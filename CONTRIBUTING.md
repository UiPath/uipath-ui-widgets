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
