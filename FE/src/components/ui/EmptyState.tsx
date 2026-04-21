import { InboxIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-surface-500 mb-4">
        {icon || <InboxIcon size={48} strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-semibold text-surface-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
