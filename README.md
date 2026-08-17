# ELM Progress Tracker

A lightweight Next.js app for ELM child progress entry, with three separate tools:

- `Preschool Snapshot Skills` at `/`
- `Infant/Toddler Snapshot` at `/infant-toddler`
- `Week-Specific Assessments` at `/assessments`

The app is config-driven, easy to host on Vercel, and designed to write rows into Google Sheets through a Google Apps Script webhook.

## Current architecture

- Frontend: Next.js App Router
- Styling: Tailwind CSS
- Form config: `lib/forms.ts`
- Submission route: `app/api/submit/route.ts`
- Google Sheets bridge: `google-apps-script.js`
- Local fallback: writes JSON files in `tmp/` during development

## Current product shape

### 1. Preschool Snapshot Skills

The main tool at `/` is for preschool Snapshot observations.

- Shared session details entered once
- Domain picker
- One section per selected domain
- One card per Snapshot skill
- Each skill uses:
  - `Observation Date 1`
  - `Observation Note 1`
  - `Observation Score 1`
  - `Observation Date 2`
  - `Observation Note 2`
  - `Observation Score 2`
  - `Follow-Up Learning Plan`

Submissions are flattened to one Google Sheets row per skill with data.

### 2. Infant/Toddler Snapshot

The infant/toddler tool at `/infant-toddler` combines the Birth-12 Months and 12-36 Months Snapshot documents into one electronic version.

- Birth-12 and 12-36 items are grouped together by indicator
- Infant/toddler teachers use the same Snapshot observation layout
- There are no week-specific assessments for infant/toddler

Submissions are flattened to one Google Sheets row per skill with data.

### 3. Week-Specific Assessments

The second tool at `/assessments` is for week-based assessment entry.

- Shared session details entered once
- Domain picker limited to domains that have assessments
- Week selection inside each domain
- Student count control
- Repeating student cards for the selected assessment

Submissions are flattened to one Google Sheets row per student per assessment.

## Project structure

```text
app/
  api/submit/route.ts        # Submission endpoint
  admin/page.tsx             # Config preview
  assessments/page.tsx       # Week-specific assessment tool
  infant-toddler/page.tsx    # Infant/toddler Snapshot tool
  page.tsx                   # Snapshot skills tool
components/
  forms/
    BasicInfoForm.tsx
    DomainSelector.tsx
    DomainSection.tsx
    WeekAssessmentSection.tsx
    AssessmentSection.tsx
  ui/
    FieldRenderer.tsx
lib/
  forms.ts                   # Domain, skill, and assessment config
  infantToddlerForms.ts      # Infant/toddler Snapshot config
  types.ts                   # Shared types
  utils.ts                   # Empty-state helpers
google-apps-script.js        # Apps Script code for Google Sheets
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

3. Open:

- `http://localhost:3000/` for Preschool Snapshot Skills
- `http://localhost:3000/infant-toddler` for Infant/Toddler Snapshot
- `http://localhost:3000/assessments` for Week-Specific Assessments

If `3000` is busy, Next.js will use another local port.

## Google Sheets setup

This repo is currently built around Google Sheets plus Google Apps Script.

### Use the included Apps Script

1. Open your target Google Sheet
2. Go to `Extensions` → `Apps Script`
3. Replace the default script with the contents of `google-apps-script.js`
4. Save
5. Deploy as a Web App
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy the deployed web app URL

### Add the env var locally or in Vercel

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-script-id/exec
```

## Sheets output shape

The Apps Script creates two tabs automatically:

- `Snapshot Skills`
- `Assessments`

### Snapshot Skills tab

Each submitted row contains:

- `Submitted At`
- `State`
- `Teacher Name`
- `School Name`
- `Classroom Name`
- `Child Name`
- `Domain`
- `Skill Group`
- `Skill Name`
- `Observation Date 1`
- `Observation Note 1`
- `Observation Score 1`
- `Observation Date 2`
- `Observation Note 2`
- `Observation Score 2`
- `Follow-Up Learning Plan`

### Assessments tab

Each submitted row contains:

- `Submitted At`
- `State`
- `Teacher Name`
- `School Name`
- `Classroom Name`
- `Domain`
- `Week`
- `Assessment Name`
- `Child Name`
- `Score`
- `Reassessment Date`
- `Reassessment Score`
- `Notes`
- `Correct Responses`
- `Items Missed`
- `Uppercase Known`
- `Lowercase Known`
- `Highest Count`
- `Numerals Correct`

## Local fallback behavior

If `GOOGLE_APPS_SCRIPT_URL` is not set, the API route saves local JSON files instead:

- `tmp/snapshot-submissions.json`
- `tmp/assessment-submissions.json`

These mirror the sheet-row structure, including header rows.

## How to update forms later

Most preschool changes happen in `lib/forms.ts`. Infant/toddler Snapshot changes happen in `lib/infantToddlerForms.ts`.

Examples:

- add a new Snapshot skill to a domain
- change field labels or placeholders
- add a new week-specific assessment
- update which domains appear in the assessment tool

The UI reads from that config instead of hardcoding every section.

## Admin preview

Visit `/admin` to preview the current config that powers the live form UI.

## Deploy on Vercel

1. Push the repo to GitHub
2. Import the repo into Vercel
3. Add this environment variable in Vercel project settings:

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-script-id/exec
```

4. Deploy

## Notes

- This codebase currently favors clarity and maintainability over heavy abstraction.
- Some unused legacy files may still exist from earlier iterations, but the active app flow is the split-tool version described above.
