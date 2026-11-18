CREATE TABLE "take_homes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"target_role_id" uuid,
	"difficulty" text NOT NULL,
	"language" text NOT NULL,
	"brief" jsonb NOT NULL,
	"submission" text,
	"submitted_at" timestamp with time zone,
	"feedback" jsonb,
	"score" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "take_homes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "take_homes" ADD CONSTRAINT "take_homes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "take_homes" ADD CONSTRAINT "take_homes_target_role_id_target_roles_id_fk" FOREIGN KEY ("target_role_id") REFERENCES "public"."target_roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "take_homes_own_rows" ON "take_homes" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);