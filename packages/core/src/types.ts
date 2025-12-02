/**
 * Unique identifier for a note.
 * Typically the relative file path from the workspace root.
 */
export type NoteId = string;

/**
 * Represents a single Markdown note.
 */
export interface Note {
  /** Unique identifier (e.g., relative file path) */
  id: NoteId;
  /** Display title (derived from filename or first heading) */
  title: string;
  /** Full or workspace-relative file path */
  filePath: string;
  /** Raw Markdown content */
  content: string;
  /** When the note was created */
  createdAt: Date;
  /** When the note was last modified */
  updatedAt: Date;
}

/**
 * Configuration for the user's workspace.
 */
export interface WorkspaceConfig {
  /** Root folder path for the workspace */
  workspaceRoot: string;
  /** ID of the last opened note (for restoring state) */
  lastOpenedNoteId?: NoteId;
}

/**
 * Metadata for a note (used in listings without full content).
 */
export interface NoteMeta {
  id: NoteId;
  title: string;
  updatedAt: Date;
}
