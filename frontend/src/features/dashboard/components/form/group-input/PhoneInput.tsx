"use client";
import React, { useState } from "react";

type CountryCode = {
  code: string;
  label: string;};

type PhoneInputProps = {
  countries: CountryCode[];
  placeholder?: string;
  onChange?: (phoneNumber: string) => void;
  selectPosition?: "start" | "end";};

const PhoneInput: React.FC<PhoneInputProps> = ({
  countries,
  placeholder = "+1 (555) 000-0000",
  onChange,
  selectPosition = "start", // Default position is 'start'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [phoneNumber, setPhoneNumber] = useState<string>("+1");

  const countryCodes: Record<string, string> = countries.reduce(
    (acc, { code, label }) => ({ ...acc, [code]: label }),
    {}
  );

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setPhoneNumber(countryCodes[newCountry]);
    if (onChange) {
      onChange(countryCodes[newCountry]);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    if (onChange) {
      onChange(newPhoneNumber);
    }
  };

  return (
    <div className="relative flex">

      {selectPosition === "start" && (
        <div className="absolute">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="appearance-none bg-none rounded-l-lg border-0 border-r border-[var(--token-gray-200)] bg-transparent py-3 pl-3.5 pr-8 leading-tight text-[var(--token-gray-700)] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[var(--color-border-dark-soft)] dark:text-[var(--token-gray-400)]"
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
                className="text-[var(--token-gray-700)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-gray-400)]"
              >
                {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 flex items-center text-[var(--token-gray-700)] pointer-events-none bg-none right-3 dark:text-[var(--token-gray-400)]">
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder={placeholder}
        className={`dark:bg-[var(--color-surface-dark-elevated)] h-11 w-full ${
          selectPosition === "start" ? "pl-[84px]" : "pr-[84px]"
        } rounded-lg border border-[var(--token-gray-300)] bg-transparent py-3 px-4 text-sm text-[var(--token-gray-800)] shadow-theme-xs placeholder:text-[var(--token-gray-400)] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-white-90)] dark:placeholder:text-[var(--token-white-30)] dark:focus:border-brand-800`}
      />

      {selectPosition === "end" && (
        <div className="absolute right-0">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="appearance-none bg-none rounded-r-lg border-0 border-l border-[var(--token-gray-200)] bg-transparent py-3 pl-3.5 pr-8 leading-tight text-[var(--token-gray-700)] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[var(--color-border-dark-soft)] dark:text-[var(--token-gray-400)]"
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
                className="text-[var(--token-gray-700)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-gray-400)]"
              >
                {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 flex items-center text-[var(--token-gray-700)] pointer-events-none right-3 dark:text-[var(--token-gray-400)]">
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
