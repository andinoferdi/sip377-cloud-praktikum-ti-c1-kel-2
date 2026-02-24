'use client';

import { CheckMarkIcon, ClipboardIcon } from '@/icons/icons';
import copy from 'copy-text-to-clipboard';
import { useState } from 'react';

export function CopyToClipboard({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  function handleClick() {
    copy(text);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  }

  return (
    <button
      onClick={handleClick}
      className="flex gap-1 items-center hover:text-[var(--token-gray-500)] dark:hover:text-[var(--token-white-90)] dark:text-[var(--token-gray-400)] dark:border-[var(--token-white-5)] bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-elevated)] h-8 rounded-full px-3 py-1.5 border font-medium text-[var(--token-gray-700)] border-[var(--token-gray-100)] text-xs"
    >
      {isCopied ? <CheckMarkIcon /> : <ClipboardIcon />}

      <span>
        {isCopied ? 'Copied' : 'Copy'}{' '}
        <span className="sr-only">to clipboard</span>
      </span>
    </button>
  );
}
