import type { NoteStorage } from "./storage";
import type { Note, NoteId, NoteMeta } from "./types";

/**
 * File System Access API types.
 * These extend the base TypeScript DOM types for better type safety.
 */
interface FileSystemDirectoryHandle {
  kind: "directory";
  name: string;
  values(): AsyncIterable<FileSystemHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemFileHandle>;
  removeEntry(name: string): Promise<void>;
}

interface FileSystemFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

/**
 * Checks if the File System Access API is available in the current browser.
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

/**
 * Opens a directory picker dialog and returns the selected directory handle.
 * Throws if the user cancels or the API is not supported.
 */
export async function pickDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API is not supported in this browser");
  }
  // Use the global showDirectoryPicker function
  const handle = await (
    window as unknown as {
      showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
    }
  ).showDirectoryPicker();
  return handle;
}

/**
 * FileSystemNoteStorage uses the File System Access API to persist notes
 * as .md files in a user-selected directory.
 */
export class FileSystemNoteStorage implements NoteStorage {
  private directoryHandle: FileSystemDirectoryHandle;
  /** Cache of note metadata for faster listing */
  private noteCache: Map<NoteId, NoteMeta> = new Map();

  constructor(directoryHandle: FileSystemDirectoryHandle) {
    this.directoryHandle = directoryHandle;
  }

  /**
   * Scans the directory for .md files and populates the cache.
   * Should be called after construction.
   */
  async initialize(): Promise<void> {
    this.noteCache.clear();
    for await (const entry of this.directoryHandle.values()) {
      if (entry.kind === "file" && entry.name.endsWith(".md")) {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const id = this.fileNameToId(entry.name);
        const title = this.fileNameToTitle(entry.name);
        this.noteCache.set(id, {
          id,
          title,
          updatedAt: new Date(file.lastModified),
        });
      }
    }
  }

  async listNotes(): Promise<NoteMeta[]> {
    // Refresh the cache by scanning the directory
    await this.initialize();

    const metas = Array.from(this.noteCache.values());
    // Sort by updatedAt descending (most recent first)
    return metas.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async loadNote(id: NoteId): Promise<Note | null> {
    const fileName = this.idToFileName(id);
    try {
      const fileHandle = await this.directoryHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();
      const title = this.fileNameToTitle(fileName);

      return {
        id,
        title,
        filePath: fileName,
        content,
        createdAt: new Date(file.lastModified),
        updatedAt: new Date(file.lastModified),
      };
    } catch {
      // File not found or access error
      return null;
    }
  }

  async saveNote(note: Note): Promise<void> {
    const fileName = this.idToFileName(note.id);
    try {
      const fileHandle = await this.directoryHandle.getFileHandle(fileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(note.content);
      await writable.close();

      // Update cache
      this.noteCache.set(note.id, {
        id: note.id,
        title: note.title,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(
        `Failed to save note: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async renameNote(id: NoteId, newTitle: string): Promise<Note> {
    // Load existing note
    const existing = await this.loadNote(id);
    if (!existing) {
      throw new Error(`Note not found: ${id}`);
    }

    const newId = this.titleToId(newTitle);
    const newFileName = `${newTitle}.md`;

    // Check for conflicts
    if (newId !== id) {
      const conflicting = await this.loadNote(newId);
      if (conflicting) {
        throw new Error(`A note with title "${newTitle}" already exists`);
      }
    }

    // Create new file with content
    const newNote: Note = {
      ...existing,
      id: newId,
      title: newTitle,
      filePath: newFileName,
      updatedAt: new Date(),
    };
    await this.saveNote(newNote);

    // Delete old file if ID changed
    if (newId !== id) {
      await this.deleteNote(id);
    }

    return newNote;
  }

  async deleteNote(id: NoteId): Promise<void> {
    const fileName = this.idToFileName(id);
    try {
      await this.directoryHandle.removeEntry(fileName);
      this.noteCache.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete note: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async createNote(title: string, content = ""): Promise<Note> {
    // Ensure unique title
    let finalTitle = title;
    let suffix = 0;
    while (await this.noteExists(this.titleToId(finalTitle))) {
      suffix++;
      finalTitle = `${title}-${suffix}`;
    }

    const now = new Date();
    const id = this.titleToId(finalTitle);
    const note: Note = {
      id,
      title: finalTitle,
      filePath: `${finalTitle}.md`,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await this.saveNote(note);
    return note;
  }

  /**
   * Check if a note with the given ID exists.
   */
  private async noteExists(id: NoteId): Promise<boolean> {
    const fileName = this.idToFileName(id);
    try {
      await this.directoryHandle.getFileHandle(fileName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert a file name (e.g., "My Note.md") to a note ID.
   */
  private fileNameToId(fileName: string): NoteId {
    const title = this.fileNameToTitle(fileName);
    return this.titleToId(title);
  }

  /**
   * Convert a file name to a title (remove .md extension).
   */
  private fileNameToTitle(fileName: string): string {
    return fileName.replace(/\.md$/, "");
  }

  /**
   * Convert a note ID to a file name.
   */
  private idToFileName(id: NoteId): string {
    // The ID is based on the title, so we need to find the original file
    // For simplicity, we store the title-based ID and reconstruct the filename
    // This assumes the title doesn't contain special characters that would break this
    const meta = this.noteCache.get(id);
    if (meta) {
      return `${meta.title}.md`;
    }
    // Fallback: convert ID back to approximate title
    return `${id}.md`;
  }

  /**
   * Convert a title to a note ID.
   */
  private titleToId(title: string): NoteId {
    return title.toLowerCase().replace(/\s+/g, "-");
  }
}
