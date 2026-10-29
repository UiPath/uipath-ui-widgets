import { createContext, useContext } from "react";
import type { ReviewModel } from "./useDecisionCapture";

const CaptureContext = createContext<ReviewModel | null>(null);

export const CaptureProvider = CaptureContext.Provider;

export function useCapture(): ReviewModel {
  const model = useContext(CaptureContext);
  if (!model) {
    throw new Error("useCapture must be used inside a CaptureProvider");
  }
  return model;
}
