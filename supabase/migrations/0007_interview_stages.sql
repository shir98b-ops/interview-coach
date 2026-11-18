ALTER TABLE "interviews" ADD COLUMN "reflection" text;--> statement-breakpoint
ALTER TABLE "job_preps" ADD COLUMN "interview_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "stage" text;--> statement-breakpoint
ALTER TABLE "take_homes" ADD COLUMN "job_id" uuid;--> statement-breakpoint
ALTER TABLE "job_preps" ADD CONSTRAINT "job_preps_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "take_homes" ADD CONSTRAINT "take_homes_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;