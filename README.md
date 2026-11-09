# Markdown Web

A minimal Markdown editor with live preview and automatic localStorage saving.

- Edit, split, and preview views; responsive layout and system dark mode.
- Bold, italic, heading, link, code, and list shortcuts.
- Download your writing as a `.md` file.
- No backend, account, build step, or CDN. Markdown images load from their source URLs.

## Run

Open `index.html` in a browser, or serve this directory with any static web server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Deploy the repository root to any static host, with no build command.

Your document saves on every edit in this browser on this origin. Clearing browser data removes it, and private browsing may not retain it. If storage is unavailable or full, the editor shows a warning and you can still download your document. Storage behavior for directly opened `file:` URLs depends on the browser; a static server gives consistent persistence. Other tabs on the same origin reflect the latest saved edit. Download a copy for a portable backup.

Keyboard shortcuts: **Ctrl/⌘ B** for bold, **Ctrl/⌘ I** for italic, **Ctrl/⌘ K** for a link. Tab keeps normal keyboard focus navigation.

Markdown uses CommonMark with table, strikethrough, and task-list extensions. It is rendered with vendored [markdown-it](https://github.com/markdown-it/markdown-it) and sanitized with [DOMPurify](https://github.com/cure53/DOMPurify). Their licenses are in `vendor/`. Raw scripts, interactive forms, and inline styles are excluded from preview; task checkboxes render as disabled controls. Headings, paragraphs, emphasis, nested lists, blockquotes, thematic breaks, fenced and indented code, links (including reference links and autolinks), images, escapes, entities, and hard/soft line breaks are supported. Safe raw HTML is preserved. Markdown images, including remote images, render normally; remote images contact their host without sending a referrer.

## Markdown checks

```sh
node --test tests/markdown.cjs
```

The actual application parser passes all 652 official CommonMark 0.31.2 examples, plus a test covering tables, strikethrough, and nested task lists. The fixtures come from [commonmark/commonmark-spec, tag 0.31.2](https://github.com/commonmark/commonmark-spec/tree/0.31.2); their CC-BY-SA 4.0 attribution and license are in `tests/commonmark.LICENSE`. HTML/XHTML void-tag syntax and whitespace inside empty blockquotes are normalized for comparison. Sanitization intentionally restricts unsafe HTML after parsing, while images use the page's no-referrer policy.
