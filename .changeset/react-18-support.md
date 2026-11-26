---
"@uipath/ui-widgets-document-viewer": minor
"@uipath/ui-widgets-validation-station": minor
"@uipath/ui-widgets-classification-station": minor
"@uipath/ui-widgets-datatable": minor
"@uipath/ui-widgets-conversational-agent-chat": minor
"@uipath/ui-widgets-decisions-and-reasons": minor
"@uipath/ui-widgets-external-auth": minor
"@uipath/ui-widgets-multi-file-upload": minor
"@uipath/ui-widgets-pdf-viewer": minor
---

Support React 18.3 hosts. The peer range is now `react@^18.3.0 || ^19.0.0`. On React 18, the Document Viewer, Validation Station (and its subcomponents) and Classification Station assign their web component's inputs as properties, as React 19 does, and remove their event listeners (and tear down a `persistent` element) on unmount.
