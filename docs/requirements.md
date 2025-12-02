# Markdown Notes App – Requirements Specification

## 1. Overview

This project is a cross-platform Markdown note-taking application built with TypeScript and React Native.  
The app focuses on:

- Managing multiple Markdown notes stored as plain `.md` files.
- Real-time preview of Markdown content, including Mermaid diagrams.
- A simple, fast, and offline-first experience on desktop environments (initially Windows and Linux).

The primary audience of this document is developers and AI coding agents (e.g., GitHub Copilot) working on this repository.

---

## 2. Goals and Non-Goals

### 2.1 Goals

1. **Local Markdown note management**
   - Create, edit, rename, delete, and browse multiple notes.
   - Store notes as `.md` files under a configurable workspace folder.

2. **Real-time preview**
   - Provide a split-view layout with an editor pane and a preview pane.
   - Update the preview live as the user types.
   - Support at least:
     - Headings, lists, links, images, code blocks, tables.
     - GitHub-flavored Markdown where reasonable (e.g., fenced code blocks, checkboxes).
     - Mermaid diagrams inside fenced code blocks (```mermaid).

3. **Cross-platform desktop support**
   - Windows: React Native for Windows.
   - Linux: reuse the same React Native/React code via a web target (e.g., React Native Web) and optionally wrap in a desktop shell (Tauri/Electron or similar) later.

4. **Performance and responsiveness**
   - Launch quickly (target: under 1 second on a typical development machine).
   - Real-time preview updates should feel instant (target: under 50–100ms for typical note sizes).
   - Handle workspaces with at least a few thousand notes without noticeable lag in the note list.

5. **Developer-friendly architecture**
   - Clear separation between:
     - UI components.
     - Domain logic (note model, storage, search).
     - Platform-specific integration (file system, windowing).
   - Easy for GitHub Copilot / coding agents to add features in a modular way.

### 2.2 Non-Goals (for the initial version)

The initial version (v0/v1) does **not** need to provide:

- Cloud sync or multi-device synchronization.
- User authentication or accounts.
- End-to-end encryption.
- Collaboration / real-time multi-user editing.
- Full Obsidian-level graph view or plugin marketplace.

These may be considered for later versions.

---

## 3. Target Platforms and Technology Stack

### 3.1 Platforms

- **Windows** (primary desktop target)
  - Use React Native for Windows.
- **Linux**
  - Use the same React/React Native codebase via a web target (e.g., React Native Web).
  - Optionally wrap in a desktop shell (Tauri/Electron or similar) at a later stage.

### 3.2 Technology Stack

- **Language**: TypeScript
- **UI Framework**: React / React Native
- **Desktop Integration**:
  - Windows: React Native Windows.
  - Linux: Web build (React Native Web or standard React) + optional desktop wrapper.
- **Markdown Rendering**:
  - Use a Markdown parser that supports GFM-style features (tables, fenced code blocks, etc.).
- **Mermaid Rendering**:
  - Use WebView to render HTML that includes Mermaid and the Markdown output.
- **State Management**:
  - Start simple (React hooks / context).
  - Allow easy replacement with state libraries (e.g., Zustand, Redux) if needed later.
- **Testing**:
  - Jest + React Testing Library (or React Native Testing Library) for unit and component tests.

---

## 4. Core Features (Functional Requirements)

### 4.1 Workspace and Note Management

1. **Workspace folder selection**
   - The app uses a root workspace folder on the local file system.
   - All notes are stored under this folder as `.md` files.
   - The user can:
     - Select the workspace folder at first launch.
     - Change the workspace folder from settings (requires reload).

2. **Note list**
   - Display a list of notes found under the workspace folder.
   - Each note item shows:
     - File name (without extension).
     - Last modified time.
   - Support basic sorting:
     - By last modified time (descending).
     - By title (alphabetical).

3. **Note creation**
   - The user can create a new note from the UI.
   - The app:
     - Creates a new `.md` file in the workspace.
     - Opens it in the editor.
     - Uses a default name (e.g., `Untitled.md`) and ensures uniqueness.

4. **Note renaming**
   - The user can rename a note.
   - The underlying file is renamed atomically.
   - If a conflicting name exists, show a user-friendly error or auto-suffix (e.g., `-1`, `-2`).

5. **Note deletion**
   - The user can delete a note from the UI.
   - Implement either:
     - Soft delete (move to a `.trash` subfolder), or
     - Hard delete (configurable later).
   - For v0, choose the simpler strategy and document it.

6. **Automatic file watching (optional v1)**
   - If notes are modified externally (e.g., via another editor), the app should detect changes and refresh its state.
   - This can be implemented in a later iteration.

### 4.2 Editor

1. **Basic text editing**
   - Provide a text input area for editing the current note’s content.
   - Support multi-line editing, standard selection, and clipboard operations.

2. **Autosave**
   - Changes should be saved periodically and/or on blur/blur-like events.
   - Avoid data loss on app crash.
   - A simple approach:
     - Save on every change with debounce (e.g., 500–1000ms).
     - Or save on explicit “Save” action plus on unmount.

3. **Keyboard shortcuts (desktop)**
   - At minimum:
     - `Ctrl+N` / `Cmd+N`: New note.
     - `Ctrl+S` / `Cmd+S`: Save current note.
     - `Ctrl+W` / `Cmd+W`: Close current note (optional).
   - Keep shortcuts configurable in code so they can be extended later.

4. **Markdown syntax friendliness (optional v1)**
   - Nice-to-have but not mandatory for v0:
     - Auto insertion of paired characters (e.g., `**`, `[]()`, code fences).
     - Basic Markdown shortcuts (e.g., pressing `Tab` on a list item to indent).

### 4.3 Preview (Markdown + Mermaid)

1. **Split view layout**
   - Layout with:
     - Left: note list.
     - Center: editor.
     - Right: preview.
   - Layout should be resizable if feasible (v1+), or fixed ratios for v0.

2. **Real-time preview**
   - As the user types in the editor, the preview updates in near real-time.
   - Implementation guideline:
     - Use a WebView.
     - Inject an HTML document that:
       - Parses Markdown into HTML.
       - Renders Mermaid diagrams from fenced code blocks with language `mermaid`.

3. **Markdown support**
   - At least support:
     - Headings (`#` to `######`).
     - Paragraphs, bold, italic.
     - Ordered and unordered lists.
     - Links and images.
     - Fenced code blocks with language specifier.
     - Tables.

4. **Mermaid support**
   - Recognize fenced code blocks with:
     - Opening: ```mermaid
     - Content: Mermaid diagram definition.
     - Closing: ```
   - Render these blocks as Mermaid diagrams in the preview.
   - For non-Mermaid code fences, show as normal code blocks with syntax highlighting if feasible.

5. **Scroll synchronization (optional v1)**
   - v0: no need to synchronize scrolling between editor and preview.
   - v1+: optional feature to map scroll positions between editor and preview.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- The app should feel responsive on common developer machines.
- Target:
  - App startup: under 1 second for a medium-sized workspace.
  - Preview update: under 50–100ms for typical note sizes.
  - Note list rendering: handle at least a few thousand notes with minimal lag.

### 5.2 Reliability

- Avoid data loss:
  - Implement autosave or frequent saves.
  - Handle file system errors gracefully (show user-friendly messages).
- Handle invalid or corrupted Markdown files without crashing.

### 5.3 Security and Privacy

- All data is stored locally on the user’s machine.
- No network calls are required for core functionality (v0).
- If any online resources are used (e.g., CDN for Mermaid scripts), make this configurable or avoid it entirely by bundling resources locally.

### 5.4 UX and Accessibility

- Provide a clean, minimal UI suitable for long editing sessions.
- Support dark mode and light mode if feasible.
- Keyboard-driven operation should be possible for common actions.

---

## 6. Data Model

### 6.1 Note

Basic in-memory model:

```ts
type NoteId = string; // e.g., relative file path from workspace root

interface Note {
  id: NoteId;
  title: string;              // derived from file name or first heading
  filePath: string;           // absolute or workspace-relative
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

- The canonical source of truth for `content`, `createdAt`, and `updatedAt` is the file system.
- The app can maintain an in-memory index for faster listing and searching.

### 6.2 Workspace Configuration

```ts
interface WorkspaceConfig {
  workspaceRoot: string;  // local file system path
  lastOpenedNoteId?: NoteId;
}
```

- Persist this configuration in a JSON file (e.g., inside app data folder or workspace folder).

---

## 7. Architecture Guidelines

1. **Separation of concerns**
   - `core` module/package:
     - Note model.
     - File I/O abstraction (load/save/rename/delete).
     - Search/indexing.
   - `ui` module/package:
     - React/React Native components.
     - Layout and styling.
   - `platform` layer:
     - Windows / Linux specific details (file dialogs, app menus, etc.).

2. **File system abstraction**
   - Define an interface for note storage so that:
     - Different implementations (e.g., Node fs, native modules) can be swapped.
     - Tests can use an in-memory or mock implementation.

3. **Preview rendering abstraction**
   - Isolate Markdown + Mermaid rendering behind a small interface or component.
   - The rest of the app should not depend on the specific Markdown library.

---

## 8. Testing and Tooling

1. **Unit tests**
   - For note management logic (create, rename, delete).
   - For workspace scanning and indexing.
   - For Markdown parsing helpers (e.g., extracting title from content).

2. **Component tests**
   - For core UI components (note list, editor, preview).

3. **End-to-end tests (optional)**
   - Later, use an E2E framework (e.g., Playwright or Detox) to test:
     - Creating and editing notes.
     - Preview behavior.

4. **CI**
   - GitHub Actions workflow to run:
     - TypeScript type checks.
     - Linting.
     - Unit tests.

---

## 9. GitHub Copilot / Coding Agent Notes

This project is intended to be friendly to GitHub Copilot and similar coding agents.

1. **Issue-based tasks**
   - Each new feature or change should be described in a GitHub Issue.
   - Issue template should include:
     - Goal/summary.
     - Context and constraints.
     - Files/areas to touch.
     - Acceptance criteria.

2. **Safe modification areas**
   - Clearly document which directories are safe for automation to modify:
     - `packages/core` – domain logic.
     - `packages/ui` – UI components.
     - `apps/windows` / `apps/web` – platform shells.
   - Configuration/infra files should be changed more carefully, and tasks must explicitly allow this.

3. **Coding style**
   - Use TypeScript with strict type checking.
   - Prefer functional, predictable code.
   - Write small, composable functions and components.

4. **Future tasks for Copilot**
   - Full-text search across notes.
   - Tagging and filtering.
   - Better keyboard shortcuts.
   - Scroll synchronization between editor and preview.
   - Plugin system for custom renderers or commands.

---

## 10. Future Enhancements (Backlog Ideas)

These are **not required** for the initial implementation but are possible future directions:

- Tag support and tag-based filtering.
- Backlinks and graph view.
- Templates/snippets for note creation.
- Multi-workspace support.
- Export/import of workspace settings.
- Mobile support (Android/iOS) with a tailored UI.
- Sync support via a chosen cloud provider or Git integration.
