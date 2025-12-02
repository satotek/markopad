import { Marked } from "marked";

/**
 * Information about a Mermaid diagram found in the Markdown content.
 */
export interface MermaidBlock {
  /** Unique ID for this diagram */
  id: string;
  /** The Mermaid diagram code */
  code: string;
}

/**
 * Result of rendering Markdown to HTML.
 */
export interface RenderResult {
  /** The rendered HTML */
  html: string;
  /** Mermaid diagrams extracted from the content */
  mermaidBlocks: MermaidBlock[];
}

/**
 * Render Markdown to HTML, extracting Mermaid blocks.
 * Mermaid blocks are replaced with placeholder divs that will be rendered client-side.
 */
export function renderMarkdown(markdown: string): RenderResult {
  const mermaidBlocks: MermaidBlock[] = [];
  const mermaidCounter = { value: 0 };

  // Create a custom renderer
  const marked = new Marked();

  // Override the code block renderer
  const renderer = {
    code(token: { text: string; lang?: string }): string {
      const { text, lang } = token;
      if (lang === "mermaid") {
        const id = `mermaid-${mermaidCounter.value++}`;
        mermaidBlocks.push({ id, code: text });
        // Return a placeholder div that Mermaid will render into
        return `<div class="mermaid" id="${id}">${escapeHtml(text)}</div>`;
      }
      // Regular code block with syntax highlighting class
      const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      return `<pre><code${langClass}>${escapeHtml(text)}</code></pre>`;
    },
  };

  marked.use({ renderer });

  const html = marked.parse(markdown) as string;

  return { html, mermaidBlocks };
}

/**
 * Escape HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
