"use client";

import { useState } from "react";
import { FieldRenderer } from "@/components/ui/FieldRenderer";
import { DomainConfig, DomainEntry } from "@/lib/types";

type AssessmentSectionProps = {
  domain: DomainConfig;
  entry: DomainEntry;
  onAssessmentFieldChange: (assessmentId: string, fieldId: string, value: string | boolean) => void;
};

export function AssessmentSection({ domain, entry, onAssessmentFieldChange }: AssessmentSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!domain.assessments?.length) return null;

  return (
    <section className="panel overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 bg-white px-6 py-5 text-left md:px-8"
        onClick={() => setIsOpen((current) => !current)}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Selected Domain</p>
          <h2 className="text-2xl font-semibold">{domain.title}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {domain.assessments.length} week-specific assessment{domain.assessments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
          {isOpen ? "Collapse" : "Expand"}
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/70 px-6 py-6 md:px-8">
          {domain.assessments.map((assessment) => (
            <article key={assessment.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <div className="mb-2 inline-flex rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warn">
                  Week {assessment.week}
                </div>
                <h4 className="font-semibold">{assessment.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{assessment.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {assessment.fields.map((field) => (
                  <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                    <FieldRenderer
                      field={field}
                      value={entry.assessments[assessment.id]?.[field.id] ?? ""}
                      onChange={(value) => onAssessmentFieldChange(assessment.id, field.id, value)}
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
