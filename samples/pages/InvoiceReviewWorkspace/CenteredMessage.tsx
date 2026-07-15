import { Box, Typography } from "@mui/material";

interface CenteredMessageProps {
  text: string;
}

function CenteredMessage({ text }: CenteredMessageProps) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {text}
      </Typography>
    </Box>
  );
}

export default CenteredMessage;
