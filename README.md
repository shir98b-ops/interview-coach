# Interview Coach

A web app for practicing job interviews on your own. Upload your resume, pick
a target role, answer realistic interview questions and get scored, specific
feedback, then track how you improve over time.

**Live demo:** https://interview-coach-lemon.vercel.app

> Status: the MVP (stages 1-6) is done. Stage 7 of 9 (jobs and interview tracker) is next. See the [roadmap](#roadmap).

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
7. Practice take-home assignments: four lessons on handling take-homes, then
   an original assignment written for the target role at a chosen difficulty.
   The written submission is scored on understanding, solution, structure
   and actionability, with improvements and the questions to expect in the
   follow-up interview.
8. Resume rating: a score out of 100 for a target role (or in general) on
   impact, relevance, clarity and completeness, with ready-to-use rewrites
   of weak lines and missing keywords. Ratings are kept to show progress.
9. Answer by speaking: in interviews and lesson exercises, a microphone
   button turns speech into text in the answer box (Hebrew or English), so
   users can talk the way they would in a real interview and fix the text
   before sending.
10. Professional practice for every profession: besides the general
    interview, a professional round (knowledge, methods, regulations and real
    work scenarios of the field) or a case interview (one realistic case in
    five steps; system design for software roles). Difficulty follows the
    seniority level, scenarios fit the chosen kind of organization (tech,
    corporate, public sector, nonprofit, small business), and problems never
    drift toward the candidate's past industry. Role titles are recognized in
    Hebrew and English, and engineers outside software (electrical, civil,
    mechanical) get the questions of their own field. Answers are scored strictly,
    as a practitioner in that field would.
11. Coding practice for roles that write code (software, and data roles tested
    in SQL or Python, including Hebrew job titles): a coding round with two
    problems at the level of the role, in the chosen language, answered in a
    code box with an optional spoken explanation, and reviewed for
    correctness, efficiency and code quality with a sample solution. Take-homes
    can be a small coding project with starter code, handed in as code and
    reviewed like a code review (requirements, correctness, structure, tests).

## Key product decisions

| Decision                                                         | Why                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sign in with **Google** only                                     | Most candidates already have a Google account, so there is no new password to create, forget or leak.                                                                                                                                                                                                                                                                    |
| Each user can only ever see **their own data**                   | Resumes and interview answers are personal. The database itself enforces this rule (row-level security), so a bug in the app cannot expose another user's data.                                                                                                                                                                                                          |
| Start with **written** answers; add voice later                  | Written answers deliver the core value (tailored questions and feedback) with fewer moving parts. Voice adds transcription and audio handling, so it comes in stage 8.                                                                                                                                                                                                   |
| Voice through the **browser's own speech recognition**           | It is free, needs no new service, keys or audio storage, and supports Hebrew. The app never receives or stores audio, only the text the user chooses to send (the browser's speech service, Google's in Chrome, hears the audio). Browsers without it (such as Firefox) keep the typing box, and the coach is told to ignore missing punctuation in spoken answers.      |
| **No repeated questions** across practice for the same role      | Job searches can take months. Each new interview sees the questions already asked for that role or job and must cover new ground, and it starts from a random sample of the question bank, so practice stays fresh.                                                                                                                                                      |
| **Professional rounds for every profession**                     | A social worker, a business manager and an electrical engineer each need the real questions of their field, at their level. Reasoning out loud works by voice or text on any phone; developers and data roles also get coding rounds and code take-homes. The code is reviewed by reading and tracing it, not by running it, which keeps the app free of a code sandbox. |
| Score against a **fixed rubric** instead of a free-form grade    | A rubric (content, structure, clarity) makes scores consistent between sessions and explainable to the user, so "3 out of 5" always means the same thing.                                                                                                                                                                                                                |
| The user **confirms** what the AI extracts from the resume       | AI extraction is fast but sometimes wrong. A quick review step keeps the profile accurate, and everything after it depends on that profile.                                                                                                                                                                                                                              |
| The original resume file is **not stored**                       | Only the details the user approves are saved. Data we never keep cannot leak, and the product only needs the details, not the file.                                                                                                                                                                                                                                      |
| A **small, fast AI model** reads resumes                         | Copying facts from a resume is a simple task. The smallest Claude model does it in seconds for about a tenth of a cent; stronger models are kept for interview feedback.                                                                                                                                                                                                 |
| A **mid-tier AI model** writes interview questions               | The questions are the heart of the product, so they get a stronger model than resume reading, for about two cents per practice interview. One question at a time keeps the user focused, like a real interview.                                                                                                                                                          |
| Questions start from a **bank of commonly asked questions**      | AI-written questions can drift toward unusual or generic ones. A curated list of questions real interviewers ask, grouped by kind of role, keeps practice realistic; the AI adapts them to the candidate.                                                                                                                                                                |
| All answers are **scored together** at the end                   | One scoring pass per interview is cheaper and keeps scores consistent with each other, and the user is not interrupted between questions, like in a real interview.                                                                                                                                                                                                      |
| The app runs **next to its database**, in Europe                 | Every page makes several database calls, and most users are in Israel. Running the app and the database together in Frankfurt keeps each call local and both close to users.                                                                                                                                                                                             |
| Each user can start **five interviews a day**                    | Every interview costs a few cents of AI usage. A daily limit protects against surprise bills when the site is shared, without getting in the way of real practice. Paid plans can raise it later.                                                                                                                                                                        |
| The interface is in **Hebrew**, with a young, energetic design   | Most users prepare in Israel. Practice anxiety is real, so the app should feel like an encouraging coach, not a form. Answers and questions can still be in English.                                                                                                                                                                                                     |
| **Learning** is part of the MVP, not only practice               | A score alone does not tell people how to improve. Short lessons with one exercise each turn feedback into a next step, and the weakest criterion picks the lesson.                                                                                                                                                                                                      |
| **Take-home** practice is scored on its own rubric               | A take-home is judged differently from an interview answer: understanding the problem, the quality of the solution, a readable write-up and actionable recommendations. Three per day keep AI costs small.                                                                                                                                                               |
| Resume rating uses the **approved details**, not the file        | The original file is never stored, so the rating judges content, which is what recruiters read first. Suggested rewrites use only facts from the resume and leave placeholders for unknown numbers, so nothing is invented.                                                                                                                                              |
| Users **choose how to be addressed** in Hebrew                   | Hebrew verbs and adjectives change with gender, and guessing gets it wrong for many users. The choice shapes AI questions and feedback and the lessons; interface text is written gender-neutral. Until users choose, both forms are shown.                                                                                                                              |
| Job links and gamified exercises come **after** the MVP          | A small product that works end to end is more useful, and easier to validate, than four half-built areas.                                                                                                                                                                                                                                                                |
| Practice exercises are **original**, "in the style of" a company | Real take-home tests are often confidential. Generating original exercises by type and difficulty avoids copying them.                                                                                                                                                                                                                                                   |

## Roadmap

Stages 1 to 6 make up the MVP.

| #   | Stage                        | Outcome                                                      |
| --- | ---------------------------- | ------------------------------------------------------------ |
| 1   | Project foundation           | Repository, app skeleton, automated checks, first deployment |
| 2   | Accounts and data            | Google sign-in and a database for profiles and sessions      |
| 3   | Resume and profile           | Resume upload, reviewed extraction, target roles             |
| 4   | Written interview simulation | Tailored questions answered in writing                       |
| 5   | Scoring and feedback         | Rubric scores, tips and progress history                     |
| 6   | MVP polish and launch        | Hebrew redesign, lessons, take-homes, resume rating, privacy |
| 7   | Jobs and interview tracker   | Applied jobs, upcoming interviews, prep plans, calendar sync |
| 8   | Voice answers                | Speak answers instead of typing, in Hebrew or English        |
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

To skip the daily usage limits on your own account while testing, set
`UNLIMITED_EMAILS` to your sign-in email (comma separated for several).

Then open http://localhost:3000.

| Command             | What it does                      |
| ------------------- | --------------------------------- |
| `npm run lint`      | Lint the code                     |
| `npm run typecheck` | Check TypeScript types            |
| `npm test`          | Run unit tests                    |
| `npm run test:e2e`  | Run browser tests (after a build) |
| `npm run format`    | Format all files with Prettier    |
| `npm run build`     | Build for production              |
