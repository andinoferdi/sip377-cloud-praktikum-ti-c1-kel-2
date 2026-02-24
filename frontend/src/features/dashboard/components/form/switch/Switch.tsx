"use client";
import React, { useState } from "react";

type SwitchProps = {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray";};

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue", // Default to blue color
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    if (disabled) return;
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (onChange) {
      onChange(newCheckedState);
    }
  };

  const switchColors =
    color === "blue"
      ? {
          background: isChecked
            ? "bg-brand-500 "
            : "bg-[var(--token-gray-200)] dark:bg-[var(--token-white-10)]", // Blue version
          knob: isChecked
            ? "translate-x-full bg-[var(--token-white)]"
            : "translate-x-0 bg-[var(--token-white)]",
        }
      : {
          background: isChecked
            ? "bg-[var(--token-gray-800)] dark:bg-[var(--token-white-10)]"
            : "bg-[var(--token-gray-200)] dark:bg-[var(--token-white-10)]", // Gray version
          knob: isChecked
            ? "translate-x-full bg-[var(--token-white)]"
            : "translate-x-0 bg-[var(--token-white)]",
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled ? "text-[var(--token-gray-400)]" : "text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)]"
      }`}
      onClick={handleToggle} // Toggle when the label itself is clicked
    >
      <div className="relative">
        <div
          className={`block transition duration-150 ease-linear h-6 w-11 rounded-full ${
            disabled
              ? "bg-[var(--token-gray-100)] pointer-events-none dark:bg-[var(--color-surface-dark-subtle)]"
              : switchColors.background
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`}
        ></div>
      </div>
      {label}
    </label>
  );
};

export default Switch;
