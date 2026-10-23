import { LOW_CONFIDENCE } from "../models/constants";

export const isLowConfidence = (confidence?: number) =>
  (confidence ?? 100) < LOW_CONFIDENCE;
