"use client";

import { useState } from "react";
import clsx from "clsx";
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
}: DomainSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((cur) =>
      cur.includes(skillId) ? cur.filter((id) => id !== skillId) : [...cur, skillId],
    );
  }

  function selectAll() {
    setSelectedSkillIds(domain.skills.map((s) => s.id));
  }

  function clearAll() {
    setSelectedSkillIds([]);
  }

  // Group skills by category
  const skillGroups = domain.skills.reduce<
    Array<{ title: string; note?: string; skills: DomainConfig["skills"] }>
  >((groups, skill) => {
    const title = skill.groupTitle ?? "Snapshot Skills";
    const note = skill.groupNote;
    const existing = groups.find((g) => g.title === title && g.note === note);
    if (existing) { existing.skills.push(skill); return groups; }
    groups.push({ title, note, skills: [skill] });
    return groups;
  }, []);

  const selectedSkills = domain.skills.filter((s) => selectedSkillIds.includes(s.id));
  const selectedCount = selectedSkillIds.length;
  const totalCount = domain.skills.length;

  return (
    <section className="panel overflow-hidden">
      {/* ── Domain header ── */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 bg-white px-6 py-5 text-left md:px-8"
        onClick={() => setIsOpen((c) => !c)}
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Selected Domain</p>
            <h2 className="text-2xl font-semibold">{domain.title}</h2>
          </div>
          {selectedCount > 0 && (
            <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-white">
              {selectedCount} / {totalCount}
            </span>
          )}
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
          {isOpen ? "Collapse" : "Expand"}
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-slate-100">
          {/*
           * Two-column split on desktop:
           * LEFT  — sticky skill checklist (always visible while filling forms)
           * RIGHT — observation forms for selected skills
           */}
          <div className="grid md:grid-cols-[300px_1fr]">

            {/* ── LEFT: Skill checklist ── */}
            <aside className="border-b border-slate-100 bg-white md:border-b-0 md:border-r md:sticky md:top-[73px] md:self-start md:max-h-[calc(100vh-73px)] md:overflow-y-auto">
              <div className="p-5">
                {/* Checklist header */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    Snapshot Skills
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="font-medium text-accent transition hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="font-medium text-slate-400 transition hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {totalCount > 0 && (
                  <div className="mb-5">
                    <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                      <span>{selectedCount} selected</span>
                      <span>{totalCount} total</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${(selectedCount / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Skill groups */}
                <div className="space-y-5">
                  {skillGroups.map((group) => {
                    const groupSelectedCount = group.skills.filter((s) =>
                      selectedSkillIds.includes(s.id),
                    ).length;

                    return (
                      <div key={`${group.title}-${group.note ?? "none"}`}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {group.title}
                          </p>
                          {groupSelectedCount > 0 && (
                            <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                              {groupSelectedCount}
                            </span>
                          )}
                        </div>
                        {group.note && (
                          <p className="mb-2 text-[11px] text-slate-400">{group.note}</p>
                        )}
                        <div className="space-y-0.5">
                          {group.skills.map((skill) => {
                            const isSelected = selectedSkillIds.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => toggleSkill(skill.id)}
                                className={clsx(
                                  "flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition",
                                  isSelected
                                    ? "bg-accent/10 text-accent"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800",
                                )}
                              >
                                {/* Custom checkbox */}
                                <span
                                  className={clsx(
                                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                                    isSelected
                                      ? "border-accent bg-accent"
                                      : "border-slate-300 bg-white",
                                  )}
                                >
                                  {isSelected && (
                                    <svg
                                      className="h-2.5 w-2.5 text-white"
                                      viewBox="0 0 10 8"
                                      fill="none"
                                    >
                                      <path
                                        d="M1 4l3 3 5-6"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </span>
                                <span className="leading-snug">{skill.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ── RIGHT: Observation forms ── */}
            <div className="bg-slate-50/70 p-5 md:p-6">
              {selectedSkills.length === 0 ? (
                /* Empty state */
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-2xl text-slate-300">
                    ←
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    Select skills from the list to open their observation form
                  </p>
                  <p className="text-xs text-slate-400">
                    You can pick one at a time or use "Select all"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSkills.map((skill) => (
                    <article
                      key={skill.id}
                      className="rounded-3xl border border-slate-200 bg-white p-5"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {skill.groupTitle}
                          </p>
                          <h5 className="mt-0.5 font-semibold text-slate-900">{skill.title}</h5>
                          {skill.description ? (
                            <p className="mt-1 text-sm text-slate-500">{skill.description}</p>
                          ) : null}
                        </div>
                        {/* Deselect chip */}
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-400 transition hover:border-rose-200 hover:text-rose-400"
                        >
                          Remove
                        </button>
                      </div>
                      {renderSkillFields(skill, entry, onSkillFieldChange)}
                    </article>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      ) : null}
    </section>
  );
}

function renderSkillFields(
  skill: DomainConfig["skills"][number],
  entry: DomainEntry,
  onSkillFieldChange: (skillId: string, fieldId: string, value: string | boolean) => void,
) {
  const fields = skill.fields ?? [];
  const fieldMap = Object.fromEntries(fields.map((f) => [f.id, f]));

  const snapshotLayoutIds = [
    "observationDate1",
    "observationDate2",
    "observationNote1",
    "observationNote2",
    "observationScore1",
    "observationScore2",
    "followUpPlan",
  ];

  const isSnapshotLayout = snapshotLayoutIds.every((id) => fieldMap[id]);

  if (!isSnapshotLayout) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <FieldRenderer
              field={field}
              value={entry.skills[skill.id]?.[field.id] ?? ""}
              onChange={(value) => onSkillFieldChange(skill.id, field.id, value)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {["observationDate1", "observationDate2"].map((fieldId) => (
          <div key={fieldId}>
            <FieldRenderer
              field={fieldMap[fieldId]}
              value={entry.skills[skill.id]?.[fieldId] ?? ""}
              onChange={(value) => onSkillFieldChange(skill.id, fieldId, value)}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["observationNote1", "observationNote2"].map((fieldId) => (
          <div key={fieldId}>
            <FieldRenderer
              field={fieldMap[fieldId]}
              value={entry.skills[skill.id]?.[fieldId] ?? ""}
              onChange={(value) => onSkillFieldChange(skill.id, fieldId, value)}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["observationScore1", "observationScore2"].map((fieldId) => (
          <div key={fieldId}>
            <FieldRenderer
              field={fieldMap[fieldId]}
              value={entry.skills[skill.id]?.[fieldId] ?? ""}
              onChange={(value) => onSkillFieldChange(skill.id, fieldId, value)}
            />
          </div>
        ))}
      </div>
      <div>
        <FieldRenderer
          field={fieldMap.followUpPlan}
          value={entry.skills[skill.id]?.followUpPlan ?? ""}
          onChange={(value) => onSkillFieldChange(skill.id, "followUpPlan", value)}
        />
      </div>
    </div>
  );
}
