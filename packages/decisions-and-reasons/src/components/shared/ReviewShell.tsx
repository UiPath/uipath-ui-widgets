import type { FC, ReactNode } from "react";
import { cn } from "@uipath/apollo-wind";
import { CaptureProvider } from "../../hooks/useCapture";
import type { ReviewModel } from "../../hooks/useDecisionCapture";

export const ReviewShell: FC<{
  model: ReviewModel;
  aside?: ReactNode;
  className?: string;
  stacked?: boolean;
  children: ReactNode;
}> = ({ model, aside, className, stacked = false, children }) => (
  <CaptureProvider value={model}>
    <div
      ref={(element) => model.setRoot(element)}
      className={cn(
        "uipath-decisions-and-reasons min-w-0 text-sm",
        stacked
          ? "space-y-4"
          : aside && "grid items-start gap-4 lg:grid-cols-2",
        className,
      )}
    >
      {stacked ? children : <div className="min-w-0 space-y-4">{children}</div>}
      {aside}
    </div>
  </CaptureProvider>
);
