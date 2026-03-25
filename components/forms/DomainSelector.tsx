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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {domains.map((domain) => {
          const isSelected = selectedDomains.includes(domain.id);

          return (
            <button
              key={domain.id}
              type="button"
              className={clsx(
                "rounded-2xl border p-4 text-left transition",
                isSelected
                  ? "border-accent bg-accent text-white shadow-panel"
                  : "border-slate-200 bg-white hover:border-accent/50 hover:bg-slate-50",
              )}
              onClick={() => onToggle(domain.id)}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold">{domain.title}</h3>
                <span
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {isSelected ? "Selected" : "Add"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
