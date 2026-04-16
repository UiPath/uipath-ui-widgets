import type { TextFieldProps } from "@mui/material";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import React from "react";

import { ArrayIcon } from "../../icons/ArrayIcon";
import { BooleanIcon } from "../../icons/BooleanIcon";
import { DateIcon } from "../../icons/DateIcon";
import { DateTimeIcon } from "../../icons/DateTimeIcon";
import { NumbersIcon } from "../../icons/NumbersIcon";
import { ObjectIcon } from "../../icons/ObjectIcon";
import { TextIcon } from "../../icons/TextIcon";
import { TimeIcon } from "../../icons/TimeIcon";
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
  textFieldProps?: Pick<TextFieldProps, "slotProps" | "sx">;
  popperContainer?: Element | null;
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

const getFieldIcon = (prop: InputSchemaProperty): React.ReactNode => {
  if (prop.type === "boolean") return <BooleanIcon />;
  if (prop.type === "number" || prop.type === "integer") return <NumbersIcon />;
  if (prop.format === "date") return <DateIcon />;
  if (prop.format === "time") return <TimeIcon />;
  if (prop.format === "date-time") return <DateTimeIcon />;
  if (prop.type === "array") return <ArrayIcon />;
  if (prop.type === "object") return <ObjectIcon />;
  return <TextIcon />;
};

interface FieldLabelProps {
  prop: InputSchemaProperty;
  fieldKey: string;
  isRequired?: boolean;
  hasError?: boolean;
}

export const FieldLabel = ({
  prop,
  fieldKey,
  isRequired,
  hasError = false,
}: FieldLabelProps) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        color: hasError ? "error.main" : "text.secondary",
        ...(hasError && {
          "& svg path, & svg rect, & svg ellipse": {
            fill: "currentColor !important",
          },
        }),
      }}
    >
      {getFieldIcon(prop)}
      <span style={{ fontSize: "14px", fontWeight: 600 }}>
        {(prop.title as string) || fieldKey}
        {isRequired && <span>*</span>}
      </span>
    </Stack>
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
  textFieldProps,
  popperContainer,
}: AgentSchemaFieldProps) => {
  const showRequired = isRequired || hasAnyRequiredDescendant(prop);
  const label = (
    <FieldLabel
      prop={prop}
      fieldKey={fieldKey}
      isRequired={showRequired}
      hasError={error}
    />
  );

  if (prop.type === "boolean") {
    return (
      <FormControl sx={{ mt: 1, gap: 1 }} error={error} disabled={disabled}>
        <FormLabel focused={false}>{label}</FormLabel>
        <RadioGroup
          value={value === undefined ? "" : String(value)}
          row
          onChange={(e) => onChange(e.target.value === "true")}
        >
          <FormControlLabel
            value="true"
            control={<Radio size="small" />}
            label="True"
          />
          <FormControlLabel
            value="false"
            control={<Radio size="small" />}
            label="False"
          />
        </RadioGroup>
      </FormControl>
    );
  }

  if (
    prop.format === "date" ||
    prop.format === "date-time" ||
    prop.format === "time"
  ) {
    const inputType =
      prop.format === "date"
        ? "date"
        : prop.format === "time"
          ? "time"
          : "datetime-local";
    return (
      <TextField
        size="small"
        label={label}
        fullWidth
        type={inputType}
        value={(value as string) ?? ""}
        error={error}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        {...textFieldProps}
      />
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
        textFieldProps={textFieldProps}
        popperContainer={popperContainer}
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
      <TextField
        size="small"
        label={label}
        fullWidth
        select
        value={value === undefined ? "" : String(value)}
        error={error}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        {...textFieldProps}
        placeholder="Select an option..."
        InputLabelProps={{ shrink: true }}
      >
        {enumValues.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {oneOfMap.get(opt) ?? opt}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  // keep InputLabelProps to force label to be visible when there is no value
  return (
    <TextField
      size="small"
      label={label}
      fullWidth
      value={value === undefined ? "" : String(value)}
      type={
        prop.type === "number" || prop.type === "integer" ? "number" : "text"
      }
      error={error}
      disabled={disabled}
      onChange={(e) => {
        const val = e.target.value;
        onChange(
          prop.type === "number" || prop.type === "integer"
            ? val === ""
              ? undefined
              : Number(val)
            : val,
        );
      }}
      {...textFieldProps}
      placeholder={
        prop.type === "number" || prop.type === "integer"
          ? "Enter a number..."
          : "Enter a value..."
      }
      InputLabelProps={{ shrink: true }}
    />
  );
};
