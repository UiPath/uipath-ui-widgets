import { Box, Typography } from "@mui/material";

interface PanelProps {
  area: string;
  label?: string;
  children: React.ReactNode;
}

function Panel({ area, label, children }: PanelProps) {
  return (
    <Box
      sx={{
        gridArea: area,
        minHeight: 0,
        minWidth: 0,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {label ? <PanelHeader label={label} /> : null}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</Box>
    </Box>
  );
}

interface PanelHeaderProps {
  label: string;
}

function PanelHeader({ label }: PanelHeaderProps) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        color: "text.secondary",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
  );
}

export default Panel;
