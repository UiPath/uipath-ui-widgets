import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Textarea,
  cn,
} from "@uipath/apollo-wind";
import React, { useState } from "react";
import { useWidgetTranslation } from "../../../i18n/useWidgetTranslation";

import type {
  AgentSchemaFieldProps,
  InputSchemaProperty,
} from "../AgentSchemaField";
import { AgentSchemaField } from "../AgentSchemaField";
import { ChevronDown, ChevronRight } from "@uipath/apollo-react/icons";
import { FieldShell } from "../FieldShell";

const getNestedErrorMap = (
  errorMap: Record<string, boolean> | undefined,
  nestedKey: string,
): Record<string, boolean> | undefined => {
  if (!errorMap) return undefined;
  const prefix = `${nestedKey}.`;
  const result: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(errorMap)) {
    if (k.startsWith(prefix)) result[k.slice(prefix.length)] = v;
  }
  return Object.keys(result).length > 0 ? result : undefined;
};

interface ObjectFieldProps extends AgentSchemaFieldProps {
  label: React.ReactNode;
}

export const ObjectField = ({
  prop,
  value,
  onChange,
  onValidationError,
  error = false,
  errorMap,
  disabled,
  label,
}: ObjectFieldProps) => {
  const nestedProperties = prop.properties as
    | Record<string, InputSchemaProperty>
    | undefined;
  const hasNestedProps =
    nestedProperties !== null &&
    nestedProperties !== undefined &&
    Object.keys(nestedProperties).length > 0;

  if (hasNestedProps) {
    return (
      <NestedObjectField
        prop={prop}
        nestedProperties={nestedProperties}
        value={value}
        onChange={onChange}
        onValidationError={onValidationError}
        errorMap={errorMap}
        disabled={disabled}
        label={label}
      />
    );
  }

  return (
    <JsonObjectField
      value={value}
      onChange={onChange}
      onValidationError={onValidationError}
      error={error}
      disabled={disabled}
      label={label}
      description={prop.description}
    />
  );
};

interface NestedObjectFieldProps {
  prop: InputSchemaProperty;
  nestedProperties: Record<string, InputSchemaProperty>;
  value: unknown;
  onChange: (value: unknown) => void;
  onValidationError?: (hasError: boolean) => void;
  errorMap?: Record<string, boolean>;
  disabled?: boolean;
  label: React.ReactNode;
}

const NestedObjectField = ({
  prop,
  nestedProperties,
  value,
  onChange,
  onValidationError,
  errorMap,
  disabled,
  label,
}: NestedObjectFieldProps) => {
  const [expanded, setExpanded] = useState(true);
  const objectValue = (
    value === undefined || value === null ? {} : value
  ) as Record<string, unknown>;
  const requiredFields = (prop.required as string[] | undefined) ?? [];

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="flex items-center gap-1">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            disabled={disabled}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Button>
        </CollapsibleTrigger>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {prop.description && (
        <p className="ml-7 mt-1 text-xs text-muted-foreground">
          {prop.description}
        </p>
      )}
      <CollapsibleContent>
        <div className="uipath-cas-schema-grid ml-3 mt-2 grid grid-cols-1 gap-4 border-l-2 border-border pl-4">
          {Object.entries(nestedProperties).map(([nestedKey, nestedProp]) => {
            const isFullSpan =
              nestedProp.type === "object" || nestedProp.type === "array";
            return (
              <div
                key={nestedKey}
                className={isFullSpan ? "col-span-2" : "col-span-1"}
              >
                <AgentSchemaField
                  prop={nestedProp}
                  fieldKey={nestedKey}
                  isRequired={requiredFields.includes(nestedKey)}
                  value={objectValue[nestedKey]}
                  onChange={(newVal) =>
                    onChange({ ...objectValue, [nestedKey]: newVal })
                  }
                  onValidationError={onValidationError}
                  error={errorMap?.[nestedKey] ?? false}
                  errorMap={getNestedErrorMap(errorMap, nestedKey)}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface JsonObjectFieldProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onValidationError?: (hasError: boolean) => void;
  error?: boolean;
  disabled?: boolean;
  label: React.ReactNode;
  description?: string;
}

const JsonObjectField = ({
  value,
  onChange,
  onValidationError,
  error = false,
  disabled,
  label,
  description,
}: JsonObjectFieldProps) => {
  const { t } = useWidgetTranslation();
  const [objectText, setObjectText] = useState(() => {
    if (value === undefined || value === null) return "{}";
    return typeof value === "object"
      ? JSON.stringify(value, null, 2)
      : String(value);
  });
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleObjectChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setObjectText(text);
    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        parsed === null
      ) {
        setJsonError(t("agent_schema_error_json_object"));
        onValidationError?.(true);
        onChange(undefined);
      } else {
        setJsonError(null);
        onValidationError?.(false);
        onChange(parsed);
      }
    } catch {
      setJsonError(t("agent_schema_error_json_syntax"));
      onValidationError?.(true);
      onChange(undefined);
    }
  };

  const hasError = error || !!jsonError;

  return (
    <FieldShell
      label={label}
      error={hasError}
      disabled={disabled}
      helperText={jsonError ?? description}
    >
      <Textarea
        value={objectText}
        onChange={handleObjectChange}
        disabled={disabled}
        className={cn(
          "min-h-14 resize-y bg-background",
          hasError && "border-destructive focus-visible:ring-destructive",
        )}
      />
    </FieldShell>
  );
};
