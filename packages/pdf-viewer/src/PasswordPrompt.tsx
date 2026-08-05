import { Button } from "@uipath/apollo-wind";
import { FC, useState } from "react";
import { LockIcon } from "./icons";

/**
 * A pending pdf.js password request. Submitting retries the load with the
 * given password; cancelling fails the load into the widget's error state.
 */
export interface PasswordRequest {
  callback: (password: string | null) => void;
  /** True when a previous password was wrong (INCORRECT_PASSWORD). */
  isRetry: boolean;
}

/** In-viewer password prompt shown for password-protected documents. */
export const PasswordPrompt: FC<{
  isRetry: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}> = ({ isRetry, onSubmit, onCancel }) => {
  const [password, setPassword] = useState("");

  return (
    <form
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
      data-testid="pdf-viewer-password"
      onSubmit={(event) => {
        event.preventDefault();
        if (!password) return;
        // Clear before submitting so a wrong attempt re-prompts empty.
        setPassword("");
        onSubmit(password);
      }}
    >
      <span className="text-[var(--color-foreground-light)]">
        <LockIcon />
      </span>
      <p className="text-sm font-semibold text-foreground">
        This document is password-protected
      </p>
      <p className="max-w-xs text-sm text-[var(--color-foreground-light)]">
        Enter the password to open it.
      </p>
      {isRetry && (
        <p className="text-sm text-[var(--color-error-icon)]" role="alert">
          Incorrect password. Try again.
        </p>
      )}
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-label="Document password"
        autoFocus
        className="w-56 rounded border border-[var(--color-border-de-emp)] bg-background px-2 py-1 text-center text-sm text-foreground"
      />
      <div className="flex gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!password}>
          Open document
        </Button>
      </div>
    </form>
  );
};
