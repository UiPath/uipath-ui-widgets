import { useState, type ReactNode } from "react";
import { PortalContainerContext } from "./PortalContainerContext";

/**
 * Anchors dropdown portals inside the widget's own DOM subtree instead of
 * `document.body`.
 *
 * Radix-based Select/Popover portal their open menu to the document body by
 * default, which drops it outside whatever the host wrapped the widget in.
 * Across different hosts that surfaces as three distinct bugs: the menu
 * flickers shut (a host click-outside/focus-trap treats the body-level menu as
 * "outside" and dismisses it), clicking does nothing (the widget lives in a
 * shadow root, so the body-level menu lands in a different tree/root than its
 * trigger), or it happens to work (a plain page with nothing competing).
 *
 * Rendering the menu into the boundary node below keeps it in the same
 * tree/root/focus boundary as its trigger, so the dropdowns behave identically
 * regardless of surface. Mount one provider per independent React root
 * (the inline widget tree, the settings panel, each tool-confirmation widget).
 */
export function PortalContainerProvider({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
      {/* display:contents so the boundary itself never affects layout; the
          portaled menus position themselves relative to their triggers. */}
      <div ref={setContainer} style={{ display: "contents" }} />
    </PortalContainerContext.Provider>
  );
}
