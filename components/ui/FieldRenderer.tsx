"use client";

import clsx from "clsx";
import { AssessmentFieldConfig } from "@/lib/types";

type FieldRendererProps = {
  field: AssessmentFieldConfig;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
};

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <label htmlFor={field.id}>{field.label}</label>
        <textarea
          id={field.id}
          rows={3}
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        />
        {field.helpText ? <p className="text-xs text-slate-500">{field.helpText}</p> : null}
      </div>
    );
  }

  if (field.type === "score") {
    const currentValue = String(value);

    return (
      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-700">{field.label}</span>
        <div className="flex gap-2">
          {["0", "1", "2"].map((option) => (
            <button
              key={option}
              type="button"
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                currentValue === option
                  ? "border-accent bg-accent text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-accent/60",
              )}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {field.helpText ? <p className="text-xs text-slate-500">{field.helpText}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2">
        <label htmlFor={field.id}>{field.label}</label>
        <select id={field.id} value={String(value)} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <input
          className="h-4 w-4"
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={field.id}>{field.label}</label>
      <input
        id={field.id}
        type={field.type}
        placeholder={field.placeholder}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
      />
      {field.helpText ? <p className="text-xs text-slate-500">{field.helpText}</p> : null}
    </div>
  );
}
