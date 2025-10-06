class ContentElement extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute("src");
    if (!src) return;

    const md = await fetch(src).then(r => r.text());
    this.innerHTML = this.renderMarkdown(md);
  }

  renderMarkdown(md) {
    let html = md;

    // Escape HTML
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Horizontal rules
    html = html.replace(/^---$/gm, "<hr>");

    // Headings
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Blockquotes
    html = html.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

    // Lists
    // Unordered
    html = html.replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>");
    // Wrap <li> in <ul>
    html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");

    // Ordered
    html = html.replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/gs, "<ol>$1</ol>");

    // Code blocks (```lang)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    });

    // Wrap paragraphs
    html = html.replace(/^(?!<h|<ul>|<ol>|<pre>|<blockquote>|<img|<hr|<code|<li>)(.+)$/gm, "<p>$1</p>");

    return html;
  }
}

customElements.define("content", ContentElement);
