# Security Review Report: uipath-ui-widgets

**Date:** 2026-02-24
**Repository:** uipath-ui-widgets (monorepo)
**Total packages in dependency tree:** 563
**Packages:** `multi-file-upload`, `datatable`, `conversational-agent-chat`

---

## 1. Package Vulnerabilities (CVEs)

**npm audit found 11 vulnerabilities** (1 moderate, 10 high). All are in **dev dependencies only** — none affect production builds.

| CVE / Advisory                                                           | Package             | Severity     | Description                     | Fix                     |
| ------------------------------------------------------------------------ | ------------------- | ------------ | ------------------------------- | ----------------------- |
| [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) | `ajv` <6.14.0       | **Moderate** | ReDoS when using `$data` option | `npm audit fix`         |
| [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26) | `minimatch` <10.2.1 | **High**     | ReDoS via repeated wildcards    | Upgrade `eslint` to v10 |

The remaining 9 "high" entries are **transitive** — they all trace back to `minimatch` via the `eslint` / `typescript-eslint` chain:

- `@eslint/config-array`, `@eslint/eslintrc`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@typescript-eslint/type-utils`, `@typescript-eslint/typescript-estree`, `@typescript-eslint/utils`, `typescript-eslint`

**Recommendation:** Upgrade `eslint` to v10.x and `typescript-eslint` to a compatible version. Since ESLint 9 is now in limited support (6 months of critical fixes only), this should be prioritized.

---

## 2. Package Integrity & Signatures

| Metric                                   | Value       |
| ---------------------------------------- | ----------- |
| Lockfile version                         | 3 (npm v9+) |
| Packages WITH integrity hashes (SHA-512) | **520**     |
| Packages WITHOUT integrity hashes        | **398**     |

**Findings:**

- 398 packages in the lockfile lack `integrity` hashes. This is common with locally-resolved or file-linked packages and some transitive dependencies, but it weakens supply-chain verification.
- CI/CD publishes with `--provenance` flag (good — enables npm provenance attestation).
- All GitHub Actions are **pinned by SHA hash** (e.g., `actions/checkout@34e114876...`), which is a strong supply-chain security practice.

**Recommendation:** Run `npm install --package-lock-only` to regenerate the lockfile and ensure all remote packages get integrity hashes. Consider enabling `npm config set sign-git-tag true` for signed releases.

---

## 3. Licensing Analysis

### Production Dependencies

| Package                                     | License | Open Source      | Restrictions                                                               | Maintained                   |
| ------------------------------------------- | ------- | ---------------- | -------------------------------------------------------------------------- | ---------------------------- |
| `react` / `react-dom` ^19.2.0               | MIT     | Yes              | None                                                                       | Yes (Meta)                   |
| `@mui/material` ^7.3.5                      | MIT     | Yes              | MUI X components need commercial license; core is free                     | Yes                          |
| `@emotion/react` / `@emotion/styled` ^11.14 | MIT     | Yes              | None                                                                       | Limited (stable but slowing) |
| `socket.io-client` ^4.8.3                   | MIT     | Yes              | None                                                                       | Yes                          |
| `ag-grid-community` ^34.3.1                 | **MIT** | Yes              | Community = MIT, Enterprise = commercial ($999/dev/yr). v34 confirmed MIT. | Yes                          |
| `ag-grid-react` ^34.3.1                     | **MIT** | Yes              | Same as above                                                              | Yes                          |
| `@fontsource/roboto` ^5.2.9                 | OFL-1.1 | Yes              | Can't sell font files standalone                                           | Yes                          |
| `@uipath/apollo-core` ^5.7.0                | MIT     | Yes (public npm) | None                                                                       | Yes (UiPath maintained)      |
| `@uipath/apollo-wind` ^0.10.0               | MIT     | Yes (public npm) | None                                                                       | Yes (UiPath maintained)      |
| `@uipath/apollo-react` ^3.30.2              | MIT     | Yes (public npm) | None                                                                       | Yes (UiPath maintained)      |
| `@uipath/uipath-typescript` 1.1.1           | MIT     | Yes (public npm) | None                                                                       | Yes (UiPath maintained)      |

### Key Dev Dependencies

| Package             | License    | Maintained          | Notes                                      |
| ------------------- | ---------- | ------------------- | ------------------------------------------ |
| `vite` ^7.3.1       | MIT        | Yes                 | Very active                                |
| `vitest` ^4.0.18    | MIT        | Yes                 | Very active                                |
| `typescript` ~5.9.3 | Apache-2.0 | Yes                 | TS 6.0+ coming                             |
| `eslint` ^9.39.1    | MIT        | **Limited support** | v10 released Feb 2026; v9 EOL in ~6 months |
| `storybook` ^10.2.8 | MIT        | Yes                 | ESM-only in v10                            |
| `rollup` ^4.55.1    | MIT        | Yes                 | Very active                                |

**No GPL, AGPL, or copyleft licenses found.** All dependencies use permissive licenses suitable for commercial use.

---

## 4. Hardcoded Secrets & Credentials

| Finding                                            | File                                                                         | Risk     | Details                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------- | -------- | ------------------------------ |
| `secret: "dummy-secret"`                           | `packages/multi-file-upload/src/MultiFileUpload.stories.tsx`                 | **None** | Storybook placeholder          |
| `secret: "dummy-secret"` / `secret: 'your-secret'` | `packages/conversational-agent-chat/src/ConversationalAgentChat.stories.tsx` | **None** | Storybook placeholder          |
| `.env.example` with sample URLs                    | `.env.example`                                                               | **None** | Template file, no real secrets |

**Positive findings:**

- `.gitignore` properly excludes `.env`, `.env.local`, `.env.*.local`
- All CI/CD workflows use GitHub Secrets (`secrets.GITHUB_TOKEN`, `secrets.NPM_TOKEN`)
- Application code uses `import.meta.env` for configuration (no hardcoded values)
- No private keys, certificates, or base64-encoded secrets found

---

## 5. SQL Injection

**No SQL injection risk.** This is a frontend-only UI widget library. No database connections, SQL queries, ORMs, or database drivers were found anywhere in the codebase.

---

## 6. Command Injection

| Finding                                | File                                         | Risk     | Details                                             |
| -------------------------------------- | -------------------------------------------- | -------- | --------------------------------------------------- |
| `execFileSync("sass", [...args], ...)` | `packages/datatable/scripts/build-styles.js` | **None** | Uses array arguments (safe), no shell interpolation |

**No command injection vulnerabilities found.** The single use of `child_process` uses `execFileSync` with an array of arguments, which does not invoke a shell and is safe from injection.

---

## 7. Other Injection / Code Quality Findings

| Issue                                     | File                                                       | Severity | Description                                                                                                          |
| ----------------------------------------- | ---------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| Path traversal (unvalidated `path` param) | `packages/multi-file-upload/src/MultiFileUpload.tsx:34-42` | **Low**  | The `path` prop is concatenated with filenames without checking for `..` sequences. Mitigated by backend validation. |
| Base64 decode without try-catch           | `packages/conversational-agent-chat/src/utils.ts:51`       | **Low**  | `atob()` call on attachment data lacks error handling. Malformed base64 will throw unhandled.                        |
| No XSS found                              | All React components                                       | **None** | No `dangerouslySetInnerHTML`, `innerHTML`, `eval()`, or `document.write()` usage detected.                           |

---

## 8. CI/CD & Supply Chain Security

### Strengths

- GitHub Actions pinned by commit SHA (not mutable tags)
- `zizmor` workflow scanner integrated in PR checks
- `npm audit --audit-level=high` runs on every PR
- Publish with `--provenance` for npm attestation
- `persist-credentials: false` on checkout actions
- Minimal permissions scoped per workflow

### Concerns

| Finding                                   | Severity   | Details                                                                                                                                  |
| ----------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--legacy-peer-deps` used in all installs | **Medium** | Bypasses peer dependency conflict checks, could mask incompatibilities or allow vulnerable transitive versions                           |
| `contents: write` in build-and-deploy.yml | **Low**    | Broader than needed for PR builds (only needed for release push). Consider splitting into separate jobs with conditional permissions     |
| 2 invalid dependency resolutions          | **Low**    | `@uipath/ui-widgets-conversational-agent-chat` and `@uipath/ui-widgets-datatable` show as invalid in `npm ls` (likely not built locally) |

---

## 9. Package Maintenance Summary

| Status                          | Packages                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actively maintained**         | react, react-dom, @mui/material, vite, vitest, typescript, rollup, storybook, socket.io-client, ag-grid-_, @fontsource/roboto, all @uipath/_ packages |
| **Limited/slowing maintenance** | @emotion/react, @emotion/styled (stable but runtime CSS-in-JS falling out of favor)                                                                   |
| **Entering EOL**                | eslint v9 (v10 released; 6-month limited support window)                                                                                              |

---

## 10. Prioritized Recommendations

### High Priority

1. **Upgrade ESLint to v10.x** — Resolves all 10 high-severity `minimatch` ReDoS CVEs and exits the EOL support window
2. **Run `npm audit fix`** — Fixes the moderate `ajv` vulnerability immediately
3. **Regenerate lockfile** — Run `npm install --package-lock-only` to ensure all 398 packages without integrity hashes get SHA-512 checksums

### Medium Priority

4. **Remove `--legacy-peer-deps`** — Resolve peer dependency conflicts properly instead of bypassing checks. This flag hides potential version incompatibilities
5. **Add path validation** in `MultiFileUpload.tsx` — Reject paths containing `..` to prevent directory traversal at the client layer
6. **Wrap `atob()` in try-catch** in `utils.ts` — Handle malformed base64 attachments gracefully

### Low Priority

7. **Split CI permissions** — Use separate jobs for PR checks (read-only) vs release deployment (write) in `build-and-deploy.yml`
8. **Monitor Emotion/CSS-in-JS** — Track MUI's plans for CSS-in-JS alternatives (Pigment CSS) as a future migration path
9. **Monitor AG Grid licensing** — v34 Community is MIT, but periodically verify this hasn't changed in newer versions

---

**Overall Assessment:** The repository demonstrates strong security practices — SHA-pinned actions, provenance publishing, automated security scanning, proper secrets management, and no critical injection vulnerabilities. The main action items are upgrading ESLint to resolve CVEs and regenerating the lockfile for full integrity coverage.
