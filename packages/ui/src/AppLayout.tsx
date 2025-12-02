import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./ThemeContext";

export interface AppLayoutProps {
  /** Left panel content (typically NoteList) */
  leftPanel: ReactNode;
  /** Center panel content (typically NoteEditor) */
  centerPanel: ReactNode;
  /** Right panel content (typically PreviewPane) */
  rightPanel: ReactNode;
  /** Whether the left panel is visible */
  isLeftPanelVisible?: boolean;
  /** Callback to toggle left panel visibility */
  onToggleLeftPanel?: () => void;
}

/**
 * AppLayout provides a three-pane layout for the MarkoPad app.
 * Left: Note list (collapsible)
 * Center: Editor
 * Right: Preview
 */
export function AppLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  isLeftPanelVisible = true,
  onToggleLeftPanel,
}: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toolbar */}
      <View
        style={[
          styles.toolbar,
          {
            backgroundColor: colors.backgroundTertiary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.toolbarLeft}>
          {onToggleLeftPanel && (
            <Pressable
              style={[
                styles.toolbarButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={onToggleLeftPanel}
              accessibilityRole="button"
              accessibilityLabel={
                isLeftPanelVisible ? "Hide note list" : "Show note list"
              }
            >
              <Text style={[styles.toolbarButtonText, { color: colors.text }]}>
                {isLeftPanelVisible ? "◀" : "▶"}
              </Text>
            </Pressable>
          )}
        </View>
        <View style={styles.toolbarRight}>
          <Pressable
            style={[
              styles.toolbarButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={
              theme.isDark ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <Text style={[styles.toolbarButtonText, { color: colors.text }]}>
              {theme.isDark ? "☀️" : "🌙"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {isLeftPanelVisible && leftPanel}
        {centerPanel}
        {rightPanel}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  toolbarButtonText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
});
