"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: React.ReactNode;
  description?: string;
  checkboxClassName?: string;
  labelClassName?: string;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      checkboxClassName,
      labelClassName,
      checked,
      defaultChecked,
      onChange,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked ?? false
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked);
      onChange?.(e);
    };

    return (
      <div className={cn("flex gap-2.5", disabled && "opacity-50 cursor-not-allowed", className)}>
        <div className="relative flex h-4 w-4 shrink-0 mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={isControlled ? checked : undefined}
            defaultChecked={!isControlled ? defaultChecked : undefined}
            onChange={handleChange}
            disabled={disabled}
            aria-checked={isChecked}
            className="peer absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            {...props}
          />
          <div
            aria-hidden="true"
            className={cn(
              "h-4 w-4 rounded flex items-center justify-center transition-all duration-150",
              "border border-(--token-gray-300) bg-(--token-white)",
              "dark:border-(--color-border-dark-strong) dark:bg-transparent",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30 peer-focus-visible:ring-offset-1",
              isChecked
                ? "bg-brand-500 border-brand-500 dark:bg-brand-500 dark:border-brand-500"
                : "",
              checkboxClassName
            )}
          >
            {isChecked && (
              <svg
                width="9"
                height="7"
                viewBox="0 0 9 7"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 3L3.5 5.5L8 1"
                  stroke="white"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300) leading-none cursor-pointer",
                  disabled && "cursor-not-allowed",
                  labelClassName
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
