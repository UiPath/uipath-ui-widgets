import { ConnectionState } from "@uipath/uipath-typescript/conversational-agent";

/** Maps ConnectionState → i18n key for human-readable status text. */
export const CONNECTION_STATUS_LABEL: Record<string, string> = {
  [ConnectionState.Enabled]: "connections_status_connected",
  [ConnectionState.Expired]: "connections_status_expired",
  [ConnectionState.Disabled]: "connections_status_disabled",
  [ConnectionState.Failed]: "connections_status_failed",
};

/** Maps ConnectionState → Badge variant for status coloring. */
export const CONNECTION_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [ConnectionState.Enabled]: "default",
  [ConnectionState.Disabled]: "secondary",
  [ConnectionState.Expired]: "outline",
  [ConnectionState.Failed]: "destructive",
};
