import React from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

type BadgeProps = {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode;};

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  const sizeStyles = {
    sm: "text-theme-xs", // Smaller padding and font size
    md: "text-sm", // Default padding and font size
  };

  const variants = {
    light: {
      primary:
        "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
      success:
        "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
      error:
        "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
      warning:
        "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-[var(--token-orange-400)]",
      info: "bg-[var(--token-blue-light-50)] text-[var(--token-blue-light-500)] dark:bg-[var(--token-blue-light-500-15)] dark:text-[var(--token-blue-light-500)]",
      light: "bg-[var(--token-gray-100)] text-[var(--token-gray-700)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-white-80)]",
      dark: "bg-[var(--token-gray-500)] text-[var(--token-white)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-white)]",
    },
    solid: {
      primary: "bg-brand-500 text-[var(--token-white)] dark:text-[var(--token-white)]",
      success: "bg-success-500 text-[var(--token-white)] dark:text-[var(--token-white)]",
      error: "bg-error-500 text-[var(--token-white)] dark:text-[var(--token-white)]",
      warning: "bg-warning-500 text-[var(--token-white)] dark:text-[var(--token-white)]",
      info: "bg-[var(--token-blue-light-500)] text-[var(--token-white)] dark:text-[var(--token-white)]",
      light: "bg-[var(--token-gray-400)] dark:bg-[var(--token-white-5)] text-[var(--token-white)] dark:text-[var(--token-white-80)]",
      dark: "bg-[var(--token-gray-700)] text-[var(--token-white)] dark:text-[var(--token-white)]",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
