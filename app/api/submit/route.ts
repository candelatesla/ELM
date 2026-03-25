import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { SubmissionPayload } from "@/lib/types";

type AppsScriptResponse = {
  ok?: boolean;
  message?: string;
};

function validatePayload(payload: SubmissionPayload) {
  if (!payload.basicInfo.childName || !payload.basicInfo.teacherName) {
    return "Child name and teacher name are required.";
  }

  if (!payload.selectedDomains.length) {
    return "Select at least one domain before submitting.";
  }

  return null;
}

async function appendLocalSubmission(payload: SubmissionPayload) {
  const storageDir = path.join(process.cwd(), "tmp");
  const storagePath = path.join(storageDir, "submissions.json");

  await fs.mkdir(storageDir, { recursive: true });

  let existing: SubmissionPayload[] = [];

  try {
    const file = await fs.readFile(storagePath, "utf8");
    existing = JSON.parse(file) as SubmissionPayload[];
  } catch {
    existing = [];
  }

  existing.push(payload);
  await fs.writeFile(storagePath, JSON.stringify(existing, null, 2));
}

async function sendToAppsScript(payload: SubmissionPayload, webhookUrl: string) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as AppsScriptResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "Google Sheets webhook failed.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload;
    const error = validatePayload(payload);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const enrichedPayload = {
      ...payload,
      submittedAt: new Date().toISOString(),
    };

    const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (webhookUrl) {
      await sendToAppsScript(enrichedPayload, webhookUrl);

      return NextResponse.json({
        ok: true,
        message: "Submission saved to Google Sheets through Apps Script.",
      });
    }

    await appendLocalSubmission(enrichedPayload);

    return NextResponse.json({
      ok: true,
      message: "Submission saved locally. Add GOOGLE_APPS_SCRIPT_URL to send records to Google Sheets.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected submission error.",
      },
      { status: 500 },
    );
  }
}
