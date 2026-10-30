const MILLISECONDS_PER_SECOND = 1000;

export const secondsSince = (startedAt: number) =>
  Math.round((Date.now() - startedAt) / MILLISECONDS_PER_SECOND);
