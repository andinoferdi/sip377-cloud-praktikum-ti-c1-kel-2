import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertProps = {
  variant: AlertVariant;
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
  onDismiss?: () => void;
  className?: string;
};

const variantConfig: Record<
  AlertVariant,
  { container: string; icon: string; dot: string }
> = {
  success: {
    container:
      "border-success-200 bg-success-50 dark:border-success-500/20 dark:bg-success-500/10",
    icon: "text-success-500",
    dot: "bg-success-500",
  },
  error: {
    container:
      "border-error-200 bg-error-50 dark:border-error-500/20 dark:bg-error-500/10",
    icon: "text-error-500",
    dot: "bg-error-500",
  },
  warning: {
    container:
      "border-warning-200 bg-warning-50 dark:border-warning-500/20 dark:bg-warning-500/10",
    icon: "text-warning-500",
    dot: "bg-warning-500",
  },
  info: {
    container:
      "border-[var(--token-blue-light-200)] bg-[var(--token-blue-light-50)] dark:border-[var(--token-blue-light-500)]/20 dark:bg-[var(--token-blue-light-500)]/10",
    icon: "text-[var(--token-blue-light-600)] dark:text-[var(--token-blue-light-400)]",
    dot: "bg-[var(--token-blue-light-500)]",
  },
};

const icons: Record<AlertVariant, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 4.5L6.5 11.5L2.5 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 5V8.5M8 11H8.01M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 6V9M8 11H8.01M6.86 2.573 1.215 12a1.333 1.333 0 0 0 1.14 2h11.29a1.333 1.333 0 0 0 1.14-2L9.14 2.573a1.333 1.333 0 0 0-2.28 0Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 7v4M8 5h.01M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
  onDismiss,
  className,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3.5 flex gap-3",
        config.container,
        className
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          config.icon
        )}
        aria-hidden="true"
      >
        {icons[variant]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--token-gray-900)] dark:text-[var(--token-white-90)] leading-snug">
          {title}
        </p>
        <p className="mt-0.5 text-sm text-[var(--token-gray-600)] dark:text-[var(--token-gray-400)] leading-relaxed">
          {message}
        </p>
        {showLink && (
          <Link
            href={linkHref}
            className="mt-2 inline-block text-xs font-medium text-[var(--token-gray-600)] dark:text-[var(--token-gray-400)] underline underline-offset-2 hover:text-[var(--token-gray-900)] dark:hover:text-[var(--token-white-90)] transition-colors"
          >
            {linkText}
          </Link>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss"
          className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded text-[var(--token-gray-400)] hover:text-[var(--token-gray-700)] dark:hover:text-[var(--token-gray-300)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M10 2L2 10M2 2l8 8"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;