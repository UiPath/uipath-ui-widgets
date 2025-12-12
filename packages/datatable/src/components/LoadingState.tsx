import { memo } from 'react';

interface LoadingStateProps {
  message?: string;
}

/**
 * Loading state component displayed while data is being fetched
 */
export const LoadingState = memo<LoadingStateProps>(({ message = 'Loading...' }) => {
  return <div className="datatable-loading">{message}</div>;
});

LoadingState.displayName = 'LoadingState';
