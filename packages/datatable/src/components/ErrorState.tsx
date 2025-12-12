import { memo } from 'react';

interface ErrorStateProps {
  error: string;
}

/**
 * Error state component displayed when data fetching fails
 */
export const ErrorState = memo<ErrorStateProps>(({ error }) => {
  return <div className="datatable-error">Error: {error}</div>;
});

ErrorState.displayName = 'ErrorState';
