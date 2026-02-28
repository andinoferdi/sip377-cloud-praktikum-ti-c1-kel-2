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
        if (prev) return window.scrollY > SCROLL_OFF_THRESHOLD;
        return window.scrollY > SCROLL_ON_THRESHOLD;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
        hasScrolled
          ? 'border-b border-soft py-2 lg:py-2.5 supports-[backdrop-filter:blur(0px)]:bg-[color-mix(in_oklab,var(--color-marketing-light-canvas)_86%,transparent)] dark:supports-[backdrop-filter:blur(0px)]:bg-[color-mix(in_oklab,var(--color-marketing-dark-canvas)_82%,transparent)] backdrop-blur-xl'
          : 'border-b border-transparent py-3 lg:py-4 bg-(--color-marketing-light-canvas) dark:bg-(--color-marketing-dark-canvas)'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-7">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="md" priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex lg:items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-(--token-gray-500) dark:text-(--token-gray-400) transition-colors hover:text-(--token-gray-900) dark:hover:text-(--token-white) rounded-lg hover:bg-(--token-gray-100)/60 dark:hover:bg-(--token-white-5)"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              href="/login"
              className="hidden lg:inline-flex items-center rounded-lg border border-soft bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:hover:opacity-90"
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
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-t border-soft bg-(--color-marketing-light-canvas) dark:bg-(--color-marketing-dark-canvas) shadow-sm">
          <nav className="mx-auto w-full max-w-7xl px-5 py-4 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300) hover:bg-(--token-gray-100) dark:hover:bg-(--token-white-5) transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-soft">
              <Link
                href="/login"
                className="block rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
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