import React from 'react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = status.toLowerCase().replace('_', ' ');

  const getStyle = () => {
    switch (normalized) {
      case 'active':
      case 'approved':
      case 'completed':
      case 'resolved':
        return 'bg-primary/10 text-primary border-primary/20';
      
      case 'pending':
      case 'under review':
      case 'draft':
      case 'open':
        return 'bg-warning/10 text-warning border-warning/20';

      case 'rejected':
      case 'overdue':
      case 'missed':
      case 'inactive':
      case 'critical':
      case 'high':
        return 'bg-danger/10 text-danger border-danger/20';

      case 'archived':
      case 'drafted':
      default:
        return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize tracking-wide select-none',
        getStyle(),
        className
      )}
    >
      {normalized}
    </span>
  );
};
