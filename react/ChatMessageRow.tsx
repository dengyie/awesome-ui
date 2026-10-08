import React from "react";
import { UiIcon } from "./UiIcon";

export interface ChatMessageRowProps {
  role: "user" | "assistant" | "system";
  content?: string;
  name?: string;
  avatar?: string;
  timestamp?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ChatMessageRow: React.FC<ChatMessageRowProps> = ({
  role,
  content,
  name,
  avatar,
  timestamp,
  className = "",
  children,
}) => {
  if (role === "system") {
    return (
      <div className={`flex justify-center py-2 ${className}`}>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 rounded-full">
          {children ?? content}
        </span>
      </div>
    );
  }

  const isUser = role === "user";

  const avatarNode = avatar ? (
    <img
      src={avatar}
      alt={name || role}
      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
    />
  ) : (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser
          ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
      }`}
    >
      <UiIcon name={isUser ? "user" : "sparkles"} size={16} />
    </div>
  );

  return (
    <div className={`flex gap-3 py-3 ${isUser ? "flex-row-reverse" : ""} ${className}`}>
      {avatarNode}
      <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {(name || timestamp) && (
          <div className="flex items-center gap-2 mb-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            {name && <span className="font-medium">{name}</span>}
            {timestamp && <span className="font-mono">{timestamp}</span>}
          </div>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"
          }`}
        >
          {children ?? content}
        </div>
      </div>
    </div>
  );
};
export default ChatMessageRow;
