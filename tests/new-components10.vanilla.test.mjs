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
    .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const dropzoneSource = stripComponent('FileDropzone.js', 'FileDropzoneElement');
const notificationsSource = stripComponent('NotificationCenter.js', 'NotificationCenterElement');
const commentsSource = stripComponent('CommentThread.js', 'CommentThreadElement');
const datePickerSource = stripComponent('DatePicker.js', 'DatePickerElement');

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

const makeFile = (window, name, { type = '', bytes = 3 } = {}) =>
  new window.File([new Uint8Array(bytes)], name, { type });

/** Feed files through the hidden input, the same path a real browse click takes. */
const chooseFiles = (window, el, files) => {
  const input = el.querySelector('.dropzone-input');
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
};

const dropFiles = (window, el, files) => {
  const zone = el.querySelector('.dropzone');
  const event = new window.Event('drop', { bubbles: true, cancelable: true });
  event.dataTransfer = { files };
  zone.dispatchEvent(event);
};

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail));
  return seen;
};

test('FileDropzone — renders hints and file rows with formatted sizes', () => {
  const { el, window } = mount(dropzoneSource, 'FileDropzoneElement', 'file-dropzone', {
    accept: 'image/*,.pdf',
    'max-size-mb': '5',
  });

  assert.ok(el.innerHTML.includes('Drag &amp; drop files here'), 'plural copy');
  assert.ok(el.innerHTML.includes('Accepts image/*,.pdf'), 'accept hint');
  assert.ok(el.innerHTML.includes('up to 5 MB'), 'size hint');
  assert.equal(el.querySelector('[role="alert"]'), null, 'no error initially');

  el.files = [
    { name: 'photo.png', size: 2048 * 1024, type: 'image/png' },
    { name: 'notes.pdf', size: 512, type: 'application/pdf' },
  ];
  assert.ok(el.innerHTML.includes('photo.png'), 'row 1');
  assert.ok(el.innerHTML.includes('2.0 MB'), 'megabyte formatting');
  assert.ok(el.innerHTML.includes('512 B'), 'byte formatting');
  assert.equal(el.querySelectorAll('.file-remove').length, 2, 'one remove button per file');
});

test('FileDropzone — accepts matching files and emits them', () => {
  const { el, window } = mount(dropzoneSource, 'FileDropzoneElement', 'file-dropzone', {
    accept: '.pdf',
    multiple: '',
  });
  const files = collect(el, 'files');
  const rejects = collect(el, 'reject');

  chooseFiles(window, el, [makeFile(window, 'report.pdf', { type: 'application/pdf' })]);

  assert.equal(files.length, 1, 'files event fired');
  assert.equal(files[0].length, 1, 'one accepted file');
  assert.equal(files[0][0].name, 'report.pdf', 'file passed through');
  assert.equal(rejects.length, 0, 'nothing rejected');
  assert.equal(el.querySelector('[role="alert"]'), null, 'no error line');
});

test('FileDropzone — rejects wrong types with an alert and no files event', () => {
  const { el, window } = mount(dropzoneSource, 'FileDropzoneElement', 'file-dropzone', { accept: '.pdf' });
  const files = collect(el, 'files');
  const rejects = collect(el, 'reject');

  chooseFiles(window, el, [makeFile(window, 'notes.txt', { type: 'text/plain' })]);

  assert.equal(files.length, 0, 'no files event');
  assert.equal(rejects.length, 1, 'reject event fired');
  assert.deepEqual(rejects[0], [{ name: 'notes.txt', reason: 'type' }], 'reason is type');
  const alert = el.querySelector('[role="alert"]');
  assert.ok(alert, 'alert rendered');
  assert.ok(alert.textContent.includes('not an accepted file type'), 'alert copy');
});

test('FileDropzone — rejects oversized files', () => {
  const { el, window } = mount(dropzoneSource, 'FileDropzoneElement', 'file-dropzone', {
    'max-size-mb': '1',
  });
  const rejects = collect(el, 'reject');

  chooseFiles(window, el, [makeFile(window, 'huge.bin', { bytes: 2 * 1024 * 1024 })]);

  assert.equal(rejects.length, 1, 'reject event fired');
  assert.equal(rejects[0][0].reason, 'size', 'reason is size');
  assert.ok(el.querySelector('[role="alert"]').textContent.includes('larger than 1 MB'), 'size copy');
});

test('FileDropzone — drop path works and single mode keeps one file', () => {
  const { el, window } = mount(dropzoneSource, 'FileDropzoneElement', 'file-dropzone', {
    multiple: 'false',
  });
  const files = collect(el, 'files');

  dropFiles(window, el, [makeFile(window, 'a.txt'), makeFile(window, 'b.txt')]);

  assert.equal(files.length, 1, 'files event fired');
  assert.equal(files[0].length, 1, 'single mode truncates to one file');
  assert.equal(files[0][0].name, 'a.txt', 'first file wins');
});

test('FileDropzone — remove button reports the file and index', () => {
  const { el } = mount(dropzoneSource, 'FileDropzoneElement', 'file-dropzone');
  el.files = [
    { name: 'a.txt', size: 1 },
    { name: 'b.txt', size: 2 },
  ];
  const removed = collect(el, 'remove');

  el.querySelectorAll('.file-remove')[1].click();

  assert.equal(removed.length, 1, 'remove event fired');
  assert.equal(removed[0].index, 1, 'index reported');
  assert.equal(removed[0].file.name, 'b.txt', 'file reported');
});

test('FileDropzone — disabled zone ignores drops', () => {
  const { el, window } = mount(dropzoneSource, 'FileDropzoneElement', 'file-dropzone', { disabled: '' });
  const files = collect(el, 'files');

  assert.equal(el.querySelector('.dropzone').getAttribute('tabindex'), '-1', 'not focusable');
  dropFiles(window, el, [makeFile(window, 'a.txt')]);
  assert.equal(files.length, 0, 'no files event while disabled');
});

test('NotificationCenter — closed renders nothing, open renders items', () => {
  const closed = mount(notificationsSource, 'NotificationCenterElement', 'notification-center');
  assert.equal(closed.el.innerHTML.trim(), '', 'closed center is empty');

  const { el } = mount(notificationsSource, 'NotificationCenterElement', 'notification-center', { open: '' });
  el.notifications = [
    { id: 1, title: 'Deploy finished', description: 'v1.10.0 is live', time: '2m ago', type: 'success', unread: true },
    { id: 2, title: 'New comment', unread: true },
    { id: 3, title: 'Weekly report', type: 'info' },
  ];

  assert.ok(el.innerHTML.includes('Notifications'), 'default title');
  assert.ok(el.innerHTML.includes('2 new'), 'unread badge');
  assert.ok(el.innerHTML.includes('Deploy finished'), 'item title');
  assert.ok(el.innerHTML.includes('v1.10.0 is live'), 'item description');
  assert.ok(el.innerHTML.includes('bg-emerald-50'), 'success tone');
  assert.equal(el.querySelectorAll('.notif-item').length, 3, 'all items listed');
});

test('NotificationCenter — unread filter narrows the list', () => {
  const { el } = mount(notificationsSource, 'NotificationCenterElement', 'notification-center', { open: '' });
  el.notifications = [
    { id: 1, title: 'Unread one', unread: true },
    { id: 2, title: 'Read one' },
  ];

  el.querySelector('.notif-filter[data-filter="unread"]').click();

  assert.equal(el.querySelectorAll('.notif-item').length, 1, 'only unread items');
  assert.ok(el.innerHTML.includes('Unread one'), 'unread item kept');
  assert.equal(el.innerHTML.includes('Read one'), false, 'read item filtered out');
  assert.equal(
    el.querySelector('.notif-filter[data-filter="unread"]').getAttribute('aria-pressed'),
    'true',
    'filter marked active'
  );
});

test('NotificationCenter — empty state when nothing matches', () => {
  const { el } = mount(notificationsSource, 'NotificationCenterElement', 'notification-center', {
    open: '',
    'empty-text': 'Nothing here',
  });
  el.notifications = [{ id: 1, title: 'Read one' }];

  el.querySelector('.notif-filter[data-filter="unread"]').click();

  assert.ok(el.innerHTML.includes('Nothing here'), 'custom empty copy');
  assert.equal(el.querySelectorAll('.notif-item').length, 0, 'no rows');
});

test('NotificationCenter — selecting an unread item marks it read and selects it', () => {
  const { el } = mount(notificationsSource, 'NotificationCenterElement', 'notification-center', { open: '' });
  el.notifications = [
    { id: 7, title: 'Unread', unread: true },
    { id: 8, title: 'Read' },
  ];
  const marked = collect(el, 'mark-read');
  const selected = collect(el, 'select');

  el.querySelector('.notif-item[data-id="7"]').click();
  assert.equal(marked.length, 1, 'mark-read fired');
  assert.deepEqual(marked[0], [7], 'unread id reported');
  assert.equal(selected[0].id, 7, 'select detail is the item');

  el.querySelector('.notif-item[data-id="8"]').click();
  assert.equal(marked.length, 1, 'read item does not re-mark');
  assert.equal(selected.length, 2, 'read item still selects');
});

test('NotificationCenter — mark all read and close emit their events', () => {
  const { el } = mount(notificationsSource, 'NotificationCenterElement', 'notification-center', { open: '' });
  el.notifications = [{ id: 1, title: 'A', unread: true }];
  const all = collect(el, 'mark-all-read');
  const closed = collect(el, 'close');

  el.querySelector('.notif-mark-all').click();
  assert.equal(all.length, 1, 'mark-all-read fired');

  el.querySelector('.notif-close').click();
  assert.equal(closed.length, 1, 'close fired');
});

test('NotificationCenter — mark all is disabled with no unread items', () => {
  const { el } = mount(notificationsSource, 'NotificationCenterElement', 'notification-center', { open: '' });
  el.notifications = [{ id: 1, title: 'A' }];
  const all = collect(el, 'mark-all-read');

  const button = el.querySelector('.notif-mark-all');
  assert.equal(button.disabled, true, 'disabled without unread');
  button.click();
  assert.equal(all.length, 0, 'no event while disabled');
});

test('CommentThread — nests replies by parentId and marks resolved', () => {
  const { el } = mount(commentsSource, 'CommentThreadElement', 'comment-thread');
  el.comments = [
    { id: 1, author: 'Ada Lovelace', text: 'Root comment', likes: 3 },
    { id: 2, parentId: 1, author: 'Grace Hopper', text: 'Nested reply' },
    { id: 3, parentId: 2, author: 'Alan Turing', text: 'Deeper reply' },
    { id: 4, author: 'Katherine Johnson', text: 'Second root', resolved: true },
  ];

  const rows = [...el.querySelectorAll('[data-comment]')];
  assert.deepEqual(
    rows.map((row) => row.getAttribute('data-comment')),
    ['1', '2', '3', '4'],
    'parents render before their children'
  );
  assert.equal(rows[0].className.includes('border-l'), false, 'root has no indent');
  assert.ok(rows[1].className.includes('border-l'), 'child indented');
  assert.ok(rows[2].className.includes('border-l'), 'grandchild indented');
  assert.ok(el.innerHTML.includes('Resolved'), 'resolved chip');
  assert.ok(el.innerHTML.includes('Reopen'), 'resolved row offers reopen');
  assert.ok(el.innerHTML.includes('AL'), 'initials avatar');
  assert.ok(el.innerHTML.includes('>3<'), 'like count');
});

test('CommentThread — empty state and composer', () => {
  const { el } = mount(commentsSource, 'CommentThreadElement', 'comment-thread', {
    placeholder: 'Say something',
    'submit-text': 'Post',
  });

  assert.ok(el.innerHTML.includes('No comments yet'), 'empty copy');
  assert.equal(el.querySelector('.comment-input').getAttribute('placeholder'), 'Say something', 'placeholder');
  assert.equal(el.querySelector('.comment-send').textContent.trim(), 'Post', 'custom submit label');
  assert.equal(el.querySelector('.comment-send').disabled, true, 'submit disabled while empty');
});

test('CommentThread — root composer submits with a null parentId', () => {
  const { el, window } = mount(commentsSource, 'CommentThreadElement', 'comment-thread');
  const submitted = collect(el, 'submit');
  const input = el.querySelector('.comment-input');

  input.value = '  Hello there  ';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(el.querySelector('.comment-send').disabled, false, 'enabled once text exists');

  el.querySelector('.comment-send').click();

  assert.equal(submitted.length, 1, 'submit fired');
  assert.deepEqual(submitted[0], { text: 'Hello there', parentId: null }, 'trimmed text, root parent');
  assert.equal(el.querySelector('.comment-input').value, '', 'draft cleared');
});

test('CommentThread — reply flow submits with the parent comment id', () => {
  const { el, window } = mount(commentsSource, 'CommentThreadElement', 'comment-thread');
  el.comments = [{ id: 42, author: 'Ada Lovelace', text: 'Root' }];
  const submitted = collect(el, 'submit');

  el.querySelector('.comment-reply').click();
  const replyInput = el.querySelector('.comment-reply-input');
  assert.ok(replyInput, 'reply box opened');
  assert.equal(el.querySelector('.comment-reply').getAttribute('aria-expanded'), 'true', 'expanded state');

  replyInput.value = 'Replying now';
  replyInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  el.querySelector('.comment-reply-send').click();

  assert.equal(submitted.length, 1, 'submit fired');
  assert.deepEqual(submitted[0], { text: 'Replying now', parentId: 42 }, 'parent id attached');
  assert.equal(el.querySelector('.comment-reply-input'), null, 'reply box closed after submit');
});

test('CommentThread — like and resolve report the comment', () => {
  const { el } = mount(commentsSource, 'CommentThreadElement', 'comment-thread');
  el.comments = [{ id: 5, author: 'Ada Lovelace', text: 'Root', likes: 1 }];
  const liked = collect(el, 'like');
  const resolved = collect(el, 'resolve');

  el.querySelector('.comment-like').click();
  assert.equal(liked.length, 1, 'like fired');
  assert.equal(liked[0].id, 5, 'liked comment');

  el.querySelector('.comment-resolve').click();
  assert.equal(resolved.length, 1, 'resolve fired');
  assert.equal(resolved[0].id, 5, 'resolved comment');
});

test('CommentThread — allow-comment=false hides the composer', () => {
  const { el } = mount(commentsSource, 'CommentThreadElement', 'comment-thread', { 'allow-comment': 'false' });
  el.comments = [{ id: 1, author: 'Ada', text: 'Root' }];

  assert.equal(el.querySelector('.comment-input'), null, 'no composer');
  assert.ok(el.querySelector('.comment-reply'), 'per-comment actions still available');
});

test('DatePicker — renders the month grid for the selected value', () => {
  const { el } = mount(datePickerSource, 'DatePickerElement', 'date-picker', { value: '2026-11-14' });

  assert.ok(el.innerHTML.includes('November 2026'), 'month header');
  const selected = el.querySelector('.date-day[aria-pressed="true"]');
  assert.equal(selected.getAttribute('data-date'), '2026-11-14', 'selected day');
  assert.equal(el.querySelectorAll('.date-day').length, 30, 'November has 30 days');
  assert.ok(el.innerHTML.includes('>Mo<'), 'week starts Monday');
});

test('DatePicker — prev/next shift the visible month', () => {
  const { el } = mount(datePickerSource, 'DatePickerElement', 'date-picker', { value: '2026-11-14' });

  el.querySelector('.date-next').click();
  assert.ok(el.innerHTML.includes('December 2026'), 'advanced one month');

  el.querySelector('.date-prev').click();
  el.querySelector('.date-prev').click();
  assert.ok(el.innerHTML.includes('October 2026'), 'went back two months');
});

test('DatePicker — min/max disable out-of-range days', () => {
  const { el } = mount(datePickerSource, 'DatePickerElement', 'date-picker', {
    value: '2026-11-14',
    min: '2026-11-10',
    max: '2026-11-20',
  });

  assert.equal(el.querySelector('.date-day[data-date="2026-11-09"]').disabled, true, 'before min');
  assert.equal(el.querySelector('.date-day[data-date="2026-11-10"]').disabled, false, 'min inclusive');
  assert.equal(el.querySelector('.date-day[data-date="2026-11-20"]').disabled, false, 'max inclusive');
  assert.equal(el.querySelector('.date-day[data-date="2026-11-21"]').disabled, true, 'after max');
});

test('DatePicker — clicking a day emits its ISO date', () => {
  const { el } = mount(datePickerSource, 'DatePickerElement', 'date-picker', { value: '2026-11-14' });
  const changes = collect(el, 'change');

  el.querySelector('.date-day[data-date="2026-11-03"]').click();

  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0], '2026-11-03', 'ISO detail');
});

test('DatePicker — disabled days do not emit', () => {
  const { el } = mount(datePickerSource, 'DatePickerElement', 'date-picker', {
    value: '2026-11-14',
    min: '2026-11-10',
  });
  const changes = collect(el, 'change');

  el.querySelector('.date-day[data-date="2026-11-02"]').click();

  assert.equal(changes.length, 0, 'blocked day is inert');
});

test('DatePicker — Today emits the current date and can be hidden', () => {
  const { el } = mount(datePickerSource, 'DatePickerElement', 'date-picker', { value: '2026-11-14' });
  const changes = collect(el, 'change');

  el.querySelector('.date-today').click();
  assert.equal(changes.length, 1, 'change fired');
  assert.match(changes[0], /^\d{4}-\d{2}-\d{2}$/, 'ISO shape');

  const hidden = mount(datePickerSource, 'DatePickerElement', 'date-picker', {
    value: '2026-11-14',
    'show-today': 'false',
  });
  assert.equal(hidden.el.querySelector('.date-today'), null, 'today row hidden');
});

test('DatePicker — week-starts-on=0 leads with Sunday', () => {
  const { el } = mount(datePickerSource, 'DatePickerElement', 'date-picker', {
    value: '2026-11-14',
    'week-starts-on': '0',
  });

  const headers = [...el.querySelectorAll('.grid > span')].slice(0, 7).map((node) => node.textContent.trim());
  assert.deepEqual(headers, ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], 'sunday-first header row');
});
