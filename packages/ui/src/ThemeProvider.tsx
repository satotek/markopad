import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { getTheme, type Theme, type ThemeColors } from "./theme";

/**
 * Theme context value
 */
interface ThemeContextValue {
  /** Current theme */
  theme: Theme;
  /** Current color scheme */
  colorScheme: "light" | "dark";
  /** Theme colors (shortcut to theme.colors) */
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * ThemeProvider component that provides theme context based on system color scheme.
 * Uses React Native's useColorScheme hook to detect system preference.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const colorScheme = systemColorScheme === "dark" ? "dark" : "light";

  const value = useMemo<ThemeContextValue>(() => {
    const theme = getTheme(colorScheme);
    return {
      theme,
      colorScheme,
      colors: theme.colors,
    };
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
