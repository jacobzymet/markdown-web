// Run with: node --test tests/markdown.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
for (const file of ['vendor/markdown-it.min.js', 'vendor/task-lists.min.js', 'markdown.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const parser = context.MarkdownWeb.createParser();
const fixtures = require('./commonmark-0.31.2.json');
// Compare semantic equivalents: CommonMark permits HTML or XHTML void tags.
const normalize = html => html.replace(/<(hr|br|img)(\b[^>]*?)\s*\/>/g, '<$1$2>').replace(/<blockquote>\n<\/blockquote>/g, '<blockquote></blockquote>');
for (const fixture of fixtures) {
  test(`CommonMark ${fixture.number}: ${fixture.section}`, () => {
    assert.equal(normalize(parser.render(fixture.markdown)), normalize(fixture.html));
  });
}
test('tables, strikethrough, and nested task lists', () => {
  const html = parser.render('| A | B |\n| :---: | ---: |\n| x | y |\n\n~~removed~~\n\n- [ ] Todo\n  - [x] Done\n');
  assert.match(html, /<table>/);
  assert.match(html, /class="align-center"/);
  assert.match(html, /class="align-right"/);
  assert.doesNotMatch(html, /style=/);
  assert.match(html, /<s>removed<\/s>/);
  assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
  assert.match(html, /checked=""/);
  assert.equal((html.match(/disabled=""/g) || []).length, 2);
});
