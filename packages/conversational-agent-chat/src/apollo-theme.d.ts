// Re-declare Apollo's MUI Palette augmentation locally.
// Apollo already declares this in @uipath/apollo-react, but
// skipLibCheck: true (required due to React type mismatches in dependencies)
// prevents TypeScript from processing it.
// Same pattern used elsewhere
import type { Palette as ApolloPalette } from "@uipath/apollo-core/tokens/jss/palette";

declare module "@mui/material/styles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Palette extends ApolloPalette {}
}
