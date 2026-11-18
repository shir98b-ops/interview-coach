import { icsFile } from "@/lib/jobs/calendar";
import { interviewEvent } from "@/lib/jobs/event";
import { interviewById } from "@/lib/jobs/queries";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

/** Downloads one interview as an .ics file for Apple Calendar or Outlook. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/jobs/interviews/[id]/ics">,
) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Row level security returns nothing for another user's interview.
  const interview = await interviewById(supabase, id);
  if (!interview) return new Response("Not found", { status: 404 });

  return new Response(icsFile(interviewEvent(interview)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="interview.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
