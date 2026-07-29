---
"@uipath/ui-widgets-validation-station": major
---

Load the Validation Station web component at runtime from a URL you host, via the new `@uipath/du-utils` package, instead of bundling it from `@uipath/du-validation-station-wc`. Consumers must now call `configureValidationStationWc({ deploymentUrl })` once at app startup, and no longer need any bundler configuration.

**Breaking:** nothing renders until `configureValidationStationWc` has been called. It takes `deploymentUrl` (where the web component's files are served from) and optional `includeFonts`. Loading is cached per page, so a repeat call with a different URL is ignored; a failed load is not cached, so calling again retries. The returned promise is the error channel — attach a `.catch`, or a load failure leaves the widgets in their loading state.

Previously the component was imported as a bare module specifier, which put a prebuilt Angular bundle into the consumer's module graph. Because that bundle resolves `du-assets/`, `styles.css`, `fonts.css`, and `media/` against its own `import.meta.url`, every consumer had to replicate bundler-specific setup: copy those files next to the emitted chunks at build time, opt the package out of dependency pre-bundling, and — on any dev server that serves `.css` as a JS module — intercept the component's raw `fetch("styles.css")` so it received real CSS rather than JavaScript. Getting it wrong failed silently: no build error, but PDFs would not render and every icon fell back to a system font. The README carried separate Vite and webpack recipes for this, and neither covered other toolchains.

Serving the files statically removes the whole class of problem, because the bundler is no longer involved in resolving them. `@uipath/du-validation-station-wc` remains a dependency — it supplies the standalone element type declarations (imported as types only, so it contributes nothing at runtime) and is the source directory to copy from.

Note that the deployment URL, not the installed package version, now determines which web component version actually runs; keep the hosted copy in step with the version the types are built against.
