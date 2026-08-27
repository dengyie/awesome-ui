import React from "react";

// Icon geometry follows the Tabler Icons visual conventions (MIT licensed): https://github.com/tabler/tabler-icons

export type UiIconName =
  | "arrow-down" | "arrow-left" | "arrow-right" | "arrow-up" | "check"
  | "check-circle" | "chevron-down" | "chevron-left" | "chevron-right"
  | "circle-x" | "code" | "copy" | "eye" | "external-link" | "globe"
  | "git-branch" | "image" | "layers" | "lock" | "loader" | "moon"
  | "monitor" | "paperclip" | "refresh" | "sparkles" | "square" | "sun"
  | "thumbs-down" | "thumbs-up" | "tool" | "x";

const paths: Record<UiIconName, React.ReactNode> = {
  "arrow-down": <path d="m6 9 6 6 6-6" />, "arrow-left": <path d="m15 6-6 6 6 6" />,
  "arrow-right": <path d="m9 6 6 6-6 6" />, "arrow-up": <path d="m6 15 6-6 6 6" />,
  check: <path d="m5 12 4 4L19 6" />, "check-circle": <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  "chevron-down": <path d="m6 9 6 6 6-6" />, "chevron-left": <path d="m14 6-6 6 6 6" />, "chevron-right": <path d="m10 6 6 6-6 6" />,
  "circle-x": <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></>,
  code: <><path d="m8 9-3 3 3 3m8-6 3 3-3 3" /><path d="m14 5-4 14" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  "external-link": <><path d="M14 5h5v5M19 5l-8 8" /><path d="M19 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  "git-branch": <><path d="M6 3v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" /><circle cx="6" cy="3" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="12" cy="18" r="2" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-4-4L5 20" /></>,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5" />, lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  loader: <><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" /></>,
  moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z" />, monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
  paperclip: <path d="m20 11-7.5 7.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-7.5 7.5a2 2 0 0 1-3-3L14 7" />, refresh: <><path d="M20 11a8 8 0 0 0-14.5-4L3 10m0-5v5h5M4 13a8 8 0 0 0 14.5 4L21 14m0 5v-5h-5" /></>,
  sparkles: <><path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2L12 3Z" /><path d="m19 15-.6 2.4L16 18l2.4.6L19 21l.6-2.4L22 18l-2.4-.6L19 15Z" /></>,
  square: <rect x="6" y="6" width="12" height="12" rx="1" />, sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
  "thumbs-down": <path d="M7 10v10H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2Zm0 0 3-7a2 2 0 0 1 2 2v3h6a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2h-7l-3-3" />, "thumbs-up": <path d="M7 14V4a2 2 0 0 1 2-2h2l1 6h6a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H9l-2-3H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2" />,
  tool: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.7-.7-.7-2.7 2.2-2.2Z" /></>, x: <path d="m6 6 12 12M18 6 6 18" />
};

export interface UiIconProps extends React.SVGProps<SVGSVGElement> { name: UiIconName; size?: number | string; strokeWidth?: number; }
export const UiIcon = React.forwardRef<SVGSVGElement, UiIconProps>(({ name, size = 20, strokeWidth = 1.8, ...props }, ref) => (
  <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={props["aria-label"] ? undefined : true} {...props}>{paths[name]}</svg>
));
UiIcon.displayName = "UiIcon";

export const icon = (name: UiIconName) => (props: Omit<UiIconProps, "name">) => <UiIcon name={name} {...props} />;
export const ArrowDown = icon("arrow-down");
export const ArrowLeft = icon("arrow-left");
export const ArrowRight = icon("arrow-right");
export const ArrowUp = icon("arrow-up");
export const Check = icon("check");
export const CheckCircle2 = icon("check-circle");
export const ChevronDown = icon("chevron-down");
export const ChevronLeft = icon("chevron-left");
export const ChevronRight = icon("chevron-right");
export const CircleX = icon("circle-x");
export const Code2 = icon("code");
export const Copy = icon("copy");
export const Eye = icon("eye");
export const ExternalLink = icon("external-link");
export const Globe = icon("globe");
export const GitBranch = icon("git-branch");
export const ImageIcon = icon("image");
export const Layers = icon("layers");
export const Lock = icon("lock");
export const Loader2 = icon("loader");
export const Moon = icon("moon");
export const Monitor = icon("monitor");
export const Paperclip = icon("paperclip");
export const RotateCcw = icon("refresh");
export const Sparkles = icon("sparkles");
export const Square = icon("square");
export const Sun = icon("sun");
export const ThumbsDown = icon("thumbs-down");
export const ThumbsUp = icon("thumbs-up");
export const Wrench = icon("tool");
export const X = icon("x");
export const XCircle = icon("circle-x");
