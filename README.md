# MarkoPad

MarkoPad is a cross-platform Markdown note-taking app with real-time preview and Mermaid diagram support, built with TypeScript and React Native.

The goal is to provide a fast, offline-first, developer-friendly workspace for managing local `.md` notes on desktop platforms (initially Windows and Linux via a web target).

> ⚠️ This project is in early development. APIs, file structure, and UI are subject to change.

---

## Features (Planned / In Progress)

- 📝 **Local Markdown note management**

  - Store notes as plain `.md` files under a workspace folder
  - Create, rename, delete, and browse multiple notes
  - Sort notes by last modified time or title

- ⚡ **Real-time preview**

  - Split view: note list / editor / preview
  - Live preview updates as you type
  - GitHub-flavored Markdown where reasonable (headings, lists, tables, fenced code blocks, checkboxes, etc.)

- 🧜 **Mermaid diagram support**

  - Render Mermaid diagrams from fenced code blocks:
    ````
    ```mermaid
    graph TD
      A[Start] --> B[Do something]
    ```
    ````
  - Other fenced code blocks are rendered as regular code blocks

- 💻 **Desktop-oriented UX**

  - Keyboard shortcuts for common actions (e.g. new note, save)
  - Layout optimized for long editing sessions
  - Designed to feel fast even with many notes

- 🧱 **Developer-friendly architecture**

  - Clear separation between:
    - `core` domain logic (notes, storage, search)
    - `ui` components
    - platform shells (Windows / Web)
  - Written in TypeScript with strict typing

- 🤖 **GitHub Copilot friendly**
  - Requirements and architecture docs tailored so coding agents can safely implement features via GitHub Issues & PRs

---

## Tech Stack

- **Language**: TypeScript
- **UI**: React / React Native
- **Desktop integration**
  - Windows: React Native for Windows
  - Linux: shared React/React Native codebase via a web target (e.g. React Native Web or plain React)
- **Markdown & preview**
  - Markdown parser with GFM-style features
  - WebView-based preview that renders:
    - Markdown → HTML
    - Mermaid diagrams from ```mermaid blocks
- **Tooling**
  - Node.js
  - `pnpm` (or your preferred package manager)
  - Jest + Testing Library (planned) for unit & component tests
  - GitHub Actions for CI (planned)

---

## Project Structure (Planned)

> This is the target structure. The actual layout may evolve as the project grows.

```text
markopad/
  README.md
  requirements.md
  package.json
  pnpm-workspace.yaml

  apps/
    windows/          # React Native Windows app shell
    web/              # Web/React Native Web app shell

  packages/
    core/             # Note model, file I/O abstraction, search/index
    ui/               # Shared UI components (note list, editor, preview)
    preview/          # Markdown + Mermaid preview logic (WebView, HTML template)

  .github/
    workflows/        # CI definitions (tests, lint, build)
    agents/           # GitHub Copilot agent configuration (optional)
```

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- `pnpm` installed globally (or adapt commands to `npm` / `yarn`)
- For Windows desktop:
  - React Native for Windows toolchain (Visual Studio, SDKs, etc.)

### Install dependencies

```bash
pnpm install
```

### Run the Windows app (example)

```bash
cd apps/windows
pnpm dev   # or the appropriate RN Windows command once configured
```

### Run the Web app (example)

```bash
cd apps/web
pnpm dev   # e.g. Next.js / Vite / Expo Web, depending on the chosen setup
```

> The exact commands may differ depending on how the app shells are implemented.  
> Check each `apps/*/package.json` for the current scripts.

---

## Usage (Conceptual)

1. **Select a workspace folder**  
   On first launch, MarkoPad asks you to choose a local folder. This folder becomes your workspace, and all notes are stored as `.md` files inside it.

2. **Create and manage notes**

   - Create new notes from the UI (they’ll be saved as `Untitled.md`, `Untitled-1.md`, etc. until renamed).
   - Rename and delete notes directly from the note list.

3. **Edit and preview**

   - Edit Markdown in the center editor pane.
   - See formatted output and Mermaid diagrams in the right preview pane.
   - Changes are saved automatically (with debounce) or via an explicit **Save** action.

4. **Keyboard shortcuts (planned)**
   - `Ctrl+N` / `Cmd+N`: New note
   - `Ctrl+S` / `Cmd+S`: Save current note
   - More shortcuts may be added later.

---

## Development

### Code style & linting

Planned:

- ESLint + Prettier
- Strict TypeScript settings

Typical commands (to be wired up in `package.json`):

```bash
pnpm lint
pnpm typecheck
pnpm test
```

### Tests

Planned testing strategy:

- **Unit tests** for core note logic:
  - Creating, renaming, deleting notes
  - Workspace scanning and indexing
- **Component tests** for:
  - Note list
  - Editor
  - Preview

---

## GitHub Copilot & Coding Agents

This repository is designed to be friendly to GitHub Copilot and other coding agents.

- `requirements.md` describes the functional and non-functional requirements in detail.
- Architecture is split into clear layers so agents can work within limited scopes.
- Future additions:
  - `.github/agents/*.agent.md` to define project-specific guidelines for Copilot
  - Issue templates to standardize feature requests and acceptance criteria

### Suggested workflow with Copilot

1. Create a GitHub Issue describing the desired feature:
   - Goal / summary
   - Context and constraints
   - Files/areas to modify
   - Acceptance criteria
2. Assign the issue to a Copilot coding agent (when available).
3. Review the pull request generated by Copilot.
4. Iterate with human + AI review until the change is ready.

---

## Roadmap (Early Ideas)

- [ ] Minimum viable app:
  - [ ] Workspace selection
  - [ ] Note list
  - [ ] Basic editor
  - [ ] Live Markdown preview
- [ ] Mermaid diagram rendering
- [ ] Autosave & basic error handling
- [ ] Keyboard shortcuts for desktop
- [ ] Full-text search across notes
- [ ] Tagging & filtering
- [ ] Scroll sync between editor & preview
- [ ] Theming (dark/light mode)
- [ ] E2E tests for core flows

You can track more detailed requirements and ideas in `requirements.md`.

---

## Contributing

Right now this is primarily a personal / experimental project, but:

- Feedback, ideas, and bug reports are welcome via GitHub Issues.
- Pull requests may be accepted after the core architecture stabilizes.

If you are using GitHub Copilot or other coding agents, please make sure:

- You clearly scope their tasks in Issues,
- You review all generated code,
- You add or update tests where appropriate.

---

## License

> TODO: Decide on a license (e.g. MIT, Apache-2.0).

Until a license file is added, treat this project as **source available for personal experimentation only**.
