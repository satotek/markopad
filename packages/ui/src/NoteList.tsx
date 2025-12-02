import type { NoteMeta } from "@markopad/core";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface NoteListProps {
  /** List of notes to display */
  notes: NoteMeta[];
  /** Currently selected note ID */
  selectedNoteId?: string;
  /** Callback when a note is selected */
  onSelectNote: (noteId: string) => void;
  /** Callback when creating a new note */
  onCreateNote?: () => void;
  /** Callback when opening a folder (for file system storage) */
  onOpenFolder?: () => void;
  /** Whether the File System Access API is supported */
  isFileSystemSupported?: boolean;
  /** Name of the currently open folder */
  folderName?: string;
}

/**
 * NoteList component displays a list of notes with selection support.
 */
export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onOpenFolder,
  isFileSystemSupported = false,
  folderName,
}: NoteListProps) {
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    }
    if (days === 1) {
      return "Yesterday";
    }
    if (days < 7) {
      return `${days} days ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Folder selection section */}
      {isFileSystemSupported && (
        <View style={styles.folderSection}>
          <Pressable
            style={styles.folderButton}
            onPress={onOpenFolder}
            accessibilityRole="button"
            accessibilityLabel="Open folder"
          >
            <Text style={styles.folderButtonText}>
              {folderName ? `📁 ${folderName}` : "📂 フォルダを開く"}
            </Text>
          </Pressable>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.headerText}>Notes</Text>
        {onCreateNote && (
          <Pressable
            style={styles.newButton}
            onPress={onCreateNote}
            accessibilityRole="button"
            accessibilityLabel="Create new note"
          >
            <Text style={styles.newButtonText}>+ New</Text>
          </Pressable>
        )}
      </View>
      <ScrollView style={styles.list}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No notes yet. Create one to get started!
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <Pressable
              key={note.id}
              style={[
                styles.noteItem,
                note.id === selectedNoteId && styles.noteItemSelected,
              ]}
              onPress={() => onSelectNote(note.id)}
              accessibilityRole="button"
            >
              <Text style={styles.noteTitle} numberOfLines={1}>
                {note.title}
              </Text>
              <Text style={styles.noteMeta}>{formatDate(note.updatedAt)}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  folderSection: {
    padding: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#e8e8e8",
  },
  folderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  folderButtonText: {
    fontSize: 12,
    color: "#1a1a1a",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  newButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  newButtonText: {
    fontSize: 12,
    color: "#1a1a1a",
  },
  list: {
    flex: 1,
  },
  emptyState: {
    padding: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  noteItem: {
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  noteItemSelected: {
    backgroundColor: "#e3f2fd",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  noteMeta: {
    fontSize: 12,
    color: "#666666",
  },
});
