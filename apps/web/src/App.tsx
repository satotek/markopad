import {
  createSampleNotes,
  InMemoryNoteStorage,
  type Note,
  type NoteMeta,
} from "@markopad/core";
import {
  AppLayout,
  NoteEditor,
  NoteList,
  PreviewPane,
  ThemeProvider,
  useTheme,
} from "@markopad/ui";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

// Initialize storage with sample notes
const storage = new InMemoryNoteStorage(createSampleNotes());

/**
 * Main app content with theme-aware styling.
 */
function AppContent() {
  const { colors, colorScheme } = useTheme();

  // State for notes list
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  // Currently selected note
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  // Current editor content
  const [content, setContent] = useState("");

  // Load all notes from storage
  const loadNotes = useCallback(async () => {
    const noteList = await storage.listNotes();
    setNotes(noteList);
    return noteList;
  }, []);

  // Load notes on mount
  useEffect(() => {
    const init = async () => {
      const noteList = await loadNotes();
      // Select first note if none selected
      if (noteList.length > 0) {
        const firstNote = await storage.loadNote(noteList[0].id);
        if (firstNote) {
          setSelectedNote(firstNote);
          setContent(firstNote.content);
        }
      }
    };
    init();
  }, [loadNotes]);

  // Handle note selection
  const handleSelectNote = useCallback(
    async (noteId: string) => {
      // Save current note before switching
      if (selectedNote) {
        await storage.saveNote({ ...selectedNote, content });
      }

      // Load selected note
      const note = await storage.loadNote(noteId);
      if (note) {
        setSelectedNote(note);
        setContent(note.content);
      }
    },
    [selectedNote, content],
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
    if (selectedNote) {
      await storage.saveNote({ ...selectedNote, content });
    }

    // Create new note
    const newNote = await storage.createNote("Untitled");
    await loadNotes();

    // Select the new note
    setSelectedNote(newNote);
    setContent(newNote.content);
  }, [selectedNote, content, loadNotes]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <AppLayout
        leftPanel={
          <NoteList
            notes={notes}
            selectedNoteId={selectedNote?.id}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
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

/**
 * Main App component for MarkoPad web application.
 * Wraps the app with ThemeProvider for dark mode support.
 */
export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
