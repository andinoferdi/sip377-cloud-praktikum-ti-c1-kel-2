import React from "react";

type RadioProps = {
  id: string; // Unique ID for the radio button
  name: string; // Group name for the radio button
  value: string; // Value of the radio button
  checked: boolean; // Whether the radio button is checked
  label: string; // Label text for the radio button
  onChange: (value: string) => void; // Handler for when the radio button is toggled
  className?: string;};

const RadioSm: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer select-none items-center text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)] ${className}`}
    >
      <span className="relative">

        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />

        <span
          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border ${
            checked
              ? "border-brand-500 bg-brand-500"
              : "bg-transparent border-[var(--token-gray-300)] dark:border-[var(--color-border-dark-strong)]"
          }`}
        >

          <span
            className={`h-1.5 w-1.5 rounded-full ${
              checked ? "bg-[var(--token-white)]" : "bg-[var(--token-white)] dark:bg-[var(--color-dark-surface-2)]"
            }`}
          ></span>
        </span>
      </span>
      {label}
    </label>
  );
};

export default RadioSm;
