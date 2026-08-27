import React, { useEffect, useRef, useState } from "react";
import { ArrowDown } from "./UiIcon";

export interface AutoScrollAnchorProps {
  isStreaming?: boolean;
  className?: string;
}

export const AutoScrollAnchor: React.FC<AutoScrollAnchorProps> = ({
  isStreaming = false,
  className = "",
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

      // Within 80px is considered at bottom
      setIsAtBottom(distanceFromBottom < 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto follow scroll during streaming only if user is already at bottom
  useEffect(() => {
    if (isStreaming && isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isStreaming, isAtBottom]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div ref={bottomRef} className={`h-px w-full pointer-events-none ${className}`} />

      {/* Floating "Back to Bottom" Button */}
      {!isAtBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-30 p-2.5 rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-medium"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
          {isStreaming && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          )}
        </button>
      )}
    </>
  );
};
