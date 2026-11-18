# Interview Coach

A web app for practicing job interviews on your own. Upload your resume, pick
a target role, answer realistic interview questions and get scored, specific
feedback, then track how you improve over time.

**Live demo:** https://interview-coach-lemon.vercel.app

> Status: stage 6 of 9 (MVP polish and launch) in progress. Stages 1-5 are done. See the [roadmap](#roadmap).

## The problem

Job seekers usually prepare for interviews by reading generic question lists.
That practice has three gaps:

- **It is not tailored.** The questions ignore the candidate's own background
  and the role they are applying for.
- **There is no feedback.** Without someone to review an answer, it is hard to
  know whether it was good or how to make it better.
- **Progress is invisible.** There is no record of what was practiced or
  whether answers are getting stronger.

## Who it is for

Candidates preparing for interviews on their own, especially for their first
or next role, who want realistic practice without booking a mock interview
with another person.

## What the MVP does

1. Sign in with Google and upload a resume (PDF).
2. Review the details the app extracts and choose a target role.
3. Start a simulated interview in English or Hebrew: five questions tailored
   to the role and the resume, based on questions real interviewers commonly
   ask and mixing professional and behavioral questions.
4. Answer each question in writing, one at a time.
5. Get a score per answer against a fixed rubric (content, structure,
   clarity), with what worked, what to improve and an outline of a stronger
   answer. Every interview is saved, with a chart of scores over time.
6. Learn: six five-minute lessons (STAR, introducing yourself, specifics,
   being concise, failures, thinking out loud), each ending with one practice
   question and instant feedback. The app recommends the lesson for the
   user's weakest rubric criterion.

## Key product decisions

| Decision                                                         | Why                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign in with **Google** only                                     | Most candidates already have a Google account, so there is no new password to create, forget or leak.                                                                                                           |
| Each user can only ever see **their own data**                   | Resumes and interview answers are personal. The database itself enforces this rule (row-level security), so a bug in the app cannot expose another user's data.                                                 |
| Start with **written** answers; add voice later                  | Written answers deliver the core value (tailored questions and feedback) with fewer moving parts. Voice adds transcription and audio handling, so it comes in stage 8.                                          |
| Score against a **fixed rubric** instead of a free-form grade    | A rubric (content, structure, clarity) makes scores consistent between sessions and explainable to the user, so "3 out of 5" always means the same thing.                                                       |
| The user **confirms** what the AI extracts from the resume       | AI extraction is fast but sometimes wrong. A quick review step keeps the profile accurate, and everything after it depends on that profile.                                                                     |
| The original resume file is **not stored**                       | Only the details the user approves are saved. Data we never keep cannot leak, and the product only needs the details, not the file.                                                                             |
| A **small, fast AI model** reads resumes                         | Copying facts from a resume is a simple task. The smallest Claude model does it in seconds for about a tenth of a cent; stronger models are kept for interview feedback.                                        |
| A **mid-tier AI model** writes interview questions               | The questions are the heart of the product, so they get a stronger model than resume reading, for about two cents per practice interview. One question at a time keeps the user focused, like a real interview. |
| Questions start from a **bank of commonly asked questions**      | AI-written questions can drift toward unusual or generic ones. A curated list of questions real interviewers ask, grouped by kind of role, keeps practice realistic; the AI adapts them to the candidate.       |
| All answers are **scored together** at the end                   | One scoring pass per interview is cheaper and keeps scores consistent with each other, and the user is not interrupted between questions, like in a real interview.                                             |
| The app runs **next to its database**, in Europe                 | Every page makes several database calls, and most users are in Israel. Running the app and the database together in Frankfurt keeps each call local and both close to users.                                    |
| Each user can start **five interviews a day**                    | Every interview costs a few cents of AI usage. A daily limit protects against surprise bills when the site is shared, without getting in the way of real practice. Paid plans can raise it later.               |
| The interface is in **Hebrew**, with a young, energetic design   | Most users prepare in Israel. Practice anxiety is real, so the app should feel like an encouraging coach, not a form. Answers and questions can still be in English.                                            |
| **Learning** is part of the MVP, not only practice               | A score alone does not tell people how to improve. Short lessons with one exercise each turn feedback into a next step, and the weakest criterion picks the lesson.                                             |
| Job links and gamified exercises come **after** the MVP          | A small product that works end to end is more useful, and easier to validate, than four half-built areas.                                                                                                       |
| Practice exercises are **original**, "in the style of" a company | Real take-home tests are often confidential. Generating original exercises by type and difficulty avoids copying them.                                                                                          |

## Roadmap

Stages 1 to 6 make up the MVP.

| #   | Stage                        | Outcome                                                      |
| --- | ---------------------------- | ------------------------------------------------------------ |
| 1   | Project foundation           | Repository, app skeleton, automated checks, first deployment |
| 2   | Accounts and data            | Google sign-in and a database for profiles and sessions      |
| 3   | Resume and profile           | Resume upload, reviewed extraction, target roles             |
| 4   | Written interview simulation | Tailored questions answered in writing                       |
| 5   | Scoring and feedback         | Rubric scores, tips and progress history                     |
| 6   | MVP polish and launch        | Hebrew redesign, lessons with exercises, limits, tests       |
| 7   | Jobs I applied to            | Job link in, company summary and job-specific practice out   |
| 8   | Voice answers                | Recorded answers, transcription, feedback on delivery        |
| 9   | Learn by playing             | Points, streaks and more lessons on top of the learning area |

## How it is built

| Layer             | Choice                                               |
| ----------------- | ---------------------------------------------------- |
| App (UI + server) | Next.js with TypeScript                              |
| Styling           | Tailwind CSS                                         |
| Data and sign-in  | Supabase (Postgres, Auth)                            |
| AI                | Claude API                                           |
| Hosting           | Vercel                                               |
| Quality checks    | ESLint, Prettier, Vitest, Playwright, GitHub Actions |

All AI calls run on the server, so API keys never reach the browser.

## Running locally

Requires Node.js 22.

```bash
npm install
npm run dev
```

To use sign-in locally, copy `.env.example` to `.env.local` and fill in
the Supabase project URL and publishable key. The database tables and access
rules are in `supabase/migrations`; run them once in the Supabase SQL editor.

For deployment, add the same two variables in Vercel under Settings,
Environment Variables, as type Config for all environments, then redeploy.

Resume reading, interview questions and feedback also need `ANTHROPIC_API_KEY` (from console.anthropic.com).
Add it to `.env.local`, and in Vercel as type Secret for all environments.

Then open http://localhost:3000.

| Command             | What it does                      |
| ------------------- | --------------------------------- |
| `npm run lint`      | Lint the code                     |
| `npm run typecheck` | Check TypeScript types            |
| `npm test`          | Run unit tests                    |
| `npm run test:e2e`  | Run browser tests (after a build) |
| `npm run format`    | Format all files with Prettier    |
| `npm run build`     | Build for production              |
