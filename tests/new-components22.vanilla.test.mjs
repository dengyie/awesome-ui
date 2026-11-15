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

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(/^import uiIcon from ['"]\.\/UiIcon\.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const segmentSource = stripComponent('SegmentBreakdownBars.js', 'SegmentBreakdownBarsElement');
const gaugeSource = stripComponent('TargetGauge.js', 'TargetGaugeElement');
const donutSource = stripComponent('HealthDonutStats.js', 'HealthDonutStatsElement');
const forecastSource = stripComponent('ForecastTrendChart.js', 'ForecastTrendChartElement');
const groupedSource = stripComponent('GroupedBarCompare.js', 'GroupedBarCompareElement');

function mount(source, exportName, tag, attrs = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    'FormData',
    `${uiIconSource}\n${source}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.FormData);
  const el = window.document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail ?? event));
  return seen;
};

test('SegmentBreakdownBars — bars, deltas and footer', () => {
  const { el } = mount(segmentSource, 'SegmentBreakdownBarsElement', 'segment-breakdown', {
    headline: '23.19',
    caption: 'Conversion rate of all sessions',
  });
  el.items = [
    { label: 'Men 16-24', value: 26.64, delta: 3.45, tone: 'indigo' },
    { label: 'Women 25-40', value: 21.69, delta: -1.49, tone: 'emerald' },
    { label: 'Men 25-40', value: 18.02, tone: 'amber' },
  ];

  assert.equal(el.querySelectorAll('[data-segment-index]').length, 3, 'three rows');
  assert.ok(el.textContent.includes('23.19'), 'headline');
  assert.ok(el.textContent.includes('Conversion rate of all sessions'), 'caption');
  assert.ok(el.innerHTML.includes('width:100%'), 'max bar full width');
  assert.ok(el.innerHTML.includes('bg-indigo-500'), 'indigo tone');
  assert.ok(el.innerHTML.includes('bg-amber-400'), 'amber tone');
  assert.ok(el.textContent.includes('+3.45pp'), 'positive delta');
  assert.ok(el.textContent.includes('-1.49pp'), 'negative delta');
  assert.ok(el.textContent.includes('across 3 segments'), 'footer');
});

test('SegmentBreakdownBars — unit attribute and re-render', () => {
  const { el } = mount(segmentSource, 'SegmentBreakdownBarsElement', 'segment-breakdown', { unit: 'k' });
  el.items = [
    { label: 'Enterprise', value: 420 },
    { label: 'Team', value: 180, unit: 'K' },
  ];
  assert.ok(el.textContent.includes('420k'), 'unit appended');
  assert.ok(el.textContent.includes('180K'), 'item unit overrides');
  el.items = [{ label: 'Solo', value: 90 }];
  assert.equal(el.querySelectorAll('[data-segment-index]').length, 1, 're-rendered');
});

test('TargetGauge — zones, needle, remaining and value setter', () => {
  const { el } = mount(gaugeSource, 'TargetGaugeElement', 'target-gauge', {
    value: '600',
    target: '700',
    label: 'Quarterly revenue',
    'value-prefix': '$',
    'value-suffix': 'k',
    'remaining-label': 'Left before quota',
  });

  assert.ok(el.textContent.includes('Quarterly revenue'), 'label');
  assert.ok(el.textContent.includes('$600k'), 'value chip');
  assert.ok(el.textContent.includes('$700k'), 'target');
  assert.ok(el.innerHTML.includes('bg-emerald-500'), 'emerald zone');
  assert.ok(el.innerHTML.includes('bg-amber-400'), 'amber zone');
  assert.ok(el.innerHTML.includes('bg-rose-500'), 'rose zone');
  assert.ok(el.querySelector('[data-gauge-needle]'), 'needle');
  assert.ok(el.querySelector('[data-gauge-needle]').style.transform.includes('rotate'), 'needle rotated');
  assert.ok(el.textContent.includes('Remaining: $100k'), 'remaining line');
  assert.ok(el.textContent.includes('86%'), 'percent helper');

  el.value = 700;
  assert.equal(el.getAttribute('value'), '700', 'value setter syncs attribute');
  assert.ok(el.textContent.includes('700'), 're-rendered with new value');
  assert.ok(!el.textContent.includes('Remaining: $'), 'no remaining at target');
});

test('TargetGauge — custom zones property', () => {
  const { el } = mount(gaugeSource, 'TargetGaugeElement', 'target-gauge', { value: '20', target: '100' });
  el.zones = [
    { from: 0, tone: 'rose' },
    { from: 40, tone: 'amber' },
    { from: 70, tone: 'emerald' },
  ];
  assert.ok(el.querySelector('[data-gauge-value]'), 'value chip');
  assert.ok(el.textContent.includes('20'), 'value rendered');
});

test('HealthDonutStats — cards, gradients, legend and action event', () => {
  const { el } = mount(donutSource, 'HealthDonutStatsElement', 'health-donut-stats');
  const clicks = collect(el, 'action-click');
  let propertyClicks = 0;
  el.onActionClick = () => propertyClicks++;
  el.cards = [
    {
      title: 'Job change freshness',
      caption: '18 credits spent from Feb 01',
      slices: [
        { label: 'Up to date', value: 74, tone: 'indigo' },
        { label: 'Need enrichment', value: 9, tone: 'amber' },
        { label: 'Unknown', value: 17, tone: 'zinc' },
      ],
      action: { label: 'View contacts' },
    },
    {
      title: 'Email coverage',
      slices: [
        { label: 'Business email', value: 62, tone: 'emerald' },
        { label: 'Missing', value: 38, tone: 'rose' },
      ],
    },
  ];

  assert.equal(el.querySelectorAll('[data-donut-card]').length, 2, 'two cards');
  assert.ok(el.textContent.includes('Job change freshness'), 'title');
  assert.ok(el.textContent.includes('18 credits spent from Feb 01'), 'caption');
  assert.ok(el.innerHTML.includes('conic-gradient'), 'gradient');
  assert.ok(el.textContent.includes('74%'), 'legend share');
  assert.ok(el.textContent.includes('View contacts'), 'action label');

  el.querySelector('[data-donut-action]').click();
  assert.equal(clicks.length, 1, 'action-click fired');
  assert.equal(clicks[0].index, 0, 'index detail');
  assert.equal(clicks[0].label, 'View contacts', 'label detail');
  assert.equal(propertyClicks, 1, 'onActionClick called');
});

test('HealthDonutStats — empty state', () => {
  const { el } = mount(donutSource, 'HealthDonutStatsElement', 'health-donut-stats');
  el.cards = [];
  assert.equal(el.innerHTML, '', 'empty markup');
});

test('ForecastTrendChart — actual vs forecast and delta', () => {
  const { el } = mount(forecastSource, 'ForecastTrendChartElement', 'forecast-trend', {
    headline: '48.2k',
    unit: 'views',
    'delta-label': '+108% vs prior period',
    note: 'Current uniques are trending upwards.',
  });
  el.points = [
    { label: 'Mon', value: 30 },
    { label: 'Tue', value: 42 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 51, forecast: true },
    { label: 'Fri', value: 60, forecast: true },
  ];

  assert.equal(el.querySelectorAll('[data-point-index]').length, 5, 'five columns');
  assert.ok(el.textContent.includes('48.2k'), 'headline');
  assert.ok(el.textContent.includes('views'), 'unit');
  assert.ok(el.textContent.includes('+108% vs prior period'), 'delta');
  assert.ok(el.textContent.includes('Current uniques are trending upwards.'), 'note');
  assert.ok(el.innerHTML.includes('bg-sky-500'), 'actual bar');
  assert.ok(el.innerHTML.includes('border-dashed'), 'forecast dashed');
  assert.ok(el.innerHTML.includes('(forecast)'), 'forecast title attr');
  assert.ok(el.textContent.includes('Actual'), 'legend');
  assert.ok(el.textContent.includes('Forecast'), 'legend');
});

test('ForecastTrendChart — rose delta tone', () => {
  const { el } = mount(forecastSource, 'ForecastTrendChartElement', 'forecast-trend', {
    headline: '1.2k',
    'delta-label': '-24% week over week',
    'delta-tone': 'rose',
  });
  el.points = [{ label: 'Mon', value: 10 }];
  assert.ok(el.innerHTML.includes('text-rose-600'), 'rose tone');
  assert.ok(el.innerHTML.includes('trending-down') || el.innerHTML.includes('d="m3 7 6 6 4-4 8 8"'), 'down icon');
});

test('GroupedBarCompare — pairs, legend and value labels', () => {
  const { el } = mount(groupedSource, 'GroupedBarCompareElement', 'grouped-bar-compare', {
    title: 'Estimated vs actual time',
  });
  el.rows = [
    { name: 'Alex', estimated: 3.75, actual: 1.6 },
    { name: 'Sam', estimated: 2.5, actual: 2.9 },
    { name: 'Riley', estimated: 1.25, actual: 1.1, unit: 'h' },
  ];

  assert.equal(el.querySelectorAll('[data-bar-row]').length, 3, 'three rows');
  assert.ok(el.textContent.includes('Estimated vs actual time'), 'title');
  assert.ok(el.textContent.includes('3.75h'), 'estimated label');
  assert.ok(el.textContent.includes('1.6h'), 'actual label');
  assert.ok(el.innerHTML.includes('bg-violet-400'), 'estimated tone');
  assert.ok(el.innerHTML.includes('bg-lime-400'), 'actual tone');
  assert.ok(el.textContent.includes('Alex'), 'name');
  assert.ok(el.textContent.includes('Estimated'), 'legend estimated');
  assert.ok(el.textContent.includes('Actual'), 'legend actual');
});

test('GroupedBarCompare — custom legend and unit attribute', () => {
  const { el } = mount(groupedSource, 'GroupedBarCompareElement', 'grouped-bar-compare', {
    'legend-estimated': 'Planned QPS',
    'legend-actual': 'Measured QPS',
    unit: 'rps',
  });
  el.rows = [{ name: 'gateway', estimated: 120, actual: 95 }];
  assert.ok(el.textContent.includes('Planned QPS'), 'custom legend');
  assert.ok(el.textContent.includes('Measured QPS'), 'custom legend 2');
  assert.ok(el.textContent.includes('120rps'), 'unit attribute');
});
