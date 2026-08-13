---
"@uipath/ui-widgets-conversational-agent-chat": patch
---

Render the client-side tool widget's Submit, Cancel, and description text.

`ClientSideToolRenderer` resolved its labels off the shared default i18next instance (`import i18next from "i18next"`), which the widget stopped initializing when it moved to a private instance. Calling `t()` on an uninitialized instance returns `undefined` — and does not fall back to the inline default string — so the client-side tool prompt rendered with blank buttons. In a host that owns i18next (Studio Web, flow-workbench) the default instance _is_ initialized, but with the host's catalog, so the labels came back as raw keys (`cancel`) instead.

The renderer now reads the widget's own instance via `getI18n()`, mirroring `ToolConfirmationRenderer` — the other imperative renderer that mounts its own React root and therefore resolves labels through a bare `t()` rather than a hook.
