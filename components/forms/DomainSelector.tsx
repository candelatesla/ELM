"use client";

import clsx from "clsx";
import { DomainConfig, DomainId } from "@/lib/types";

type DomainSelectorProps = {
  domains: DomainConfig[];
  selectedDomains: DomainId[];
  onToggle: (domainId: DomainId) => void;
};

export function DomainSelector({ domains, selectedDomains, onToggle }: DomainSelectorProps) {
  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Choose domains</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {domains.map((domain) => {
          const isSelected = selectedDomains.includes(domain.id);

          return (
            <button
              key={domain.id}
              type="button"
              className={clsx(
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                isSelected
                  ? "border-accent bg-accent text-white shadow-panel"
                  : "border-slate-200 bg-white text-slate-800 hover:border-accent/40 hover:bg-slate-50",
              )}
              onClick={() => onToggle(domain.id)}
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
  );
}
