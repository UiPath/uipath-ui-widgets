/**
 * A direct platform call that failed. The message is fixed text — the
 * operation and the status — because a failed load's message is sent to
 * telemetry: no URL (trace, span and folder ids, document paths) and none of
 * the service's response. That stays on `detail`, bounded, for the host.
 */
export class PlatformCallError extends Error {
  constructor(
    operation: string,
    readonly status: number,
    /** The start of the service's response; never sent to telemetry. */
    readonly detail: string,
  ) {
    super(`${operation} failed with status ${status}`);
    this.name = "PlatformCallError";
  }
}

/**
 * The error as a host-facing result reports it: the message, plus the
 * service's detail when there is one. Not for telemetry.
 */
export function describeForHost(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return error instanceof PlatformCallError && error.detail
    ? `${message}: ${error.detail}`
    : message;
}
