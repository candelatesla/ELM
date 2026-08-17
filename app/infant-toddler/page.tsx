"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BasicInfoForm } from "@/components/forms/BasicInfoForm";
import { DomainSection } from "@/components/forms/DomainSection";
import { DomainSelector } from "@/components/forms/DomainSelector";
import { infantToddlerDomainConfigs, infantToddlerDomainConfigMap } from "@/lib/infantToddlerForms";
import { BasicInfo, DomainId, SubmissionPayload } from "@/lib/types";
import { createEmptyDomainEntry } from "@/lib/utils";

const emptyBasicInfo: BasicInfo = {
  state: "",
  teacherName: "",
  schoolName: "",
  classroomName: "",
  childName: "",
};

const initialEntries = Object.fromEntries(
  infantToddlerDomainConfigs.map((domain) => [domain.id, createEmptyDomainEntry(domain)]),
);

export default function InfantToddlerSnapshotPage() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(emptyBasicInfo);
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>(
    infantToddlerDomainConfigs.map((domain) => domain.id),
  );
  const [entries, setEntries] = useState<SubmissionPayload["entries"]>(initialEntries);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payload: SubmissionPayload = useMemo(
    () => ({
      formType: "infant-toddler-snapshot",
      basicInfo,
      selectedDomains,
      entries,
      uploadedFiles: [
        {
          name: "File uploads",
          status: "planned",
          note: "Placeholder only. Connect this later to Drive, Supabase Storage, or another file store.",
        },
      ],
    }),
    [basicInfo, selectedDomains, entries],
  );

  function toggleDomain(domainId: DomainId) {
    setSelectedDomains((current) =>
      current.includes(domainId) ? current.filter((item) => item !== domainId) : [...current, domainId],
    );
  }

  function updateSkillField(domainId: DomainId, skillId: string, fieldId: string, value: string | boolean) {
    setEntries((current) => ({
      ...current,
      [domainId]: {
        ...current[domainId],
        skills: {
          ...current[domainId].skills,
          [skillId]: {
            ...current[domainId].skills[skillId],
            [fieldId]: value,
          },
        },
      },
    }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setStatus({ type: "idle" });

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Submission failed");
      }

      setStatus({ type: "success", message: result.message });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong while saving the submission.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,125,122,0.14),_transparent_28%),linear-gradient(180deg,_#f8fbfb_0%,_#f3f7f6_100%)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">ELM Progress Tracker</p>
            <h1 className="text-lg font-bold text-slate-900">Infant/Toddler Snapshot</h1>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-accent hover:text-accent"
            >
              Preschool Snapshot
            </Link>
            <Link
              href="/assessments"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-warn hover:text-warn"
            >
              Week-Specific Assessments
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6 space-y-6">
          <BasicInfoForm value={basicInfo} onChange={(field, value) => setBasicInfo((current) => ({ ...current, [field]: value }))} />
          <DomainSelector domains={infantToddlerDomainConfigs} selectedDomains={selectedDomains} onToggle={toggleDomain} />
          <section className="panel p-5 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Scoring Key</p>
                <p className="mt-1 text-sm text-slate-600">Use the same 0/1/2 scoring across all infant/toddler Snapshot skills.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">0 = not yet</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">1 = getting it</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">2 = got it</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {selectedDomains.map((domainId) => (
            <DomainSection
              key={domainId}
              domain={infantToddlerDomainConfigMap[domainId]}
              entry={entries[domainId]}
              onSkillFieldChange={(skillId, fieldId, value) => updateSkillField(domainId, skillId, fieldId, value)}
              onAssessmentFieldChange={() => {}}
            />
          ))}
        </div>

        <section className="panel mt-8 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Submit infant/toddler Snapshot record</h2>
              <p className="mt-1 text-sm text-slate-600">
                This sends session details and all completed infant/toddler Snapshot skills together.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedDomains.length === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit infant/toddler record"}
            </button>
          </div>
          {status.message ? (
            <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
              {status.message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
