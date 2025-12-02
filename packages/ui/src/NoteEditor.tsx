import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "./ThemeContext";

export interface NoteEditorProps {
  /** Current content of the note */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Callback when scroll position changes (ratio 0-1) */
  onScroll?: (scrollRatio: number) => void;
}

/**
 * NoteEditor component provides a TextInput for editing Markdown content.
 */
export function NoteEditor({
  content,
  onChange,
  placeholder = "Start writing your note...",
  editable = true,
  onScroll,
}: NoteEditorProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (onScroll) {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const scrollableHeight = contentSize.height - layoutMeasurement.height;
      if (scrollableHeight > 0) {
        const ratio = contentOffset.y / scrollableHeight;
        onScroll(Math.max(0, Math.min(1, ratio)));
      }
    }
  };

  // On web, we use a scrollable container with a TextInput
  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.container,
          {
            borderRightColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
            },
          ]}
        >
          <Text style={[styles.headerText, { color: colors.text }]}>
            Editor
          </Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <TextInput
            style={[
              styles.textInput,
              { color: colors.text, backgroundColor: colors.background },
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
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          borderRightColor: colors.border,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.backgroundSecondary,
          },
        ]}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>Editor</Text>
      </View>
      <TextInput
        style={[
          styles.textInput,
          { color: colors.text, backgroundColor: colors.background },
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
  scrollView: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "monospace",
    minHeight: "100%",
  },
});
