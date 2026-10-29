import type { ReviewPart } from "../models/capture";
import { signal } from "../utils/signals";
import { useCapture } from "./useCapture";

export function useProposalControl(part: ReviewPart) {
  const { locked, lookAt, edit, settle } = useCapture();
  return {
    ...signal.field(part.id),
    disabled: locked,
    value: part.value,
    onFocus: () => lookAt(part.id),
    onChange: (event: { target: { value: string } }) =>
      edit(part.id, event.target.value),
    onBlur: () => settle(part.id),
  };
}
