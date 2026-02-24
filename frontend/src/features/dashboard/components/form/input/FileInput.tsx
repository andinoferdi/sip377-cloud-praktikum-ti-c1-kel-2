import React, { FC } from "react";

type FileInputProps = {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;};

const FileInput: FC<FileInputProps> = ({ className, onChange }) => {
  return (
    <input
      type="file"
      className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-[var(--token-gray-300)] bg-transparent text-sm text-[var(--token-gray-500)] shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-[var(--token-gray-200)] file:bg-[var(--token-gray-50)] file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-[var(--token-gray-700)] placeholder:text-[var(--token-gray-400)] hover:file:bg-[var(--token-gray-100)] focus:outline-hidden focus:file:ring-brand-300 dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-gray-400)] dark:text-[var(--token-white-90)] dark:file:border-[var(--token-gray-800)] dark:file:bg-[var(--token-white-3)] dark:file:text-[var(--token-gray-400)] dark:placeholder:text-[var(--token-gray-400)] ${className}`}
      onChange={onChange}
    />
  );
};

export default FileInput;
