import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "subtle" | "solid" | "outline";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gray";

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "h-5 px-1.5 text-[11px] gap-1",
  md: "h-6 px-2 text-xs gap-1.5",
};

const colorStyles: Record<BadgeColor, Record<BadgeVariant, string>> = {
  default: {
    subtle:  "bg-[var(--token-gray-100)] text-[var(--token-gray-700)] dark:bg-[var(--token-white-8)] dark:text-[var(--token-gray-300)]",
    solid:   "bg-[var(--token-gray-900)] text-[var(--token-white)] dark:bg-[var(--token-white)] dark:text-[var(--token-gray-900)]",
    outline: "border border-[var(--token-gray-300)] text-[var(--token-gray-700)] dark:border-[var(--color-border-dark-soft)] dark:text-[var(--token-gray-300)]",
  },
  primary: {
    subtle:  "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    solid:   "bg-brand-500 text-[var(--token-white)]",
    outline: "border border-brand-300 text-brand-700 dark:border-brand-500/40 dark:text-brand-300",
  },
  success: {
    subtle:  "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
    solid:   "bg-success-500 text-[var(--token-white)]",
    outline: "border border-success-300 text-success-700 dark:border-success-500/40 dark:text-success-400",
  },
  error: {
    subtle:  "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400",
    solid:   "bg-error-500 text-[var(--token-white)]",
    outline: "border border-error-300 text-error-700 dark:border-error-500/40 dark:text-error-400",
  },
  warning: {
    subtle:  "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
    solid:   "bg-warning-500 text-[var(--token-white)]",
    outline: "border border-warning-300 text-warning-700 dark:border-warning-500/40 dark:text-warning-400",
  },
  info: {
    subtle:  "bg-[var(--token-blue-light-50)] text-[var(--token-blue-light-700)] dark:bg-[var(--token-blue-light-500)]/15 dark:text-[var(--token-blue-light-400)]",
    solid:   "bg-[var(--token-blue-light-500)] text-[var(--token-white)]",
    outline: "border border-[var(--token-blue-light-300)] text-[var(--token-blue-light-700)] dark:border-[var(--token-blue-light-500)]/40 dark:text-[var(--token-blue-light-400)]",
  },
  gray: {
    subtle:  "bg-[var(--token-gray-100)] text-[var(--token-gray-600)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-gray-400)]",
    solid:   "bg-[var(--token-gray-500)] text-[var(--token-white)]",
    outline: "border border-[var(--token-gray-200)] text-[var(--token-gray-600)] dark:border-[var(--color-border-dark-soft)] dark:text-[var(--token-gray-400)]",
  },
};

const dotColorMap: Record<BadgeColor, string> = {
  default: "bg-[var(--token-gray-400)]",
  primary: "bg-brand-500",
  success: "bg-success-500",
  error:   "bg-error-500",
  warning: "bg-warning-500",
  info:    "bg-[var(--token-blue-light-500)]",
  gray:    "bg-[var(--token-gray-400)]",
};

const Badge: React.FC<BadgeProps> = ({
  variant = "subtle",
  color = "default",
  size = "md",
  startIcon,
  endIcon,
  dot = false,
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        sizeStyles[size],
        colorStyles[color][variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("shrink-0 rounded-full", size === "sm" ? "size-1" : "size-1.5", dotColorMap[color])}
          aria-hidden="true"
        />
      )}
      {!dot && startIcon && (
        <span className="shrink-0" aria-hidden="true">{startIcon}</span>
      )}
      {children}
      {endIcon && (
        <span className="shrink-0" aria-hidden="true">{endIcon}</span>
      )}
    </span>
  );
};

export default Badge;