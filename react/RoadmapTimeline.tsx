import React from "react";
import { Check, ChevronRight, Lock } from "lucide-react";

export interface RoadmapNode {
  id: string | number;
  index: string;
  title: string;
  subtitle?: string;
  stageColor?: string;
  status: "completed" | "active" | "locked";
  tags?: string[];
}

export interface RoadmapTimelineProps {
  nodes: RoadmapNode[];
  activeId?: string | number;
  onNodeClick?: (node: RoadmapNode) => void;
  className?: string;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  nodes,
  activeId,
  onNodeClick,
  className = "",
}) => {
  return (
    <div className={`w-full max-w-4xl mx-auto py-8 font-sans ${className}`}>
      <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-2">
        {/* 桌面端横向贯穿轨线 */}
        <div className="hidden md:block absolute top-6 left-[4%] right-[4%] h-[2px] bg-[#b3ac97] dark:bg-[#3e444e] -z-0" />
        
        {/* 移动端竖向贯穿轨线 */}
        <div className="md:hidden absolute top-4 bottom-4 left-6 w-[2px] bg-[#b3ac97] dark:bg-[#3e444e] -z-0" />

        {nodes.map((node) => {
          const isCurrentActive = activeId === node.id || node.status === "active";
          const isDone = node.status === "completed";
          const nodeColor = node.stageColor || "#c2410c";

          return (
            <div
              key={node.id}
              onClick={() => onNodeClick?.(node)}
              className={`relative z-10 flex md:flex-col items-center md:items-start gap-4 md:gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group flex-1 ${
                isCurrentActive
                  ? "bg-[#faf8f1] dark:bg-[#1b1f26] shadow-sm border border-[#b3ac97]/60 dark:border-[#3e444e]"
                  : "hover:bg-[#faf8f1]/50 dark:hover:bg-[#1b1f26]/50"
              }`}
            >
              {/* 菱形地标节点 (Diamond Pin) */}
              <div
                style={{
                  borderColor: isCurrentActive || isDone ? nodeColor : undefined,
                  backgroundColor: isDone ? nodeColor : isCurrentActive ? "#faf8f1" : undefined,
                }}
                className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rotate-45 border-2 rounded-xs transition-transform duration-200 group-hover:scale-105 ${
                  isDone
                    ? "text-white"
                    : isCurrentActive
                    ? "border-2 shadow-xs"
                    : "border-[#b3ac97] dark:border-[#3e444e] bg-[#f1efe7] dark:bg-[#14171c] text-[#8d9298] dark:text-[#6f7268]"
                }`}
              >
                <div className="-rotate-45 font-mono text-xs font-bold flex items-center justify-center">
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : node.status === "locked" ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span style={{ color: isCurrentActive ? nodeColor : undefined }}>
                      {node.index}
                    </span>
                  )}
                </div>
              </div>

              {/* 文本区域 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-xs tracking-wider uppercase font-semibold"
                    style={{ color: nodeColor }}
                  >
                    STEP {node.index}
                  </span>
                  {node.tags && node.tags.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs border border-[#d6d2c2] dark:border-[#2b3038] text-[#545b64] dark:text-[#a9a89c]">
                      {node.tags[0]}
                    </span>
                  )}
                </div>

                <h4
                  className={`mt-1 font-serif text-sm md:text-base font-bold truncate leading-tight ${
                    isCurrentActive
                      ? "text-[#22262d] dark:text-[#e9e6db]"
                      : "text-[#22262d]/80 dark:text-[#e9e6db]/80 group-hover:text-[#22262d] dark:group-hover:text-[#e9e6db]"
                  }`}
                >
                  {node.title}
                </h4>

                {node.subtitle && (
                  <p className="mt-0.5 text-xs text-[#545b64] dark:text-[#a9a89c] truncate">
                    {node.subtitle}
                  </p>
                )}
              </div>

              {/* 移动端向右箭头 */}
              <div className="md:hidden ml-auto text-[#8d9298]">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
