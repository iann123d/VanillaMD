class ContentElement extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute("src");
    if (!src) return;

    try {
      const md = await fetch(src).then(r => r.text());
      this.innerHTML = this.renderMarkdown(md);
      hljs.highlightAll();
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

    function flushBlockquote() {
      if (blockquoteBuffer.length) {
        html += `<blockquote>${this.renderMarkdown(blockquoteBuffer.join('\n'))}</blockquote>`;
        blockquoteBuffer = [];
        inBlockquote = false;
      }
    }

    function flushList() {
      if (listBuffer.length) {
        const tag = listType === 'ol' ? 'ol' : 'ul';
        html += `<${tag}>${listBuffer.join('')}</${tag}>`;
        listBuffer = [];
        listType = '';
        inList = false;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (inCode) {
        if (line.match(/^```/)) {
          html += `<pre><code class="language-${codeLang}">${codeBuffer.join('\n')}</code></pre>`;
          codeBuffer = [];
          inCode = false;
        } else {
          codeBuffer.push(line);
        }
        continue;
      }

      if (inBlockquote) {
        if (!line.match(/^>/)) {
          flushBlockquote.call(this);
        } else {
          blockquoteBuffer.push(line.replace(/^>\s?/, ''));
          if (!lines[i+1] || !lines[i+1].match(/^>/)) {
            flushBlockquote.call(this);
          }
          continue;
        }
      }

      const codeMatch = line.match(/^```(\w*)/);
      if (codeMatch) {
        flushList.call(this);
        inCode = true;
        codeLang = codeMatch[1] || '';
        continue;
      }

      const blockquoteMatch = line.match(/^>\s?(.*)/);
      if (blockquoteMatch) {
        flushList.call(this);
        inBlockquote = true;
        blockquoteBuffer.push(blockquoteMatch[1]);
        if (!lines[i+1] || !lines[i+1].match(/^>/)) {
          flushBlockquote.call(this);
        }
        continue;
      }

      let ulMatch = line.match(/^\s*-\s+(.+)/);
      if (ulMatch) {
        flushBlockquote.call(this);
        if (!inList || listType !== 'ul') {
          flushList.call(this);
          inList = true;
          listType = 'ul';
        }
        listBuffer.push(`<li>${this.renderMarkdown(ulMatch[1])}</li>`);
        if (!lines[i+1] || !lines[i+1].match(/^\s*-\s+/)) {
          flushList.call(this);
        }
        continue;
      }

      let olMatch = line.match(/^\s*\d+\.\s+(.+)/);
      if (olMatch) {
        flushBlockquote.call(this);
        if (!inList || listType !== 'ol') {
          flushList.call(this);
          inList = true;
          listType = 'ol';
        }
        listBuffer.push(`<li>${this.renderMarkdown(olMatch[1])}</li>`);
        if (!lines[i+1] || !lines[i+1].match(/^\s*\d+\.\s+/)) {
          flushList.call(this);
        }
        continue;
      }

      if (line.trim() === '---') {
        flushBlockquote.call(this);
        flushList.call(this);
        html += '<hr>';
        continue;
      }

      let hMatch = line.match(/^(#+)\s+(.*)/);
      if (hMatch) {
        flushBlockquote.call(this);
        flushList.call(this);
        const level = hMatch[1].length;
        html += `<h${level}>${this.renderMarkdown(hMatch[2])}</h${level}>`;
        continue;
      }

      if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)) {
        html += line.replace(/^!\[([^\]]*)\]\(([^)]+)\)/, '<img src="$2" alt="$1">');
        continue;
      }

      if (line.trim()) {
        html += `<p>${line}</p>`;
      }
    }

    flushBlockquote.call(this);
    flushList.call(this);

    md = html.trim();
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    md = md.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    md = md.replace(/`([^`]+)`/g, '<code>$1</code>');

    return md;
  }
}

if (!customElements.get("mark-down")) {
  customElements.define("mark-down", ContentElement);
}
