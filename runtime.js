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
    // Split into lines for easier block processing
    const lines = md.split(/\r?\n/);
    let html = '';
    let inCode = false, codeLang = '', codeBuffer = [];
    let inBlockquote = false, blockquoteBuffer = [];
    let inList = false, listType = '', listBuffer = [];

    function flushCode() {
      if (codeBuffer.length) {
        const code = codeBuffer.join('\n').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html += `<pre><code class="language-${codeLang}">${code}</code></pre>`;
        codeBuffer = [];
        codeLang = '';
      }
    }
    function flushBlockquote() {
      if (blockquoteBuffer.length) {
        html += `<blockquote>${blockquoteBuffer.join(' ')}</blockquote>`;
        blockquoteBuffer = [];
      }
    }
    function flushList() {
      if (listBuffer.length) {
        const tag = listType === 'ol' ? 'ol' : 'ul';
        html += `<${tag}>${listBuffer.join('')}</${tag}>`;
        listBuffer = [];
        listType = '';
      }
    }

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // --- Code block start/end ---
      const codeMatch = line.match(/^```(\w*)/);
      if (codeMatch) {
        if (!inCode) {
          flushBlockquote(); flushList();
          inCode = true;
          codeLang = codeMatch[1] || '';
        } else {
          inCode = false;
          flushCode();
        }
        continue;
      }
      if (inCode) {
        codeBuffer.push(line);
        continue;
      }

      // --- Blockquote ---
      if (/^>\s?(.*)/.test(line)) {
        flushList();
        inBlockquote = true;
        blockquoteBuffer.push(line.replace(/^>\s?/, ''));
        // If next line is not a blockquote, flush
        if (!lines[i+1] || !/^>\s?/.test(lines[i+1])) {
          flushBlockquote();
          inBlockquote = false;
        }
        continue;
      }

      // --- Lists ---
      let ulMatch = line.match(/^\s*-\s+(.+)/);
      let olMatch = line.match(/^\s*\d+\.\s+(.+)/);
      if (ulMatch) {
        flushBlockquote();
        if (!inList || listType !== 'ul') { flushList(); inList = true; listType = 'ul'; }
        listBuffer.push(`<li>${ulMatch[1]}</li>`);
        // If next line is not a list, flush
        if (!lines[i+1] || !/^\s*-\s+/.test(lines[i+1])) { flushList(); inList = false; }
        continue;
      }
      if (olMatch) {
        flushBlockquote();
        if (!inList || listType !== 'ol') { flushList(); inList = true; listType = 'ol'; }
        listBuffer.push(`<li>${olMatch[1]}</li>`);
        if (!lines[i+1] || !/^\s*\d+\.\s+/.test(lines[i+1])) { flushList(); inList = false; }
        continue;
      }

      // --- Headings ---
      if (/^### (.+)/.test(line)) {
        flushBlockquote(); flushList();
        html += `<h3>${line.replace(/^### /, '')}</h3>`;
        continue;
      }
      if (/^## (.+)/.test(line)) {
        flushBlockquote(); flushList();
        html += `<h2>${line.replace(/^## /, '')}</h2>`;
        continue;
      }
      if (/^# (.+)/.test(line)) {
        flushBlockquote(); flushList();
        html += `<h1>${line.replace(/^# /, '')}</h1>`;
        continue;
      }

      // --- Horizontal rule ---
      if (/^---+$/.test(line)) {
        flushBlockquote(); flushList();
        html += `<hr>`;
        continue;
      }

      // --- Images ---
      if (/^!\[([^\]]*)\]\(([^)]+)\)/.test(line)) {
        flushBlockquote(); flushList();
        html += line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
        continue;
      }

      // --- Links ---
      if (/\[([^\]]+)\]\(([^)]+)\)/.test(line)) {
        flushBlockquote(); flushList();
        html += line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        continue;
      }

      // --- Inline code, bold, italics ---
      let escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      escaped = escaped.replace(/`([^`\n]+)`/g, '<code>$1</code>');
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // --- Paragraphs ---
      if (escaped.trim()) {
        flushBlockquote(); flushList();
        html += `<p>${escaped}</p>`;
      }
    }
    // Flush any remaining buffers
    flushCode(); flushBlockquote(); flushList();
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
