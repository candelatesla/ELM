"use client";

import { BasicInfo } from "@/lib/types";

type BasicInfoFormProps = {
  value: BasicInfo;
  onChange: (field: keyof BasicInfo, value: string) => void;
};

const fields: Array<{ id: Exclude<keyof BasicInfo, "state">; label: string; type?: string }> = [
  { id: "teacherName", label: "Teacher Name" },
  { id: "schoolName", label: "School Name" },
  { id: "classroomName", label: "Classroom Name" },
  { id: "childName", label: "Child Name" },
];

const states = [
  { value: "Texas", label: "Texas" },
  { value: "Oregon", label: "Oregon" },
  { value: "Georgia", label: "Georgia" },
];

export function BasicInfoForm({ value, onChange }: BasicInfoFormProps) {
  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Session details</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label htmlFor="state">State</label>
          <select id="state" value={value.state} onChange={(event) => onChange("state", event.target.value)}>
            <option value="">Select state</option>
            {states.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              type={field.type ?? "text"}
              value={value[field.id]}
              onChange={(event) => onChange(field.id, event.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
