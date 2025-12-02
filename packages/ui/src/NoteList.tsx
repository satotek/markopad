import type { NoteMeta } from "@markopad/core";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./ThemeProvider";

export interface NoteListProps {
  /** List of notes to display */
  notes: NoteMeta[];
  /** Currently selected note ID */
  selectedNoteId?: string;
  /** Callback when a note is selected */
  onSelectNote: (noteId: string) => void;
  /** Callback when creating a new note */
  onCreateNote?: () => void;
}

/**
 * NoteList component displays a list of notes with selection support.
 */
export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
}: NoteListProps) {
  const { colors } = useTheme();

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderRightColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.backgroundTertiary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>Notes</Text>
        {onCreateNote && (
          <Pressable
            style={[
              styles.newButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={onCreateNote}
            accessibilityRole="button"
            accessibilityLabel="Create new note"
          >
            <Text style={[styles.newButtonText, { color: colors.text }]}>
              + New
            </Text>
          </Pressable>
        )}
      </View>
      <ScrollView style={styles.list}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              style={[styles.emptyStateText, { color: colors.textSecondary }]}
            >
              No notes yet. Create one to get started!
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <Pressable
              key={note.id}
              style={[
                styles.noteItem,
                { borderBottomColor: colors.border },
                note.id === selectedNoteId && {
                  backgroundColor: colors.selected,
                },
              ]}
              onPress={() => onSelectNote(note.id)}
              accessibilityRole="button"
            >
              <Text
                style={[styles.noteTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {note.title}
              </Text>
              <Text style={[styles.noteMeta, { color: colors.textSecondary }]}>
                {formatDate(note.updatedAt)}
              </Text>
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
    borderRightWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  newButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  newButtonText: {
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  emptyState: {
    padding: 16,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
  },
  noteItem: {
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  noteMeta: {
    fontSize: 12,
  },
});
