import React from "react";

type ComponentCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string;};

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)] ${className}`}
    >

      <div className="px-6 py-5">
        <h3 className="text-base font-medium text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
            {desc}
          </p>
        )}
      </div>

      <div className="p-4 border-t border-[var(--token-gray-100)] dark:border-[var(--color-border-dark-soft)] sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
