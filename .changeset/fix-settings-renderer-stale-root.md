---
"@uipath/ui-widgets-conversational-agent-chat": patch
---

Stop the settings panel from crashing the host application when it is closed and reopened.

`renderSettings` mounted its React root directly on the element Apollo hands to `settingsRenderer`. Apollo's `AutopilotChatSettings` effect clears that element's `innerHTML` on every settings toggle — including close, where it returns without calling the renderer back — so closing the panel detached the root's DOM behind React's back. The next invocation then called `unmount()` on that stale root and React threw `NotFoundError: The node to be removed is not a child of this node` out of `removeChild`. Because React defers a synchronous unmount requested while it is already rendering, the throw escaped Apollo's `try/catch` around the renderer and surfaced as an uncaught error: in flow-workbench's debug Chats panel it took down the entire Studio shell, leaving the host error page painted over a still-mounted chat.

The root now mounts on a child element the widget appends to Apollo's container. The wipe detaches that wrapper wholesale and its subtree stays attached to it, so `unmount()` remains valid. The same stale-root path also ran on widget teardown (the unmount `useEffect`) whenever the panel had been closed first, and is fixed by the same change.

The added wrapper is inert for styling: `postcss-scope-selectors` scopes the shipped stylesheet by descendant, so an extra level inside `.uipath-conversational-agent-chat` still matches.
