# Changelog

All notable consumer-facing changes to `@uipath/du-document-viewer-wc`
are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package
follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0-beta.1] - 2026-11-11

First beta.

### Added

- `<ui-du-document-viewer-wc-element>` and its persistent variant: the document viewer of
  Validation Station and Classification Station as a standalone element. It makes no HTTP calls
  and holds no extraction or classification data. The persistent variant keeps its state across
  DOM detachment; call `forceDestroy()` when you remove it for good.
- Content inputs: the digitized document (`dom`), the original (`document`) and the text (`text`).
- Reference inputs, each a DU content reference:
  - `highlightReference`: highlighted and scrolled to.
  - `passiveReferences`: drawn as a passive highlight, such as every extracted value. The user
    can show or hide it from the viewer menu.
  - `outlineReference`: outlined, such as the value the user hovers in another element.
- `goToPage` navigates to a 1-based page or to `'next'`, `'previous'`, `'first'` or `'last'`,
  and reports the outcome in `goToPageResult`.
- `options` (`DocumentViewerOptions`), the same viewer configuration the Validation Station and
  Classification Station elements take. Its `floatingButtonsOptions` hide the text-view toggle,
  the selection-mode button, the search and each menu entry (`hideExtractedTokensToggle` for the
  passive highlight), and pick the starting selection mode. `autoRotationThreshold` tunes
  automatic page rotation, and `disableSelection` turns selection off.
- `theme` (`WcTheme`, including the Apollo Modern `'future-light'` and `'future-dark'`) and
  `language`.
- Events: `ready`, `pageCountChange`, `currentPageChange`, `textModeChange`, `goToPageResult`,
  `referenceSelect` (the user's selection, as a DU content reference) and `switchPanelSides`.
- TypeScript contracts in `types.d.ts`: `IDocumentViewerWcElement`,
  `IPersistentDocumentViewerWcElement`, `IDocumentViewerWcEventMap`, `IDocumentViewerWcJsxProps`
  and the types they reference. `@uipath/uipath-typescript` is a peer dependency, for
  `DocumentEntity` and `ResultsContentReference`.
- Entries: `main`, `polyfills`, a `styles` side-effect entry that registers the theme adopted into
  the element's shadow root, and `fonts.css` with Material Icons.
