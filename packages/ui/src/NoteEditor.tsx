import { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";

export interface NoteEditorProps {
  /** Current content of the note */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Callback when scroll position changes (ratio from 0 to 1) */
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
  // Ref for the TextInput element
  const textInputRef = useRef<TextInput>(null);

  // Set up scroll event listener for web platform
  useEffect(() => {
    if (Platform.OS !== "web" || !onScroll || !textInputRef.current) {
      return;
    }

    // Get the underlying DOM element (textarea in React Native Web)
    // biome-ignore lint/suspicious/noExplicitAny: React Native Web internal structure is not typed
    const element = textInputRef.current as any;
    const domNode =
      element._node || element._nativeTag || (element as unknown as Element);

    if (!domNode || typeof domNode.addEventListener !== "function") {
      return;
    }

    const handleScroll = () => {
      const scrollableHeight = domNode.scrollHeight - domNode.clientHeight;
      const scrollRatio =
        scrollableHeight > 0 ? domNode.scrollTop / scrollableHeight : 0;
      onScroll(scrollRatio);
    };

    domNode.addEventListener("scroll", handleScroll);
    return () => {
      domNode.removeEventListener("scroll", handleScroll);
    };
  }, [onScroll]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Editor</Text>
      </View>
      <TextInput
        ref={textInputRef}
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
