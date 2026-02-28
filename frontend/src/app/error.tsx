'use client';

import { getErrorMessage } from '@/lib/errors';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-semibold text-(--token-gray-800) dark:text-(--token-white-90)">Terjadi kesalahan</h2>
      <p className="text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">{getErrorMessage(error)}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-(--token-white) transition hover:bg-primary-600"
      >
        Coba lagi
      </button>
    </div>
  );
}
