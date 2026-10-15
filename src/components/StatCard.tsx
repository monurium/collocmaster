import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'indigo',
  trend,
}) => {
  const colorMap = {
    indigo: {
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'group-hover:shadow-indigo-500/10',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/10',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-cyan-500/10',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:shadow-rose-500/10',
    },
  };

  const scheme = colorMap[accentColor];

  return (
    <div
      className={`group relative p-5 rounded-2xl bg-[#111827]/70 border border-[#1F293D] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${scheme.border} ${scheme.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {value}
            </h3>
            {trend && (
              <span className="text-xs font-medium text-emerald-400">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-xl border ${scheme.iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
