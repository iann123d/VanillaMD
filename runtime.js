class ContentElement extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute("src");
    if (!src) return;

    try {
      const md = await fetch(src).then(r => r.text());
      this.innerHTML = this.renderMarkdown(md);
      if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
      }
    } catch (err) {
      console.error("Failed to load Markdown:", err);
      this.innerHTML = "<p>Failed to load content.</p>";
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  renderMarkdown(md) {
    const lines = md.split(/\r?\n/);
    let html = '';
    let inCode = false, codeLang = '', codeBuffer = [];
    let inBlockquote = false, blockquoteBuffer = [];
    let inList = false, listType = '', listBuffer = [], listLevel = 0;
    let inTable = false, tableHeaders = [], tableAlignments = [], tableRows = [];
    let inHTML = false, htmlBuffer = [];

    const flushBlockquote = () => {
      if (blockquoteBuffer.length) {
        html += `<blockquote>${this.renderMarkdown(blockquoteBuffer.join('\n'))}</blockquote>`;
        blockquoteBuffer = [];
        inBlockquote = false;
      }
    };

    const flushList = () => {
      if (listBuffer.length) {
        const tag = listType === 'ol' ? 'ol' : 'ul';
        html += `<${tag}>${listBuffer.join('')}</${tag}>`;
        listBuffer = [];
        listType = '';
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableHeaders.length) {
        html += '<table><thead><tr>';
        tableHeaders.forEach((header, idx) => {
          const align = tableAlignments[idx] || 'left';
          html += `<th style="text-align: ${align}">${this.processInlineMarkdown(header.trim())}</th>`;
        });
        html += '</tr></thead><tbody>';
        tableRows.forEach(row => {
          html += '<tr>';
          row.forEach((cell, idx) => {
            const align = tableAlignments[idx] || 'left';
            html += `<td style="text-align: ${align}">${this.processInlineMarkdown(cell.trim())}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
        tableHeaders = [];
        tableAlignments = [];
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (inCode) {
        if (line.match(/^```/) || line.match(/^~~~~/)) {
          html += `<pre><code class="language-${codeLang}">${this.escapeHTML(codeBuffer.join('\n'))}</code></pre>`;
          codeBuffer = [];
          inCode = false;
        } else {
          codeBuffer.push(line);
        }
        continue;
      }

      if (inHTML) {
        htmlBuffer.push(line);
        if (line.match(/<\/(div|section|article|aside|header|footer|nav|main)>/)) {
          html += htmlBuffer.join('\n');
          htmlBuffer = [];
          inHTML = false;
        }
        continue;
      }

      if (inBlockquote) {
        if (!line.match(/^>/)) {
          flushBlockquote();
        } else {
          blockquoteBuffer.push(line.replace(/^>\s?/, ''));
          if (!lines[i+1] || !lines[i+1].match(/^>/)) {
            flushBlockquote();
          }
          continue;
        }
      }

      const codeMatch = line.match(/^```(\w*)/) || line.match(/^~~~~(\w*)/);
      if (codeMatch) {
        flushList();
        flushTable();
        inCode = true;
        codeLang = codeMatch[1] || '';
        continue;
      }

      if (line.match(/^<(div|section|article|aside|header|footer|nav|main)/)) {
        flushList();
        flushBlockquote();
        flushTable();
        inHTML = true;
        htmlBuffer.push(line);
        continue;
      }

      const blockquoteMatch = line.match(/^>\s?(.*)/);
      if (blockquoteMatch) {
        flushList();
        flushTable();
        inBlockquote = true;
        blockquoteBuffer.push(blockquoteMatch[1]);
        if (!lines[i+1] || !lines[i+1].match(/^>/)) {
          flushBlockquote();
        }
        continue;
      }

      if (inTable || (line.includes('|') && lines[i+1] && lines[i+1].match(/^\|?[\s:|-]+\|/))) {
        if (!inTable) {
          flushList();
          inTable = true;
          tableHeaders = line.split('|').filter(h => h.trim()).map(h => h.trim());
          const alignLine = lines[i+1];
          tableAlignments = alignLine.split('|').filter(a => a.trim()).map(a => {
            a = a.trim();
            if (a.startsWith(':') && a.endsWith(':')) return 'center';
            if (a.endsWith(':')) return 'right';
            return 'left';
          });
          i++;
          continue;
        } else {
          if (line.includes('|')) {
            const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
            tableRows.push(cells);
          } else {
            flushTable();
          }
          continue;
        }
      }

      const taskMatch = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)/);
      if (taskMatch) {
        flushBlockquote();
        flushTable();
        const checked = taskMatch[1].toLowerCase() === 'x';
        if (!inList || listType !== 'task') {
          flushList();
          inList = true;
          listType = 'task';
        }
        listBuffer.push(`<li class="task-item"><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${this.processInlineMarkdown(taskMatch[2])}</li>`);
        if (!lines[i+1] || !lines[i+1].match(/^\s*[-*]\s+\[[ xX]\]/)) {
          flushList();
        }
        continue;
      }

      let ulMatch = line.match(/^(\s*)[-*+]\s+(.+)/);
      if (ulMatch) {
        flushBlockquote();
        flushTable();
        const currentLevel = ulMatch[1].length;
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
          listLevel = currentLevel;
        }
        listBuffer.push(`<li>${this.processInlineMarkdown(ulMatch[2])}</li>`);
        if (!lines[i+1] || !lines[i+1].match(/^\s*[-*+]\s+/)) {
          flushList();
        }
        continue;
      }

      let olMatch = line.match(/^\s*\d+\.\s+(.+)/);
      if (olMatch) {
        flushBlockquote();
        flushTable();
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listBuffer.push(`<li>${this.processInlineMarkdown(olMatch[1])}</li>`);
        if (!lines[i+1] || !lines[i+1].match(/^\s*\d+\.\s+/)) {
          flushList();
        }
        continue;
      }

      if (line.trim().match(/^(---|\*\*\*|___)\s*$/)) {
        flushBlockquote();
        flushList();
        flushTable();
        html += '<hr>';
        continue;
      }

      let hMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (hMatch) {
        flushBlockquote();
        flushList();
        flushTable();
        const level = hMatch[1].length;
        const text = hMatch[2];
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        html += `<h${level} id="${id}">${this.processInlineMarkdown(text)}</h${level}>`;
        continue;
      }

      if (line.match(/^!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/)) {
        flushTable();
        html += line.replace(/^!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/, (match, alt, src, title) => {
          return title ? `<img src="${src}" alt="${alt}" title="${title}">` : `<img src="${src}" alt="${alt}">`;
        });
        continue;
      }

      if (line.trim() === '') {
        flushTable();
        continue;
      }

      if (line.trim()) {
        html += `<p>${this.processInlineMarkdown(line)}</p>`;
      }
    }

    flushBlockquote();
    flushList();
    flushTable();

    return html.trim();
  }

  processInlineMarkdown(text) {
    text = text.replace(/!\[([^\]]*)\]\(([^\s)"]+)(?:\s+"([^"]+)")?\)/g, (match, alt, src, title) => {
      return title ? `<img src="${src}" alt="${alt}" title="${title}">` : `<img src="${src}" alt="${alt}">`;
    });

    text = text.replace(/\[([^\]]+)\]\(([^\s)"]+)(?:\s+"([^"]+)")?\)/g, (match, linkText, url, title) => {
      return title ? `<a href="${url}" title="${title}">${linkText}</a>` : `<a href="${url}">${linkText}</a>`;
    });

    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    text = text.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    text = text.replace(/\^\^([^\^]+)\^\^/g, '<sup>$1</sup>');
    text = text.replace(/~([^~]+)~/g, '<sub>$1</sub>');

    text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');

    text = text.replace(/:\w+:/g, (match) => {
      const emoji = this.getEmoji(match);
      return emoji || match;
    });

    return text;
  }

  getEmoji(code) {
    const emojiMap = {
      ':smile:': '😊',
      ':heart:': '❤️',
      ':star:': '⭐',
      ':fire:': '🔥',
      ':rocket:': '🚀',
      ':check:': '✓',
      ':x:': '✗',
      ':warning:': '⚠️',
      ':info:': 'ℹ️',
      ':bulb:': '💡',
      ':thumbsup:': '👍',
      ':thumbsdown:': '👎',
      ':tada:': '🎉',
      ':thinking:': '🤔',
      ':eyes:': '👀'
    };
    return emojiMap[code] || null;
  }
}

if (!customElements.get("mark-down")) {
  customElements.define("mark-down", ContentElement);
}
