# UiPath UI Widgets

[![Test](https://github.com/UiPath/uipath-ui-widgets/actions/workflows/test.yml/badge.svg)](https://github.com/UiPath/uipath-ui-widgets/actions/workflows/test.yml)
[![Build & Deploy](https://github.com/UiPath/uipath-ui-widgets/actions/workflows/build.yml/badge.svg)](https://github.com/UiPath/uipath-ui-widgets/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Storybook](https://img.shields.io/badge/Storybook-10.2-ff4785.svg)](https://storybook.js.org/)

A collection of reusable React UI components for UiPath applications.

## 📦 Packages

### [@uipath/ui-widgets-datatable](./packages/datatable)

A powerful and flexible datatable component with full CRUD support, master-detail views, inline editing, and more.

**Features:**

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 📊 Master-detail view with grouping
- ✏️ Inline editing with multiple field types
- 🔍 Filtering, sorting, and pagination
- 🎨 Customizable columns and styling
- 🔗 Foreign key relationship support
- 📝 Diff viewer for change review
- ✅ Comprehensive test coverage

### [@uipath/ui-widgets-multi-file-upload](./packages/multi-file-upload)

A multi-file upload component that allows users to select and upload multiple files to a UiPath bucket.

**Features:**

- 📁 Multiple file selection
- ☁️ Upload to UiPath buckets
- ✅ Success/error callbacks
- 🔍 File type filtering
- 📏 File size limits
- 📂 Custom path support

### [@uipath/ui-widgets-external-auth](./packages/external-auth)

A provider-agnostic sign-in widget that renders one button per configured authentication provider and starts login directly at that provider's IdP.

**Features:**

- 🔑 Built-in OIDC authorization-code redirect (CSRF `state` + PKCE) for providers like Google and UAE PASS
- 🔧 Per-provider `onSignIn` override (sync or async) — required for SAML 2.0 backend-initiated flows
- 🎨 apollo-wind design-system styling, custom icons per provider
- 📊 Product telemetry for sign-in attempts and redirect outcomes

### [@uipath/ui-widgets-conversational-agent-chat](./packages/conversational-agent-chat)

A chat interface powered by UiPath Conversational Agents.

**Features:**

- 💬 Real-time streaming responses from conversational agents
- 🗂️ Conversation history and management
- 🎨 Built on UiPath Apollo React components
- 🔌 Powered by the UiPath TypeScript SDK

### [@uipath/ui-widgets-validation-station](./packages/validation-station)

A React wrapper for the UiPath Document Understanding Validation Station.

**Features:**

- 📄 Document validation and review UI as a React component
- ⚙️ Handles web component loading and bucket artifact fetching
- 🧩 Declarative props API for all Validation Station features

### [@uipath/ui-widgets-pdf-viewer](./packages/pdf-viewer)

A PDF viewer widget for UiPath coded apps.

**Features:**

- 📄 Renders PDFs from Orchestrator Storage Buckets, Data Fabric entity attachments, or plain URLs/Blobs
- 🧰 Prop-toggleable toolbar, selectable text, built-in loading/error states
- 📦 pdf.js worker ships inside the package — no CDN or bundler configuration, works behind enterprise CSP/firewalls

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build all packages
npm run build

# Run linter
npm run lint

# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 📚 Storybook

This project uses Storybook for component documentation and development. Storybook provides an interactive UI for viewing and testing components in isolation.

### Running Storybook Locally

```bash
npm run storybook
```

This will start Storybook on [http://localhost:6006](http://localhost:6006).

### Building Storybook

```bash
npm run build-storybook
```

This creates a static build of Storybook in the `storybook-static` directory.

### Deployment

Storybook is deployed to GitHub Pages by the **Publish SDK package** workflow when a package is published officially (dev builds skip it).

## 🚀 Publishing

Packages are published with the **Publish SDK package** workflow (Actions → Publish SDK package → Run workflow):

- **Official release** (no checkboxes): requires `production` environment approval — publishes the selected package to npm as `latest` and to GitHub Packages, and deploys Storybook. Check **beta** to publish to npm under the `beta` dist-tag instead of `latest`.
- **Dev build** (`github_packages_only`): publishes only to GitHub Packages under the `dev` dist-tag — npm and the Storybook deploy are skipped, and no approval is needed. The package version must be a prerelease (e.g. `1.0.0-beta.2`); the run fails fast otherwise, and `latest` is never moved.

### Installing dev builds

One-time setup: create a **classic** GitHub PAT with the `read:packages` scope, authorize it for the UiPath org (**Configure SSO**), then:

```bash
# ~/.npmrc (personal — never commit a token)
//npm.pkg.github.com/:_authToken=YOUR_TOKEN

# project .npmrc (safe to commit)
@uipath:registry=https://npm.pkg.github.com
```

Install with the `dev` tag, e.g.:

```bash
npm install @uipath/ui-widgets-pdf-viewer@dev
```

## 📁 Project Structure

```
uipath-ui-widgets/
├── packages/
│   ├── conversational-agent-chat/  # Conversational agent chat widget
│   ├── datatable/                  # DataTable component
│   ├── external-auth/              # Provider-agnostic sign-in widget
│   ├── multi-file-upload/          # Multi-file upload to storage buckets
│   ├── pdf-viewer/                 # PDF viewer widget
│   └── validation-station/         # Document Understanding Validation Station wrapper
├── samples/                        # Sample applications
└── package.json
```

## 🧪 Testing

This project follows testing best practices with comprehensive unit test coverage:

- **Test Framework**: Vitest
- **Testing Library**: React Testing Library
- **Coverage Target**: 80%+ for statements, branches, functions, and lines

Key testing principles:

- ✅ Test behavior, not implementation
- ✅ Use accessible queries
- ✅ Follow AAA pattern (Arrange-Act-Assert)
- ✅ Mock external dependencies
- ✅ Test edge cases and error states

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **ag-Grid** - Data grid component
- **Material-UI** - UI components
- **Vitest** - Test runner
- **React Testing Library** - Component testing

## React Compiler

The React Compiler is enabled on this project. See [React Compiler documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
