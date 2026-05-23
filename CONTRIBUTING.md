# Contributing to Riftlytics

Thank you for your interest in contributing to Riftlytics! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and professional. We're building this together.

## Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ or pnpm
- Git

### Setup Development Environment

1. Clone the repository

```bash
git clone https://github.com/yourusername/riftlytics.git
cd riftlytics
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Development Workflow

### Branch Naming

- Feature: `feature/short-description`
- Bug fix: `fix/short-description`
- Documentation: `docs/short-description`

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(api): add profile caching
fix(queries): resolve memory leak in useProfileQuery
docs(readme): update setup instructions
```

### Code Style

We use ESLint and Prettier for code formatting. They run automatically on commit.

**Manual checks:**

```bash
npm run lint              # Run ESLint
npx prettier --check src  # Check formatting
npx prettier --write src  # Auto-format
```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the code standards in `CLAUDE.md`
- Keep commits atomic and logical
- Write descriptive commit messages

### 3. Test Your Changes

```bash
npm run test              # Run tests
npm run test -- --watch   # Watch mode
```

### 4. Build & Type Check

```bash
npm run build
npx tsc --noEmit
```

### 5. Create a Pull Request

- Use the PR template
- Link related issues
- Request reviews from maintainers
- Address feedback

## Code Standards

See [CLAUDE.md](../CLAUDE.md) for detailed standards including:

- Naming conventions
- File structure
- TypeScript patterns
- Testing requirements

## Testing

### Unit Tests

```bash
npm run test -- src/lib/errors.test.ts
```

### Watch Mode

```bash
npm run test -- --watch
```

### Coverage

```bash
npm run test -- --coverage
```

Target: 80%+ coverage

## Documentation

- Update README.md for user-facing features
- Add JSDoc comments to public APIs
- Update CLAUDE.md for architectural changes
- Include examples in complex features

## Getting Help

- Check existing issues and discussions
- Ask in pull request comments
- Create a new discussion for general questions

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a release PR
4. Tag release when merged
5. Publish to npm

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🚀
