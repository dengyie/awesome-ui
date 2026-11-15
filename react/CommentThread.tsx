import React, { useMemo, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface CommentItem {
  id: string | number;
  /** Parent comment id; omit or null for a root comment. */
  parentId?: string | number | null;
  author: string;
  /** Image URL; falls back to initials. */
  avatar?: string;
  text: string;
  time?: string;
  likes?: number;
  resolved?: boolean;
}

export interface CommentThreadProps {
  comments?: CommentItem[];
  placeholder?: string;
  submitText?: string;
  /** Show the top-level composer. */
  allowComment?: boolean;
  onSubmit?: (text: string, parentId: string | number | null) => void;
  onLike?: (comment: CommentItem) => void;
  onResolve?: (comment: CommentItem) => void;
  emptyText?: string;
  className?: string;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/** Flat comments + parentId → depth-tagged render order (parents before children). */
export const flattenComments = (comments: CommentItem[]) => {
  const children = new Map<string, CommentItem[]>();
  const roots: CommentItem[] = [];

  comments.forEach((comment) => {
    if (comment.parentId == null) {
      roots.push(comment);
      return;
    }
    const key = String(comment.parentId);
    children.set(key, [...(children.get(key) || []), comment]);
  });

  const out: Array<{ comment: CommentItem; depth: number }> = [];
  const walk = (list: CommentItem[], depth: number) => {
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

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments = [],
  placeholder = "Write a comment...",
  submitText = "Comment",
  allowComment = true,
  onSubmit,
  onLike,
  onResolve,
  emptyText = "No comments yet. Start the conversation.",
  className = "",
}) => {
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const rows = useMemo(() => flattenComments(comments), [comments]);

  const submitRoot = () => {
    const text = draft.trim();
    if (!text) return;
    onSubmit?.(text, null);
    setDraft("");
  };

  const submitReply = (parentId: string | number) => {
    const text = replyDraft.trim();
    if (!text) return;
    onSubmit?.(text, parentId);
    setReplyDraft("");
    setReplyTo(null);
  };

  return (
    <div className={className}>
      {comments.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-zinc-400">{emptyText}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(({ comment, depth }) => {
            const replying = replyTo === comment.id;
            return (
              <li
                key={comment.id}
                className={depth > 0 ? "border-l border-zinc-200 pl-3 dark:border-zinc-700" : ""}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 ${
                      depth > 0 ? "h-5 w-5" : "h-6 w-6"
                    }`}
                  >
                    {comment.avatar ? (
                      <img src={comment.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(comment.author)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{comment.author}</span>
                      {comment.time && <span className="text-[10px] text-zinc-400">{comment.time}</span>}
                      {comment.resolved && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <UiIcon name="check" size={9} />
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {comment.text}
                    </p>

                    <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-400">
                      <button
                        type="button"
                        onClick={() => onLike?.(comment)}
                        aria-label={`Like comment by ${comment.author}`}
                        className="inline-flex items-center gap-1 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <UiIcon name="thumbs-up" size={11} />
                        <span className="tabular-nums">{comment.likes || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(replying ? null : comment.id);
                          setReplyDraft("");
                        }}
                        aria-expanded={replying}
                        className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolve?.(comment)}
                        className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        {comment.resolved ? "Reopen" : "Resolve"}
                      </button>
                    </div>

                    {replying && (
                      <div className="mt-2 flex items-end gap-1.5">
                        <textarea
                          value={replyDraft}
                          onChange={(e) => setReplyDraft(e.target.value)}
                          rows={2}
                          placeholder={`Reply to ${comment.author}...`}
                          aria-label={`Reply to ${comment.author}`}
                          className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() => submitReply(comment.id)}
                          disabled={!replyDraft.trim()}
                          className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {allowComment && (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
          />
          <div className="mt-1.5 flex justify-end">
            <button
              type="button"
              onClick={submitRoot}
              disabled={!draft.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentThread;
