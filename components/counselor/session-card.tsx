import React from "react";

export default function SessionCard({
  title,
  subtitle,
  meta,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col gap-3 border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-slate-800 truncate uppercase tracking-tight">{title}</div>
          {subtitle && <div className="text-sm text-slate-500 truncate">{subtitle}</div>}
        </div>
        {meta && <div className="text-xs font-bold text-slate-400 ml-4 flex-shrink-0 uppercase tracking-widest">{meta}</div>}
      </div>
      {action && <div className="w-full">{action}</div>}
    </div>
  );
}
