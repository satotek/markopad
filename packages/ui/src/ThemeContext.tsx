import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryText: string;
  selected: string;
  hover: string;
}

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: "#ffffff",
  backgroundSecondary: "#f5f5f5",
  backgroundTertiary: "#f0f0f0",
  text: "#1a1a1a",
  textSecondary: "#666666",
  border: "#e0e0e0",
  primary: "#0066cc",
  primaryText: "#ffffff",
  selected: "#e3f2fd",
  hover: "#f0f0f0",
};

const darkColors: ThemeColors = {
  background: "#1e1e1e",
  backgroundSecondary: "#252526",
  backgroundTertiary: "#2d2d2d",
  text: "#d4d4d4",
  textSecondary: "#888888",
  border: "#404040",
  primary: "#58a6ff",
  primaryText: "#ffffff",
  selected: "#264f78",
  hover: "#2a2d2e",
};

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark(): boolean {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  initialMode = "system",
}: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);

  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return getSystemPrefersDark();
    }
    return themeMode === "dark";
  }, [themeMode]);

  const theme = useMemo<Theme>(
    () => ({
      mode: themeMode,
      isDark,
      colors: isDark ? darkColors : lightColors,
    }),
    [themeMode, isDark],
  );

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      // If system, toggle to the opposite of current preference
      return getSystemPrefersDark() ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      toggleTheme,
    }),
    [theme, themeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
