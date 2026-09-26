"use client";

interface Props {
  current: number;
  total: number;
  color?: string;
}

export default function ProgressBar({ current, total, color = "bg-yellow-400" }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
