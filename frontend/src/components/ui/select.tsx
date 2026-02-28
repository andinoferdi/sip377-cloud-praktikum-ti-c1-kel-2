"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SimpleSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

interface SelectTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "default" | "lg";
  hasError?: boolean;
}

const Select = SelectPrimitive.Root;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, size = "default", hasError, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    data-size={size}
    className={cn(
      "group relative flex w-full items-center justify-between gap-2 rounded-xl border transition-all duration-200 cursor-pointer",
      "border-(--token-gray-300) bg-(--token-white) text-(--token-gray-900)",
      "focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "hover:border-primary-500/50",
      "dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90)",
      hasError &&
        "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:border-red-500/50",
      {
        "h-10 px-3 text-sm": size === "sm",
        "h-12 px-4 text-sm": size === "default",
        "h-14 px-5 text-base": size === "lg",
      },
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="size-4 shrink-0 text-(--token-gray-400) transition-transform group-data-[state=open]:rotate-180 dark:text-(--token-gray-500)" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

interface SelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content> {
  hasSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
  (
    {
      className,
      position = "popper",
      hasSearch = false,
      onSearchChange,
      searchValue = "",
      searchPlaceholder = "Cari...",
      children,
      ...props
    },
    ref,
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        className={cn(
          "border border-(--token-gray-300) bg-(--token-white) text-(--token-gray-900)",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "relative z-50 min-w-32 overflow-hidden rounded-xl shadow-lg dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90)",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {hasSearch && (
          <div
            data-slot="select-input-wrapper"
            className="sticky top-0 z-10 border-b border-(--token-gray-200) bg-(--token-white) dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle)"
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <SearchIcon className="size-4 shrink-0 text-(--token-gray-400) dark:text-(--token-gray-500)" />
              <input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={cn(
                  "flex h-8 w-full bg-transparent text-sm text-(--token-gray-900) outline-none dark:text-(--token-white-90)",
                  "placeholder:text-(--token-gray-400) dark:placeholder:text-(--token-gray-500)",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  className="rounded p-1 hover:bg-(--token-gray-100) dark:hover:bg-(--token-white-8)"
                  aria-label="Clear search"
                >
                  <XIcon className="size-3.5 text-(--token-gray-400) dark:text-(--token-gray-500)" />
                </button>
              )}
            </div>
          </div>
        )}
        <SelectPrimitive.Viewport
          className={cn(
            "p-1 overflow-x-hidden overflow-y-auto",
            hasSearch ? "max-h-75" : "max-h-100",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = "SelectContent";

const SelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Group>,
  React.ComponentProps<typeof SelectPrimitive.Group>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Group
    ref={ref}
    data-slot="select-group"
    className={cn("overflow-hidden", className)}
    {...props}
  />
));
SelectGroup.displayName = "SelectGroup";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentProps<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(
      "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-(--token-gray-400) dark:text-(--token-gray-500)",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

interface SelectItemProps extends React.ComponentProps<typeof SelectPrimitive.Item> {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, icon, badge, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none select-none",
      "text-(--token-gray-800) focus:bg-(--token-gray-100) focus:text-(--token-gray-900) dark:text-(--token-gray-200) dark:focus:bg-(--token-white-8) dark:focus:text-(--token-white)",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      "hover:bg-(--token-gray-100) dark:hover:bg-(--token-white-8) transition-colors",
      "data-[state=checked]:bg-(--token-gray-100) data-[state=checked]:text-(--token-gray-900) dark:data-[state=checked]:bg-(--token-white-8) dark:data-[state=checked]:text-(--token-white)",
      className,
    )}
    {...props}
  >
    {icon && <div className="shrink-0">{icon}</div>}
    <SelectPrimitive.ItemText className="flex-1">{children}</SelectPrimitive.ItemText>
    {badge && <div className="shrink-0 text-xs">{badge}</div>}
    <div className="absolute right-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4 text-primary-500" />
      </SelectPrimitive.ItemIndicator>
    </div>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentProps<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    data-slot="select-value"
    className={cn("line-clamp-1 flex items-center gap-2", className)}
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentProps<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn(
      "-mx-1 my-2 h-px bg-(--token-gray-200) dark:bg-(--color-marketing-dark-border)",
      className,
    )}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectEmpty = ({ children }: { children?: React.ReactNode }) => (
  <div
    data-slot="select-empty"
    className="py-6 text-center text-sm text-(--token-gray-500) dark:text-(--token-gray-400)"
  >
    {children || "Tidak ada hasil ditemukan"}
  </div>
);

export default function UiSelect({
  value,
  onChange,
  options,
  className,
  placeholder = "Pilih opsi",
  disabled,
}: SimpleSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectValue,
  SelectSeparator,
  SelectEmpty,
};
