# ELM Progress Tracker

A lightweight, production-structured ELM child progress and assessment app built with Next.js, Tailwind CSS, and a config-driven form model.

## Architecture choice

This project intentionally uses a simple setup:

- Frontend: Next.js App Router, easy to deploy on Vercel or Netlify
- Styling: Tailwind CSS for fast, readable UI code
- Form structure: central config in `lib/forms.ts`
- Submission pipeline: one API route at `app/api/submit/route.ts`
- Storage: Google Sheets via Google Apps Script webhook when configured
- Local fallback: saves JSON to `tmp/submissions.json` during development

Why this approach:

- It keeps hosting free and setup light
- It works well with static-ish hosting plus serverless functions
- It avoids overengineering while leaving room to grow later
- It makes form updates mostly a config-editing task instead of a UI rewrite

## Features included

- Shared intake fields entered once
- Multi-select domain workflow
- Only selected domains render in the session
- Snapshot-style skill rows with observed date and follow-up plan
- Week-specific assessment support with 0/1/2 scoring and reassessment fields
- Combined submission for multiple domains in one session
- `/admin` preview page for the current config model
- Placeholder upload architecture for future file support

## Project structure

```text
app/
  api/submit/route.ts     # Submission endpoint
  admin/page.tsx          # Config preview/admin page
  page.tsx                # Main intake flow
components/
  forms/                  # Basic info, selector, domain sections
  ui/                     # Field renderer and progress bar
lib/
  forms.ts                # Domain, skill, and assessment definitions
  types.ts                # Shared TypeScript types
  utils.ts                # Helpers for empty state and progress
```

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

Without a backend webhook configured, submissions are stored locally in `tmp/submissions.json`.

## Connect Google Sheets

The easiest free path for this app is Google Sheets via Google Apps Script.

### Recommended flow

1. Create a Google Sheet to hold responses.
2. Create an Apps Script project attached to that sheet.
3. Add a `doPost(e)` handler that:
   - parses the JSON payload
   - writes one row per submission
   - stores the full structured JSON in a column for easy export/debugging
4. Deploy the Apps Script as a web app.
5. Copy the web app URL into `.env.local`:

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-script-id/exec
```

6. Restart the dev server.

### Suggested sheet columns

- `submittedAt`
- `childName`
- `teacherName`
- `schoolName`
- `classroomName`
- `state`
- `weekNumber`
- `selectedDomains`
- `entryDate`
- `periodStart`
- `periodEnd`
- `rawJson`

This keeps the sheet readable while preserving the full nested record for export and future processing.

## Deploy on Vercel

1. Push this project to GitHub.
2. Import it into Vercel.
3. Add the environment variable:
   - `GOOGLE_APPS_SCRIPT_URL`
4. Deploy.

Vercel handles the Next.js API route automatically.

## Deploy on Netlify

Netlify can host Next.js too, but Vercel is the smoother default for this stack.

1. Push to GitHub.
2. Import into Netlify.
3. Use the Next.js runtime/plugin if prompted.
4. Add:
   - `GOOGLE_APPS_SCRIPT_URL`
5. Deploy.

## How to update form fields later

Most changes happen in `lib/forms.ts`.

Examples:

- Add a new domain by appending another object to `domainConfigs`
- Add a new snapshot skill under a domain's `skills`
- Add a new week-specific assessment under `assessments`
- Add or remove fields from any skill or assessment

The UI is already generic and reads from that config.

## Admin/config preview

Visit `/admin` to preview the active form structure. This is intentionally simple, but it gives you a dedicated place to review how the config will render before extending it further.

## Data model

Each submission includes:

- `basicInfo`
- `selectedDomains`
- `entries`
  - `skills`
  - `assessments`
- `uploadedFiles`
- `submittedAt`

The current upload support is a clear placeholder only. A future extension could connect file uploads to Google Drive, Supabase Storage, or Cloudinary while keeping the rest of the data model unchanged.

## Viewing and downloading responses

- In development without a webhook: inspect `tmp/submissions.json`
- With Google Sheets: view responses directly in the sheet
- Download as CSV or XLSX from Google Sheets when needed
- Use the `rawJson` column if you need the full submission structure later

## Notes about the PDFs

The provided PDFs appear to be image-heavy, so this starter uses:

- the Snapshot domain structure you listed
- the named week-specific assessments from the file names
- common 0/1/2 and reassessment patterns you described

The app is designed so those fields can be refined once the exact paper layouts are transcribed or reviewed manually.
