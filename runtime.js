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

    // --- Wrap remaining lines in <p> ---
    html = html.replace(/^(?!<h|<ul>|<ol>|<pre>|<blockquote>|<img|<hr|<code|<li>)(.+)$/gm, "<p>$1</p>");

    // --- Escape any leftover HTML entities ---
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return html;
  }
}

// Only define once
if (!customElements.get("mark-down")) {
  customElements.define("mark-down", ContentElement);
}
