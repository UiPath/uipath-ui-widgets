# How to Contribute

Thank you for your interest in contributing to UiPath UI Widgets! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `develop`
4. **Make your changes** and test them
5. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/uipath-ui-widgets.git
cd uipath-ui-widgets

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Start Storybook for development
npm run storybook
```

## Project Structure

This is a monorepo using npm workspaces with the following packages:

```
packages/
  datatable/                 # DataTable component
  multi-file-upload/         # Multi-file upload component
  conversational-agent-chat/ # Conversational agent chat component
  external-auth/             # Provider-agnostic sign-in widget
```

## Available Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run dev`           | Start Vite dev server          |
| `npm run build`         | Build all packages             |
| `npm run test`          | Run tests for all packages     |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint`          | Run ESLint                     |
| `npm run storybook`     | Start Storybook on port 6006   |

## Code Quality

### Pre-commit Hooks

This project uses Husky to run pre-commit hooks:

- **Prettier** - Automatically formats staged files
- **ESLint** - Lints the codebase

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages must follow this format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Examples:**

```
feat(datatable): add row selection feature
fix(multi-file-upload): handle large file uploads
docs: update README with new examples
```

### Code Coverage

All packages must maintain **80% code coverage** for new code. The CI pipeline will fail if coverage drops below this threshold.

## Internationalization (i18n)

The `conversational-agent-chat` package is consumed by both external customers
and UiPath internal production products, so every string rendered to the UI
must be translated. PRs that add hardcoded English strings will fail lint.

**Convention:** wrap user-facing strings with `t("key")` from `react-i18next`
and register the key in `packages/conversational-agent-chat/src/i18n/locales/en/index.json` and `packages/conversational-agent-chat/src/i18n/locales/keys/index.json`.

The rule intentionally ignores `className`, `variant`, `data-*`, `console.*`,
`throw new Error(...)`, enum-like strings, and other non-rendered literals — you
should not need `eslint-disable` in normal development. If the rule fires on
something that isn't user-facing, please flag it on the PR rather than
disabling.

**What the check verifies:**

- `i18next/no-literal-string` — flags untranslated JSX text and specific attrs
- `no-restricted-syntax` — flags raw literals passed to `setError(...)` and
  dynamic keys passed to `t(...)` (see below)
- `npm run check-i18n` — every key used in `t(...)` must exist in `en/index.json`

**`t()` keys must be static string literals.** `t("key")`, `t('key')`, and
``t(`key`)`` are all fine. Dynamic forms are rejected because they silently
leak English — if `t(x)` is called with a value that isn't a registered key,
i18next falls back to rendering the raw key string:

```tsx
// ❌ rejected — dynamic keys can't be verified at PR time
t(someVariable);
t(`error_${type}`);

// ✅ use a switch/conditional on static keys (preferred)
t(isFatal ? "error_fatal" : "error_recoverable");

// ✅ lookup table (preferred when the mapping is closed)
const STATUS_KEYS = {
  active: "status_active",
  pending: "status_pending",
  failed: "status_failed",
} as const;
t(STATUS_KEYS[status]);
```

**Escape hatch** for genuinely dynamic lookups (API-driven enums, error-code
maps): enumerate every possible key in a comment above the call, then disable
the rule on the next line. The enumeration gets picked up by `check-i18n`,
so each listed key is still verified against `en/index.json`:

```tsx
// Possible keys: t("status_active"), t("status_pending"), t("status_failed")
// eslint-disable-next-line no-restricted-syntax -- dynamic key, enumerated above
t(`status_${status}`);
```

This follows [i18next-parser's documented workaround](https://github.com/i18next/i18next-parser#caveats)
for dynamic keys. If the enumeration grows unwieldy, that's a signal to use a
lookup table instead (see above).

Run `npm run lint` locally before pushing.

## Pull Request Process

1. **Ensure your code builds** without warnings: `npm run build`
2. **Run linting**: `npm run lint`
3. **Run tests with coverage**: `npm run test:coverage`
4. **Format your code**: Prettier runs automatically on commit
5. **Write clear commit messages** following Conventional Commits
6. **Submit your pull request** against the `develop` branch

### PR Checks

Your PR must pass the following automated checks:

- Commit message validation (commitlint)
- Code formatting (Prettier)
- Linting (ESLint)
- i18n key coverage (`check-i18n`, see [Internationalization](#internationalization-i18n))
- Unit tests with 80% coverage threshold

## Code Style

- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Write unit tests for new functionality
- Use React functional components with hooks
- Style components using SCSS

## Reporting Issues

When reporting bugs or requesting features:

- Use the issue templates provided
- Include clear steps to reproduce
- Provide environment details (OS, Node version, browser)
- Include relevant code examples or screenshots

## Code of Conduct

We expect all contributors to follow professional standards:

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment
- Follow GitHub's community guidelines

## Questions?

If you have questions about contributing:

- Check existing issues and discussions
- Create a new issue with the "question" label

We appreciate your contributions to making UiPath UI Widgets better!
