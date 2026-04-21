interface BadgeProps {
  status: 'pending' | 'won' | 'cancelled' | 'active' | 'inactive' | 'verified';
  className?: string;
}

const statusConfig = {
  pending: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    label: 'Pending',
  },
  won: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    label: 'Won',
  },
  cancelled: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
    label: 'Cancelled',
  },
  active: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    label: 'Active',
  },
  inactive: {
    bg: 'bg-surface-500/15',
    text: 'text-surface-400',
    dot: 'bg-surface-400',
    label: 'Inactive',
  },
  verified: {
    bg: 'bg-primary-500/15',
    text: 'text-primary-400',
    dot: 'bg-primary-400',
    label: 'Verified',
  },
};

export function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
