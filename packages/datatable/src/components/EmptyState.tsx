import { memo } from 'react';

interface EmptyStateProps {
  message?: string;
}

/**
 * Empty state component displayed when no data is available
 */
export const EmptyState = memo<EmptyStateProps>(({ message = 'No data available' }) => {
  return <div className="datatable-empty">{message}</div>;
});

EmptyState.displayName = 'EmptyState';
