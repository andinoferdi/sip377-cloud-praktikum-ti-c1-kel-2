import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-[var(--token-gray-50)] px-4 py-5 text-center dark:bg-[var(--color-surface-dark-elevated)]`}
    >
      <h3 className="mb-2 font-semibold text-[var(--token-gray-900)] dark:text-[var(--token-white)]">
        #1 Tailwind CSS Dashboard
      </h3>
      <p className="mb-4 text-[var(--token-gray-500)] text-theme-sm dark:text-[var(--token-gray-400)]">
        Leading Tailwind CSS Admin Template with 400+ UI Component and Pages.
      </p>
      <a
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-[var(--token-white)] rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        Upgrade To Pro
      </a>
    </div>
  );
}
