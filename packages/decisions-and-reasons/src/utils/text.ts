import { EMPTY_VALUE } from "../models/constants";

export const truncate = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

export const orEmpty = (text: string) => text || EMPTY_VALUE;
