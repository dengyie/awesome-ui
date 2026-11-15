import React from "react";
import { UiIcon } from "./UiIcon";

export type AvatarStatus = "online" | "away" | "offline";

export interface AvatarMember {
  id: string;
  name: string;
  src?: string;
  status?: AvatarStatus;
}

export interface AvatarGroupProps {
  members: AvatarMember[];
  /** How many avatars to show before collapsing into a +N chip. Defaults to 4. */
  max?: number;
  size?: "sm" | "md" | "lg";
  onMemberClick?: (member: AvatarMember) => void;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<AvatarGroupProps["size"]>, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

const DOT_CLASS: Record<AvatarStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  offline: "bg-zinc-400",
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  members,
  max = 4,
  size = "md",
  onMemberClick,
  className = "",
}) => {
  const visible = members.slice(0, Math.max(0, max));
  const overflow = members.length - visible.length;
  const sizeClass = SIZE_CLASS[size];

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {visible.map((member) => (
        <button
          key={member.id}
          type="button"
          title={member.name}
          aria-label={member.name}
          onClick={onMemberClick ? () => onMemberClick(member) : undefined}
          className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 font-semibold text-zinc-600 ring-2 ring-white transition-transform hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-900 ${sizeClass}`}
        >
          {member.src ? (
            <img src={member.src} alt="" className="h-full w-full object-cover" />
          ) : member.name.trim() ? (
            <span aria-hidden="true">{initials(member.name)}</span>
          ) : (
            <UiIcon name="user" size={size === "sm" ? 12 : size === "lg" ? 18 : 14} />
          )}
          {member.status && (
            <span
              aria-hidden="true"
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${DOT_CLASS[member.status]}`}
            />
          )}
        </button>
      ))}
      {overflow > 0 && (
        <span
          title={`${overflow} more`}
          className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-100 font-semibold tabular-nums text-zinc-500 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-900 ${sizeClass}`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
};

export default AvatarGroup;
