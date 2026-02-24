import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import SignInForm from '@/features/auth/components/signin-form';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function SignInPage() {
  return (
    <section className="bg-[var(--color-marketing-light-canvas)] dark:bg-[var(--color-marketing-dark-canvas)] py-18 md:py-24">
      <div className="wrapper">
        <div className="mx-auto max-w-[600px]">
          <div className="rounded-3xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-8 shadow-theme-sm dark:border-[var(--color-marketing-dark-border)] dark:bg-[var(--color-surface-dark-subtle)] sm:p-14">
            <div className="text-center mb-8">
              <h3 className="text-(--token-gray-800) dark:text-(--token-white-90) font-bold text-3xl mb-2">
                Sign In
              </h3>
              <p className="text-(--token-gray-500) dark:text-(--token-gray-400)">
                Enter your email and password to sign in!
              </p>
            </div>

            <Suspense fallback={null}>
              <SignInForm />
            </Suspense>

            <div className="mt-6 border-t border-[var(--token-gray-200)] pt-5 dark:border-[var(--color-marketing-dark-border)]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--token-gray-300)] bg-[var(--token-white)] px-5 text-sm font-semibold text-[var(--token-gray-700)] transition-colors hover:bg-[var(--token-gray-100)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-gray-300)] dark:hover:bg-[var(--color-surface-dark-subtle)]"
                >
                  Go to Register
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary-500 px-5 text-sm font-semibold text-[var(--token-white)] transition-colors hover:bg-primary-600"
                >
                  <Home size={16} aria-hidden />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
