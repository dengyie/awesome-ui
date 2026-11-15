import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const uiIconSource = readFileSync(join(root, 'vanilla/UiIcon.js'), 'utf8')
  .replace(/^export default uiIcon;\s*$/m, '')
  .replace(/^export function uiIcon/m, 'function uiIcon');

const codeBlockSource = readFileSync(join(root, 'vanilla/CodeBlock.js'), 'utf8')
  .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
  .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
  .replace(/^export default CodeBlockElement;\s*$/m, '')
  .replace(/^export class CodeBlockElement/m, 'class CodeBlockElement');

const typingSource = readFileSync(join(root, 'vanilla/TypingIndicator.js'), 'utf8')
  .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
  .replace(/^export default TypingIndicatorElement;\s*$/m, '')
  .replace(/^export class TypingIndicatorElement/m, 'class TypingIndicatorElement');

function mountCodeBlock(attrs = {}, code = '') {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'Event',
    'setTimeout',
    `${uiIconSource}\n${codeBlockSource}\nreturn CodeBlockElement;`
  );
  factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.Event,
    window.setTimeout.bind(window)
  );

  const el = window.document.createElement('code-block');
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) el.setAttribute(k, String(v));
  }
  if (code) el.code = code;
  window.document.body.appendChild(el);
  return { dom, window, el };
}

const escapeAttrHelper =
  'const escapeAttribute = (value) => String(value).replace(/[&<>\'"]/g, (char) => ({ \'&\': \'&amp;\', \'<\': \'&lt;\', \'>\': \'&gt;\', "\'": \'&#39;\', \'"\': \'&quot;\' }[char]));';

function mountTyping(attrs = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    `${escapeAttrHelper}\n${typingSource}\nreturn TypingIndicatorElement;`
  );
  factory(window.customElements, window.HTMLElement);

  const el = window.document.createElement('typing-indicator');
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) el.setAttribute(k, String(v));
  }
  window.document.body.appendChild(el);
  return { dom, window, el };
}

test('CodeBlock — renders language badge, filename, and escaped code', () => {
  const { el } = mountCodeBlock(
    { language: 'javascript', filename: 'app.js' },
    'const x = "<script>alert(1)</script>";'
  );

  assert.ok(el.innerHTML.includes('javascript'), 'shows language badge');
  assert.ok(el.innerHTML.includes('app.js'), 'shows filename');
  assert.ok(!el.innerHTML.includes('<script>alert'), 'code is escaped (no XSS)');
  assert.ok(el.innerHTML.includes('&lt;script&gt;'), 'code renders as escaped entities');
  assert.ok(el.querySelector('.cb-copy-btn'), 'copy button exists');
});

test('CodeBlock — line numbers mode renders numbered rows', () => {
  const { el } = mountCodeBlock(
    { 'show-line-numbers': '', language: 'python' },
    'print("a")\nprint("b")\nprint("c")'
  );

  const html = el.innerHTML;
  assert.ok(html.includes('>1<'), 'first line number rendered');
  assert.ok(html.includes('>3<'), 'third line number rendered');
  assert.ok(html.includes('print("a")'), 'code content present after escaping round-trip');
});

test('TypingIndicator — renders 3 animated dots with staggered delays', () => {
  const { el } = mountTyping({ label: 'Thinking...' });

  assert.ok(el.innerHTML.includes('Thinking...'), 'shows label');
  assert.ok(el.innerHTML.includes('animate-bounce'), 'uses bounce animation');
  assert.ok(el.innerHTML.includes('animation-delay: 160ms'), 'staggered delay on second dot');
  assert.ok(el.innerHTML.includes('animation-delay: 320ms'), 'staggered delay on third dot');
  assert.equal(el.getAttribute('role'), 'status', 'has status role for a11y');
});

test('TypingIndicator — pulse variant and size prop apply', () => {
  const { el } = mountTyping({ variant: 'pulse', size: 'sm' });

  assert.ok(el.innerHTML.includes('animate-pulse'), 'pulse variant applied');
  assert.ok(el.innerHTML.includes('w-1.5'), 'small dot size applied');
  assert.ok(!el.innerHTML.includes('animate-bounce'), 'bounce animation not applied');
});
