CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cache_write_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(12, 6) NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "analytics_admins" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"props" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"device" text,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_admins" ADD CONSTRAINT "analytics_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_events" ADD CONSTRAINT "product_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_created_idx" ON "ai_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_events_created_idx" ON "product_events" USING btree ("created_at");--> statement-breakpoint
CREATE POLICY "ai_usage_insert_own" ON "ai_usage" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "product_events_insert_own" ON "product_events" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
-- Usage and cost totals for the owner, as one JSON object. It runs with the
-- owner's rights so it can count every user's rows, but only answers callers
-- listed in analytics_admins (or the SQL editor). It returns totals only,
-- never anyone's identity or content. Rows marked is_internal (the owner's
-- own tests) are left out of the totals and shown separately.
CREATE OR REPLACE FUNCTION public.analytics_report(period_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  since timestamptz := now() - make_interval(days => period_days);
BEGIN
  -- The SQL editor runs as postgres with no signed-in user.
  IF NOT (
    ((select auth.uid()) IS NULL AND session_user = 'postgres')
    OR EXISTS (
      SELECT 1 FROM public.analytics_admins WHERE user_id = (select auth.uid())
    )
  ) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'period_days', period_days,
    'generated_at', now(),
    'users', (
      SELECT jsonb_build_object(
        'total', count(*),
        'new_in_period', count(*) FILTER (WHERE first_seen >= since),
        'active_in_period', count(*) FILTER (WHERE last_seen >= since),
        'came_back_after_7_days', count(*) FILTER (WHERE last_seen >= first_seen + interval '7 days'),
        'active_on_3_or_more_days', count(*) FILTER (WHERE active_days >= 3)
      )
      FROM (
        SELECT user_id,
               min(created_at) AS first_seen,
               max(created_at) AS last_seen,
               count(DISTINCT created_at::date) AS active_days
        FROM public.product_events
        WHERE NOT is_internal
        GROUP BY user_id
      ) u
    ),
    'events', (
      SELECT coalesce(jsonb_object_agg(name, jsonb_build_object('count', n, 'users', users)), '{}'::jsonb)
      FROM (
        SELECT name, count(*) AS n, count(DISTINCT user_id) AS users
        FROM public.product_events
        WHERE NOT is_internal AND created_at >= since
        GROUP BY name
      ) e
    ),
    'answer_methods', (
      SELECT coalesce(jsonb_object_agg(method, n), '{}'::jsonb)
      FROM (
        SELECT props->>'method' AS method, count(*) AS n
        FROM public.product_events
        WHERE NOT is_internal AND created_at >= since AND props ? 'method'
        GROUP BY 1
      ) m
    ),
    'users_by_device', (
      SELECT coalesce(jsonb_object_agg(coalesce(device, 'unknown'), users), '{}'::jsonb)
      FROM (
        SELECT device, count(DISTINCT user_id) AS users
        FROM public.product_events
        WHERE NOT is_internal AND created_at >= since
        GROUP BY device
      ) d
    ),
    'daily_limit_hits', (
      SELECT coalesce(jsonb_object_agg(coalesce(feature, 'unknown'), jsonb_build_object('count', n, 'users', users)), '{}'::jsonb)
      FROM (
        SELECT props->>'feature' AS feature, count(*) AS n, count(DISTINCT user_id) AS users
        FROM public.product_events
        WHERE NOT is_internal AND created_at >= since AND name = 'limit_reached'
        GROUP BY 1
      ) l
    ),
    'ai_cost', (
      SELECT jsonb_build_object(
        'total_usd', round(coalesce(sum(cost_usd), 0), 4),
        'calls', count(*),
        'paying_users', count(DISTINCT user_id),
        'median_user_usd', (
          SELECT round(coalesce(percentile_cont(0.5) WITHIN GROUP (ORDER BY total), 0)::numeric, 4)
          FROM (SELECT sum(cost_usd) AS total FROM public.ai_usage
                WHERE NOT is_internal AND created_at >= since GROUP BY user_id) t
        ),
        'heaviest_user_usd', (
          SELECT round(coalesce(max(total), 0), 4)
          FROM (SELECT sum(cost_usd) AS total FROM public.ai_usage
                WHERE NOT is_internal AND created_at >= since GROUP BY user_id) t
        )
      )
      FROM public.ai_usage
      WHERE NOT is_internal AND created_at >= since
    ),
    'ai_cost_by_action', (
      SELECT coalesce(jsonb_agg(row_to_json(a) ORDER BY a.total_usd DESC), '[]'::jsonb)
      FROM (
        SELECT action, model, count(*) AS calls,
               round(avg(input_tokens)) AS avg_input_tokens,
               round(avg(output_tokens)) AS avg_output_tokens,
               round(avg(cost_usd), 4) AS avg_cost_usd,
               round(sum(cost_usd), 4) AS total_usd
        FROM public.ai_usage
        WHERE NOT is_internal AND created_at >= since
        GROUP BY action, model
      ) a
    ),
    'ai_cost_by_day', (
      SELECT coalesce(jsonb_agg(row_to_json(d) ORDER BY d.day), '[]'::jsonb)
      FROM (
        SELECT created_at::date AS day, count(*) AS calls,
               round(sum(cost_usd), 4) AS total_usd
        FROM public.ai_usage
        WHERE NOT is_internal AND created_at >= since
        GROUP BY 1
      ) d
    ),
    'owner_tests', jsonb_build_object(
      'events', (SELECT count(*) FROM public.product_events WHERE is_internal AND created_at >= since),
      'ai_calls', (SELECT count(*) FROM public.ai_usage WHERE is_internal AND created_at >= since),
      'ai_cost_usd', (SELECT round(coalesce(sum(cost_usd), 0), 4) FROM public.ai_usage WHERE is_internal AND created_at >= since)
    )
  );
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.analytics_report(integer) FROM public, anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.analytics_report(integer) TO authenticated;
