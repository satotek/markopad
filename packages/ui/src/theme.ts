/**
 * Theme definitions for MarkoPad.
 * Provides light and dark theme color palettes.
 */

export interface ThemeColors {
  /** Primary background color */
  background: string;
  /** Secondary/surface background color */
  backgroundSecondary: string;
  /** Tertiary/elevated background color */
  backgroundTertiary: string;
  /** Primary text color */
  text: string;
  /** Secondary/muted text color */
  textSecondary: string;
  /** Border color */
  border: string;
  /** Selected/highlighted item background */
  selected: string;
  /** Accent/primary color */
  accent: string;
}

export interface Theme {
  /** Theme identifier */
  name: "light" | "dark";
  /** Theme color palette */
  colors: ThemeColors;
}

/**
 * Light theme color palette
 */
export const lightTheme: Theme = {
  name: "light",
  colors: {
    background: "#ffffff",
    backgroundSecondary: "#f5f5f5",
    backgroundTertiary: "#f0f0f0",
    text: "#1a1a1a",
    textSecondary: "#666666",
    border: "#e0e0e0",
    selected: "#e3f2fd",
    accent: "#0066cc",
  },
};

/**
 * Dark theme color palette
 */
export const darkTheme: Theme = {
  name: "dark",
  colors: {
    background: "#1e1e1e",
    backgroundSecondary: "#252525",
    backgroundTertiary: "#2d2d2d",
    text: "#d4d4d4",
    textSecondary: "#a0a0a0",
    border: "#404040",
    selected: "#264f78",
    accent: "#58a6ff",
  },
};

/**
 * Get theme based on color scheme preference
 */
export function getTheme(colorScheme: "light" | "dark" | null): Theme {
  return colorScheme === "dark" ? darkTheme : lightTheme;
}
