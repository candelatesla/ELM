type ProgressBarProps = {
  filled: number;
  total: number;
  percent: number;
};

export function ProgressBar({ filled, total, percent }: ProgressBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-700">Session progress</p>
        <p className="text-sm text-slate-500">
          {filled} of {total} fields
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
