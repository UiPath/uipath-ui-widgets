import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from "@uipath/apollo-wind";

import { ExpandLessIcon } from "../../icons/ExpandLessIcon";
import { ExpandMoreIcon } from "../../icons/ExpandMoreIcon";
import { useCallback, useImperativeHandle, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AgentSchemaField } from "./AgentSchemaField";
import type { InputSchemaProperty } from "./AgentSchemaField";
import { isFieldEmpty, collectRequiredErrors } from "./inputs/validation";
import type { InputSchema } from "./types";
import { resolveSchema } from "./resolveSchema";

/**
 * Returns a new error map with the given key removed along with any nested
 * errors written under it (dot-notation children like `parent.child`).
 */
function clearErrorsForKey(
  errors: Record<string, boolean>,
  key: string,
): Record<string, boolean> {
  const prefix = `${key}.`;
  const next = { ...errors };
  delete next[key];
  for (const k of Object.keys(next)) {
    if (k.startsWith(prefix)) delete next[k];
  }
  return next;
}

/**
 * Handle exposed via the `formRef` prop.
 * Allows external components to trigger form submission
 * programmatically while AgentSchemaForm handles validation.
 */
export interface AgentSchemaFormHandle {
  /** Triggers validation and calls onSubmit if valid. */
  submit: () => void;
}

export interface AgentSchemaFormProps {
  /** JSON Schema describing the agent's input fields. */
  inputSchema: InputSchema;
  /** Pre-populated values for form fields (e.g. from tool call inputValue). */
  initialValues?: Record<string, unknown>;
  /** Called with the validated form data on submit. */
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  /** Disable all form fields. */
  disabled?: boolean;
  /**
   * When true, optional fields are hidden behind a "Show more" toggle.
   * Used at agent launch; settings mode shows all fields.
   */
  collapsibleOptional?: boolean;
  /**
   * Ref exposing a `submit()` method for programmatic submission.
   * Use when rendering your own submit button outside the form.
   */
  formRef?: React.Ref<AgentSchemaFormHandle>;
}

/**
 * Reusable schema-driven form for UiPath Conversational Agents.
 *
 * Renders input fields from a JSON Schema using Apollo Wind components. Currently used by InputsPage, settings
 * panel, and tool call confirmation.
 */
export function AgentSchemaForm({
  inputSchema,
  initialValues,
  onSubmit,
  disabled,
  collapsibleOptional = false,
  formRef,
}: AgentSchemaFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const init = { ...(initialValues ?? {}) };
    // Pre-initialize object-type properties to {} so ObjectField
    // doesn't need a mount-time side effect to set its own default.
    const resolved = resolveSchema(inputSchema);
    for (const [key, prop] of Object.entries(resolved.properties ?? {})) {
      if (prop.type === "object" && init[key] === undefined) {
        init[key] = {};
      }
    }
    return init;
  });
  const [showOptional, setShowOptional] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  const schema = useMemo(() => resolveSchema(inputSchema), [inputSchema]);
  const properties = useMemo(() => schema.properties ?? {}, [schema]);
  const requiredKeys = useMemo(() => schema.required ?? [], [schema]);
  const entries = Object.entries(properties);
  const requiredEntries = entries.filter(([key]) => requiredKeys.includes(key));
  const optionalEntries = entries.filter(
    ([key]) => !requiredKeys.includes(key),
  );

  const handleSubmit = useCallback(async () => {
    const errors: Record<string, boolean> = {};

    // Validate required fields
    requiredKeys.forEach((key) => {
      const value = formData[key];
      const prop = properties[key];
      if (isFieldEmpty(value)) {
        errors[key] = true;
      }
      if (prop?.type === "object") {
        collectRequiredErrors(value, prop as InputSchemaProperty, key, errors);
      }
    });

    // Check inline validation errors (e.g. JSON syntax)
    Object.entries(validationErrors).forEach(([key, hasError]) => {
      if (hasError) errors[key] = true;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    await onSubmit?.(formData);
  }, [formData, validationErrors, requiredKeys, properties, onSubmit]);

  // imperative needed here since the button is outside the form
  useImperativeHandle(formRef, () => ({ submit: handleSubmit }), [
    handleSubmit,
  ]);

  const renderField = (
    key: string,
    prop: InputSchemaProperty,
    isRequired: boolean,
  ) => {
    const hasError = fieldErrors[key] ?? false;
    const prefix = `${key}.`;
    const errorMap = Object.fromEntries(
      Object.entries(fieldErrors)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, v]) => [k.slice(prefix.length), v]),
    );

    // Nested objects/arrays render their own grid inside, so they take the
    // full row. Scalars (string/number/boolean/date) share a row in pairs.
    const isFullSpan = prop.type === "object" || prop.type === "array";

    return (
      <div key={key} className={isFullSpan ? "col-span-2" : "col-span-1"}>
        <AgentSchemaField
          prop={prop}
          fieldKey={key}
          isRequired={isRequired}
          value={formData[key]}
          onChange={(val) => {
            setFormData((prev) => ({ ...prev, [key]: val }));
            if (val !== undefined && val !== "" && val !== null) {
              setFieldErrors((prev) => clearErrorsForKey(prev, key));
            }
          }}
          onValidationError={(hasValidationError) =>
            setValidationErrors((prev) => ({
              ...prev,
              [key]: hasValidationError,
            }))
          }
          error={hasError}
          errorMap={Object.keys(errorMap).length > 0 ? errorMap : undefined}
          disabled={disabled}
        />
      </div>
    );
  };

  return (
    <div className="uipath-cas-schema-form w-full">
      <div className="uipath-cas-schema-grid my-1 grid w-full grid-cols-1 gap-4">
        {requiredEntries.map(([key, prop]) =>
          renderField(key, prop as InputSchemaProperty, true),
        )}
        {collapsibleOptional && optionalEntries.length > 0 && (
          <Collapsible
            open={showOptional}
            onOpenChange={setShowOptional}
            className="col-span-2"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center gap-1 py-2 text-left text-sm font-semibold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <span>
                {showOptional
                  ? t("agent_schema_show_less")
                  : t("agent_schema_show_more")}
              </span>
              {showOptional ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="uipath-cas-schema-grid grid grid-cols-1 gap-4">
                {optionalEntries.map(([key, prop]) =>
                  renderField(key, prop as InputSchemaProperty, false),
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        {!collapsibleOptional &&
          optionalEntries.map(([key, prop]) =>
            renderField(key, prop as InputSchemaProperty, false),
          )}
      </div>
    </div>
  );
}
