import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--token-gray-900)] text-[var(--token-white)] hover:bg-[var(--token-gray-700)] dark:bg-[var(--token-white)] dark:text-[var(--token-gray-900)] dark:hover:bg-[var(--token-gray-200)] shadow-sm",
  secondary:
    "bg-[var(--token-gray-100)] text-[var(--token-gray-700)] hover:bg-[var(--token-gray-200)] dark:bg-[var(--token-white-8)] dark:text-[var(--token-gray-300)] dark:hover:bg-[var(--token-white-12)]",
  outline:
    "border border-[var(--token-gray-200)] bg-transparent text-[var(--token-gray-700)] hover:bg-[var(--token-gray-50)] dark:border-[var(--color-border-dark-soft)] dark:text-[var(--token-gray-300)] dark:hover:bg-[var(--token-white-5)]",
  ghost:
    "bg-transparent text-[var(--token-gray-600)] hover:bg-[var(--token-gray-100)] dark:text-[var(--token-gray-400)] dark:hover:bg-[var(--token-white-8)]",
  destructive:
    "bg-error-500 text-[var(--token-white)] hover:bg-error-600 shadow-sm",
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  type = "button",
  className,
  disabled = false,
  loading = false,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--token-gray-900)/20 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-(--token-white)/20",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {loading ? (
        <svg
          className="animate-spin shrink-0"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="7"
            cy="7"
            r="5.5"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          <path
            d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        startIcon && (
          <span className="shrink-0 flex items-center" aria-hidden="true">
            {startIcon}
          </span>
        )
      )}
      <span>{children}</span>
      {!loading && endIcon && (
        <span className="shrink-0 flex items-center" aria-hidden="true">
          {endIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
