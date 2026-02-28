import React, { type CSSProperties, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "minimal" | "filled";
type CardSize = "sm" | "md" | "lg";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  interactive?: boolean;
  backgroundColor?: string;
  textColor?: string;
};

const sizeMap: Record<CardSize, { body: string; section: string }> = {
  sm: { body: "p-4",   section: "px-4 py-3" },
  md: { body: "p-5",   section: "px-5 py-4" },
  lg: { body: "p-6",   section: "px-6 py-5" },
};

const variantStyles: Record<CardVariant, string> = {
  default:  "bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-elevated)] border border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)] shadow-sm",
  elevated: "bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-elevated)] border border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)] shadow-lg",
  minimal:  "bg-[var(--token-gray-50)] dark:bg-[var(--color-surface-dark-subtle)] border border-[var(--token-gray-100)] dark:border-[var(--color-border-dark-soft)]",
  filled:   "bg-[var(--token-gray-900)] dark:bg-[var(--token-white)] text-[var(--token-white)] dark:text-[var(--token-gray-900)]",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      header,
      children,
      footer,
      variant = "default",
      size = "md",
      interactive = false,
      className,
      backgroundColor,
      textColor,
      style,
      ...props
    },
    ref
  ) => {
    const sizes = sizeMap[size];

    const customStyle: CSSProperties = {
      ...style,
      ...(backgroundColor && { backgroundColor }),
      ...(textColor && { color: textColor }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden transition-all duration-200",
          variantStyles[variant],
          interactive && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:translate-y-0 active:shadow-sm",
          className
        )}
        style={customStyle}
        {...props}
      >
        {header && (
          <div
            className={cn(
              "border-b border-(--token-gray-100) dark:border-(--color-border-dark-soft)",
              sizes.section
            )}
          >
            {typeof header === "string" ? (
              <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white-90)">
                {header}
              </h3>
            ) : (
              header
            )}
          </div>
        )}

        <div className={sizes.body}>{children}</div>

        {footer && (
          <div
            className={cn(
              "border-t border-(--token-gray-100) dark:border-(--color-border-dark-soft)",
              sizes.section
            )}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-tight text-(--token-gray-900) dark:text-(--token-white-90)", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-(--token-gray-500) dark:text-(--token-gray-400)", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
