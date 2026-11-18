CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"page" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "feedback_own_rows" ON "feedback" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
-- Lets a signed-in user delete their own account. Deleting the auth user
-- cascades to every table, because each user_id references auth.users with
-- ON DELETE CASCADE. It runs with the owner's rights but can only ever
-- delete the caller's own account.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM auth.users WHERE id = (select auth.uid());
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.delete_my_account() FROM public, anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
