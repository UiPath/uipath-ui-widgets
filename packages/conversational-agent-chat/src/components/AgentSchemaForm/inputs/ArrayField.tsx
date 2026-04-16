import { Box, Chip, FormControl, FormLabel } from "@mui/material";
import { useState } from "react";

import type { AgentSchemaFieldProps } from "../AgentSchemaField";

interface ArrayFieldProps extends AgentSchemaFieldProps {
  label: React.ReactNode;
}

export const ArrayField = ({
  value,
  onChange,
  error = false,
  disabled,
  label,
}: ArrayFieldProps) => {
  const chips = (value as string[] | undefined) ?? [];
  const [inputValue, setInputValue] = useState("");

  const addChip = () => {
    const trimmed = inputValue.trim();
    if (trimmed) onChange([...chips, trimmed]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip();
    } else if (e.key === "Backspace" && inputValue === "") {
      onChange(chips.slice(0, -1));
    }
  };

  return (
    <FormControl fullWidth error={error}>
      <FormLabel focused={false}>{label}</FormLabel>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          alignItems: "center",
          border: "1px solid",
          borderColor: error ? "error.main" : "text.primary",
          borderRadius: 1,
          padding: "8px 12px",
          minHeight: "10px",
          backgroundColor: "semantic.colorBackground",
          mt: 1,
          "&:focus-within": { borderColor: "primary.main", borderWidth: "2px" },
        }}
      >
        {chips.map((chip, i) => (
          <Chip
            key={i}
            label={chip}
            size="small"
            disabled={disabled}
            onDelete={() => onChange(chips.filter((_, idx) => idx !== i))}
            sx={{
              backgroundColor: "semantic.colorChipInfoBackground",
              "&:hover": {
                backgroundColor: "semantic.colorChipInfoBackground",
              },
              "& .MuiChip-deleteIcon": { color: "text.secondary" },
            }}
          />
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addChip}
          disabled={disabled}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            minWidth: 60,
            background: "transparent",
            fontSize: "16px",
          }}
        />
      </Box>
    </FormControl>
  );
};
