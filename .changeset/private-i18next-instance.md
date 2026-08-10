---
"@uipath/ui-widgets-conversational-agent-chat": patch
---

Render the widget's own strings when the host application owns i18next.

`initI18n()` initialized the shared default i18next instance behind an `if (i18next.isInitialized) return` guard. In a host that owns i18next and initializes first — Studio Web / flow-workbench — that guard skipped the widget's init entirely, so its catalog never loaded and every string rendered as its raw key (`chat_input_placeholder`, `disclaimer_message`, `loading`, `reload`, …). Hosts could not work around it either, since the catalog is not exported.

The widget now creates a private instance via `i18next.createInstance()`, exposed as `getI18n()`. Components read it through a new `useWidgetTranslation()` hook rather than a bare `useTranslation()`, which also keeps the widget's separate React roots (settings dialog, tool confirmation) working — those inherit no React context. The instance deliberately does not register `initReactI18next`, so react-i18next's global default continues to belong to the host.

Hosts without i18next are unaffected. As a side effect the widget no longer changes the host's language via the `locale` prop, and no longer mutates global i18next state on import.
