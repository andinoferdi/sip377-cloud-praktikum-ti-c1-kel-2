'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { navItems } from './nav-items';
import { cn } from '@/lib/utils';
import { useActiveNavHash } from './use-active-nav-hash';

type MobileMenuProps = {
  isOpen: boolean;
  onNavigate?: () => void;
};

export default function MainMobileNav({ isOpen, onNavigate }: MobileMenuProps) {
  const pathname = usePathname();
  const { activeHash, setActiveHashFromHref, navigateToHref } = useActiveNavHash();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden h-screen absolute top-full bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-base)] w-full border-b border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)]">
      <div className="flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto">
          <div className="pt-2 pb-3 space-y-1 px-4 sm:px-6">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/' && activeHash === ''
                  : pathname === '/' && activeHash === item.hash;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                    if (navigateToHref(item.href)) {
                      event.preventDefault();
                    } else {
                      setActiveHashFromHref(item.href);
                    }

                    onNavigate?.();
                  }}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium text-[var(--token-gray-500)] dark:text-[var(--token-gray-300)] hover:bg-[var(--token-gray-100)] dark:hover:bg-[var(--token-gray-700)]',
                    {
                      'bg-[var(--token-gray-100)] dark:bg-[var(--token-gray-700)] text-[var(--token-gray-800)] dark:text-[var(--token-white)]':
                        isActive,
                    }
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col pt-2 pb-3 space-y-3 px-8">
          <Link
            href="/login"
            className="text-sm block w-full border h-11 border-[var(--token-gray-200)] px-5 py-3 rounded-full text-center font-medium text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)] hover:text-primary-500"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="flex items-center px-5 py-3 gradient-btn  justify-center text-sm text-[var(--token-white)] rounded-full button-bg h-11"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
