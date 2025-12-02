import {
  createSampleNotes,
  FileSystemNoteStorage,
  InMemoryNoteStorage,
  isFileSystemAccessSupported,
  type Note,
  type NoteMeta,
  type NoteStorage,
  pickDirectory,
} from "@markopad/core";
import { AppLayout, NoteEditor, NoteList, PreviewPane } from "@markopad/ui";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

/**
 * Main App component for MarkoPad web application.
 * Manages the note list, editor, and preview in a three-pane layout.
 * Supports both in-memory storage and file system storage.
 */
export function App() {
  // State for notes list
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  // Currently selected note
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  // Current editor content
  const [content, setContent] = useState("");
  // Current storage instance
  const storageRef = useRef<NoteStorage>(
    new InMemoryNoteStorage(createSampleNotes()),
  );
  // Name of the opened folder (if using file system storage)
  const [folderName, setFolderName] = useState<string | undefined>(undefined);

  // Check if File System Access API is supported
  const isFileSystemSupported = useMemo(
    () => isFileSystemAccessSupported(),
    [],
  );

  // Load all notes from storage
  const loadNotes = useCallback(async () => {
    const noteList = await storageRef.current.listNotes();
    setNotes(noteList);
    return noteList;
  }, []);

  // Load notes on mount
  useEffect(() => {
    const init = async () => {
      const noteList = await loadNotes();
      // Select first note if none selected
      if (noteList.length > 0) {
        const firstNote = await storageRef.current.loadNote(noteList[0].id);
        if (firstNote) {
          setSelectedNote(firstNote);
          setContent(firstNote.content);
        }
      }
    };
    init();
  }, [loadNotes]);

  // Handle opening a folder
  const handleOpenFolder = useCallback(async () => {
    try {
      const directoryHandle = await pickDirectory();
      const fileStorage = new FileSystemNoteStorage(directoryHandle);
      await fileStorage.initialize();

      // Switch to file system storage
      storageRef.current = fileStorage;
      setFolderName(directoryHandle.name);

      // Reset selection and load notes from the new storage
      setSelectedNote(null);
      setContent("");
      const noteList = await loadNotes();

      // Select first note if available
      if (noteList.length > 0) {
        const firstNote = await storageRef.current.loadNote(noteList[0].id);
        if (firstNote) {
          setSelectedNote(firstNote);
          setContent(firstNote.content);
        }
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error("Failed to open folder:", error);
    }
  }, [loadNotes]);

  // Save the current note if one is selected
  const saveCurrentNote = useCallback(async () => {
    if (selectedNote) {
      await storageRef.current.saveNote({ ...selectedNote, content });
    }
  }, [selectedNote, content]);

  // Handle note selection
  const handleSelectNote = useCallback(
    async (noteId: string) => {
      // Save current note before switching
      await saveCurrentNote();

      // Load selected note
      const note = await storageRef.current.loadNote(noteId);
      if (note) {
        setSelectedNote(note);
        setContent(note.content);
      }
    },
    [saveCurrentNote],
  );

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    // Auto-save with debounce would go here
    // For v0, we just update the state and save on note switch
  }, []);

  // Handle creating a new note
  const handleCreateNote = useCallback(async () => {
    // Save current note first
    await saveCurrentNote();

    // Create new note
    const newNote = await storageRef.current.createNote("Untitled");
    await loadNotes();

    // Select the new note
    setSelectedNote(newNote);
    setContent(newNote.content);
  }, [saveCurrentNote, loadNotes]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <AppLayout
        leftPanel={
          <NoteList
            notes={notes}
            selectedNoteId={selectedNote?.id}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onOpenFolder={handleOpenFolder}
            isFileSystemSupported={isFileSystemSupported}
            folderName={folderName}
          />
        }
        centerPanel={
          <NoteEditor
            content={content}
            onChange={handleContentChange}
            placeholder={
              selectedNote
                ? "Start writing..."
                : "Select a note or create a new one"
            }
            editable={!!selectedNote}
          />
        }
        rightPanel={
          <PreviewPane content={content || selectedNote?.content || ""} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
