# Hosting the web component

> **Note: Applies to `@uipath/ui-widgets-validation-station` with web component `1.0.0-rc.6`.**
> Start with the [package README](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#readme) for install, hosting and a working Coded Action App.

The full version of the README's hosting steps: how the loader works, what the served folder must contain, and the security and versioning notes.

The widgets in this package render the Validation Station **web component**, which ships as a prebuilt Angular bundle in [`@uipath/du-validation-station-wc`](https://www.npmjs.com/package/@uipath/du-validation-station-wc). The bundle is **not** imported by the package — it is loaded at runtime from a URL you host, via [`@uipath/du-utils`](https://www.npmjs.com/package/@uipath/du-utils).

That means there is no bundler configuration to write. You need two things:

1. Serve the contents of `node_modules/@uipath/du-validation-station-wc` as static files at `du-vs-wc`, next to your app's own root (see the default below — pass an explicit `deploymentUrl` if you host it somewhere else).
2. Call `configureValidationStationWc` once, before rendering any widget.

```ts
import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";

configureValidationStationWc({
  // Set true unless your app already loads Material Icons globally —
  // otherwise every icon renders as its ligature text. See "Fonts" below.
  includeFonts: true,
}).catch((error) => {
  console.error("Validation Station web component failed to load", error);
});
```

`deploymentUrl` defaults to `du-vs-wc` joined onto `getAppBase()` — `/du-vs-wc` on a plain host, or the deployed app's own base path if you are running as a UiPath Coded App. Most integrations need nothing more than the call above. Pass an explicit `deploymentUrl` only when the web component is hosted somewhere that default doesn't reach:

```ts
import {
  configureValidationStationWc,
  joinDeploymentUrl,
} from "@uipath/ui-widgets-validation-station";

configureValidationStationWc({
  // A literal, a build-time constant, or a resolver — see "Notes" below.
  deploymentUrl: joinDeploymentUrl(
    "https://cdn.example.com/my-app",
    "du-vs-wc",
  ),
  includeFonts: true,
});
```

`joinDeploymentUrl(base, path)` exists because hand-rolled string concatenation is an easy way to end up with a doubled or missing slash — it strips any trailing slash from `base` and any leading slash from `path` before joining them, regardless of which one supplied it (or neither).

The served directory must keep the package's own layout, because the bundle resolves these against its own `import.meta.url`:

```
/du-vs-wc/
├── main.js          ← entry, plus its hashed chunk-*.js siblings
├── polyfills.js     ← must load before main.js (the loader handles ordering)
├── styles.css       ← fetched as raw CSS and adopted into the shadow root
├── fonts.css        ← Material Icons only (opt-in via includeFonts)
├── media/           ← the font files fonts.css references
└── du-assets/       ← pdf.js scripts, cmaps, wasm decoders, translations,
                       the business-rules executor
```

Copying the package directory verbatim satisfies this.

## Serving it with Vite

> **Success: No `vite.config.ts` changes are needed**
> Since `1.1.0` the web component is fetched at runtime instead of imported, so it never enters the module graph. The `optimizeDeps.exclude`, asset-copy plugin and dev-server middleware that `1.0.x` required are all obsolete — delete them (see [Migrating from 1.0.x](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/UPGRADING.md#migrating-from-10x)). A Vite app needs nothing in its config beyond whatever it already has.

What it does need is the package copied into `public/`, which Vite serves verbatim in dev and copies to `dist/` on build. The [sample apps](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#going-further) all do it with one script wired to the `predev` and `prebuild` hooks, so a plain `npm run dev` or `npm run build` stages it:

```json title="package.json"
{
  "scripts": {
    "stage-du-wc": "node scripts/stage-du-wc.mjs",
    "predev": "npm run stage-du-wc",
    "prebuild": "npm run stage-du-wc"
  },
  "devDependencies": {
    "@uipath/du-validation-station-wc": "1.0.0-rc.6"
  }
}
```

The script copies `node_modules/@uipath/du-validation-station-wc` to `public/du-vs-wc` — which is exactly where the `deploymentUrl` default looks — skipping the npm metadata, verifying that `main.js`, `polyfills.js`, `styles.css`, `fonts.css` and `du-assets/` all landed, and stamping the staged version so a repeat run is a no-op. Take it as-is: [`scripts/stage-du-wc.mjs`](https://github.com/UiPath/uipath-typescript/blob/main/samples/document-validation-app/scripts/stage-du-wc.mjs).

> **Tip: Keep `public/du-vs-wc` out of git**
> It is generated, and it is tens of megabytes — the fonts alone are most of it. Add it to `.gitignore` and let the `predev` / `prebuild` hooks produce it.

## Fonts

The `fonts.css` in `@uipath/du-validation-station-wc` carries **Material Icons
only** — the one font the component cannot do without. The Apollo text fonts
(Poppins, Noto Sans, Inconsolata) are not in the package, so the component's
text inherits your app's own font stack. A UiPath-styled host already loads
them; to get the UiPath typography otherwise, install
[`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts) and
import its `font.css` in your app. That file contains Material Icons as well, so
`includeFonts` can then stay off.

A UiPath-hosted deployment of the web component is built with the full font set,
so `includeFonts: true` against one of those links the Apollo fonts too.

## Notes

- **Call it once.** Loading is cached per page, so a second call with a different `deploymentUrl` is ignored. A _failed_ load is not cached — call again to retry.
- **The returned promise is the error channel.** Components only observe success; a bad URL or a 404 surfaces on the promise, so attach a `.catch`. Without it, a load failure leaves the widgets showing their loading state.
- **`du-assets/` and `media/` are outside that promise.** The loader only ever touches `polyfills.js`, `main.js`, `styles.css` and `fonts.css`; the web component fetches those two directories itself, at render time. Without `du-assets/`, PDF rendering and translations 404 silently while business-rules validation rejects outright — its executor is pulled in with a dynamic `import()`, so it fails loudly where the rest degrades quietly. Without `media/`, `fonts.css` resolves but every `url()` inside it 404s, so `includeFonts: true` loads no fonts.
- **`deploymentUrl` accepts a resolver.** Pass `() => string | Promise<string>` instead of a plain string for cases where the URL isn't known synchronously — it is called lazily, at most once per load.
- **`deploymentUrl` is a script source.** The loader injects `<script type="module" src>` from it, so whoever controls the URL executes code in your app's origin. Pass a literal, a build-time constant, or a resolver derived from one of those — never a value from `location`, a query parameter, or other user input.
- **CSP.** Serving from your own origin needs no more than `script-src 'self'`. A separate origin must be added to `script-src` and `style-src`, and note that the loader offers no Subresource Integrity hook — self-hosting avoids that exposure entirely.
- **Version skew.** The URL decides which web component version actually runs, and it is not checked against the installed `@uipath/du-validation-station-wc`. Keep the hosted copy in step with the version this package's types are built against.
