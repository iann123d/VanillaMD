class ContentElement extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute("src");
    if (!src) return;

    try {
      const md = await fetch(src).then(r => r.text());
      this.innerHTML = this.renderMarkdown(md);
    } catch (err) {
      console.error("Failed to load Markdown:", err);
      this.innerHTML = "<p>Failed to load content.</p>";
    }
  }

  renderMarkdown(md) {
    let html = md;

    // --- Code blocks first (```lang) ---
    html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, function(_, lang, code) {
      code = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    });

    // --- Blockquotes ---
    html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

    // --- Headings ---
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // --- Lists ---
    html = html.replace(/^\s*-\s+(.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ol>$1</ol>");

    // --- Bold & Italics ---
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // --- Inline code ---
    html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");

    // --- Links & Images ---
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // --- Wrap remaining lines in <p> and escape ---
    html = html.replace(
      /^(?!<h|<ul>|<ol>|<pre>|<blockquote>|<img|<hr|<code|<li>)(.+)$/gm,
      (_, line) => "<p>" + line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>"
    );

    return html;
  }
}

// Only define once
if (!customElements.get("mark-down")) {
  customElements.define("mark-down", ContentElement);
}

// --- Inject CSS styles dynamically ---
const style = document.createElement("style");
style.textContent = `
mark-down {
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.5;
  color: #222;
}

mark-down blockquote {
  border-left: 4px solid #888;
  padding-left: 1em;
  color: #555;
  margin: 0.5em 0;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 4px;
}

mark-down pre {
  background-color: #1e1e1e;
  color: #f8f8f2;
  padding: 0.8em;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  overflow-x: auto;
  max-width: 100%;
  margin: 0.5em 0;
}

mark-down code {
  font-family: 'Courier New', monospace;
  background-color: #eee;
  padding: 0 0.3em;
  border-radius: 3px;
  font-size: 0.9em;
}

mark-down h1, mark-down h2, mark-down h3 {
  margin: 0.8em 0 0.4em 0;
}
`;
document.head.appendChild(style);


// Only define once
if (!customElements.get("mark-down")) {
  customElements.define("mark-down", ContentElement);
}
