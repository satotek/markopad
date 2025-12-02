import type { NoteMeta } from "@markopad/core";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "./ThemeContext";

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
  /** Search query */
  searchQuery?: string;
  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;
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
  onRenameNote,
  searchQuery = "",
  onSearchChange,
}: NoteListProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  // State for rename modal
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameNoteId, setRenameNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // State for delete confirmation
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

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

  const handleRenameStart = (noteId: string, currentTitle: string) => {
    setRenameNoteId(noteId);
    setRenameValue(currentTitle);
    setRenameModalVisible(true);
  };

  const handleRenameConfirm = () => {
    if (renameNoteId && renameValue.trim() && onRenameNote) {
      onRenameNote(renameNoteId, renameValue.trim());
    }
    setRenameModalVisible(false);
    setRenameNoteId(null);
    setRenameValue("");
  };

  const handleRenameCancel = () => {
    setRenameModalVisible(false);
    setRenameNoteId(null);
    setRenameValue("");
  };

  const handleDeleteStart = (noteId: string) => {
    setDeleteNoteId(noteId);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteNoteId && onDeleteNote) {
      onDeleteNote(deleteNoteId);
    }
    setDeleteModalVisible(false);
    setDeleteNoteId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDeleteNoteId(null);
  };

  const deleteNoteTitle = deleteNoteId
    ? (notes.find((n) => n.id === deleteNoteId)?.title ?? "")
    : "";

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
            borderBottomColor: colors.border,
            backgroundColor: colors.backgroundTertiary,
          },
        ]}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>Notes</Text>
        {onCreateNote && (
          <Pressable
            style={[
              styles.newButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
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

      {/* Search input */}
      {onSearchChange && (
        <View
          style={[styles.searchContainer, { borderBottomColor: colors.border }]}
        >
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Search notes..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
            accessibilityLabel="Search notes"
          />
        </View>
      )}

      <ScrollView style={styles.list}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              style={[styles.emptyStateText, { color: colors.textSecondary }]}
            >
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
                { borderBottomColor: colors.border },
                note.id === selectedNoteId && {
                  backgroundColor: colors.selected,
                },
              ]}
              onPress={() => onSelectNote(note.id)}
              accessibilityRole="button"
            >
              <View style={styles.noteContent}>
                <Text
                  style={[styles.noteTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {note.title}
                </Text>
                <Text
                  style={[styles.noteMeta, { color: colors.textSecondary }]}
                >
                  {formatDate(note.updatedAt)}
                </Text>
              </View>
              <View style={styles.noteActions}>
                {onRenameNote && (
                  <Pressable
                    style={[
                      styles.actionButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={() => handleRenameStart(note.id, note.title)}
                    accessibilityRole="button"
                    accessibilityLabel={`Rename ${note.title}`}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      ✏️
                    </Text>
                  </Pressable>
                )}
                {onDeleteNote && (
                  <Pressable
                    style={[
                      styles.actionButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={() => handleDeleteStart(note.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${note.title}`}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      🗑️
                    </Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleRenameCancel}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Rename Note
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.backgroundSecondary,
                },
              ]}
              value={renameValue}
              onChangeText={setRenameValue}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={handleRenameCancel}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleRenameConfirm}
              >
                <Text style={{ color: colors.primaryText }}>Rename</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Delete Note
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Are you sure you want to delete "{deleteNoteTitle}"? This action
              cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={handleDeleteCancel}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleDeleteConfirm}
              >
                <Text style={{ color: "#ffffff" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    padding: 8,
    borderBottomWidth: 1,
  },
  searchInput: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 13,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  noteMeta: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: "row",
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
  actionButtonText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 320,
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: 8,
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonDanger: {
    backgroundColor: "#dc3545",
    borderWidth: 0,
  },
});
