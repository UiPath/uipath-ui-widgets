export const OTHER_REASON = "Other";
export const MAX_REASON_LENGTH = 80;

export const normalizedReason = (text: string) =>
  text.trim().slice(0, MAX_REASON_LENGTH);

export const unpickedReasons = (
  options: readonly string[],
  picked: readonly string[],
) =>
  options.filter(
    (option) => option !== OTHER_REASON && !picked.includes(option),
  );
