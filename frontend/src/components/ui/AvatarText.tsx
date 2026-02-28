import React from "react";
import { cn } from "@/lib/utils";

type AvatarTextSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarTextProps = {
  name: string;
  size?: AvatarTextSize;
  className?: string;
};

const sizeMap: Record<AvatarTextSize, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-14 text-lg",
};

const colorPalette = [
  "bg-violet-100  text-violet-700  dark:bg-violet-500/20  dark:text-violet-300",
  "bg-sky-100     text-sky-700     dark:bg-sky-500/20     dark:text-sky-300",
  "bg-rose-100    text-rose-700    dark:bg-rose-500/20    dark:text-rose-300",
  "bg-amber-100   text-amber-700   dark:bg-amber-500/20   dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-pink-100    text-pink-700    dark:bg-pink-500/20    dark:text-pink-300",
  "bg-cyan-100    text-cyan-700    dark:bg-cyan-500/20    dark:text-cyan-300",
  "bg-orange-100  text-orange-700  dark:bg-orange-500/20  dark:text-orange-300",
];

function getColorClass(name: string): string {
  const index = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorPalette[index % colorPalette.length];
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

const AvatarText: React.FC<AvatarTextProps> = ({
  name,
  size = "md",
  className,
}) => {
  return (
    <div
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none",
        sizeMap[size],
        getColorClass(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

export default AvatarText;