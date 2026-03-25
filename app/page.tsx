"use client";

import { useMemo, useState } from "react";
import { BasicInfoForm } from "@/components/forms/BasicInfoForm";
import { DomainSection } from "@/components/forms/DomainSection";
import { DomainSelector } from "@/components/forms/DomainSelector";
import { domainConfigs, domainConfigMap } from "@/lib/forms";
import { BasicInfo, DomainId, SubmissionPayload } from "@/lib/types";
import { createEmptyDomainEntry } from "@/lib/utils";

const emptyBasicInfo: BasicInfo = {
  state: "",
  teacherName: "",
  schoolName: "",
  classroomName: "",
  childName: "",
};

const initialEntries = Object.fromEntries(domainConfigs.map((domain) => [domain.id, createEmptyDomainEntry(domain)]));

export default function HomePage() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(emptyBasicInfo);
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>(["language-literacy", "mathematics"]);
  const [entries, setEntries] =
    useState<SubmissionPayload["entries"]>(initialEntries);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payload: SubmissionPayload = useMemo(
    () => ({
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

  function updateAssessmentField(domainId: DomainId, assessmentId: string, fieldId: string, value: string | boolean) {
    setEntries((current) => ({
      ...current,
      [domainId]: {
        ...current[domainId],
        assessments: {
          ...current[domainId].assessments,
          [assessmentId]: {
            ...current[domainId].assessments[assessmentId],
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,125,122,0.18),_transparent_28%),linear-gradient(180deg,_#f8fbfb_0%,_#f3f7f6_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6 space-y-6">
          <BasicInfoForm value={basicInfo} onChange={(field, value) => setBasicInfo((current) => ({ ...current, [field]: value }))} />
          <DomainSelector domains={domainConfigs} selectedDomains={selectedDomains} onToggle={toggleDomain} />
        </div>

        <div className="space-y-6">
          {selectedDomains.map((domainId) => (
            <DomainSection
              key={domainId}
              domain={domainConfigMap[domainId]}
              entry={entries[domainId]}
              onSkillFieldChange={(skillId, fieldId, value) => updateSkillField(domainId, skillId, fieldId, value)}
              onAssessmentFieldChange={(assessmentId, fieldId, value) =>
                updateAssessmentField(domainId, assessmentId, fieldId, value)
              }
            />
          ))}
        </div>

        <section className="panel mt-8 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Submit one combined record</h2>
              <p className="mt-1 text-sm text-slate-600">
                This sends the shared basic info, selected domains, and all completed skill and assessment values together.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedDomains.length === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit progress record"}
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
