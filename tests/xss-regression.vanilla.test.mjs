/**
 * XSS regression tests — vanilla Web Components
 * jsdom-level malicious-payload coverage for the P0 security hardening batch:
 * escapeAttribute injection fixes, isSafeHref protocol whitelist, safeCssColor,
 * and the StreamMarkdown lightweight sanitizer.
 *
 * Components that read JSON attributes receive payloads via setAttribute;
 * escape output is asserted in its HTML-entity form (raw payload must never
 * appear as markup, but `onerror=` as escaped text is the CORRECT behavior).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// uiIcon stub: components only need it to return an SVG-ish string.
const UI_ICON_STUB = "const uiIcon = (name, opts = {}) => `<svg data-icon='${name}'></svg>`;";

/** Assert a tag-attribute handler never appears in live markup (as part of a tag). */
const assertNoTagHandler = (html, handler) => {
  // matches onerror= when it sits inside a tag body: preceded by whitespace and
  // followed by a quote — the escaped-text form is &lt;img src=x onerror=...
  assert.doesNotMatch(html, new RegExp(`<[^>]*\\s${handler}\\s*=`, 'i'), `tag-level ${handler} must not appear`);
};

/**
 * Load a vanilla component source into a fresh jsdom window and return a
 * connected element. ESM import lines are stripped (the only import across
 * these files is ./UiIcon.js, substituted with a stub), then the body is
 * evaluated with the bare globals jsdom's window.eval cannot resolve injected
 * via new Function. opts.marked injects a window.marked stub (StreamMarkdown).
 */
function mount(file, className, attrs = {}, props = {}, opts = {}) {
  const raw = readFileSync(join(root, file), 'utf8');
  const source = raw
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export default \w+;\s*$/m, '')
    .replace(/^export\s+(class|const|function)\s+/gm, '$1 ');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  if (opts.marked) {
    window.marked = { parse: (c, o) => marked.parse(c, o), Renderer: marked.Renderer };
  }
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'Event',
    'window',
    UI_ICON_STUB + '\n' + source + `\nreturn ${className};`
  );
  const Klass = factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.Event,
    window
  );
  const el = new Klass();
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const [k, v] of Object.entries(props)) el[k] = v;
  window.document.body.appendChild(el);
  return { el, window };
}

test('KnowledgeDrawer: themeColor style injection is whitelisted to fallback', () => {
  const { el } = mount('vanilla/KnowledgeDrawer.js', 'KnowledgeDrawerElement', {}, {
    data: {
      isOpen: true,
      title: 'Safe',
      themeColor: 'red; background-image:url(xxx); x="',
    },
  });
  const html = el.innerHTML;
  assert.ok(!html.includes('background-image'), 'style attr must not gain new properties');
  assert.ok(html.includes('#c2410c'), 'falls back to default color');
});

test('KnowledgeDrawer: title/subtitle/label injection is escaped', () => {
  const { el } = mount('vanilla/KnowledgeDrawer.js', 'KnowledgeDrawerElement', {}, {
    data: {
      isOpen: true,
      title: '<img src=x onerror=alert(1)>',
      subtitle: '</p><script>alert(2)</script>',
      actionLabel: '" onmouseover="alert(3)',
      dependencies: [{ type: 'dependency', label: '<svg onload=alert(4)>' }],
    },
  });
  const html = el.innerHTML;
  assertNoTagHandler(html, 'onerror');
  assertNoTagHandler(html, 'onmouseover');
  assertNoTagHandler(html, 'onload');
  assert.ok(!html.includes('<img '), 'raw img tag must not appear');
  assert.ok(!html.includes('<script'), 'raw script tag must not appear');
  // uiIcon stub itself renders <svg data-icon> — assert the payload form, not any svg
  assert.ok(!html.includes('<svg onload'), 'raw svg payload must not appear');
  assert.ok(html.includes('&lt;svg'), 'svg payload entity-escaped');
  assert.ok(html.includes('&lt;img'), 'payload is entity-escaped');
});

test('ToolCallBadge: args/output/error/name attribute injection is escaped', () => {
  const { el } = mount('vanilla/ToolCallBadge.js', 'ToolCallBadge', {
    name: '<script>alert(1)</script>',
    args: '" onmouseover="alert(2)',
    output: '<img src=x onerror=alert(3)>',
    error: '</pre><script>alert(4)</script>',
  });
  const html = el.innerHTML;
  assertNoTagHandler(html, 'onerror');
  assertNoTagHandler(html, 'onmouseover');
  assert.ok(!html.includes('<script'), 'raw script tag must not appear');
  assert.ok(html.includes('&lt;img'), 'output payload entity-escaped');
});

test('ToolCallBadge: empty args attribute renders no drawer pre via escape-to-empty', () => {
  const { el } = mount('vanilla/ToolCallBadge.js', 'ToolCallBadge', { name: 't' });
  // args null -> escapeAttribute -> "" -> falsy branch keeps drawer pre absent
  assert.ok(!el.innerHTML.includes('Arguments:'));
});

test('SourcesCitation: javascript: URL is refused (no href rendered)', () => {
  const { el } = mount('vanilla/SourcesCitation.js', 'SourcesCitation', {
    sources: JSON.stringify([{ url: 'javascript:alert(1)', domain: 'evil', title: 't', snippet: 's' }]),
  });
  const anchor = el.querySelector('a');
  if (anchor) assert.equal(anchor.getAttribute('href'), null, 'no href on unsafe URL');
  assert.ok(!el.innerHTML.includes('javascript:'));
});

test('SourcesCitation: https URL survives, label injection escaped', () => {
  const { el } = mount('vanilla/SourcesCitation.js', 'SourcesCitation', {
    sources: JSON.stringify([
      { url: 'https://ok.example.com/a', domain: '<b>d</b>', title: '<i>t</i>', snippet: 'fine' },
    ]),
  });
  const anchor = el.querySelector('a[href]');
  assert.ok(anchor, 'safe https URL renders anchor');
  assert.match(anchor.getAttribute('href'), /^https:\/\/ok\.example\.com/);
  assert.ok(!el.innerHTML.includes('<b>'), 'domain escaped');
  assert.ok(!el.innerHTML.includes('<i>'), 'title escaped');
});

test('Breadcrumb: javascript: href falls back to button (no anchor)', () => {
  const { el } = mount('vanilla/Breadcrumb.js', 'BreadcrumbElement', {}, {
    items: [{ label: 'Evil', href: 'javascript:alert(1)' }, { label: 'End' }],
  });
  assert.equal(el.querySelector('a[href="javascript:alert(1)"]'), null);
  assert.ok(!el.innerHTML.includes('javascript:'));
});

test('Breadcrumb: safe https href renders anchor', () => {
  const { el } = mount('vanilla/Breadcrumb.js', 'BreadcrumbElement', {}, {
    items: [{ label: 'Home', href: 'https://example.com' }, { label: 'End' }],
  });
  assert.ok(el.querySelector('a[href="https://example.com"]'));
});

test('AuthSplitPanel: javascript: footer link degrades to span', () => {
  const { el } = mount('vanilla/AuthSplitPanel.js', 'AuthSplitPanelElement', {}, {
    footerLinks: [{ label: 'Docs', href: 'javascript:alert(1)' }],
  });
  assert.equal(el.querySelector('a'), null, 'no anchor at all for unsafe link');
  assert.ok(el.innerHTML.includes('Docs'));
});

test('DocsPageLayout: card javascript: href degrades to aria-disabled anchor', () => {
  const { el } = mount('vanilla/DocsPageLayout.js', 'DocsPageLayoutElement', {
    blocks: JSON.stringify([
      { type: 'cards', cards: [{ title: 'C', description: 'd', href: 'javascript:alert(1)' }] },
    ]),
  });
  const card = el.querySelector('[data-docspage-card]');
  assert.ok(card, 'card anchor shell still renders');
  assert.equal(card.getAttribute('href'), null);
  assert.equal(card.getAttribute('aria-disabled'), 'true');
  assert.ok(!el.innerHTML.includes('javascript:'));
});

test('DocsPageLayout: card https href passes through', () => {
  const { el } = mount('vanilla/DocsPageLayout.js', 'DocsPageLayoutElement', {
    blocks: JSON.stringify([
      { type: 'cards', cards: [{ title: 'C', description: 'd', href: 'https://ok.example.com' }] },
    ]),
  });
  const card = el.querySelector('[data-docspage-card]');
  assert.equal(card.getAttribute('href'), 'https://ok.example.com');
});

test('Navbar & SiteFooter: javascript: href degrades to #', () => {
  for (const [file, cls] of [
    ['vanilla/Navbar.js', 'NavbarElement'],
    ['vanilla/SiteFooter.js', 'SiteFooterElement'],
  ]) {
    const { el } = mount(file, cls, {}, {
      links: [{ label: 'X', href: 'javascript:alert(1)' }],
      columns: [{ heading: 'H', links: [{ label: 'Y', href: 'javascript:alert(1)' }] }],
    });
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    assert.ok(hrefs.length > 0, `${file} renders links`);
    for (const h of hrefs) assert.notEqual(h, 'javascript:alert(1)', `${file} href must not pass through`);
  }
});

test('StreamMarkdown sanitizer: script/iframe stripped, on* handlers removed, unsafe URLs neutralized', () => {
  const { el } = mount('vanilla/StreamMarkdown.js', 'StreamMarkdown', {
    content: [
      '# Title',
      '',
      '<script>alert(1)</script>',
      '<iframe src="javascript:alert(2)"></iframe>',
      '<img src=x onerror="alert(3)">',
      '<a href="javascript:alert(4)">bad</a>',
      '<a href="data:text/html,<h1>x">data</a>',
      'good prose with online=1 text',
    ].join('\n'),
  }, {}, { marked: true });
  const html = el.innerHTML;
  for (const bad of ['<script', '<iframe', 'javascript:', 'data:text/html']) {
    assert.ok(!html.includes(bad), `must not contain ${bad}`);
  }
  assertNoTagHandler(html, 'onerror');
  assert.ok(html.includes('<h1>Title</h1>') || html.includes('Title'), 'markdown still renders');
  assert.ok(html.includes('online=1'), 'prose text with on-word survives');
});

test('StreamMarkdown sanitizer: image data: URI and normal links survive', () => {
  const { el } = mount('vanilla/StreamMarkdown.js', 'StreamMarkdown', {
    content: '<img src="data:image/png;base64,AAAA">\n\n[a](https://example.com)',
  }, {}, { marked: true });
  const html = el.innerHTML;
  assert.ok(html.includes('data:image/png'), 'image data URI kept');
  assert.ok(html.includes('https://example.com'), 'normal link kept');
});

test('ArtifactCanvas: title attribute injection is escaped', () => {
  const { el } = mount('vanilla/ArtifactCanvas.js', 'ArtifactCanvas', {
    'is-open': '',
    title: '<img src=x onerror=alert(1)>',
    code: '<p>hi</p>',
    language: 'html',
  });
  const html = el.innerHTML;
  assert.ok(!html.includes('<img src=x'), 'raw payload must not appear in header');
  assert.ok(html.includes('&lt;img'), 'payload entity-escaped');
});

test('ArtifactCanvas: srcdoc actually receives the sandboxed document (P1 fix)', () => {
  const { el } = mount('vanilla/ArtifactCanvas.js', 'ArtifactCanvas', {
    'is-open': '',
    title: 'T',
    code: '<h1>artifact</h1>',
    language: 'html',
  });
  const frame = el.querySelector('#preview-frame');
  assert.ok(frame, 'iframe exists');
  assert.ok(
    (frame.srcdoc || '').includes('<h1>artifact</h1>'),
    'srcdoc carries the user code'
  );
});

test('PromptChips & StatusIndicator: label injection escaped', () => {
  const { el: chips } = mount('vanilla/PromptChips.js', 'PromptChips', {
    suggestions: JSON.stringify(['<img src=x onerror=alert(1)>']),
  });
  assert.ok(!chips.innerHTML.includes('<img src=x'), 'chips payload escaped');
  assert.ok(chips.innerHTML.includes('&lt;img'), 'chips payload entity-escaped');

  const { el: status } = mount('vanilla/StatusIndicator.js', 'StatusIndicator', {
    label: '" onmouseover="alert(2)',
  });
  assertNoTagHandler(status.innerHTML, 'onmouseover');
});

test('IterationActionBar: built-in action labels are static (no user injection surface)', () => {
  // ACTIONS is a module-level constant — labels are trusted, escaping is
  // defense-in-depth. Assert render works and contains no handler attrs.
  const { el: bar } = mount('vanilla/IterationActionBar.js', 'IterationActionBarElement', {
    'aria-label': '" onmouseover="alert(1)',
  });
  assertNoTagHandler(bar.innerHTML, 'onmouseover');
  assert.ok(bar.innerHTML.includes('data-iteration-action'));
});

test('AudioWaveVisualizer & RoadmapTimeline: color/class & text escaping', () => {
  const { el: wave } = mount('vanilla/AudioWaveVisualizer.js', 'AudioWaveVisualizer', {
    color: 'bg-amber-500" onclick="alert(1)',
  });
  assert.ok(!wave.innerHTML.includes('onclick='), 'wave color class sanitized');

  const { el: road } = mount('vanilla/RoadmapTimeline.js', 'RoadmapTimelineElement', {}, {
    stages: [{ title: '<svg onload=alert(2)>', stageColor: 'red; x="' }],
  });
  assert.ok(!road.innerHTML.includes('<svg '), 'roadmap title escaped');
  assert.ok(!road.innerHTML.includes('background-image'), 'roadmap color whitelisted');
});
