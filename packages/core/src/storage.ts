import type { Note, NoteId, NoteMeta } from "./types";

/**
 * Abstract interface for note storage operations.
 * Implementations can be in-memory, file-based, or remote.
 */
export interface NoteStorage {
  /**
   * List all notes in the workspace (metadata only).
   */
  listNotes(): Promise<NoteMeta[]>;

  /**
   * Load a note by its ID.
   * Returns null if the note doesn't exist.
   */
  loadNote(id: NoteId): Promise<Note | null>;

  /**
   * Save a note (create or update).
   */
  saveNote(note: Note): Promise<void>;

  /**
   * Rename a note.
   * Returns the updated note with new ID/title.
   */
  renameNote(id: NoteId, newTitle: string): Promise<Note>;

  /**
   * Delete a note by its ID.
   */
  deleteNote(id: NoteId): Promise<void>;

  /**
   * Create a new note with the given title and optional content.
   * Returns the created note.
   */
  createNote(title: string, content?: string): Promise<Note>;

  /**
   * Search notes by query string.
   * Searches both title and content.
   * Returns matching notes.
   */
  searchNotes(query: string): Promise<Note[]>;
}
