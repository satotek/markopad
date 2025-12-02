import { StyleSheet, Text, TextInput, View } from "react-native";

export interface NoteEditorProps {
  /** Current content of the note */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
}

/**
 * NoteEditor component provides a TextInput for editing Markdown content.
 */
export function NoteEditor({
  content,
  onChange,
  placeholder = "Start writing your note...",
  editable = true,
}: NoteEditorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Editor</Text>
      </View>
      <TextInput
        style={styles.textInput}
        value={content}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        editable={editable}
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 300,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "monospace",
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
});
