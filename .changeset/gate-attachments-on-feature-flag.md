---
"@uipath/ui-widgets-conversational-agent-chat": minor
---

Gate file attachments on the tenant's `fileAttachmentEnabled` feature flag, matching the react-sdk.

The widget now fetches CAS feature flags (`ConversationalAgent.getFeatureFlags()`) during chat init, in parallel with resolving the agent so init isn't slowed down. Attachments start disabled and turn on only when the flag is `true`. A flag that is off or missing, or a failed fetch, keeps them off without blocking the chat. `disabledFeatures.attachments: true` still hides attachments when the flag is on, but a host can no longer turn them on for a tenant whose flag is off.
