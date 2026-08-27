import React from "react";
import { X, ExternalLink, GitBranch, ArrowRight, Layers } from "./UiIcon";

export interface KnowledgeDependency {
  type: "dependency" | "branch" | "parallel" | "convergent";
  label: string;
}

export interface KnowledgeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  index: string;
  title: string;
  subtitle?: string;
  themeColor?: string;
  conceptText?: string;
  dependencies?: KnowledgeDependency[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const KnowledgeDrawer: React.FC<KnowledgeDrawerProps> = ({
  isOpen,
  onClose,
  index,
  title,
  subtitle,
  themeColor = "#c2410c",
  conceptText,
  dependencies = [],
  actionLabel = "开始该阶段练习",
  onAction,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
      {/* 背景蒙层 */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 侧边滑出面板 */}
      <div
        style={{ borderLeftColor: themeColor }}
        className={`relative z-10 w-full max-w-md bg-[#faf8f1] dark:bg-[#1b1f26] h-full shadow-2xl border-l-4 flex flex-col transform transition-transform duration-300 ease-out ${className}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#d6d2c2] dark:border-[#2b3038] flex items-start justify-between gap-4 bg-[#f1efe7]/50 dark:bg-[#14171c]/50">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className="font-mono text-2xl font-black leading-none"
              style={{ color: themeColor }}
            >
              {index}
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold text-[#22262d] dark:text-[#e9e6db] leading-snug truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#545b64] dark:text-[#a9a89c] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-sm hover:bg-[#e7e4d7] dark:hover:bg-[#0f1216] text-[#545b64] dark:text-[#a9a89c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {conceptText && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#8d9298] dark:text-[#6f7268] uppercase mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>核心要点与认知</span>
              </div>
              <p className="text-sm leading-relaxed text-[#22262d] dark:text-[#e9e6db] bg-[#f1efe7]/60 dark:bg-[#14171c]/60 p-3.5 rounded-sm border border-[#d6d2c2]/80 dark:border-[#2b3038]">
                {conceptText}
              </p>
            </div>
          )}

          {dependencies.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#8d9298] dark:text-[#6f7268] uppercase mb-2">
                <GitBranch className="w-3.5 h-3.5" />
                <span>拓扑前置与分支关系</span>
              </div>
              <div className="space-y-2">
                {dependencies.map((dep, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs p-2 rounded border border-[#d6d2c2] dark:border-[#2b3038] bg-white/50 dark:bg-black/20"
                  >
                    <span
                      className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border tracking-wider"
                      style={{
                        borderColor:
                          dep.type === "dependency"
                            ? "#8d9298"
                            : dep.type === "branch"
                            ? "#1d4ed8"
                            : themeColor,
                        color:
                          dep.type === "dependency"
                            ? "#545b64"
                            : dep.type === "branch"
                            ? "#1d4ed8"
                            : themeColor,
                      }}
                    >
                      {dep.type}
                    </span>
                    <span className="text-[#545b64] dark:text-[#a9a89c] font-medium">
                      {dep.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-[#d6d2c2] dark:border-[#2b3038] bg-[#f1efe7]/30 dark:bg-[#14171c]/30">
          <button
            type="button"
            onClick={onAction}
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
            className="w-full py-2.5 px-4 text-white font-serif font-bold text-sm rounded-sm shadow-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
