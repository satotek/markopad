import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "./ThemeProvider";

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
 * Left: Note list
 * Center: Editor
 * Right: Preview
 */
export function AppLayout({
  leftPanel,
  centerPanel,
  rightPanel,
}: AppLayoutProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {leftPanel}
      {centerPanel}
      {rightPanel}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});
