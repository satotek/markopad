import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "./ThemeProvider";

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
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderRightColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>Editor</Text>
      </View>
      <TextInput
        style={[
          styles.textInput,
          {
            color: colors.text,
            backgroundColor: colors.background,
          },
        ]}
        value={content}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
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
  },
  header: {
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "monospace",
  },
});
