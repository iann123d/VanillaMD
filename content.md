# Welcome to VanillaMD

This is a **fully featured Markdown site** powered by a single script. VanillaMD now supports comprehensive Markdown and rich text formatting.

## Core Features

- Headings (H1 through H6)
- **Bold**, *Italic*, and ***Bold Italic*** text
- `Inline code` and code blocks with syntax highlighting
- ~~Strikethrough~~ and ==highlighted== text
- Ordered and unordered lists
- Task lists with checkboxes
- Blockquotes
- Links with titles
- Images with alt text and titles
- Tables with alignment
- Horizontal rules
- Superscript^^2^^ and Subscript~i~
- Auto-linking URLs
- Emoji support :rocket: :star: :fire:

---

## Text Formatting Examples

**Bold text** using `**text**` or `__text__`

*Italic text* using `*text*` or `_text_`

***Bold and italic*** using `***text***` or `___text___`

~~Strikethrough text~~ using `~~text~~`

==Highlighted text== using `==text==`

Superscript: E = mc^^2^^

Subscript: H~2~O

---

## Lists

### Unordered Lists

- Item one
- Item two
- Item three
  + Nested item (using + or *)
  + Another nested item

### Ordered Lists

1. First item
2. Second item
3. Third item

### Task Lists

- [x] Completed task
- [ ] Pending task
- [x] Another completed task

---

## Code Examples

### Inline Code

Use `const variable = value` for inline code.

### Code Blocks

```javascript
function greet(name) {
  return `Hello, ${name}! Welcome to VanillaMD.`;
}

console.log(greet("World"));
```

```python
def calculate_sum(a, b):
    return a + b

result = calculate_sum(5, 10)
print(f"Result: {result}")
```

---

## Tables

Tables now work with full alignment support:

| Feature | Support | Status |
|---------|:-------:|-------:|
| Headers | Yes | :check: |
| Bold text | Yes | Complete |
| Alignment | Yes | Working |
| Nested formatting | **Yes** | *Active* |

---

## Blockquotes

> "Markdown, minus the nonsense."
>
> VanillaMD makes it easy to create beautiful documentation with zero dependencies.

> **Note:** Blockquotes can contain **formatting** and even `code`.

---

## Links & Images

[Visit GitHub](https://github.com "GitHub Homepage")

Auto-linked URL: https://example.com

![Placeholder Image](https://via.placeholder.com/400x200 "Sample placeholder image")

---

## Emojis

Built-in emoji support: :smile: :heart: :star: :fire: :rocket: :thumbsup: :tada:

---

## HTML Support

<div style="padding: 1rem; background: #f0f0f0; border-radius: 8px;">
  <strong>Custom HTML blocks are supported!</strong>
  <p>You can mix HTML with Markdown for advanced layouts.</p>
</div>
