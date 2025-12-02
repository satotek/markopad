import { renderMarkdown } from "@markopad/preview";
import { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./ThemeContext";

export interface PreviewPaneProps {
  /** Markdown content to preview */
  content: string;
  /** Scroll ratio (0-1) to sync with editor */
  scrollRatio?: number;
}

// HTML template for the preview iframe
const createPreviewHtml = (htmlContent: string, isDark: boolean): string => {
  const bgColor = isDark ? "#1e1e1e" : "#ffffff";
  const textColor = isDark ? "#d4d4d4" : "#24292e";
  const codeBg = isDark ? "#2d2d2d" : "#f6f8fa";
  const borderColor = isDark ? "#404040" : "#e1e4e8";
  const linkColor = isDark ? "#58a6ff" : "#0366d6";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    :root {
      --bg-color: ${bgColor};
      --text-color: ${textColor};
      --code-bg: ${codeBg};
      --border-color: ${borderColor};
      --link-color: ${linkColor};
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-color);
      background: var(--bg-color);
      padding: 20px;
      margin: 0;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    p { margin: 0 0 16px; }
    a { color: var(--link-color); text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 85%;
      background: var(--code-bg);
      padding: 0.2em 0.4em;
      border-radius: 6px;
    }
    pre {
      background: var(--code-bg);
      padding: 16px;
      overflow: auto;
      border-radius: 6px;
      margin: 0 0 16px;
    }
    pre code { background: transparent; padding: 0; }
    blockquote {
      margin: 0 0 16px;
      padding: 0 1em;
      color: ${isDark ? "#9e9e9e" : "#6a737d"};
      border-left: 0.25em solid var(--border-color);
    }
    ul, ol { padding-left: 2em; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
    th, td { padding: 6px 13px; border: 1px solid var(--border-color); }
    th { font-weight: 600; background: var(--code-bg); }
    tr:nth-child(2n) { background: var(--code-bg); }
    img { max-width: 100%; }
    .mermaid { text-align: center; margin: 16px 0; }
    .empty-state { color: ${isDark ? "#9e9e9e" : "#6a737d"}; font-style: italic; text-align: center; padding: 40px; }
  </style>
</head>
<body>
  <div id="content">${
    htmlContent ||
    '<p class="empty-state">Start typing to see the preview...</p>'
  }</div>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: '${isDark ? "dark" : "default"}',
      securityLevel: 'loose'
    });

    // Handle scroll sync from parent
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'scrollSync') {
        const scrollRatio = event.data.ratio;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, scrollRatio * scrollableHeight);
      }
    });
  </script>
</body>
</html>`;
};

/**
 * PreviewPane renders Markdown content with Mermaid diagram support.
 * On web, uses an iframe with srcdoc. On native, would use WebView.
 */
export function PreviewPane({ content, scrollRatio }: PreviewPaneProps) {
  const { theme } = useTheme();
  const { colors, isDark } = theme;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Render Markdown to HTML
  const { html } = useMemo(() => renderMarkdown(content), [content]);

  // Create the full HTML document for the iframe
  const srcdoc = useMemo(() => createPreviewHtml(html, isDark), [html, isDark]);

  // Sync scroll position with editor
  useEffect(() => {
    if (
      Platform.OS === "web" &&
      iframeRef.current?.contentWindow &&
      typeof scrollRatio === "number"
    ) {
      iframeRef.current.contentWindow.postMessage(
        { type: "scrollSync", ratio: scrollRatio },
        "*",
      );
    }
  }, [scrollRatio]);

  // Web-specific rendering with iframe using srcdoc
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            Preview
          </Text>
        </View>
        <View style={styles.iframeContainer}>
          <iframe
            ref={(ref) => {
              iframeRef.current = ref;
            }}
            srcDoc={srcdoc}
            style={{
              ...iframeStyles,
              backgroundColor: colors.background,
            }}
            title="Markdown Preview"
            sandbox="allow-scripts"
          />
        </View>
      </View>
    );
  }

  // Native fallback (would use WebView in a real implementation)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.backgroundSecondary,
          },
        ]}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>Preview</Text>
      </View>
      <View style={styles.fallback}>
        <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
          Preview not available on this platform yet.
        </Text>
      </View>
    </View>
  );
}

// Inline styles for iframe (can't use StyleSheet for DOM elements)
const iframeStyles: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 300,
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
  iframeContainer: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  fallbackText: {
    fontSize: 14,
    textAlign: "center",
  },
});
