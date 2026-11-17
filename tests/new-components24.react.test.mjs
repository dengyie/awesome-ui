/**
 * SSR smoke tests for the v1.24.0 batch
 * (OtpInput, SearchTypeahead, TourTooltip, CookieConsent, SettingsSideDrawer).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const cacheDir = join(here, 'node_modules', '.cache-components');
mkdirSync(cacheDir, { recursive: true });

const transpile = (file) => {
  const source = readFileSync(join(root, 'react', file), 'utf8');
  return ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    })
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"')
    .replace(/import\s*{\s*([^}]*)\s*}\s*from\s*["']\.\/UiIcon\.mjs["'];/g, (match) =>
      match.replace(/type\s+/g, '')
    );
};

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n24.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — OtpInput cells, error state and actions', async () => {
  const { default: OtpInput } = await load('OtpInput.tsx');
  const html = renderToStaticMarkup(
    h(OtpInput, {
      value: '12',
      heading: 'Check your email for a code',
      subtext: "We've sent a code to samlee@content-mobbin.com",
      status: 'error',
      errorText: 'Code is invalid',
      resendHint: "Can't find your code? Check your spam folder!",
    })
  );
  assert.ok((html.match(/data-otp-cell=/g) || []).length === 6, 'six cells');
  assert.ok(html.includes('value="1"'), 'first digit filled');
  assert.ok(html.includes('value="2"'), 'second digit filled');
  assert.ok(html.includes('border-rose-400'), 'error cell tone');
  assert.ok(html.includes('Code is invalid'), 'error text');
  assert.ok(html.includes('Check your email for a code'), 'heading');
  assert.ok(html.includes('samlee@content-mobbin.com'), 'subtext');
  assert.ok(html.includes('Continue'), 'continue label');
  assert.ok(html.includes('Resend code'), 'resend link');
  assert.ok(html.includes('aria-label="Digit 3"'), 'cell aria labels');
});

test('React SSR — SearchTypeahead highlight, badges and results', async () => {
  const { default: SearchTypeahead } = await load('SearchTypeahead.tsx');
  const html = renderToStaticMarkup(
    h(SearchTypeahead, {
      query: 'web development',
      highlight: 'web development',
      suggestions: [
        { label: 'Web Development Domain', type: 'Course' },
        { label: 'game development', type: 'Article' },
      ],
      results: [{ title: 'Web Development for Beginners', badge: 'Doc' }],
      footerHint: 'Not sure where to begin? Take our quiz →',
    })
  );
  assert.ok(html.includes('value="web development"'), 'query value');
  assert.ok(html.includes('<mark'), 'match highlighted');
  assert.ok(html.includes('>Web Development</mark> Domain'), 'suggestion with highlight');
  assert.ok(html.includes('Course'), 'type badge');
  assert.ok(html.includes('Top results'), 'results heading');
  assert.ok(html.includes('Web Development</mark> for Beginners'), 'result title with highlight');
  assert.ok(html.includes('Doc'), 'result badge');
  assert.ok(html.includes('Not sure where to begin'), 'footer hint');
  assert.ok(html.includes('Help Center'), 'help link');
  assert.ok(html.includes('data-typeahead-clear'), 'clear button');
});

test('React SSR — TourTooltip steps, feedback and dark theme', async () => {
  const { default: TourTooltip } = await load('TourTooltip.tsx');
  const html = renderToStaticMarkup(
    h(TourTooltip, {
      step: 2,
      totalSteps: 4,
      title: 'Navigate to Fixed Rate Contract Creation',
      body: 'Click on the People tab in the main navigation menu',
      feedback: true,
    })
  );
  assert.ok(html.includes('Step 2 of 4'), 'step counter');
  assert.ok(html.includes('Navigate to Fixed Rate Contract Creation'), 'title');
  assert.ok(html.includes('Click on the People tab'), 'body');
  assert.ok(html.includes('Was this helpful?'), 'feedback prompt');
  assert.ok(html.includes('data-tour-feedback-up'), 'thumbs up');
  assert.ok(html.includes('Previous'), 'prev button (step > 1)');
  assert.ok(html.includes('data-tour-next'), 'next button');
  assert.ok(html.includes('>Next<'), 'next label');
  assert.ok(html.includes('bg-white'), 'light surface');
});

test('React SSR — TourTooltip last step shows Finish tour and dark surface', async () => {
  const { default: TourTooltip } = await load('TourTooltip.tsx');
  const html = renderToStaticMarkup(
    h(TourTooltip, { step: 2, totalSteps: 2, title: 'Share updates', body: 'Post your daily summary.', theme: 'dark' })
  );
  assert.ok(html.includes('Finish tour'), 'finish label');
  assert.ok(html.includes('bg-zinc-900'), 'dark surface');
  assert.ok(html.includes('2/2'), 'compact counter');
  assert.ok(html.includes('Previous'), 'prev button');
});

test('React SSR — CookieConsent categories, always active and actions', async () => {
  const { default: CookieConsent } = await load('CookieConsent.tsx');
  const html = renderToStaticMarkup(
    h(CookieConsent, {
      categories: [
        { id: 'necessary', label: 'Necessary', alwaysActive: true, description: 'Core site functionality.' },
        { id: 'analytics', label: 'Analytics', description: 'Helps us improve.', cookies: ['_ga', '_gid'] },
        { id: 'marketing', label: 'Targeted Advertising' },
      ],
    })
  );
  assert.ok(html.includes('Necessary'), 'category');
  assert.ok(html.includes('Always Active'), 'always active label');
  assert.ok(html.includes('_ga, _gid'), 'cookie list');
  assert.ok(html.includes('Accept All'), 'accept');
  assert.ok(html.includes('Reject All'), 'reject');
  assert.ok(html.includes('Confirm'), 'save');
  assert.ok(html.includes('Privacy Policy'), 'policy link');
  assert.ok(html.includes('<details'), 'collapsible rows');
  assert.ok(html.includes('data-consent-toggle'), 'toggle glyph');
});

test('React SSR — SettingsSideDrawer tabs, rows and footer', async () => {
  const { default: SettingsSideDrawer } = await load('SettingsSideDrawer.tsx');
  const html = renderToStaticMarkup(
    h(SettingsSideDrawer, {
      isOpen: true,
      title: 'Settings',
      tabs: [
        { id: 'general', label: 'Settings' },
        { id: 'requirements', label: 'Study requirements' },
      ],
      activeTab: 'general',
      sections: [
        {
          title: 'Quick actions',
          rows: [
            { label: 'Move', description: 'Move this maze to a different project.', control: 'button', buttonLabel: 'Move', buttonTone: 'indigo' },
            { label: 'Delete', description: 'Permanently deletes this maze.', control: 'button', buttonLabel: 'Delete', buttonTone: 'danger' },
          ],
        },
        {
          title: 'Password protection',
          rows: [{ label: 'Require password', control: 'toggle', enabled: true }],
        },
        {
          title: 'Integrations',
          rows: [{ label: 'Sampling rate', control: 'select', value: '100%', options: ['50%', '100%'] }],
        },
      ],
      footerPrimary: 'Deploy',
      footerSecondary: 'Cancel',
    })
  );
  assert.ok(html.includes('aria-selected="true"'), 'active tab');
  assert.ok(html.includes('Study requirements'), 'tab label');
  assert.ok(html.includes('Quick actions'), 'section title');
  assert.ok(html.includes('Move this maze to a different project.'), 'row description');
  assert.ok(html.includes('bg-rose'), 'danger button tone');
  assert.ok(html.includes('role="switch"'), 'toggle switch');
  assert.ok(html.includes('aria-checked="true"'), 'toggle on');
  assert.ok(html.includes('Deploy'), 'footer primary');
  assert.ok(html.includes('Cancel'), 'footer secondary');
  assert.ok(html.includes('data-drawer-overlay'), 'overlay layer');
  assert.ok(html.includes('right-0'), 'right-anchored');
});
