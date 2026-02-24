'use client';

import { CopyToClipboard } from '@/features/ai/components/copy-to-clipboard';

type PropsType = {
  response: string;
};

export default function AiResponse({ response }: PropsType) {
  return (
    <div className="max-w-3xl whitespace-pre-wrap">
      <div className="bg-[var(--token-white)] dark:bg-[var(--token-white-5)] shadow-theme-xs rounded-3xl rounded-bl-lg py-4 px-5 max-w-3xl leading-7">
        {response}
      </div>

      <div className="mt-3 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
        <CopyToClipboard text={response} />
      </div>
    </div>
  );
}
