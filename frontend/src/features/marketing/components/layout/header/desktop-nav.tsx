import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { navItems } from './nav-items';
import { useActiveNavHash } from './use-active-nav-hash';

export default function DesktopNav() {
  const pathname = usePathname();
  const { activeHash, setActiveHashFromHref, navigateToHref } = useActiveNavHash();

  return (
    <nav className="hidden lg:flex lg:items-center bg-[var(--color-gray-50)] dark:bg-[var(--color-surface-dark-elevated)] rounded-full p-1 max-h-fit">
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
                return;
              }

              setActiveHashFromHref(item.href);
            }}
            className={cn(
              'text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)] text-sm px-4 py-1.5 rounded-full hover:text-primary-500 font-medium',
              {
                'bg-[var(--token-white)] dark:bg-[var(--token-white-5)] font-medium text-[var(--token-gray-800)] dark:text-[var(--token-white-90)] shadow-xs':
                  isActive,
              }
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
