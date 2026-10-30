import { useState } from "react";
import type { FC } from "react";
import { Button } from "@uipath/apollo-wind";
import { signal } from "../../utils/signals";
import type { ComparisonCitation } from "./types";

export const CitationLink: FC<{
  citation: ComparisonCitation;
  onOpen?: (citation: ComparisonCitation) => void;
}> = ({ citation, onOpen }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen(!open);
    if (!open) onOpen?.(citation);
  };

  return (
    <div className="space-y-1">
      <Button
        variant="link"
        aria-expanded={open}
        className="h-auto p-0 text-xs"
        onClick={toggle}
      >
        {citation.document} · page {citation.page}
      </Button>
      {open && (
        <p
          {...signal.evidence("citation")}
          className="rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground"
        >
          {citation.before}
          <mark className="rounded bg-warning-background px-0.5 text-foreground">
            {citation.highlight}
          </mark>
          {citation.after}
        </p>
      )}
    </div>
  );
};
