import type { NoteStorage } from "./storage";
import type { Note, NoteId, NoteMeta } from "./types";

/**
 * File System Access API types.
 * These are available in modern browsers supporting the API.
 */
interface FileSystemFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle {
  kind: "directory";
  name: string;
  values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemFileHandle>;
  removeEntry(name: string): Promise<void>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | ArrayBuffer | Blob): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

/**
 * File system-based implementation of NoteStorage.
 * Uses the File System Access API to read/write .md files from a local folder.
 */
export class FileSystemNoteStorage implements NoteStorage {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private noteCache: Map<NoteId, Note> = new Map();

  /**
   * Check if the File System Access API is available.
   */
  static isSupported(): boolean {
    return typeof window !== "undefined" && "showDirectoryPicker" in window;
  }

  /**
   * Check if a directory is currently selected.
   */
  isDirectorySelected(): boolean {
    return this.directoryHandle !== null;
  }

  /**
   * Get the name of the selected directory.
   */
  getDirectoryName(): string | null {
    return this.directoryHandle?.name ?? null;
  }

  /**
   * Open a directory picker and select a workspace folder.
   */
  async selectDirectory(): Promise<boolean> {
    if (!FileSystemNoteStorage.isSupported()) {
      console.warn("File System Access API is not supported in this browser");
      return false;
    }

    try {
      this.directoryHandle = await window.showDirectoryPicker();
      await this.refreshCache();
      return true;
    } catch (error) {
      // User cancelled or permission denied
      console.warn("Failed to select directory:", error);
      return false;
    }
  }

  /**
   * Refresh the internal cache by scanning the directory.
   */
  private async refreshCache(): Promise<void> {
    if (!this.directoryHandle) {
      this.noteCache.clear();
      return;
    }

    const newCache = new Map<NoteId, Note>();

    for await (const entry of this.directoryHandle.values()) {
      if (entry.kind === "file" && entry.name.endsWith(".md")) {
        try {
          const file = await (entry as FileSystemFileHandle).getFile();
          const content = await file.text();
          const title = entry.name.slice(0, -3); // Remove .md extension
          const id = this.titleToId(title);

          const note: Note = {
            id,
            title,
            filePath: entry.name,
            content,
            createdAt: new Date(file.lastModified),
            updatedAt: new Date(file.lastModified),
          };

          newCache.set(id, note);
        } catch (error) {
          console.warn(`Failed to read file ${entry.name}:`, error);
        }
      }
    }

    this.noteCache = newCache;
  }

  async listNotes(): Promise<NoteMeta[]> {
    if (!this.directoryHandle) {
      return [];
    }

    // Refresh cache to get latest files
    await this.refreshCache();

    const metas: NoteMeta[] = [];
    for (const note of this.noteCache.values()) {
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
    // Try cache first
    const cached = this.noteCache.get(id);
    if (cached) {
      // Refresh from file to get latest content
      if (this.directoryHandle) {
        try {
          const fileHandle = await this.directoryHandle.getFileHandle(
            cached.filePath,
          );
          const file = await fileHandle.getFile();
          const content = await file.text();

          const updatedNote: Note = {
            ...cached,
            content,
            updatedAt: new Date(file.lastModified),
          };

          this.noteCache.set(id, updatedNote);
          return updatedNote;
        } catch {
          // File might have been deleted externally
          this.noteCache.delete(id);
          return null;
        }
      }
    }

    return null;
  }

  async saveNote(note: Note): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(
        note.filePath,
        { create: true },
      );

      const writable = await fileHandle.createWritable();
      await writable.write(note.content);
      await writable.close();

      const updatedNote: Note = {
        ...note,
        updatedAt: new Date(),
      };

      this.noteCache.set(note.id, updatedNote);
    } catch (error) {
      console.error("Failed to save note:", error);
      throw new Error(`Failed to save note: ${error}`);
    }
  }

  async renameNote(id: NoteId, newTitle: string): Promise<Note> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    const existing = this.noteCache.get(id);
    if (!existing) {
      throw new Error(`Note not found: ${id}`);
    }

    const newFilePath = `${newTitle}.md`;
    const newId = this.titleToId(newTitle);

    // Check for conflicts
    if (newId !== id && this.noteCache.has(newId)) {
      throw new Error(`A note with title "${newTitle}" already exists`);
    }

    // Create new file with content
    const newFileHandle = await this.directoryHandle.getFileHandle(
      newFilePath,
      { create: true },
    );
    const writable = await newFileHandle.createWritable();
    await writable.write(existing.content);
    await writable.close();

    // Delete old file
    await this.directoryHandle.removeEntry(existing.filePath);

    const updatedNote: Note = {
      ...existing,
      id: newId,
      title: newTitle,
      filePath: newFilePath,
      updatedAt: new Date(),
    };

    // Update cache
    this.noteCache.delete(id);
    this.noteCache.set(newId, updatedNote);

    return updatedNote;
  }

  async deleteNote(id: NoteId): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    const existing = this.noteCache.get(id);
    if (!existing) {
      throw new Error(`Note not found: ${id}`);
    }

    await this.directoryHandle.removeEntry(existing.filePath);
    this.noteCache.delete(id);
  }

  async createNote(title: string, content = ""): Promise<Note> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    // Ensure unique title
    let finalTitle = title;
    let suffix = 0;
    while (this.noteCache.has(this.titleToId(finalTitle))) {
      suffix++;
      finalTitle = `${title}-${suffix}`;
    }

    const filePath = `${finalTitle}.md`;
    const id = this.titleToId(finalTitle);

    const fileHandle = await this.directoryHandle.getFileHandle(filePath, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    const now = new Date();
    const note: Note = {
      id,
      title: finalTitle,
      filePath,
      content,
      createdAt: now,
      updatedAt: now,
    };

    this.noteCache.set(id, note);
    return note;
  }

  async searchNotes(query: string): Promise<NoteMeta[]> {
    if (!query.trim()) {
      return this.listNotes();
    }

    // Refresh cache to get latest files
    await this.refreshCache();

    const lowerQuery = query.toLowerCase();
    const results: NoteMeta[] = [];

    for (const note of this.noteCache.values()) {
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
