import { createContext, useContext } from "react";

/**
 * DOM node that the widget's dropdown portals (Select, Combobox) render into.
 * `null` means no provider is mounted yet, in which case consumers fall back
 * to `document.body` — matching Radix's default.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export const usePortalContainer = (): HTMLElement | null =>
  useContext(PortalContainerContext);
