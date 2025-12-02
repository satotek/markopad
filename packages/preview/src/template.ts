/**
 * HTML template for the Markdown preview.
 * This template includes Mermaid for diagram rendering.
 */
export function getPreviewTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MarkoPad Preview</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    :root {
      --bg-color: #ffffff;
      --text-color: #24292e;
      --code-bg: #f6f8fa;
      --border-color: #e1e4e8;
      --link-color: #0366d6;
      --heading-color: #1a1a1a;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #1e1e1e;
        --text-color: #d4d4d4;
        --code-bg: #2d2d2d;
        --border-color: #404040;
        --link-color: #58a6ff;
        --heading-color: #ffffff;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
      padding: 20px;
      margin: 0;
      max-width: 100%;
      overflow-wrap: break-word;
    }

    h1, h2, h3, h4, h5, h6 {
      color: var(--heading-color);
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }

    p {
      margin-top: 0;
      margin-bottom: 16px;
    }

    a {
      color: var(--link-color);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 85%;
      background-color: var(--code-bg);
      padding: 0.2em 0.4em;
      border-radius: 6px;
    }

    pre {
      background-color: var(--code-bg);
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      border-radius: 6px;
      margin-top: 0;
      margin-bottom: 16px;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }

    blockquote {
      margin: 0 0 16px 0;
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid var(--border-color);
    }

    ul, ol {
      padding-left: 2em;
      margin-top: 0;
      margin-bottom: 16px;
    }

    li {
      margin-top: 0.25em;
    }

    li > ul, li > ol {
      margin-bottom: 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }

    th, td {
      padding: 6px 13px;
      border: 1px solid var(--border-color);
    }

    th {
      font-weight: 600;
      background-color: var(--code-bg);
    }

    tr:nth-child(2n) {
      background-color: var(--code-bg);
    }

    img {
      max-width: 100%;
      height: auto;
    }

    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: var(--border-color);
      border: 0;
    }

    /* Checkbox styling */
    input[type="checkbox"] {
      margin-right: 0.5em;
    }

    /* Mermaid diagram container */
    .mermaid {
      background-color: var(--bg-color);
      text-align: center;
      margin: 16px 0;
    }

    /* Empty state */
    .empty-state {
      color: #6a737d;
      font-style: italic;
      text-align: center;
      padding: 40px;
    }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    // Function to render content
    async function renderContent(html) {
      const container = document.getElementById('content');
      container.innerHTML = html || '<p class="empty-state">Start typing to see the preview...</p>';
      
      // Re-render Mermaid diagrams
      try {
        await mermaid.run({
          querySelector: '.mermaid'
        });
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }

    // Listen for messages from parent (for iframe usage)
    window.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'render') {
        await renderContent(event.data.html);
      }
    });

    // Initial render
    renderContent('');
  </script>
</body>
</html>`;
}

/**
 * Create a data URL for the preview template.
 * Useful for iframe src or WebView source.
 */
export function getPreviewDataUrl(): string {
  const html = getPreviewTemplate();
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
