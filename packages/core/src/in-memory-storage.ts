import type { NoteStorage } from "./storage";
import type { Note, NoteId, NoteMeta } from "./types";

/**
 * In-memory implementation of NoteStorage.
 * Notes are stored in memory and lost when the app restarts.
 * Useful for prototyping and testing.
 */
export class InMemoryNoteStorage implements NoteStorage {
  private notes: Map<NoteId, Note> = new Map();

  constructor(initialNotes: Note[] = []) {
    for (const note of initialNotes) {
      this.notes.set(note.id, note);
    }
  }

  async listNotes(): Promise<NoteMeta[]> {
    const metas: NoteMeta[] = [];
    for (const note of this.notes.values()) {
      metas.push({
        id: note.id,
        title: note.title,
        updatedAt: note.updatedAt,
      });
    }
    // Sort by updatedAt descending (most recent first)
    return metas.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async loadNote(id: NoteId): Promise<Note | null> {
    return this.notes.get(id) ?? null;
  }

  async saveNote(note: Note): Promise<void> {
    this.notes.set(note.id, {
      ...note,
      updatedAt: new Date(),
    });
  }

  async renameNote(id: NoteId, newTitle: string): Promise<Note> {
    const existing = this.notes.get(id);
    if (!existing) {
      throw new Error(`Note not found: ${id}`);
    }

    // Create new ID based on new title
    const newId = this.titleToId(newTitle);

    // Check for conflicts
    if (newId !== id && this.notes.has(newId)) {
      throw new Error(`A note with title "${newTitle}" already exists`);
    }

    const updatedNote: Note = {
      ...existing,
      id: newId,
      title: newTitle,
      filePath: `${newTitle}.md`,
      updatedAt: new Date(),
    };

    // Remove old entry and add new one
    this.notes.delete(id);
    this.notes.set(newId, updatedNote);

    return updatedNote;
  }

  async deleteNote(id: NoteId): Promise<void> {
    if (!this.notes.has(id)) {
      throw new Error(`Note not found: ${id}`);
    }
    this.notes.delete(id);
  }

  async createNote(title: string, content = ""): Promise<Note> {
    // Ensure unique title
    let finalTitle = title;
    let suffix = 0;
    while (this.notes.has(this.titleToId(finalTitle))) {
      suffix++;
      finalTitle = `${title}-${suffix}`;
    }

    const now = new Date();
    const note: Note = {
      id: this.titleToId(finalTitle),
      title: finalTitle,
      filePath: `${finalTitle}.md`,
      content,
      createdAt: now,
      updatedAt: now,
    };

    this.notes.set(note.id, note);
    return note;
  }

  async searchNotes(query: string): Promise<NoteMeta[]> {
    if (!query.trim()) {
      return this.listNotes();
    }

    const lowerQuery = query.toLowerCase();
    const results: NoteMeta[] = [];

    for (const note of this.notes.values()) {
      const titleMatch = note.title.toLowerCase().includes(lowerQuery);
      const contentMatch = note.content.toLowerCase().includes(lowerQuery);

      if (titleMatch || contentMatch) {
        results.push({
          id: note.id,
          title: note.title,
          updatedAt: note.updatedAt,
        });
      }
    }

    // Sort by updatedAt descending (most recent first)
    return results.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  private titleToId(title: string): NoteId {
    return title.toLowerCase().replace(/\s+/g, "-");
  }
}

/**
 * Create sample notes for demo/testing purposes.
 */
export function createSampleNotes(): Note[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: "welcome",
      title: "Welcome",
      filePath: "Welcome.md",
      content: `# Welcome to MarkoPad

This is a sample note to help you get started.

## Features

- **Markdown Preview**: See your notes rendered in real-time
- **Mermaid Diagrams**: Create diagrams with code blocks

## Example Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B[Write Notes]
    B --> C[Preview]
    C --> D[Done!]
\`\`\`

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

Happy note-taking! 📝
`,
      createdAt: lastWeek,
      updatedAt: now,
    },
    {
      id: "getting-started",
      title: "Getting Started",
      filePath: "Getting Started.md",
      content: `# Getting Started

## Quick Tips

1. Click on a note in the left panel to open it
2. Edit the content in the center panel
3. See the preview on the right

## Keyboard Shortcuts (Planned)

- \`Ctrl+N\`: New note
- \`Ctrl+S\`: Save note

## Links

- [Markdown Guide](https://www.markdownguide.org/)
- [Mermaid Documentation](https://mermaid.js.org/)
`,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "todo-list",
      title: "Todo List",
      filePath: "Todo List.md",
      content: `# Todo List

## Today

- [x] Set up MarkoPad
- [ ] Write some notes
- [ ] Try Mermaid diagrams

## This Week

- [ ] Organize workspace
- [ ] Create project notes

## Ideas

| Priority | Idea | Status |
|----------|------|--------|
| High | Learn Markdown | In Progress |
| Medium | Explore features | Pending |
| Low | Customize theme | Later |
`,
      createdAt: lastWeek,
      updatedAt: yesterday,
    },
  ];
}
