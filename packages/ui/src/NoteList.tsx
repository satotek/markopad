import type { NoteMeta } from "@markopad/core";
import { useState } from "react";
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
  /** Callback when search query changes */
  onSearch?: (query: string) => void;
}

/**
 * NoteList component displays a list of notes with selection support.
 */
export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onSearch,
}: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          accessibilityLabel="Search notes"
        />
      </View>
      <ScrollView style={styles.list}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "No notes match your search."
                : "No notes yet. Create one to get started!"}
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
    paddingVertical: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    fontSize: 13,
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
