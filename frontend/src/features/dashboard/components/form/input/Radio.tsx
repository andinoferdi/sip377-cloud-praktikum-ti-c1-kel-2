import React from "react";

type RadioProps = {
  id: string; // Unique ID for the radio button
  name: string; // Radio group name
  value: string; // Value of the radio button
  checked: boolean; // Whether the radio button is checked
  label: string; // Label for the radio button
  onChange: (value: string) => void; // Handler for value change
  className?: string; // Optional additional classes
  disabled?: boolean;};

const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer  select-none items-center gap-3 text-sm font-medium ${
        disabled
          ? "text-[var(--token-gray-300)] dark:text-[var(--token-gray-600)] cursor-not-allowed"
          : "text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)]"
      } ${className}`}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)} // Prevent onChange when disabled
        className="sr-only"
        disabled={disabled} // Disable input
      />
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] ${
          checked
            ? "border-brand-500 bg-brand-500"
            : "bg-transparent border-[var(--token-gray-300)] dark:border-[var(--color-border-dark-strong)]"
        } ${
          disabled
            ? "bg-[var(--token-gray-100)] dark:bg-[var(--token-gray-700)] border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-strong)]"
            : ""
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full bg-[var(--token-white)] ${
            checked ? "block" : "hidden"
          }`}
        ></span>
      </span>
      {label}
    </label>
  );
};

export default Radio;
