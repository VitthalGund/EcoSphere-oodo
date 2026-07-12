import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  accent?: 'primary' | 'social' | 'governance' | 'gamification' | 'secondary' | 'danger' | 'warning';
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  accent,
  children,
  actions,
  className
}) => {
  const accentClasses = {
    primary: 'border-t-4 border-t-primary',
    social: 'border-t-4 border-t-[#1971c2]',
    governance: 'border-t-4 border-t-[#6741d9]',
    gamification: 'border-t-4 border-t-[#f08c00]',
    secondary: 'border-t-4 border-t-[#6741d9]',
    danger: 'border-t-4 border-t-danger',
    warning: 'border-t-4 border-t-warning'
  };

  return (
    <div
      className={clsx(
        'bg-base border border-border rounded-xl shadow-xs p-6 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-200',
        accent ? accentClasses[accent] : '',
        className
      )}
    >
      {/* Card Header */}
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between border-b border-border pb-4 mb-4">
          <div className="space-y-1">
            {title && typeof title === 'string' ? (
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider m-0">{title}</h3>
            ) : (
              title
            )}
            {subtitle && typeof subtitle === 'string' ? (
              <p className="text-xs text-text-secondary">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className="flex-1 text-left text-sm text-text-secondary">
        {children}
      </div>
    </div>
  );
};
