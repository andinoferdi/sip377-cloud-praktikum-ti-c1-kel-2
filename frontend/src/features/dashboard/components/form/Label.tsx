import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type LabelProps = {
  htmlFor?: string;
  children: ReactNode;
  className?: string;};

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        "mb-1.5 block text-sm font-medium text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)]",

        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
