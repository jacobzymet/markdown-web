/* global markdownit, markdownitTaskLists */
(() => {
  'use strict';
  globalThis.MarkdownWeb = {
    createParser() {
      const parser = markdownit('commonmark', { html: true })
        .enable(['table', 'strikethrough'])
        .use(markdownitTaskLists);
      // Preserve table alignment without allowing arbitrary inline CSS in previews.
      for (const rule of ['th_open', 'td_open']) {
        parser.renderer.rules[rule] = (tokens, index, options, env, renderer) => {
          const token = tokens[index];
          const alignment = token.attrGet('style')?.match(/^text-align:(left|center|right)$/)?.[1];
          if (alignment) token.attrJoin('class', `align-${alignment}`);
          if (token.attrs) token.attrs = token.attrs.filter(([name]) => name !== 'style');
          return renderer.renderToken(tokens, index, options);
        };
      }
      return parser;
    },
  };
})();
