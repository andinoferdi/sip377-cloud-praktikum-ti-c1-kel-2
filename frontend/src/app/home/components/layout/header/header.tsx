'use client';
import { CloseIcon, MenuIcon } from '@/icons/icons';
import BrandLogo from '@/components/ui/brand-logo';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from './theme-toggle';
import { usePathname } from 'next/navigation';
import { navItems } from './nav-items';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();
  const SCROLL_ON_THRESHOLD = 16;
  const SCROLL_OFF_THRESHOLD = 4;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeMenu = () => setMobileMenuOpen(false);
    window.addEventListener('hashchange', closeMenu);
    return () => window.removeEventListener('hashchange', closeMenu);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled((prev) => {
        if (prev) {
          return window.scrollY > SCROLL_OFF_THRESHOLD;
        }

        return window.scrollY > SCROLL_ON_THRESHOLD;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
        hasScrolled
          ? 'py-2 lg:py-2.5 supports-[backdrop-filter:blur(0px)]:bg-[color-mix(in_oklab,var(--color-marketing-light-canvas)_86%,transparent)] dark:supports-[backdrop-filter:blur(0px)]:bg-[color-mix(in_oklab,var(--color-marketing-dark-canvas)_78%,transparent)] backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'py-3 lg:py-4 bg-(--color-marketing-light-canvas) dark:bg-(--color-marketing-dark-canvas)'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-7">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" priority />
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex lg:items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-(--token-gray-600) dark:text-(--token-gray-300) transition-colors hover:text-(--token-gray-900) dark:hover:text-(--token-white) rounded-lg hover:bg-(--token-gray-100)/60 dark:hover:bg-(--token-white-5)"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/login"
              className="hidden lg:inline-flex gradient-btn items-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Masuk
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-(--token-gray-500) dark:text-(--token-gray-400) hover:text-(--token-gray-700) dark:hover:text-(--token-gray-300) hover:bg-(--token-gray-100) dark:hover:bg-(--token-white-5) lg:hidden"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-t border-soft bg-(--token-white) dark:bg-(--color-surface-dark-base) shadow-lg">
          <nav className="px-5 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300) hover:bg-(--token-gray-100) dark:hover:bg-(--token-white-5)"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-soft">
              <Link
                href="/login"
                className="gradient-btn block rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Masuk
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
