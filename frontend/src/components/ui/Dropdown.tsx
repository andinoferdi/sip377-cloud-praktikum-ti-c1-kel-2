"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Dropdown ────────────────────────────────────────────────────────────────

type DropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  align = "right",
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(target) && !target.closest(".dropdown-toggle")) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "absolute z-50 mt-1.5 min-w-[11rem]",
        "rounded-xl border border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)]",
        "bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-elevated)]",
        "shadow-lg shadow-black/8 dark:shadow-black/30",
        "py-1 outline-none",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
};

// ─── DropdownItem ─────────────────────────────────────────────────────────────

type DropdownItemProps = {
  tag?: "a" | "button";
  href?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  href,
  onClick,
  onItemClick,
  className,
  children,
  icon,
  destructive = false,
  disabled = false,
}) => {
  const baseClass = cn(
    "flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg mx-1",
    "transition-colors duration-100 outline-none",
    "focus-visible:ring-2 focus-visible:ring-brand-500/30",
    destructive
      ? "text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
      : "text-[var(--token-gray-700)] hover:bg-[var(--token-gray-50)] dark:text-[var(--token-gray-300)] dark:hover:bg-[var(--token-white-5)]",
    disabled && "opacity-40 pointer-events-none cursor-not-allowed",
    className
  );

  const handleClick = (e: React.MouseEvent) => {
    if (tag === "button") e.preventDefault();
    onClick?.();
    onItemClick?.();
  };

  const content = (
    <>
      {icon && (
        <span className="shrink-0 text-[var(--token-gray-400)]" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left">{children}</span>
    </>
  );

  if (tag === "a" && href) {
    return (
      <Link href={href} role="menuitem" className={baseClass} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={baseClass}
    >
      {content}
    </button>
  );
};