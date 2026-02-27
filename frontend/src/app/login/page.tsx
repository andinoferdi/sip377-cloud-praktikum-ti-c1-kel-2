import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import LoginForm from "@/app/login/components/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <section className="bg-[var(--color-marketing-light-canvas)] dark:bg-[var(--color-marketing-dark-canvas)] py-18 md:py-24">
      <div className="wrapper">
        <div className="mx-auto max-w-[600px]">
          <div className="rounded-3xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-8 shadow-theme-sm dark:border-[var(--color-marketing-dark-border)] dark:bg-[var(--color-surface-dark-subtle)] sm:p-14">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-(--token-gray-800) dark:text-(--token-white-90)">
                Login Presensi
              </h1>
              <p className="text-(--token-gray-500) dark:text-(--token-gray-400)">
                Masuk menggunakan NIM atau NIP dan password.
              </p>
            </div>

            <LoginForm />

            <div className="mt-6 border-t border-[var(--token-gray-200)] pt-5 dark:border-[var(--color-marketing-dark-border)]">
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-5 text-sm font-semibold text-[var(--token-white)] transition-colors hover:bg-primary-600"
              >
                <Home size={16} aria-hidden />
                Kembali ke Landing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
