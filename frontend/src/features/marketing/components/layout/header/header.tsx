'use client';
import { CloseIcon, MenuIcon } from '@/icons/icons';
import BrandLogo from '@/components/ui/brand-logo';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DesktopNav from './desktop-nav';
import MainMobileNav from './main-mobile-nav';
import ThemeToggle from './theme-toggle';
import { usePathname } from 'next/navigation';

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
    const closeOnHashChange = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener('hashchange', closeOnHashChange);
    return () => {
      window.removeEventListener('hashchange', closeOnHashChange);
    };
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
      className={`sticky top-0 z-50 py-2 lg:py-4 bg-[var(--color-marketing-light-canvas)] dark:bg-[var(--color-marketing-dark-canvas)] ${
        hasScrolled
          ? 'supports-[backdrop-filter:blur(0px)]:bg-[color-mix(in_oklab,var(--color-marketing-light-canvas)_86%,transparent)] dark:supports-[backdrop-filter:blur(0px)]:bg-[color-mix(in_oklab,var(--color-marketing-dark-canvas)_78%,transparent)] backdrop-blur-md shadow-[0_8px_24px_-20px_rgba(17,24,39,0.38)] dark:shadow-[0_10px_30px_-20px_rgba(0,0,0,0.72)]'
          : ''
      } transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-7">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" priority />
            </Link>
          </div>

          <DesktopNav />

          <div className="flex items-center gap-4 justify-self-end">
            <ThemeToggle />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              type="button"
              className="order-last shrink-0 inline-flex items-center justify-center p-2 rounded-md text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)] hover:text-[var(--token-gray-700)] dark:hover:text-[var(--token-gray-300)] hover:bg-[var(--token-gray-100)] dark:hover:bg-[var(--token-gray-700)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
              href="/login"
              className="text-sm hidden lg:block font-medium text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)] hover:text-primary-500"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="lg:inline-flex items-center px-5 py-3 gradient-btn hidden text-sm text-[var(--token-white)] rounded-full button-bg h-11"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      <MainMobileNav
        isOpen={mobileMenuOpen}
        onNavigate={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
