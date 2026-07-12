import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "We couldn't retrieve the requested data. Please try again.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-base border border-border rounded-xl text-center max-w-md mx-auto my-8 shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Failed to Load</h3>
      <p className="mt-2 text-xs text-text-secondary leading-relaxed">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center space-x-2 justify-center rounded-lg border border-border bg-base px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface hover:text-text-primary active:scale-95 transition-all shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry Loading</span>
        </button>
      )}
    </div>
  );
};
