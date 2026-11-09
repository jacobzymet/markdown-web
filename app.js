/* global MarkdownWeb, DOMPurify */
(() => {
  'use strict';
  const STORAGE_KEY = 'markdown-web:content';
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  const emptyPreview = document.getElementById('empty-preview');
  const status = document.getElementById('save-status');
  const workspace = document.getElementById('workspace');
  const viewButtons = [...document.querySelectorAll('button[data-view]')];
  const formatButtons = [...document.querySelectorAll('[data-format]')];
  const markdown = MarkdownWeb.createParser();
  let renderTimer;

  DOMPurify.addHook('afterSanitizeAttributes', node => {
    if (node.tagName === 'INPUT') {
      if (node.getAttribute('type') !== 'checkbox') node.remove();
      else node.setAttribute('disabled', '');
    }
  });

  function storageError() {
    status.textContent = 'Not saved — download a copy';
    status.classList.add('error');
  }

  try {
    editor.value = localStorage.getItem(STORAGE_KEY) ?? '';
    // Test writes too: some browsers permit reads while blocking writes.
    localStorage.setItem(STORAGE_KEY, editor.value);
  } catch {
    storageError();
  }

  function render() {
    const source = editor.value;
    preview.innerHTML = DOMPurify.sanitize(markdown.render(source), {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['style', 'form', 'button', 'textarea', 'select'],
      FORBID_ATTR: ['style', 'id', 'name'],
    });
    for (const link of preview.querySelectorAll('a')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    emptyPreview.hidden = source.trim().length > 0;
  }

  function update() {
    const source = editor.value;
    try {
      localStorage.setItem(STORAGE_KEY, source);
      status.textContent = 'Saved in this browser';
      status.classList.remove('error');
    } catch {
      storageError();
    }
    updateCounts();
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 100);
  }

  function updateCounts() {
    const source = editor.value;
    const words = source.trim() ? source.trim().split(/\s+/u).length : 0;
    const characters = [...source].length;
    document.getElementById('word-count').textContent = `${words.toLocaleString()} ${words === 1 ? 'word' : 'words'}`;
    document.getElementById('character-count').textContent = `${characters.toLocaleString()} ${characters === 1 ? 'character' : 'characters'}`;
  }

  function setView(view) {
    workspace.dataset.view = view;
    for (const button of viewButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.view === view));
    }
    for (const button of formatButtons) button.disabled = view === 'preview';
  }

  function insert(before, after = '', placeholder = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || placeholder;
    editor.focus();
    editor.setRangeText(before + selected + after, start, end, 'select');
    editor.setSelectionRange(start + before.length, start + before.length + selected.length);
    update();
  }

  function prefixLines(prefix) {
    const start = editor.value.lastIndexOf('\n', editor.selectionStart - 1) + 1;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end);
    const replacement = prefix + selected.replace(/\n(?!$)/g, `\n${prefix}`);
    editor.focus();
    editor.setRangeText(replacement, start, end, 'end');
    update();
  }

  const formats = {
    heading: () => prefixLines('# '),
    bold: () => insert('**', '**', 'bold text'),
    italic: () => insert('*', '*', 'italic text'),
    link: () => insert('[', '](https://example.com)', 'link text'),
    code: () => insert('`', '`', 'code'),
    list: () => prefixLines('- '),
  };

  editor.addEventListener('input', update);
  editor.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const format = { b: 'bold', i: 'italic', k: 'link' }[event.key.toLowerCase()];
      if (format) {
        event.preventDefault();
        formats[format]();
      }
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        update();
      }
    }
  });
  for (const button of formatButtons) {
    button.addEventListener('click', () => formats[button.dataset.format]());
  }
  for (const button of viewButtons) {
    button.addEventListener('click', () => setView(button.dataset.view));
  }
  document.getElementById('download').addEventListener('click', () => {
    const heading = editor.value.match(/^#\s+(.+)$/m)?.[1] || 'untitled';
    const name = heading.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').replace(/[. ]+$/g, '').trim().slice(0, 100) || 'untitled';
    const url = URL.createObjectURL(new Blob([editor.value], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name}.md`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // Changes from another tab are applied without writing them back.
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    editor.value = event.newValue ?? '';
    clearTimeout(renderTimer);
    render();
    updateCounts();
  });

  setView(matchMedia('(max-width: 640px)').matches ? 'edit' : 'split');
  updateCounts();
  render();
})();
