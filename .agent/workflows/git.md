---
description: Git workflow - check status, update changelog, commit and push
---

# Git Workflow

## Steps

// turbo-all

### 1. Check Git Status
```bash
git status
```
Note the modified and untracked files.

### 2. View Changed Files (if needed)
For modified files, run:
```bash
git diff --stat
```

### 3. Update CHANGELOG.md
Add a new entry under `## [Unreleased]` with today's date as a comment.

**Changelog Format:**
- `### Added` - New features, files, or documentation
- `### Changed` - Modifications to existing functionality
- `### Fixed` - Bug fixes
- `### Removed` - Deleted features or files

**Entry Style:**
```markdown
### Added
- **Feature Name**: Brief description of what was added.

### Changed
- **Component Name**: What changed and why.
```

### 4. Stage All Changes
```bash
git add -A
```

### 5. Commit with Descriptive Message
```bash
git commit -m "type: brief description"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks
- `style:` - Formatting, styling changes

### 6. Push to Remote
```bash
git push
```

## Quick Reference

**One-liner after changelog update:**
```bash
git add -A && git commit -m "type: description" && git push
```