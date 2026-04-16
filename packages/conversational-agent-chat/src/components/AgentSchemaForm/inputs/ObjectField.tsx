import {
  Box,
  Collapse,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";

import type {
  AgentSchemaFieldProps,
  InputSchemaProperty,
} from "../AgentSchemaField";
import { AgentSchemaField } from "../AgentSchemaField";
import { ExpandLessIcon } from "../../../icons/ExpandLessIcon";
import { ExpandMoreIcon } from "../../../icons/ExpandMoreIcon";

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
  textFieldProps,
  popperContainer,
  label,
}: ObjectFieldProps) => {
  const theme = useTheme();

  const nestedProperties = prop.properties as
    | Record<string, InputSchemaProperty>
    | undefined;
  const hasNestedProps =
    nestedProperties !== null &&
    nestedProperties !== undefined &&
    Object.keys(nestedProperties).length > 0;

  const [expanded, setExpanded] = useState(true);
  const [objectText, setObjectText] = useState(() => {
    if (hasNestedProps) return "{}";
    if (value === undefined || value === null) return "{}";
    return typeof value === "object"
      ? JSON.stringify(value, null, 2)
      : String(value);
  });
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (hasNestedProps) {
    const objectValue = (
      value === undefined || value === null ? {} : value
    ) as Record<string, unknown>;
    const requiredFields = (prop.required as string[] | undefined) ?? [];

    return (
      <FormControl fullWidth>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => setExpanded((prev) => !prev)}
            sx={{
              color: "text.secondary",
              p: 0,
              ml: 0,
              "&.Mui-focusVisible": { outline: "none", boxShadow: "none" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <FormLabel focused={false}>{label}</FormLabel>
        </Stack>
        <Collapse in={expanded}>
          <Box
            sx={{
              borderLeft: "2px solid",
              borderColor: "divider",
              pl: 2,
              ml: 1,
              mt: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {Object.entries(nestedProperties).map(([nestedKey, nestedProp]) => (
              <AgentSchemaField
                key={nestedKey}
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
                textFieldProps={textFieldProps}
                popperContainer={popperContainer}
              />
            ))}
          </Box>
        </Collapse>
      </FormControl>
    );
  }

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
        setJsonError("Value must be a JSON object");
        onValidationError?.(true);
        onChange(undefined);
      } else {
        setJsonError(null);
        onValidationError?.(false);
        onChange(parsed);
      }
    } catch {
      setJsonError("Invalid JSON syntax");
      onValidationError?.(true);
      onChange(undefined);
    }
  };

  const hasError = error || !!jsonError;

  return (
    <FormControl fullWidth error={hasError}>
      <FormLabel focused={false}>{label}</FormLabel>
      <textarea
        value={objectText}
        onChange={handleObjectChange}
        disabled={disabled}
        style={{
          marginTop: "8px",
          padding: "8px 12px",
          fontSize: "14px",
          fontFamily: "inherit",
          border: `1px solid ${hasError ? theme.palette.error.main : theme.palette.text.primary}`,
          borderRadius: "4px",
          background:
            theme.palette.semantic?.colorBackground ??
            theme.palette.background.default,
          resize: "vertical",
          minHeight: "56px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          color: "inherit",
        }}
      />
      {jsonError && (
        <span
          style={{
            fontSize: "12px",
            color: theme.palette.error.main,
            marginTop: "4px",
          }}
        >
          {jsonError}
        </span>
      )}
    </FormControl>
  );
};
