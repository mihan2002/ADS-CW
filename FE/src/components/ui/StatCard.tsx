import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  color?: string;
}

export function StatCard({ icon, label, value, trend, color = 'primary' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  };

  const iconColorMap: Record<string, string> = {
    primary: 'text-primary-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400',
    violet: 'text-violet-400',
  };

  return (
    <div
      className={`glass-card p-5 bg-gradient-to-br ${colorMap[color] || colorMap.primary} border`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-surface-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-surface-100">{value}</p>
          {trend && (
            <p
              className={`text-xs font-medium ${
                trend.positive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`${iconColorMap[color] || iconColorMap.primary} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
