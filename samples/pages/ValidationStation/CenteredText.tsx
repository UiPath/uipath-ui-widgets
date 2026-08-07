import { Box, Typography } from "@mui/material";

interface CenteredTextProps {
  children: React.ReactNode;
  /** MUI palette path, e.g. `"error.main"` for a failure message. */
  color?: string;
}

/** Full-height centered status text: empty, loading and error states. */
function CenteredText({
  children,
  color = "text.secondary",
}: CenteredTextProps) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color={color}>
        {children}
      </Typography>
    </Box>
  );
}

export default CenteredText;
