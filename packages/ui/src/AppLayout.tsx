import { type ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface AppLayoutProps {
  /** Left panel content (typically NoteList) */
  leftPanel: ReactNode;
  /** Center panel content (typically NoteEditor) */
  centerPanel: ReactNode;
  /** Right panel content (typically PreviewPane) */
  rightPanel: ReactNode;
}

/**
 * AppLayout provides a three-pane layout for the MarkoPad app.
 * Left: Note list (toggleable)
 * Center: Editor
 * Right: Preview
 *
 * When left panel is hidden, editor and preview split 50:50.
 */
export function AppLayout({
  leftPanel,
  centerPanel,
  rightPanel,
}: AppLayoutProps) {
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);

  const toggleLeftPanel = () => {
    setLeftPanelVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Toggle button - always visible */}
      <Pressable
        style={styles.toggleButton}
        onPress={toggleLeftPanel}
        accessibilityRole="button"
        accessibilityLabel={
          leftPanelVisible ? "Hide notes panel" : "Show notes panel"
        }
      >
        <Text style={styles.toggleButtonText}>☰</Text>
      </Pressable>

      {/* Main content area */}
      <View style={styles.mainContent}>
        {/* Left panel - conditionally rendered */}
        {leftPanelVisible && <View style={styles.leftPanel}>{leftPanel}</View>}

        {/* Center and right panels */}
        <View style={styles.centerPanel}>{centerPanel}</View>
        <View style={styles.rightPanel}>{rightPanel}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  toggleButton: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    // Width is defined by NoteList component itself (250px)
  },
  centerPanel: {
    flex: 1,
  },
  rightPanel: {
    flex: 1,
  },
});
