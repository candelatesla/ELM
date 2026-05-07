"use client";

import { BasicInfo } from "@/lib/types";

type BasicInfoFormProps = {
  value: BasicInfo;
  onChange: (field: keyof BasicInfo, value: string) => void;
  hideChildName?: boolean;
};

const states = [
  { value: "Texas", label: "Texas" },
  { value: "Oregon", label: "Oregon" },
  { value: "Georgia", label: "Georgia" },
];

export function BasicInfoForm({ value, onChange, hideChildName = false }: BasicInfoFormProps) {
  const fields: Array<{ id: Exclude<keyof BasicInfo, "state">; label: string }> = [
    { id: "teacherName", label: "Teacher Name" },
    { id: "schoolName", label: "School Name" },
    { id: "classroomName", label: "Classroom Name" },
    ...(!hideChildName ? [{ id: "childName" as const, label: "Child Name" }] : []),
  ];

  const colCount = hideChildName ? 4 : 5;

  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Session details</h2>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      >
        <div>
          <label htmlFor="state">State</label>
          <select id="state" value={value.state} onChange={(e) => onChange("state", e.target.value)}>
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              type="text"
              value={value[field.id]}
              onChange={(e) => onChange(field.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
