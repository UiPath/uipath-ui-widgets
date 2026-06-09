import {
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@uipath/apollo-wind";
import type { ChangeEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  DataTypesArray,
  DataTypesBoolean,
  DataTypesDate,
  DataTypesDatetime,
  DataTypesInteger,
  DataTypesObject,
  DataTypesString,
} from "@uipath/apollo-react/icons";

// No apollo equivalent for a time-only type, so this one stays hand-rolled.
import { TimeIcon } from "../../icons/TimeIcon";
import { FieldShell } from "./FieldShell";
import { ArrayField } from "./inputs/ArrayField";
import { ObjectField } from "./inputs/ObjectField";
import type { InputSchemaProperty } from "./types";
export type { InputSchemaProperty } from "./types";

export interface AgentSchemaFieldProps {
  prop: InputSchemaProperty;
  fieldKey: string;
  isRequired?: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
  onValidationError?: (hasError: boolean) => void;
  error?: boolean;
  /** Flat dot-notation error map relative to this field */
  errorMap?: Record<string, boolean>;
  disabled?: boolean;
}

const hasAnyRequiredDescendant = (prop: InputSchemaProperty): boolean => {
  if (prop.type !== "object") return false;
  const required = (prop.required as string[] | undefined) ?? [];
  if (required.length > 0) return true;
  const nestedProps = prop.properties as
    | Record<string, InputSchemaProperty>
    | undefined;
  if (!nestedProps) return false;
  return Object.values(nestedProps).some(hasAnyRequiredDescendant);
};

// Values are HTML <input type> strings, used directly as the field's `type`.
// resolveDateFormat translates the JSON Schema "date-time" format to
// "datetime-local"; any new option must likewise be a valid <input> type.
type DateFormat = "date" | "time" | "datetime-local";

// Tool input schemas often arrive as plain `type: "string"` with no format,
// even when the value is a date. Precedence: schema → value → undefined.
// length >= 10 avoids bare years like "2026" matching as parseable dates.
//
// `format: "time"` is intentionally not trusted — calendar-style tool schemas
// commonly misuse it for timezone identifier strings ("Europe/London"). A
// genuine time-only value flows through the value check below and renders as
// text.
const resolveDateFormat = (
  prop: InputSchemaProperty,
  value: unknown,
): DateFormat | undefined => {
  if (prop.format === "date") return "date";
  if (prop.format === "date-time") return "datetime-local";
  if (prop.type && prop.type !== "string") return undefined;
  if (value instanceof Date) return "datetime-local";
  if (
    typeof value === "string" &&
    value.length >= 10 &&
    !isNaN(Date.parse(value))
  ) {
    return value.includes("T") ? "datetime-local" : "date";
  }
  return undefined;
};

const getFieldIcon = (
  prop: InputSchemaProperty,
  dateFormat: DateFormat | undefined,
): ReactNode => {
  if (prop.type === "boolean") return <DataTypesBoolean size={16} />;
  if (prop.type === "number" || prop.type === "integer")
    return <DataTypesInteger size={16} />;
  if (dateFormat === "date") return <DataTypesDate size={16} />;
  if (dateFormat === "time") return <TimeIcon />;
  if (dateFormat === "datetime-local") return <DataTypesDatetime size={16} />;
  if (prop.type === "array") return <DataTypesArray size={16} />;
  if (prop.type === "object") return <DataTypesObject size={16} />;
  return <DataTypesString size={16} />;
};

interface FieldLabelProps {
  prop: InputSchemaProperty;
  fieldKey: string;
  isRequired?: boolean;
  hasError?: boolean;
  /** Resolved date/time format (schema-driven if set, else inferred from value). */
  dateFormat?: DateFormat;
}

export const FieldLabel = ({
  prop,
  fieldKey,
  isRequired,
  hasError = false,
  dateFormat,
}: FieldLabelProps) => {
  return (
    <span
      className={cn(
        "flex items-center gap-2",
        hasError ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {getFieldIcon(prop, dateFormat)}
      <span>
        {(prop.title as string) || fieldKey}
        {isRequired && <span>*</span>}
      </span>
    </span>
  );
};

export const AgentSchemaField = ({
  prop,
  fieldKey,
  isRequired,
  value,
  onChange,
  onValidationError,
  error = false,
  errorMap,
  disabled,
}: AgentSchemaFieldProps) => {
  const { t } = useTranslation();
  const showRequired = isRequired || hasAnyRequiredDescendant(prop);
  const dateFormat = resolveDateFormat(prop, value);
  const label = (
    <FieldLabel
      prop={prop}
      fieldKey={fieldKey}
      isRequired={showRequired}
      hasError={error}
      dateFormat={dateFormat}
    />
  );

  if (prop.type === "boolean") {
    return (
      <FieldShell
        label={label}
        error={error}
        disabled={disabled}
        helperText={prop.description}
      >
        <RadioGroup
          className="flex gap-4"
          value={value === undefined ? "" : String(value)}
          onValueChange={(nextValue: string) => onChange(nextValue === "true")}
          disabled={disabled}
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="true" />
            {t("agent_schema_boolean_true")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="false" />
            {t("agent_schema_boolean_false")}
          </label>
        </RadioGroup>
      </FieldShell>
    );
  }

  if (dateFormat) {
    return (
      <FieldShell
        label={label}
        error={error}
        disabled={disabled}
        helperText={prop.description}
      >
        <Input
          type={dateFormat}
          value={(value as string) ?? ""}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className={cn(
            "relative w-full bg-background pr-10",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "[&::-webkit-calendar-picker-indicator]:right-3",
            "[&::-webkit-calendar-picker-indicator]:top-1/2",
            "[&::-webkit-calendar-picker-indicator]:-translate-y-1/2",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        />
      </FieldShell>
    );
  }

  if (prop.type === "object") {
    return (
      <ObjectField
        prop={prop}
        fieldKey={fieldKey}
        isRequired={isRequired}
        value={value}
        onChange={onChange}
        onValidationError={onValidationError}
        error={error}
        errorMap={errorMap}
        disabled={disabled}
        label={label}
      />
    );
  }

  if (prop.type === "array") {
    return (
      <ArrayField
        prop={prop}
        fieldKey={fieldKey}
        isRequired={isRequired}
        value={value}
        onChange={onChange}
        onValidationError={onValidationError}
        error={error}
        disabled={disabled}
        label={label}
      />
    );
  }

  if (prop.enum) {
    const enumValues = prop.enum as string[];
    const oneOfOptions = (prop.oneOf ?? []) as Array<{
      const: string;
      title?: string;
    }>;
    const oneOfMap = new Map(
      oneOfOptions.map((o) => [o.const, o.title ?? o.const]),
    );
    return (
      <FieldShell
        label={label}
        error={error}
        disabled={disabled}
        helperText={prop.description}
      >
        <Select
          value={value === undefined ? "" : String(value)}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              "w-full bg-background",
              error && "border-destructive focus:ring-destructive",
            )}
          >
            <SelectValue placeholder={t("agent_schema_select_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {enumValues.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {oneOfMap.get(opt) ?? opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldShell>
    );
  }

  const isNumeric = prop.type === "number" || prop.type === "integer";
  return (
    <FieldShell
      label={label}
      error={error}
      disabled={disabled}
      helperText={prop.description}
    >
      <Input
        value={value === undefined ? "" : String(value)}
        type={isNumeric ? "number" : "text"}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const val = e.target.value;
          onChange(isNumeric ? (val === "" ? undefined : Number(val)) : val);
        }}
        placeholder={
          isNumeric
            ? t("agent_schema_number_placeholder")
            : t("agent_schema_text_placeholder")
        }
        className={cn(
          "bg-background",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
    </FieldShell>
  );
};
