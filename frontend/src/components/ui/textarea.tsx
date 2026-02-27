"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none outline-none",
          "text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]",
          "placeholder:text-[var(--token-gray-400)] dark:placeholder:text-[var(--token-white-30)]",
          "border-[var(--token-gray-300)] dark:border-[var(--color-border-dark-strong)]",
          "bg-[var(--token-white)] dark:bg-transparent",
          "transition-all duration-150",
          "hover:border-[var(--token-gray-400)] dark:hover:border-[var(--color-border-dark-strong)]",
          "focus:border-brand-400 focus:ring-3 focus:ring-brand-500/15",
          "dark:focus:border-brand-500 dark:focus:ring-brand-500/15",
          error &&
            "border-error-400 focus:border-error-400 focus:ring-3 focus:ring-error-500/15",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };

// ─── AutoGrowingTextArea ──────────────────────────────────────────────────────
// Bug fix: previous version had onChange in useEffect deps, causing infinite loops.
// Solution: the effect depends only on `value`; onChange is called via event handler.

type AutoGrowingProps = Omit<TextareaProps, "onChange" | "value"> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  minRows?: number;
  maxRows?: number;
};

export function AutoGrowingTextArea({
  onChange,
  className,
  value: controlledValue,
  defaultValue = "",
  withDefaultStyles,
  minRows = 2,
  maxRows = 8,
  ...props
}: AutoGrowingProps & { withDefaultStyles?: boolean }) {
  const isControlled = controlledValue !== undefined;
  const [value, setValue] = useState(isControlled ? controlledValue : defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (isControlled) setValue(controlledValue);
  }, [isControlled, controlledValue]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (!isControlled) setValue(next);
    onChange?.(next);
  };

  const lineHeight = 20;
  const minHeight = lineHeight * minRows + 22;
  const maxHeight = lineHeight * maxRows + 22;

  const sharedProps = {
    ref: textareaRef,
    value,
    onChange: handleChange,
    style: { minHeight, maxHeight, overflowY: "auto" as const },
    ...props,
  };

  if (withDefaultStyles) {
    return <Textarea className={className} {...sharedProps} />;
  }

  return (
    <textarea
      className={cn(
        "w-full bg-transparent outline-none resize-none text-sm",
        "text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]",
        "placeholder:text-[var(--token-gray-400)]",
        className
      )}
      {...sharedProps}
    />
  );
}