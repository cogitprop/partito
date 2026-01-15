# Contributing to Partito

Thank you for your interest in contributing to Partito! This document provides guidelines and information for contributors.

## Code of Conduct

Be kind, respectful, and constructive. We're all here to make something great together.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### Suggesting Features

1. Check existing [Issues](../../issues) for similar suggestions
2. Create a new issue with the "enhancement" label
3. Describe the feature and why it would be valuable

### Submitting Code

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test** your changes locally
5. **Commit** with clear messages:
   ```bash
   git commit -m "Add: brief description of change"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** against `main`

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/partito.git
cd partito

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Fill in your Supabase credentials

# Start development server
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes

### React

- Functional components with hooks
- Keep components focused and small
- Use the existing component patterns in `src/components/partito/`

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system in `tailwind.config.ts`
- Use design tokens from `src/lib/design-tokens.ts`

### File Organization

- Pages go in `src/pages/`
- Reusable components go in `src/components/partito/`
- Hooks go in `src/hooks/`
- Utilities go in `src/lib/`

## Commit Message Format

Use clear, descriptive commit messages:

- `Add:` New feature or file
- `Fix:` Bug fix
- `Update:` Changes to existing functionality
- `Remove:` Removing code or files
- `Refactor:` Code restructuring without behavior change
- `Docs:` Documentation only changes

Examples:
```
Add: password hint display on event view
Fix: capacity check race condition in RSVP submission
Update: email template styling for dark mode
Docs: add self-hosting guide to README
```

## Pull Request Guidelines

- Keep PRs focused on a single change
- Update documentation if needed
- Ensure all tests pass
- Add screenshots for UI changes
- Link related issues in the description

## Questions?

Feel free to open an issue for any questions about contributing.

## License

By contributing to Partito, you agree that your contributions will be licensed under the AGPL-3.0 license.
