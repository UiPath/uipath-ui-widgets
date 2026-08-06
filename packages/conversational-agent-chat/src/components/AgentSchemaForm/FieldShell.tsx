import { Label, cn } from "@uipath/apollo-wind";
import type { ReactNode } from "react";

interface FieldShellProps {
  label: ReactNode;
  children: ReactNode;
  error?: boolean;
  disabled?: boolean;
  helperText?: ReactNode;
  className?: string;
}

export const FieldShell = ({
  label,
  children,
  error = false,
  disabled = false,
  helperText,
  className,
}: FieldShellProps) => (
  <div
    className={cn(
      "flex w-full flex-col gap-2",
      disabled && "opacity-60",
      className,
    )}
  >
    <Label
      className={cn(
        "text-sm font-semibold text-muted-foreground",
        error && "text-destructive",
      )}
    >
      {label}
    </Label>
    {children}
    {helperText && (
      <span
        className={cn(
          "text-xs text-muted-foreground",
          error && "text-destructive",
        )}
      >
        {helperText}
      </span>
    )}
  </div>
);
