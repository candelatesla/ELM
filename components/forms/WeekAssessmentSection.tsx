"use client";

import { useState } from "react";
import clsx from "clsx";
import { FieldRenderer } from "@/components/ui/FieldRenderer";
import { DomainConfig, DomainAssessmentData, StudentEntry } from "@/lib/types";

type WeekAssessmentSectionProps = {
  domain: DomainConfig;
  data: DomainAssessmentData;
  onWeekChange: (assessmentId: string) => void;
  onStudentCountChange: (count: number) => void;
  onStudentNameChange: (index: number, name: string) => void;
  onStudentFieldChange: (index: number, fieldId: string, value: string | boolean) => void;
};

export function WeekAssessmentSection({
  domain,
  data,
  onWeekChange,
  onStudentCountChange,
  onStudentNameChange,
  onStudentFieldChange,
}: WeekAssessmentSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!domain.assessments?.length) return null;

  const selectedAssessment = domain.assessments.find((a) => a.id === data.selectedAssessmentId);
  const studentCount = data.students.length;

  function handleCountInput(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1 && n <= 60) onStudentCountChange(n);
  }

  return (
    <section className="panel overflow-hidden">
      {/* Domain header */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 bg-white px-6 py-5 text-left md:px-8"
        onClick={() => setIsOpen((c) => !c)}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-warn">Selected Domain</p>
          <h2 className="text-2xl font-semibold">{domain.title}</h2>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
          {isOpen ? "Collapse" : "Expand"}
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-6 border-t border-slate-100 bg-slate-50/70 px-6 py-6 md:px-8">

          {/* ── Step 1: Choose week ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-slate-700">Choose assessment week</p>
            <div className="flex flex-wrap gap-2">
              {domain.assessments.map((assessment) => {
                const isSelected = data.selectedAssessmentId === assessment.id;
                return (
                  <button
                    key={assessment.id}
                    type="button"
                    onClick={() => onWeekChange(assessment.id)}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      isSelected
                        ? "border-warn bg-warn text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-warn/50 hover:bg-slate-50",
                    )}
                  >
                    Week {assessment.week}
                    <span className={clsx("ml-1.5 text-xs font-normal", isSelected ? "text-white/80" : "text-slate-400")}>
                      · {assessment.title.replace(/^Week \d+:\s*/i, "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Step 2: Number of students (only after week is chosen) ── */}
          {data.selectedAssessmentId ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">Number of students</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onStudentCountChange(Math.max(1, studentCount - 1))}
                  disabled={studentCount <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-600 transition hover:border-warn hover:text-warn disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={studentCount === 0 ? "" : studentCount}
                  onChange={(e) => handleCountInput(e.target.value)}
                  className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-800 outline-none transition focus:border-warn focus:ring-2 focus:ring-warn/20"
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => onStudentCountChange(Math.min(60, studentCount + 1))}
                  disabled={studentCount >= 60}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-600 transition hover:border-warn hover:text-warn disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
                <span className="text-sm text-slate-400">
                  {studentCount > 0 ? `${studentCount} student${studentCount !== 1 ? "s" : ""}` : "Enter a number to begin"}
                </span>
              </div>
            </div>
          ) : null}

          {/* ── Step 3: Student assessment cards ── */}
          {selectedAssessment && data.students.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-slate-800">
                  {selectedAssessment.title}
                </h3>
                <span className="inline-flex rounded-full bg-sand px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-warn">
                  Week {selectedAssessment.week}
                </span>
              </div>

              {data.students.map((student, index) => (
                <StudentCard
                  key={index}
                  index={index}
                  student={student}
                  assessment={selectedAssessment}
                  onNameChange={(name) => onStudentNameChange(index, name)}
                  onFieldChange={(fieldId, value) => onStudentFieldChange(index, fieldId, value)}
                />
              ))}
            </div>
          ) : null}

        </div>
      ) : null}
    </section>
  );
}

type StudentCardProps = {
  index: number;
  student: StudentEntry;
  assessment: NonNullable<DomainConfig["assessments"]>[number];
  onNameChange: (name: string) => void;
  onFieldChange: (fieldId: string, value: string | boolean) => void;
};

function StudentCard({ index, student, assessment, onNameChange, onFieldChange }: StudentCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5">
      {/* Student header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-bold text-warn">
          {index + 1}
        </span>
        <div className="flex-1">
          <label htmlFor={`child-name-${index}`} className="mb-1 block text-sm font-medium text-slate-700">
            Child Name
          </label>
          <input
            id={`child-name-${index}`}
            type="text"
            value={student.childName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter child's name"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-warn focus:ring-2 focus:ring-warn/20"
          />
        </div>
      </div>

      {/* Assessment fields */}
      <div className="grid gap-4 md:grid-cols-2">
        {assessment.fields.map((field) => (
          <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <FieldRenderer
              field={field}
              value={student.fields[field.id] ?? ""}
              onChange={(value) => onFieldChange(field.id, value)}
            />
          </div>
        ))}
      </div>
    </article>
  );
}
