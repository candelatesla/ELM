"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { BasicInfoForm } from "@/components/forms/BasicInfoForm";
import { WeekAssessmentSection } from "@/components/forms/WeekAssessmentSection";
import { domainConfigs, domainConfigMap } from "@/lib/forms";
import { BasicInfo, DomainId, DomainAssessmentData, StudentEntry } from "@/lib/types";

// Only domains that have week-specific assessments
const assessmentDomains = domainConfigs.filter((d) => d.assessments && d.assessments.length > 0);

const emptyBasicInfo: BasicInfo = {
  state: "",
  teacherName: "",
  schoolName: "",
  classroomName: "",
  childName: "",
};

function emptyDomainData(): DomainAssessmentData {
  return { selectedAssessmentId: "", students: [] };
}

export default function AssessmentsPage() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(emptyBasicInfo);
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>(
    assessmentDomains.map((d) => d.id) as DomainId[],
  );
  const [domainData, setDomainData] = useState<Record<string, DomainAssessmentData>>(
    Object.fromEntries(assessmentDomains.map((d) => [d.id, emptyDomainData()])),
  );
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Domain toggle ──
  function toggleDomain(domainId: DomainId) {
    setSelectedDomains((current) =>
      current.includes(domainId) ? current.filter((id) => id !== domainId) : [...current, domainId],
    );
  }

  // ── Week selection ──
  function setWeek(domainId: string, assessmentId: string) {
    setDomainData((current) => ({
      ...current,
      [domainId]: { ...current[domainId], selectedAssessmentId: assessmentId },
    }));
  }

  // ── Student count – grow or shrink the students array ──
  function setStudentCount(domainId: string, count: number) {
    setDomainData((current) => {
      const existing = current[domainId].students;
      const newStudents: StudentEntry[] = Array.from({ length: count }, (_, i) =>
        existing[i] ?? { childName: "", fields: {} },
      );
      return { ...current, [domainId]: { ...current[domainId], students: newStudents } };
    });
  }

  // ── Student name ──
  function setStudentName(domainId: string, index: number, name: string) {
    setDomainData((current) => {
      const students = [...current[domainId].students];
      students[index] = { ...students[index], childName: name };
      return { ...current, [domainId]: { ...current[domainId], students } };
    });
  }

  // ── Student field ──
  function setStudentField(
    domainId: string,
    index: number,
    fieldId: string,
    value: string | boolean,
  ) {
    setDomainData((current) => {
      const students = [...current[domainId].students];
      students[index] = {
        ...students[index],
        fields: { ...students[index].fields, [fieldId]: value },
      };
      return { ...current, [domainId]: { ...current[domainId], students } };
    });
  }

  // ── Submit ──
  async function handleSubmit() {
    setIsSubmitting(true);
    setStatus({ type: "idle" });
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "assessments",
          basicInfo,
          selectedDomains,
          domainData,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Submission failed");
      setStatus({ type: "success", message: result.message });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(192,108,50,0.10),_transparent_28%),linear-gradient(180deg,_#fdf9f5_0%,_#f8f3ee_100%)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warn">ELM Progress Tracker</p>
            <h1 className="text-lg font-bold text-slate-900">Week-Specific Assessments</h1>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-accent hover:text-accent"
            >
              Preschool Snapshot
            </Link>
            <Link
              href="/infant-toddler"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-accent hover:text-accent"
            >
              Infant/Toddler Snapshot
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 space-y-6">

          {/* Session details – no child name */}
          <BasicInfoForm
            value={basicInfo}
            onChange={(field, value) => setBasicInfo((c) => ({ ...c, [field]: value }))}
            hideChildName
          />

          <section className="panel p-5 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warn">Scoring Key</p>
                <p className="mt-1 text-sm text-slate-600">Use the same 0/1/2 scoring across all week-specific assessments.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">0 = not yet</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">1 = getting it</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">2 = got it</span>
              </div>
            </div>
          </section>

          {/* Domain selector */}
          <section className="panel p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Choose domains</h2>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {assessmentDomains.map((domain) => {
                const isSelected = selectedDomains.includes(domain.id);
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => toggleDomain(domain.id)}
                    className={clsx(
                      "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                      isSelected
                        ? "border-warn bg-warn text-white shadow-panel"
                        : "border-slate-200 bg-white text-slate-800 hover:border-warn/40 hover:bg-slate-50",
                    )}
                  >
                    <span className="text-sm font-semibold">{domain.title}</span>
                    <span
                      className={clsx(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {isSelected ? "On" : "Off"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Domain assessment sections */}
        <div className="space-y-6">
          {selectedDomains
            .filter((id) => assessmentDomains.some((d) => d.id === id))
            .map((domainId) => (
              <WeekAssessmentSection
                key={domainId}
                domain={domainConfigMap[domainId]}
                data={domainData[domainId]}
                onWeekChange={(assessmentId) => setWeek(domainId, assessmentId)}
                onStudentCountChange={(count) => setStudentCount(domainId, count)}
                onStudentNameChange={(index, name) => setStudentName(domainId, index, name)}
                onStudentFieldChange={(index, fieldId, value) =>
                  setStudentField(domainId, index, fieldId, value)
                }
              />
            ))}
        </div>

        {/* Submit */}
        <section className="panel mt-8 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Submit assessment records</h2>
              <p className="mt-1 text-sm text-slate-600">
                Sends session details and all student assessment entries for the selected domains and weeks.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-warn px-6 py-3 text-sm font-semibold text-white transition hover:bg-warn/90 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedDomains.length === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit assessment record"}
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
