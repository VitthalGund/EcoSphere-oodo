import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading data...', 
  fullScreen = false 
}) => {
  const content = (
    <div className="text-center p-8 select-none">
      <div className="relative h-12 w-12 mx-auto">
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-primary/20"></div>
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-text-secondary">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center w-full h-full min-h-[200px]">{content}</div>;
};
