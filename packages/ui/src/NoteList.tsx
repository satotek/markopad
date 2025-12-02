import type { NoteMeta } from "@markopad/core";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface NoteListProps {
  /** List of notes to display */
  notes: NoteMeta[];
  /** Currently selected note ID */
  selectedNoteId?: string;
  /** Callback when a note is selected */
  onSelectNote: (noteId: string) => void;
  /** Callback when creating a new note */
  onCreateNote?: () => void;
  /** Callback when deleting a note */
  onDeleteNote?: (noteId: string) => void;
  /** Callback when renaming a note */
  onRenameNote?: (noteId: string, newTitle: string) => void;
  /** Search query for filtering notes */
  searchQuery?: string;
  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;
}

/**
 * Format date with time for display in the note list.
 * Shows both date and time for better clarity.
 */
function formatDateTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Format time as HH:MM
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (days === 0) {
    // For today, show "Today HH:MM"
    return `Today ${timeStr}`;
  }
  if (days === 1) {
    return `Yesterday ${timeStr}`;
  }
  if (days < 7) {
    return `${days} days ago`;
  }

  // For older dates, show full date in locale format
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * NoteList component displays a list of notes with selection support.
 */
export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery = "",
  onSearchChange,
}: NoteListProps) {
  // Filter notes based on search query
  const filteredNotes =
    searchQuery.trim() === ""
      ? notes
      : notes.filter((note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  return (
    <View style={styles.container}>
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
      {onSearchChange && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search notes..."
            placeholderTextColor="#999999"
            accessibilityLabel="Search notes"
          />
        </View>
      )}
      <ScrollView style={styles.list}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "No notes match your search."
                : "No notes yet. Create one to get started!"}
            </Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <View
              key={note.id}
              style={[
                styles.noteItem,
                note.id === selectedNoteId && styles.noteItemSelected,
              ]}
            >
              <Pressable
                style={styles.noteContent}
                onPress={() => onSelectNote(note.id)}
                accessibilityRole="button"
              >
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <Text style={styles.noteMeta}>
                  {formatDateTime(note.updatedAt)}
                </Text>
              </Pressable>
              {onDeleteNote && (
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => onDeleteNote(note.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${note.title}`}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </Pressable>
              )}
            </View>
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
  searchContainer: {
    padding: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
  },
  searchInput: {
    height: 32,
    paddingHorizontal: 10,
    fontSize: 13,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
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
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  noteContent: {
    flex: 1,
    padding: 12,
    paddingHorizontal: 16,
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
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: 18,
    color: "#999999",
    fontWeight: "400",
  },
});
