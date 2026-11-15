import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const initials = (name) =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/** Flat comments + parentId → depth-tagged render order (parents before children). */
const flattenComments = (comments) => {
  const children = new Map();
  const roots = [];
  comments.forEach((comment) => {
    if (comment.parentId == null) {
      roots.push(comment);
      return;
    }
    const key = String(comment.parentId);
    children.set(key, [...(children.get(key) || []), comment]);
  });
  const out = [];
  const walk = (list, depth) => {
    list.forEach((comment) => {
      out.push({ comment, depth });
      const replies = children.get(String(comment.id)) || [];
      if (depth < 2) walk(replies, depth + 1);
      else replies.forEach((child) => out.push({ comment: child, depth: depth + 1 }));
    });
  };
  walk(roots, 0);
  return out;
};

/**
 * CommentThread - Vanilla Web Component
 * Usage: <comment-thread></comment-thread>
 * Properties: comments (CommentItem[], flat list linked by parentId)
 * Events: submit (detail: {text, parentId}), like (detail: comment), resolve (detail: comment)
 */
export class CommentThreadElement extends HTMLElement {
  static get observedAttributes() {
    return ['placeholder', 'submit-text', 'allow-comment', 'empty-text'];
  }

  constructor() {
    super();
    this._comments = [];
    this._draft = '';
    this._replyTo = null;
    this._replyDraft = '';
  }

  get comments() {
    return this._comments;
  }

  set comments(value) {
    this._comments = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  _submit(text, parentId) {
    const value = String(text || '').trim();
    if (!value) return;
    this.dispatchEvent(new CustomEvent('submit', { detail: { text: value, parentId } }));
    if (parentId == null) this._draft = '';
    else {
      this._replyDraft = '';
      this._replyTo = null;
    }
  }

  render() {
    this._applyHostClass('block');

    const placeholder = this.getAttribute('placeholder') || 'Write a comment...';
    const submitText = this.getAttribute('submit-text') || 'Comment';
    const emptyText = this.getAttribute('empty-text') || 'No comments yet. Start the conversation.';
    const allowComment = this.getAttribute('allow-comment') !== 'false';
    const rows = flattenComments(this._comments);

    const list = rows.length
      ? `<ul class="space-y-2.5">
          ${rows
            .map(({ comment, depth }) => {
              const replying = this._replyTo != null && String(this._replyTo) === String(comment.id);
              const avatar = comment.avatar
                ? `<img src="${escapeAttribute(comment.avatar)}" alt="" class="h-full w-full object-cover" />`
                : escapeAttribute(initials(comment.author));
              return `<li class="${depth > 0 ? 'border-l border-zinc-200 pl-3 dark:border-zinc-700' : ''}" data-comment="${escapeAttribute(comment.id)}">
                <div class="flex items-start gap-2">
                  <span class="flex ${depth > 0 ? 'h-5 w-5' : 'h-6 w-6'} shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">${avatar}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span class="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(comment.author)}</span>
                      ${comment.time ? `<span class="text-[10px] text-zinc-400">${escapeAttribute(comment.time)}</span>` : ''}
                      ${
                        comment.resolved
                          ? `<span class="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">${uiIcon('check', { size: 9 })}Resolved</span>`
                          : ''
                      }
                    </div>
                    <p class="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">${escapeAttribute(comment.text)}</p>
                    <div class="mt-1 flex items-center gap-3 text-[10px] text-zinc-400">
                      <button type="button" class="comment-like inline-flex items-center gap-1 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Like comment by ${escapeAttribute(comment.author)}">${uiIcon('thumbs-up', { size: 11 })}<span class="tabular-nums">${comment.likes || 0}</span></button>
                      <button type="button" class="comment-reply transition-colors hover:text-indigo-600 dark:hover:text-indigo-400" aria-expanded="${replying}">Reply</button>
                      <button type="button" class="comment-resolve transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">${comment.resolved ? 'Reopen' : 'Resolve'}</button>
                    </div>
                    ${
                      replying
                        ? `<div class="mt-2 flex items-end gap-1.5">
                            <textarea class="comment-reply-input flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200" rows="2" placeholder="Reply to ${escapeAttribute(comment.author)}..." aria-label="Reply to ${escapeAttribute(comment.author)}">${escapeAttribute(this._replyDraft)}</textarea>
                            <button type="button" class="comment-reply-send rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50" ${this._replyDraft.trim() ? '' : 'disabled'}>Reply</button>
                          </div>`
                        : ''
                    }
                  </div>
                </div>
              </li>`;
            })
            .join('')}
        </ul>`
      : `<p class="py-4 text-center text-[11px] text-zinc-400">${escapeAttribute(emptyText)}</p>`;

    const composer = allowComment
      ? `<div class="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <textarea class="comment-input w-full resize-none rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200" rows="2" placeholder="${escapeAttribute(placeholder)}" aria-label="${escapeAttribute(placeholder)}">${escapeAttribute(this._draft)}</textarea>
          <div class="mt-1.5 flex justify-end">
            <button type="button" class="comment-send rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50" ${this._draft.trim() ? '' : 'disabled'}>${escapeAttribute(submitText)}</button>
          </div>
        </div>`
      : '';

    this.innerHTML = list + composer;

    this.querySelectorAll('[data-comment]').forEach((node) => {
      const id = node.getAttribute('data-comment');
      const comment = this._comments.find((entry) => String(entry.id) === String(id));
      if (!comment) return;

      node.querySelector('.comment-like').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('like', { detail: comment }));
      });

      node.querySelector('.comment-reply').addEventListener('click', () => {
        this._replyTo = this._replyTo != null && String(this._replyTo) === String(id) ? null : comment.id;
        this._replyDraft = '';
        this.render();
      });

      node.querySelector('.comment-resolve').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('resolve', { detail: comment }));
      });

      const replyInput = node.querySelector('.comment-reply-input');
      if (replyInput) {
        replyInput.focus();
        replyInput.addEventListener('input', (event) => {
          this._replyDraft = event.target.value;
          node.querySelector('.comment-reply-send').disabled = !this._replyDraft.trim();
        });
        node.querySelector('.comment-reply-send').addEventListener('click', () => {
          this._submit(this._replyDraft, comment.id);
          this.render();
        });
      }
    });

    const input = this.querySelector('.comment-input');
    if (input) {
      input.addEventListener('input', (event) => {
        this._draft = event.target.value;
        this.querySelector('.comment-send').disabled = !this._draft.trim();
      });
      this.querySelector('.comment-send').addEventListener('click', () => {
        this._submit(this._draft, null);
        this.render();
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('comment-thread')) {
  customElements.define('comment-thread', CommentThreadElement);
}
export default CommentThreadElement;
