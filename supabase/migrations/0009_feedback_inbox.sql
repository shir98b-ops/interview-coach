CREATE TABLE "feedback_digests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid,
	"period_days" integer NOT NULL,
	"feedback_count" integer NOT NULL,
	"digest" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback_digests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "rating" smallint;--> statement-breakpoint
ALTER TABLE "feedback_digests" ADD CONSTRAINT "feedback_digests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
--> statement-breakpoint
-- True for accounts listed in analytics_admins, and for the SQL editor.
CREATE OR REPLACE FUNCTION public.is_analytics_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ((select auth.uid()) IS NULL AND session_user = 'postgres')
    OR EXISTS (
      SELECT 1 FROM public.analytics_admins WHERE user_id = (select auth.uid())
    );
$$;
--> statement-breakpoint
-- Every feedback message in the period, newest first, for the owner's inbox.
-- Users are shown by a short anonymous label, never by name or email.
CREATE OR REPLACE FUNCTION public.admin_feedback(period_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_analytics_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN (
    SELECT coalesce(jsonb_agg(row_to_json(f) ORDER BY f.created_at DESC), '[]'::jsonb)
    FROM (
      SELECT fb.id, fb.message, fb.page, fb.rating, fb.created_at,
             left(md5(fb.user_id::text), 6) AS user_label,
             EXISTS (
               SELECT 1 FROM public.analytics_admins a WHERE a.user_id = fb.user_id
             ) AS is_internal
      FROM public.feedback fb
      WHERE fb.created_at >= now() - make_interval(days => period_days)
    ) f
  );
END;
$$;
--> statement-breakpoint
-- Saves an AI summary of the feedback, so it can be reread for free.
CREATE OR REPLACE FUNCTION public.save_feedback_digest(
  period_days integer, feedback_count integer, digest jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_analytics_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.feedback_digests (created_by, period_days, feedback_count, digest)
  VALUES ((select auth.uid()), period_days, feedback_count, digest);
END;
$$;
--> statement-breakpoint
-- The latest saved summary, or null when there is none yet.
CREATE OR REPLACE FUNCTION public.latest_feedback_digest()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_analytics_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  RETURN (
    SELECT row_to_json(d)::jsonb
    FROM (
      SELECT period_days, feedback_count, digest, created_at
      FROM public.feedback_digests
      ORDER BY created_at DESC
      LIMIT 1
    ) d
  );
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.is_analytics_admin() FROM public, anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_analytics_admin() TO authenticated;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.admin_feedback(integer) FROM public, anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.admin_feedback(integer) TO authenticated;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.save_feedback_digest(integer, integer, jsonb) FROM public, anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.save_feedback_digest(integer, integer, jsonb) TO authenticated;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.latest_feedback_digest() FROM public, anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.latest_feedback_digest() TO authenticated;
