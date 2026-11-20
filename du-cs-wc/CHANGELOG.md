# Changelog

All notable consumer-facing changes to `@uipath/du-classification-station-wc`
are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package
follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0-rc.2] - 2026-11-11

Second release candidate for `1.0.0`. Element tags, JS properties and events
from `1.0.0-rc.1` are unchanged. `documentViewerOptions` and
`DisableKeyboardShortcuts` are opt-in; the visible changes are accessibility
fixes, and each group's header is taller to fit its document-type label.

> 🚀 This is a **release candidate**. Public APIs (element tags, JS
> properties, events) are now considered stable and are not expected to
> change before `1.0.0`. Please report any issues before the stable release.

### Added

- `DisableKeyboardShortcuts` on `FeatureCustomization`. When `true`, the
  element turns its keyboard shortcuts off for every user, overriding the
  setting a user picks in the keyboard-shortcuts dialog: the station's
  shortcuts stop responding, their hints are hidden, and the document viewer
  menu drops its "Show available keyboard shortcuts" entry. Inside the
  document viewer, the toolbar hints, the search box's Enter navigation and
  the Alt+−, Alt++ and Alt+0 zoom keys still work. Omitted or `false`, each
  user's own setting applies.
- A `documentViewerOptions` input, typed `DocumentViewerOptions`: the same
  document-viewer configuration `@uipath/du-validation-station-wc` and
  `@uipath/du-document-viewer-wc` take. `floatingButtonsOptions` hides the
  text-view toggle (`hideTextView`), the selection-mode button
  (`hideInteractionTypeButton`), the search (`hideSearch`) and the menu's
  "Switch panel sides" (`hideSwitchPanelSidesButton`) and "Show available
  keyboard shortcuts" (`hideKeyboardShortcutsButton`) entries, and
  `defaultInteractionType` picks the selection mode the viewer starts in.
  `autoRotationThreshold` tunes automatic page rotation, and
  `disableSelection` turns word and area selection off. Unset, the viewer is
  unchanged. New exports: `DocumentViewerOptions`,
  `DocumentViewerFloatingButtonsOptions`, `InteractionType`.
- `theme` accepts the Apollo Modern themes, `'future-light'` and
  `'future-dark'`. The accepted ids are exported as `WcTheme`.

### Fixed

- Highlighting a group's reference and stepping through search matches no
  longer scroll the host page, or shift the page image inside the viewer.
- Accessibility:
  - Each group's document-type picker has a visible "Document type" label,
    where it had only a screen-reader name. The group header is taller to fit
    it.
  - The split control between two page thumbnails is named "Split after page
    N", is reachable with Tab, and shows a focus ring.
  - Each group's thumbnails form a named list. Each thumbnail is named "Page N
    of M", where it read "Select page", and marks the current page. Arrow-key
    page navigation moves the focus along with the selection.
  - The page navigator's input shows a "Go to page" tooltip on hover and focus.
  - Closing the keyboard-shortcuts dialog opened from the viewer menu returns
    focus to the menu button.

## [1.0.0-rc.1] - 2026-09-28

First release candidate for `1.0.0`. Element tags, JS properties and events
are unchanged since `1.0.0-beta.1`.

> 🚀 This is a **release candidate**. Public APIs (element tags, JS
> properties, events) are now considered stable and are not expected to
> change before `1.0.0`. Please report any issues before the stable release.

### Changed

- **`fonts.css` no longer carries the Apollo text fonts** — only Material
  Icons. The import is unchanged:

  ```ts
  import '@uipath/du-classification-station-wc/fonts.css';
  ```

  Poppins, Noto Sans (including the CJK subsets), Inconsolata and the Apollo
  icon font were tens of MB of the install, a UiPath-styled host already loads
  them, and without them the component inherits your app's own font stack —
  which is what most embedders want. Material Icons stay, because without those
  every icon renders as its ligature text.

  If you do want the UiPath typography, install
  [`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts)
  and import its `font.css` — it also contains Material Icons, so it can replace
  the `fonts.css` import outright. Loading the WC from a UiPath-hosted
  deployment URL with `{ includeFonts: true }` is unaffected: that deployment
  is built with the full set. See the README "Fonts" section.

## [1.0.0-beta.1]

First public release. Ships the **standalone** Classification Station element:

### Added

- `<ui-du-classification-station-standalone-wc-element>` — the human-in-the-loop
  screen where a reviewer splits a multi-document file into page groups and
  assigns a document type to each, next to the original document. It makes **no
  HTTP calls**: the host supplies every input as a JS property and persists by
  listening to the save-request events, so your backend keeps control of all I/O.
  - Data inputs: `dom`, `text`, `original`, `docTypes`, `classificationResults`,
    `customizationInfo`.
  - Configuration: `documentId`, `theme`, `language`, `isReadonly`,
    `enableSaveAsDraft`, `pdfSettings`, `pageUris`, `enableTokenFeatures`,
    `allowNotClassifiedGroups`, `supportNotClassifiedGroups`,
    `disableShortcutsPanel`, `showCreateNewDocTypeOption`,
    `customNotClassifiedLabel`.
  - Events: `saveClassificationRequest`, `saveClassificationAsDraftRequest`,
    `saveExceptionReportRequest`, plus `dirty`, `hasChanges`,
    `splitClassifications` and `createNewDocType`.
- `<ui-du-classification-station-standalone-wc-persistent-element>` — the same
  element with `disconnectedCallback()` suppressed, for hosts that move it
  through portals or tab switches. Call `forceDestroy()` to tear it down.
- TypeScript contracts in `types.d.ts`:
  `IClassificationStationStandaloneWcElement`,
  `IPersistentClassificationStationStandaloneWcElement`,
  `IClassificationStationStandaloneWcEventMap`,
  `IClassificationStationStandaloneWcJsxProps`, and the DTOs they reference
  (`IClassifierResultDTO`, `IClassificationResultDTO`, `IReportAsExceptionDTO`,
  `ICustomizationInfoDTO`, `SplitClassifications`, and the three save-request
  payloads).
- A `styles` side-effect entry that registers the component's theme CSS with the
  runtime, so the theme is adopted into the element's shadow root without a
  network fetch and without applying anything to the host document.
- Opt-in `fonts.css` for hosts that do not already load Apollo fonts and
  Material Icons.
