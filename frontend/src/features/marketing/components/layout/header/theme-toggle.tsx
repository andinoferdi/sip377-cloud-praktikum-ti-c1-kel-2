"use client";

import { useThemeTransition } from '@/features/theme/use-theme-transition';

const ThemeToggle = () => {
  const { resolvedTheme, toggleThemeWithTransition } = useThemeTransition();

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleThemeWithTransition}
      className="inline-flex items-center justify-center size-11 rounded-full bg-[var(--color-gray-100)] dark:bg-[var(--token-white-5)] text-[var(--color-gray-500)] dark:text-[var(--token-white-60)] hover:text-[var(--token-gray-800)] dark:hover:text-[var(--token-white-90)] hover:bg-[var(--token-gray-100)] dark:hover:bg-[var(--token-white-10)]"
    >
      <svg
        className="size-5 dark:inline hidden"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      <svg
        className="dark:hidden"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M6.24683 7.08492C6.24683 10.7677 9.23232 13.7532 12.9151 13.7532C14.6687 13.7532 16.2641 13.0764 17.4545 11.9697C16.584 15.2727 13.5765 17.7083 10.0001 17.7083C5.74289 17.7083 2.29175 14.2572 2.29175 9.99996C2.29175 6.42356 4.72736 3.41602 8.03036 2.54558C6.92367 3.73594 6.24683 5.33139 6.24683 7.08492Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ThemeToggle;
