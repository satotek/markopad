import {
  createSampleNotes,
  FileSystemNoteStorage,
  InMemoryNoteStorage,
  type Note,
  type NoteMeta,
  type NoteStorage,
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
import { Pressable, StyleSheet, Text, View } from "react-native";

// Check if File System API is supported
const isFileSystemSupported = FileSystemNoteStorage.isSupported();

/**
 * Main App component for MarkoPad web application.
 * Manages the note list, editor, and preview in a three-pane layout.
 */
function AppContent() {
  // Storage instance
  const [storage, setStorage] = useState<NoteStorage>(
    () => new InMemoryNoteStorage(createSampleNotes()),
  );
  const [isFileSystemMode, setIsFileSystemMode] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  // State for notes list
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  // Currently selected note
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  // Current editor content
  const [content, setContent] = useState("");
  // Left panel visibility
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  // Editor scroll ratio for sync
  const [editorScrollRatio, setEditorScrollRatio] = useState(0);

  // Load notes based on search query
  const loadNotes = useCallback(async () => {
    let noteList: NoteMeta[];
    if (searchQuery.trim()) {
      noteList = await storage.searchNotes(searchQuery);
    } else {
      noteList = await storage.listNotes();
    }
    setNotes(noteList);
    return noteList;
  }, [storage, searchQuery]);

  // Load notes on mount and when search changes
  useEffect(() => {
    const init = async () => {
      const noteList = await loadNotes();
      // Select first note if none selected and not searching
      if (noteList.length > 0 && !selectedNote) {
        const firstNote = await storage.loadNote(noteList[0].id);
        if (firstNote) {
          setSelectedNote(firstNote);
          setContent(firstNote.content);
        }
      }
    };
    init();
  }, [loadNotes, storage, selectedNote]);

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
    [selectedNote, content, storage],
  );

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
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
  }, [selectedNote, content, loadNotes, storage]);

  // Handle deleting a note
  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      await storage.deleteNote(noteId);
      await loadNotes();

      // If deleted note was selected, clear selection
      if (selectedNote?.id === noteId) {
        const noteList = await storage.listNotes();
        if (noteList.length > 0) {
          const firstNote = await storage.loadNote(noteList[0].id);
          if (firstNote) {
            setSelectedNote(firstNote);
            setContent(firstNote.content);
          }
        } else {
          setSelectedNote(null);
          setContent("");
        }
      }
    },
    [selectedNote, loadNotes, storage],
  );

  // Handle renaming a note
  const handleRenameNote = useCallback(
    async (noteId: string, newTitle: string) => {
      const renamedNote = await storage.renameNote(noteId, newTitle);
      await loadNotes();

      // If renamed note was selected, update selection
      if (selectedNote?.id === noteId) {
        setSelectedNote(renamedNote);
      }
    },
    [selectedNote, loadNotes, storage],
  );

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle toggle left panel
  const handleToggleLeftPanel = useCallback(() => {
    setIsLeftPanelVisible((prev) => !prev);
  }, []);

  // Handle editor scroll
  const handleEditorScroll = useCallback((ratio: number) => {
    setEditorScrollRatio(ratio);
  }, []);

  // Handle selecting a workspace folder
  const handleSelectFolder = useCallback(async () => {
    if (!isFileSystemSupported) {
      console.warn("File System Access API not supported");
      return;
    }

    const fsStorage = new FileSystemNoteStorage();
    const success = await fsStorage.selectDirectory();

    if (success) {
      // Save current note before switching storage
      if (selectedNote) {
        await storage.saveNote({ ...selectedNote, content });
      }

      setStorage(fsStorage);
      setIsFileSystemMode(true);
      setWorkspaceName(fsStorage.getDirectoryName());
      setSelectedNote(null);
      setContent("");
      setSearchQuery("");
    }
  }, [selectedNote, content, storage]);

  // Handle switching back to in-memory mode
  const handleSwitchToMemory = useCallback(async () => {
    // Save current note before switching
    if (selectedNote) {
      await storage.saveNote({ ...selectedNote, content });
    }

    const memStorage = new InMemoryNoteStorage(createSampleNotes());
    setStorage(memStorage);
    setIsFileSystemMode(false);
    setWorkspaceName(null);
    setSelectedNote(null);
    setContent("");
    setSearchQuery("");
  }, [selectedNote, content, storage]);

  // Filtered notes based on search (already handled in loadNotes)
  const displayedNotes = notes;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <AppLayout
        isLeftPanelVisible={isLeftPanelVisible}
        onToggleLeftPanel={handleToggleLeftPanel}
        leftPanel={
          <View style={styles.leftPanel}>
            {/* Workspace selector */}
            <WorkspaceSelector
              isFileSystemSupported={isFileSystemSupported}
              isFileSystemMode={isFileSystemMode}
              workspaceName={workspaceName}
              onSelectFolder={handleSelectFolder}
              onSwitchToMemory={handleSwitchToMemory}
            />
            <NoteList
              notes={displayedNotes}
              selectedNoteId={selectedNote?.id}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onRenameNote={handleRenameNote}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
          </View>
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
            onScroll={handleEditorScroll}
          />
        }
        rightPanel={
          <PreviewPane
            content={content || selectedNote?.content || ""}
            scrollRatio={editorScrollRatio}
          />
        }
      />
    </View>
  );
}

interface WorkspaceSelectorProps {
  isFileSystemSupported: boolean;
  isFileSystemMode: boolean;
  workspaceName: string | null;
  onSelectFolder: () => void;
  onSwitchToMemory: () => void;
}

function WorkspaceSelector({
  isFileSystemSupported,
  isFileSystemMode,
  workspaceName,
  onSelectFolder,
  onSwitchToMemory,
}: WorkspaceSelectorProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.workspaceSelector,
        {
          backgroundColor: colors.backgroundTertiary,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.workspaceLabel, { color: colors.text }]}>
        {isFileSystemMode ? `📁 ${workspaceName}` : "📝 Sample Notes"}
      </Text>
      <View style={styles.workspaceButtons}>
        {isFileSystemSupported && !isFileSystemMode && (
          <Pressable
            style={[
              styles.workspaceButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={onSelectFolder}
            accessibilityRole="button"
            accessibilityLabel="Open folder"
          >
            <Text style={[styles.workspaceButtonText, { color: colors.text }]}>
              Open Folder
            </Text>
          </Pressable>
        )}
        {isFileSystemMode && (
          <Pressable
            style={[
              styles.workspaceButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={onSwitchToMemory}
            accessibilityRole="button"
            accessibilityLabel="Use sample notes"
          >
            <Text style={[styles.workspaceButtonText, { color: colors.text }]}>
              Sample
            </Text>
          </Pressable>
        )}
        {isFileSystemSupported && isFileSystemMode && (
          <Pressable
            style={[
              styles.workspaceButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={onSelectFolder}
            accessibilityRole="button"
            accessibilityLabel="Change folder"
          >
            <Text style={[styles.workspaceButtonText, { color: colors.text }]}>
              Change
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

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
  leftPanel: {
    flex: 1,
    flexDirection: "column",
  },
  workspaceSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  workspaceLabel: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  workspaceButtons: {
    flexDirection: "row",
  },
  workspaceButton: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    borderWidth: 1,
    marginLeft: 4,
  },
  workspaceButtonText: {
    fontSize: 11,
  },
});
