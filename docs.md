
# VanillaMD Documentation

Welcome to the official documentation for VanillaMD, a lightweight and dependency-free Markdown renderer for the web.

## <a name="introduction"></a>Introduction

VanillaMD is a simple yet powerful tool that allows you to render Markdown files directly in your HTML without any complex setup or dependencies. It's built with vanilla JavaScript and is designed to be as easy to use as possible.

The core philosophy of VanillaMD is to provide a "no-nonsense" Markdown experience. It's perfect for project documentation, personal blogs, or any scenario where you want to write in Markdown and have it seamlessly appear on your webpage.

## <a name="features"></a>Features

*   **Zero Dependencies:** Written entirely in vanilla JavaScript.
*   **Easy to Use:** Just one script tag and a custom HTML element.
*   **Lightweight:** The runtime is small and fast.
*   **Custom Elements:** Uses a simple `<mark-down>` custom element.
*   **Extensible:** Easily styled with CSS.
*   **Syntax Highlighting:** Supports automatic syntax highlighting with a library like `highlight.js`.

## <a name="installation"></a>Installation

Getting started with VanillaMD is incredibly simple. You only need the `runtime.js` file.

1.  **Download `runtime.js`:**
    You can download the `runtime.js` file from the official repository or clone the entire project.

2.  **Include it in your HTML:**
    Place the `runtime.js` script tag at the bottom of your `<body>` section.

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>My Awesome Page</title>
    </head>
    <body>
      <!-- Your content here -->
      <script src="runtime.js"></script>
    </body>
    </html>
    ```

## <a name="how-it-works"></a>How It Works

VanillaMD uses a custom HTML element called `<mark-down>`. This element will fetch the content of the Markdown file specified in its `src` attribute, parse it, and render it as HTML inside the element itself.

## <a name="usage"></a>Usage

To use VanillaMD, add the `<mark-down>` element to your HTML and provide the path to your Markdown file in the `src` attribute.

```html
<main>
  <mark-down src="path/to/your/content.md"></mark-down>
</main>
```

### Syntax Highlighting

For syntax highlighting in your code blocks, you can use a library like `highlight.js`.

1.  **Include `highlight.js`:**
    Add the `highlight.js` library and a stylesheet of your choice to your HTML.

    ```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    ```

2.  **Initialize `highlight.js`:**
    After the VanillaMD runtime, add a script to initialize `highlight.js`.

    ```html
    <script src="runtime.js"></script>
    <script>hljs.highlightAll();</script>
    ```

## <a name="customization"></a>Customization

You can easily style the rendered HTML using CSS. The rendered elements are standard HTML tags (`<h1>`, `<p>`, `<ul>`, etc.), so you can target them directly in your stylesheet.

```css
/* Example: Style all paragraphs rendered by VanillaMD */
mark-down p {
  line-height: 1.6;
  color: #333;
}

/* Example: Style blockquotes */
mark-down blockquote {
  border-left: 4px solid #ccc;
  padding-left: 1rem;
  color: #666;
  font-style: italic;
}
```

## <a name="troubleshooting"></a>Troubleshooting

### Markdown file not loading

*   **Check the path:** Ensure the `src` attribute in your `<mark-down>` element points to the correct path of your Markdown file.
*   **CORS Policy:** If you are loading the file from a different domain, you might encounter a CORS (Cross-Origin Resource Sharing) error. For security reasons, browsers restrict cross-origin HTTP requests. Make sure the server hosting the Markdown file has the correct CORS headers. For local development, running a local server can solve this issue.

### Content not rendering correctly

*   **Check your Markdown syntax:** Make sure your Markdown is well-formed.
*   **Script position:** Ensure the `runtime.js` script is included at the end of the `<body>` tag.

### Syntax highlighting not working

*   **Check `highlight.js`:** Make sure you have included the `highlight.js` library and a theme stylesheet.
*   **Initialization:** Ensure you are calling `hljs.highlightAll()` after the VanillaMD runtime script.

## <a name="contributing"></a>Contributing

Contributions are welcome! If you have a feature request, bug report, or want to contribute to the code, please feel free to open an issue or submit a pull request on the project's repository.

## <a name="license"></a>License

VanillaMD is open-source software licensed under the MIT License.
