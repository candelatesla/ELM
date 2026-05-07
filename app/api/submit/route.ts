import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { domainConfigs } from "@/lib/forms";
import { BasicInfo, DomainId, DomainEntry, DomainAssessmentData } from "@/lib/types";

// ─── Payload shapes ────────────────────────────────────────────────────────────

type SnapshotBody = {
  formType?: "snapshot";
  basicInfo: BasicInfo;
  selectedDomains: DomainId[];
  entries: Record<string, DomainEntry>;
};

type AssessmentBody = {
  formType: "assessments";
  basicInfo: BasicInfo;
  selectedDomains: DomainId[];
  domainData: Record<string, DomainAssessmentData>;
};

type SubmitBody = SnapshotBody | AssessmentBody;

// ─── Column headers (must match Apps Script exactly) ──────────────────────────

export const SNAPSHOT_HEADERS = [
  "Submitted At", "State", "Teacher Name", "School Name", "Classroom Name", "Child Name",
  "Domain", "Skill Group", "Skill Name",
  "Observation Date 1", "Observation Note 1", "Observation Score 1",
  "Observation Date 2", "Observation Note 2", "Observation Score 2",
  "Follow-Up Learning Plan",
];

export const ASSESSMENT_HEADERS = [
  "Submitted At", "State", "Teacher Name", "School Name", "Classroom Name",
  "Domain", "Week", "Assessment Name", "Child Name",
  "Score", "Reassessment Date", "Reassessment Score", "Notes",
  "Correct Responses", "Items Missed",
  "Uppercase Known", "Lowercase Known",
  "Highest Count", "Numerals Correct",
];

// ─── Validation ────────────────────────────────────────────────────────────────

function validate(body: SubmitBody): string | null {
  if (!body.basicInfo?.teacherName?.trim()) return "Teacher name is required.";
  if (!body.selectedDomains?.length) return "Select at least one domain before submitting.";

  if (body.formType !== "assessments" && !body.basicInfo?.childName?.trim()) {
    return "Child name is required for snapshot submissions.";
  }

  return null;
}

// ─── Flatten: Snapshot Skills → rows ──────────────────────────────────────────
// One row per skill that has at least one filled field.

function flattenSnapshotRows(body: SnapshotBody, submittedAt: string): string[][] {
  const rows: string[][] = [];
  const { basicInfo, selectedDomains, entries } = body;

  for (const domainId of selectedDomains) {
    const domain = domainConfigs.find((d) => d.id === domainId);
    if (!domain) continue;

    const domainEntry = entries[domainId];
    if (!domainEntry) continue;

    for (const skill of domain.skills) {
      const skillData = domainEntry.skills[skill.id];
      if (!skillData) continue;

      // Skip skills where nothing was touched
      const hasData = Object.values(skillData).some((v) => v !== "" && v !== false);
      if (!hasData) continue;

      rows.push([
        submittedAt,
        basicInfo.state,
        basicInfo.teacherName,
        basicInfo.schoolName,
        basicInfo.classroomName,
        basicInfo.childName,
        domain.title,
        skill.groupTitle ?? "",
        skill.title,
        String(skillData.observationDate1 ?? ""),
        String(skillData.observationNote1 ?? ""),
        String(skillData.observationScore1 ?? ""),
        String(skillData.observationDate2 ?? ""),
        String(skillData.observationNote2 ?? ""),
        String(skillData.observationScore2 ?? ""),
        String(skillData.followUpPlan ?? ""),
      ]);
    }
  }

  return rows;
}

// ─── Flatten: Assessments → rows ──────────────────────────────────────────────
// One row per student per assessment.

function flattenAssessmentRows(body: AssessmentBody, submittedAt: string): string[][] {
  const rows: string[][] = [];
  const { basicInfo, selectedDomains, domainData } = body;

  for (const domainId of selectedDomains) {
    const domain = domainConfigs.find((d) => d.id === domainId);
    if (!domain) continue;

    const dd = domainData[domainId];
    if (!dd?.selectedAssessmentId || !dd.students?.length) continue;

    const assessment = domain.assessments?.find((a) => a.id === dd.selectedAssessmentId);
    if (!assessment) continue;

    for (const student of dd.students) {
      const f = student.fields;

      rows.push([
        submittedAt,
        basicInfo.state,
        basicInfo.teacherName,
        basicInfo.schoolName,
        basicInfo.classroomName,
        domain.title,
        String(assessment.week),
        assessment.title,
        student.childName,
        String(f.score ?? ""),
        String(f.reassessmentDate ?? ""),
        String(f.reassessmentScore ?? ""),
        String(f.notes ?? ""),
        String(f.correctResponses ?? ""),
        String(f.itemsMissed ?? ""),
        String(f.uppercaseKnown ?? ""),
        String(f.lowercaseKnown ?? ""),
        String(f.highestCount ?? ""),
        String(f.numeralsCorrect ?? ""),
      ]);
    }
  }

  return rows;
}

// ─── Send to Apps Script ───────────────────────────────────────────────────────

async function sendToAppsScript(
  snapshots: string[][],
  assessments: string[][],
  webhookUrl: string,
) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshots, assessments }),
  });

  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

  if (!response.ok || data.ok === false) {
    throw new Error(data.message ?? "Google Sheets webhook failed.");
  }
}

// ─── Local fallback (no env var set) ──────────────────────────────────────────
// Saves to tmp/snapshot-submissions.json and tmp/assessment-submissions.json.
// Each file is an array of rows (first row = headers) — mirrors the Sheets layout.

async function saveLocally(snapshots: string[][], assessments: string[][]) {
  const dir = path.join(process.cwd(), "tmp");
  await fs.mkdir(dir, { recursive: true });

  async function appendRows(filename: string, headers: string[], rows: string[][]) {
    if (!rows.length) return;
    const filePath = path.join(dir, filename);
    let existing: string[][] = [];
    try {
      existing = JSON.parse(await fs.readFile(filePath, "utf8")) as string[][];
    } catch {
      existing = [headers]; // seed with header row on first write
    }
    existing.push(...rows);
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
  }

  await appendRows("snapshot-submissions.json", SNAPSHOT_HEADERS, snapshots);
  await appendRows("assessment-submissions.json", ASSESSMENT_HEADERS, assessments);
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;

    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();
    const isAssessment = body.formType === "assessments";

    const snapshots = isAssessment
      ? []
      : flattenSnapshotRows(body as SnapshotBody, submittedAt);

    const assessments = isAssessment
      ? flattenAssessmentRows(body as AssessmentBody, submittedAt)
      : [];

    const rowCount = isAssessment ? assessments.length : snapshots.length;
    const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (webhookUrl) {
      await sendToAppsScript(snapshots, assessments, webhookUrl);
      return NextResponse.json({
        ok: true,
        message: `${rowCount} row${rowCount !== 1 ? "s" : ""} saved to Google Sheets.`,
      });
    }

    await saveLocally(snapshots, assessments);
    return NextResponse.json({
      ok: true,
      message: `${rowCount} row${rowCount !== 1 ? "s" : ""} saved locally. Set GOOGLE_APPS_SCRIPT_URL to send to Google Sheets.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected submission error." },
      { status: 500 },
    );
  }
}
