# Contributing to Relay Studio

Thank you for your interest in contributing to Relay Studio! As an open-source project dedicated to high-velocity software engineering, we welcome pull requests, bug reports, feature suggestions, and documentation improvements.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, professional, and collaborative in all communications, issues, and discussions.

---

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/<your-username>/relay.git
   cd relay
   ```

2. **Branching**
   Create a focused feature branch from `main`:
   ```bash
   git checkout -b feat/triage-keyboard-shortcuts
   # or
   git checkout -b fix/media-attachment-dimensions
   ```

3. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

4. **Environment Initialization**
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```

5. **Run Development Servers**
   ```bash
   npm run dev
   # in another terminal
   php artisan serve
   ```

---

## Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or user-facing functionality
- `fix:` A bug fix
- `refactor:` Code restructuring without functional behavior changes
- `perf:` Performance improvements
- `test:` Adding or updating automated tests
- `docs:` Documentation additions or edits
- `chore:` Maintenance tasks, dependency bumps, or toolchain updates

Examples:
- `feat(triage): add vim j/k card navigation shortcuts`
- `fix(queue): ensure media processing retries on timeout`
- `test(api): add contract tests for work-request endpoints`

---

## Code Quality & Standards

Before opening a pull request, verify that your changes adhere to our coding standards:

### 1. PHP & Laravel Style (Pint)
We enforce clean, modern PHP 8.3 code formatting using Laravel Pint:
```bash
# Check formatting
./vendor/bin/pint --test

# Automatically fix formatting issues
./vendor/bin/pint
```

### 2. Automated Test Suite
Ensure all Unit and Feature tests pass:
```bash
php artisan test
```
When submitting new features or fixing bugs, please include corresponding Feature/Unit tests in `tests/`.

### 3. Frontend Type Checking & Build
Ensure TypeScript compiles cleanly and production Vite bundles succeed:
```bash
npm run build
```

### 4. Stack Health Check
Verify your local environment with Relay Doctor:
```bash
php artisan relay:doctor
```

---

## Pull Request Guidelines

1. **Self-Review**: Review your own diff before opening the PR. Remove unused debugging logs, temporary scratch files, and extraneous comments.
2. **Clear Title & Summary**: Describe what changes were made and why. Link any related issues (`Fixes #123`).
3. **Continuous Integration**: Ensure that all GitHub Actions CI checks pass.
4. **Focused Scope**: Keep PRs focused on a single topic. Split large refactors or distinct features into sequential, reviewable pull requests.

Thank you for helping make Relay Studio the fastest, cleanest open-source delivery tool!
