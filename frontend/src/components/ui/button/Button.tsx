import React, { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string;};

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  const variantClasses = {
    primary:
      "bg-brand-500 text-[var(--token-white)] shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-[var(--token-white)] text-[var(--token-gray-700)] ring-1 ring-inset ring-gray-300 hover:bg-[var(--token-gray-50)] dark:bg-[var(--color-surface-dark-subtle)] dark:text-[var(--token-gray-400)] dark:ring-gray-700 dark:hover:bg-[var(--token-white-3)] dark:hover:text-[var(--token-gray-300)]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
