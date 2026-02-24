import type { Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'lucide-react';
import SignupForm from '@/features/auth/components/signup-form';

export const metadata: Metadata = {
  title: 'Register',
};

export default function SignUpPage() {
  return (
    <section className="bg-[var(--color-marketing-light-canvas)] dark:bg-[var(--color-marketing-dark-canvas)] py-18 md:py-24">
      <div className="wrapper">
        <div className="mx-auto max-w-[680px]">
          <div className="rounded-3xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-8 shadow-theme-sm dark:border-[var(--color-marketing-dark-border)] dark:bg-[var(--color-surface-dark-subtle)] sm:p-14">
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-3xl font-bold text-(--token-gray-800) dark:text-(--token-white-90)">
                Create Account
              </h3>
              <p className="text-(--token-gray-500) dark:text-(--token-gray-400)">
                Register your account to access the dashboard.
              </p>
            </div>

            <SignupForm />

            <div className="mt-6 border-t border-[var(--token-gray-200)] pt-5 dark:border-[var(--color-marketing-dark-border)]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--token-gray-300)] bg-[var(--token-white)] px-5 text-sm font-semibold text-[var(--token-gray-700)] transition-colors hover:bg-[var(--token-gray-100)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-gray-300)] dark:hover:bg-[var(--color-surface-dark-subtle)]"
                >
                  Go to Login
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
