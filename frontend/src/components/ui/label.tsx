import { cn } from "@/lib/utils";
import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  optional?: boolean;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, optional, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium",
          "text-(--token-gray-700) dark:text-(--token-gray-300)",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span
            className="text-error-500 leading-none"
            aria-hidden="true"
          >
            *
          </span>
        )}
        {optional && !required && (
          <span className="text-(--token-gray-400) text-xs font-normal">
            (optional)
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
