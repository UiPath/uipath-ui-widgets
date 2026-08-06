import { useCallback, useState } from "react";

export interface Notification {
  message: string;
  severity: "success" | "error";
}

/**
 * Transient toast/snackbar feedback. `notify` raises a message; it is cleared
 * when the user (or the auto-hide timer) calls `dismissNotification`.
 */
export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback(
    (message: string, severity: Notification["severity"]) =>
      setNotification({ message, severity }),
    [],
  );
  const dismissNotification = useCallback(() => setNotification(null), []);

  return { notification, notify, dismissNotification };
}
