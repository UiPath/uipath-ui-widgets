export const MAX_TAG_LENGTH = 40;

export const normalizedTag = (text: string) =>
  text.trim().slice(0, MAX_TAG_LENGTH);

export const toggledTag = (tags: string[], tag: string) =>
  tags.includes(tag)
    ? tags.filter((current) => current !== tag)
    : [...tags, tag];
