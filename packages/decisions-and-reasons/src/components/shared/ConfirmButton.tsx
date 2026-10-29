import type { FC } from "react";
import { Button } from "@uipath/apollo-wind";
import { useCapture } from "../../hooks/useCapture";
import type { ReviewPart } from "../../models/capture";

export const ConfirmButton: FC<{ part: ReviewPart; idleLabel: string }> = ({
  part,
  idleLabel,
}) => {
  const { locked, lookAt } = useCapture();
  if (locked) return null;
  return (
    <Button
      variant="link"
      aria-pressed={part.looked}
      aria-label={`Confirm ${part.label}`}
      className="h-auto p-0 text-xs"
      onClick={() => lookAt(part.id)}
    >
      {part.looked ? "✓ Confirmed" : idleLabel}
    </Button>
  );
};
