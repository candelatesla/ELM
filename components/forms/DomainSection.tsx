"use client";

import { useState } from "react";
import { FieldRenderer } from "@/components/ui/FieldRenderer";
import { DomainConfig, DomainEntry } from "@/lib/types";

type DomainSectionProps = {
  domain: DomainConfig;
  entry: DomainEntry;
  onSkillFieldChange: (skillId: string, fieldId: string, value: string | boolean) => void;
  onAssessmentFieldChange: (assessmentId: string, fieldId: string, value: string | boolean) => void;
};

export function DomainSection({
  domain,
  entry,
  onSkillFieldChange,
  onAssessmentFieldChange,
}: DomainSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const skillGroups = domain.skills.reduce<Array<{ title: string; note?: string; skills: DomainConfig["skills"] }>>(
    (groups, skill) => {
      const title = skill.groupTitle ?? "Snapshot Skills";
      const note = skill.groupNote;
      const existing = groups.find((group) => group.title === title && group.note === note);

      if (existing) {
        existing.skills.push(skill);
        return groups;
      }

      groups.push({ title, note, skills: [skill] });
      return groups;
    },
    [],
  );

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
          <p className="mt-1 text-sm text-slate-600">{domain.shortDescription}</p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
          {isOpen ? "Collapse" : "Expand"}
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-8 border-t border-slate-100 bg-slate-50/70 px-6 py-6 md:px-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Snapshot Skills</h3>
            {skillGroups.map((group) => (
              <div key={`${group.title}-${group.note ?? "none"}`} className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-slate-800">{group.title}</h4>
                  {group.note ? <p className="text-sm text-slate-500">{group.note}</p> : null}
                </div>
                <div className="space-y-4">
                  {group.skills.map((skill) => (
                    <article key={skill.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                      <div className="mb-4">
                        <h5 className="font-semibold">{skill.title}</h5>
                        {skill.description ? <p className="mt-1 text-sm text-slate-500">{skill.description}</p> : null}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {(skill.fields ?? []).map((field) => (
                          <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                            <FieldRenderer
                              field={field}
                              value={entry.skills[skill.id]?.[field.id] ?? ""}
                              onChange={(value) => onSkillFieldChange(skill.id, field.id, value)}
                            />
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {domain.assessments?.length ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Week-Specific Assessments</h3>
              <div className="space-y-4">
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
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
