/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutopilotChatFileInfo } from "@uipath/apollo-react/ap-chat";

export const createFileKey = (attachment: AutopilotChatFileInfo) => {
  const name = attachment.name;
  const size = attachment.content.binary?.length || attachment.content.text?.length || 0;
  const type = attachment.type;
  return `${name}-${size}-${type}`;
};

export const normalizeInput = (obj: any): any => {
  if (!obj) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeInput);
  const normalized: any = {};
  for (const [ key, value ] of Object.entries(obj)) {
    normalized[key] = normalizeInput(value);
  }
  return normalized;
};

export const convertAttachmentToFile = (attachment: AutopilotChatFileInfo): File => {
  let blob: BlobPart;

  if (attachment.content.binary) {
    blob = new Uint8Array(attachment.content.binary);
  } else if (attachment.content.base64) {
    // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = attachment.content.base64.startsWith('data:')
      ? attachment.content.base64.split(',')[1]
      : attachment.content.base64;

    // Remove any whitespace
    const cleanBase64 = base64Data.replace(/\s/g, '');
    const binary = atob(cleanBase64);
    const bytes = new Uint8Array(
      Array.from(binary, char => char.charCodeAt(0))
    );
    blob = new Blob([bytes], { type: attachment.type });
  } else {
    throw new Error(`No content found for attachment: ${attachment.name}`);
  }

  return new File([blob], attachment.name, { type: attachment.type });
};
