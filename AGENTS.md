# AGENTS.md — Guidelines for GitHub Copilot and Other Coding Agents

This document describes how AI coding agents (e.g. GitHub Copilot agents) should interact with the **MarkoPad** repository.

The main goals are:

- Keep the codebase consistent, safe, and maintainable.
- Make it easy for agents to implement small to medium-sized tasks via GitHub Issues and Pull Requests.
- Avoid unexpected changes to tooling, infrastructure, and project structure without explicit permission.

---

## 1. Project Summary

**MarkoPad** is a cross-platform Markdown note-taking app with:

- Local `.md` file management under a workspace folder.
- Real-time Markdown preview, including Mermaid diagrams.
- A desktop-focused UX (initially Windows and Linux via a web target).
- A TypeScript + React / React Native stack.

Key documents:

- `README.md` – high-level overview, setup, and roadmap.
- `requirements.md` – detailed functional and non-functional requirements.
- `ARCHITECTURE.md` – architecture, layers, and data flows.
- `AGENTS.md` (this file) – rules and best practices for AI coding agents.

Agents should read these documents before making substantial changes.

---

## 2. General Rules for Agents

1. **Work only via Issues and Pull Requests**
   - Do **not** push directly to `main` or other protected branches.
   - Every change should be associated with a GitHub Issue and implemented in a PR.

2. **Stay within the scope of the assigned Issue**
   - Do not refactor unrelated modules.
   - Do not change tooling (ESLint, TypeScript config, CI) unless explicitly requested.

3. **Prefer small, focused changes**
   - Implement one feature or fix per PR.
   - If the Issue is large, propose a smaller sub-scope or phased approach in the PR description.

4. **Maintain build and test health**
   - Run available tests and type checks where possible.
   - Do not merge (or recommend merging) a PR that breaks builds or tests.

5. **Preserve developer intent**
   - Follow patterns and conventions already present in the codebase.
   - Avoid introducing entirely new libraries or patterns unless requested in the Issue.

6. **Be explicit when uncertain**
   - Use comments or PR descriptions to highlight assumptions or open questions.
   - When a requirement is ambiguous, implement the safest minimal behavior and document it.

---

## 3. Repository Structure and Safe Modification Areas

The repository is intended to follow (or converge toward) this structure:

```text
markopad/
  README.md
  requirements.md
  ARCHITECTURE.md
  AGENTS.md
  package.json
  pnpm-workspace.yaml

  apps/
    windows/          # React Native Windows app shell (platform-specific)
    web/              # Web / React Native Web app shell (platform-specific)

  packages/
    core/             # Domain logic: notes, workspace, storage abstraction, search/index
    ui/               # Shared UI components: note list, editor, layout, etc.
    preview/          # Markdown + Mermaid preview logic: WebView integration, HTML template

  .github/
    workflows/        # CI workflows (lint, test, build)
    agents/           # Optional project-specific agent configs
```

### 3.1 Safe areas for most tasks

Unless an Issue states otherwise, agents are usually safe to modify:

- `packages/core/**`
  - Note model, workspace scanning, storage abstraction, search.
- `packages/ui/**`
  - React/React Native components and UI logic.
- `packages/preview/**`
  - Markdown/HTML rendering helpers, WebView integration.
- `apps/windows/**`
- `apps/web/**`
  - Platform shells, routing, entry points, small platform-specific glue code.
- `docs/**` (if present)
  - Developer documentation (architecture notes, design decisions).

### 3.2 Areas requiring explicit permission

Agents should **not** modify the following unless the Issue specifically allows it:

- Root-level configuration:
  - `package.json`, `pnpm-workspace.yaml`
  - `tsconfig*.json`
  - ESLint / Prettier / Jest / tooling configs
- CI/CD:
  - `.github/workflows/**`
- Licensing and security files:
  - `LICENSE`
  - `SECURITY.md`
- External integration configs (if present):
  - Store / signing configs
  - Native build scripts

When in doubt, keep changes limited to the `packages/` and `apps/` directories and mention any necessary follow-up work in the PR description instead of modifying core tooling yourself.

---

## 4. Typical Task Types for Agents

### 4.1 Feature Implementation

Examples:

- Add full-text search across notes.
- Implement tagging and filtering.
- Add keyboard shortcuts for specific actions.
- Implement scroll synchronization between editor and preview.

Expected behavior:

- Read `requirements.md` and `ARCHITECTURE.md` to understand existing design.
- Implement the feature in the relevant package(s).
- Add or update tests.
- Update docs and README sections if the user-facing behavior changes.

### 4.2 Bug Fixes

Examples:

- Preview not updating for large notes.
- File renaming edge-case when a file name already exists.
- Incorrect sorting in the note list.

Expected behavior:

- Reproduce the bug using tests or minimal reproduction code where possible.
- Fix the bug with minimal changes.
- Add regression tests.

### 4.3 Refactoring (Scoped)

Examples:

- Extract common UI patterns into shared components.
- Simplify complex functions in `packages/core`.
- Improve typing or reduce `any` usage.

Expected behavior:

- Keep refactorings small and well-scoped.
- Do not change public APIs without updating dependents and documentation.
- Ensure tests still pass and behavior remains equivalent.

### 4.4 Documentation and Examples

Examples:

- Update `README.md` to reflect new workflow.
- Add examples for keyboard shortcuts or configuration.
- Update architecture diagrams in `ARCHITECTURE.md`.

Expected behavior:

- Keep docs concise and accurate.
- Do not remove existing content without strong reason; prefer improving or augmenting it.

---

## 5. Coding Style and Conventions

1. **Language and types**
   - Use **TypeScript** with strict typing enabled.
   - Avoid `any` unless absolutely necessary and justify its use in a comment.

2. **Functional style preference**
   - Prefer small, composable functions and components.
   - Keep side effects localized and explicit.

3. **React / React Native patterns**
   - Use functional components with hooks.
   - Avoid class components unless required by a specific library.
   - Keep hooks at the top level (respecting the Rules of Hooks).

4. **Error handling**
   - Prefer returning typed errors or using clearly handled exceptions.
   - Do not silently swallow errors; log or surface them in a user-friendly way where appropriate.

5. **File and naming conventions**
   - Use `kebab-case` for file names where consistent with existing code.
   - Use `PascalCase` for React components.
   - Use `camelCase` for functions, variables, and non-component exports.

6. **Imports and dependencies**
   - Reuse existing dependencies where possible.
   - Avoid adding new libraries unless clearly justified in the Issue and PR description.
   - Group imports logically (stdlib, third-party, internal).

---

## 6. Workflow for Agents

When an Issue is assigned to an AI coding agent, the agent should follow this workflow:

1. **Understand the task**
   - Read the Issue carefully (goal, context, acceptance criteria).
   - Read relevant sections of:
     - `requirements.md`
     - `ARCHITECTURE.md`
     - Existing code in `packages/` and `apps/`

2. **Plan the approach**
   - Decide which modules/files to modify.
   - If needed, outline a short step-by-step plan in the PR description.

3. **Implement**
   - Make focused changes in the appropriate areas.
   - Keep commits small and logically grouped when possible.

4. **Test**
   - Run unit tests, component tests, and type checks as available.
   - If tests are missing, add minimal tests for the changed behavior.

5. **Document**
   - Update or add comments where the behavior is non-obvious.
   - Update README/docs for any user-facing changes.

6. **Create a Pull Request**
   - Reference the Issue in the PR description.
   - Summarize the changes, including:
     - What was implemented
     - How it was implemented
     - Any limitations or follow-up work
   - List any new dependencies and why they are needed.

7. **Respond to review**
   - If the PR receives review comments, update the code accordingly.
   - Keep the PR description up to date with any major changes in direction.

---

## 7. Limitations and Things to Avoid

Agents **must not**:

- Change the project license or add new legal terms.
- Introduce telemetry, analytics, or network calls without explicit approval.
- Remove existing tests without replacing them with appropriate coverage.
- Perform large-scale rewrites (e.g., migrating the entire app to a different framework) unless the Issue explicitly asks for it.

Agents **should avoid**:

- Introducing experimental or unstable dependencies without clear justification.
- Modifying build or deployment pipelines unless specifically requested.
- Changing the repository layout unless part of an agreed migration.

---

## 8. Future Extensions to This Document

As MarkoPad evolves, this document may be extended with:

- More detailed module-level guidelines (e.g., how `core` models should evolve).
- Patterns for common features (e.g., adding a new command or UI panel).
- Checklists for feature vs. bugfix vs. refactor PRs.

Agents and maintainers are encouraged to update `AGENTS.md` whenever new conventions emerge that would help future automated contributions stay consistent and safe.
