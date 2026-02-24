'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MarketingNavHash } from './nav-items';

const OBSERVER_THRESHOLDS = [0, 0.15, 0.35, 0.6, 0.85];
const OBSERVER_ROOT_MARGIN = '-96px 0px -45% 0px';
const HEADER_OFFSET = 96;
const URL_SYNC_DEBOUNCE_MS = 140;
const NAVIGATION_LOCK_MS = 1000;

const SECTION_CONFIG = [
  { id: 'features', hash: '#features' },
  { id: 'pricing', hash: '#pricing' },
  { id: 'help', hash: '#help' },
] as const;

type SectionId = (typeof SECTION_CONFIG)[number]['id'];

const HASH_SET = new Set<MarketingNavHash>([
  '',
  '#features',
  '#pricing',
  '#help',
]);

function toHashFromHref(href: string): MarketingNavHash {
  if (href === '/') return '';

  const hash = href.startsWith('/#')
    ? (`#${href.slice(2)}` as MarketingNavHash)
    : '';

  return HASH_SET.has(hash) ? hash : '';
}

function toHashFromId(id: string): MarketingNavHash {
  return (`#${id}` as MarketingNavHash);
}

function toIdFromHash(hash: MarketingNavHash): SectionId | null {
  if (!hash) return null;

  const id = hash.slice(1);
  return SECTION_CONFIG.some((section) => section.id === id)
    ? (id as SectionId)
    : null;
}

function scrollToHashTarget(hash: MarketingNavHash) {
  if (hash === '') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const sectionId = toIdFromHash(hash);
  if (!sectionId) return;

  const targetElement = document.getElementById(sectionId);
  if (!targetElement) return;

  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function getValidLocationHash(): MarketingNavHash {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash as MarketingNavHash;
  return HASH_SET.has(hash) ? hash : '';
}

export function useActiveNavHash() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState<MarketingNavHash>('');
  const activeHashRef = useRef<MarketingNavHash>('');
  const rafRef = useRef<number | null>(null);
  const navigationLockRef = useRef(false);
  const lockedHashRef = useRef<MarketingNavHash>('');
  const navigationUnlockTimerRef = useRef<number | null>(null);
  const urlSyncTimerRef = useRef<number | null>(null);

  const clearNavigationLock = useCallback(() => {
    navigationLockRef.current = false;
    lockedHashRef.current = '';

    if (navigationUnlockTimerRef.current !== null) {
      window.clearTimeout(navigationUnlockTimerRef.current);
      navigationUnlockTimerRef.current = null;
    }
  }, []);

  const clearUrlSyncTimer = useCallback(() => {
    if (urlSyncTimerRef.current !== null) {
      window.clearTimeout(urlSyncTimerRef.current);
      urlSyncTimerRef.current = null;
    }
  }, []);

  const syncUrl = useCallback((nextHash: MarketingNavHash) => {
    if (pathname !== '/') return;

    const target = nextHash ? `/${nextHash}` : '/';
    const current = `${window.location.pathname}${window.location.hash}`;

    if (current !== target) {
      window.history.replaceState(window.history.state, '', target);
    }
  }, [pathname]);

  const scheduleUrlSync = useCallback((nextHash: MarketingNavHash) => {
    clearUrlSyncTimer();

    urlSyncTimerRef.current = window.setTimeout(() => {
      syncUrl(nextHash);
      urlSyncTimerRef.current = null;
    }, URL_SYNC_DEBOUNCE_MS);
  }, [clearUrlSyncTimer, syncUrl]);

  const setHashState = useCallback(
    (nextHash: MarketingNavHash, syncUrl: boolean) => {
      if (activeHashRef.current !== nextHash) {
        activeHashRef.current = nextHash;
        setActiveHash(nextHash);
      }

      if (!syncUrl) return;
      scheduleUrlSync(nextHash);
    },
    [scheduleUrlSync]
  );

  const recomputeActiveSection = useCallback(
    (syncUrl: boolean) => {
      if (pathname !== '/') {
        setHashState('', false);
        return;
      }

      if (navigationLockRef.current) {
        if (lockedHashRef.current) {
          setHashState(lockedHashRef.current, syncUrl);
        }
        return;
      }

      const sections = SECTION_CONFIG.reduce<
        Array<{ id: SectionId; element: HTMLElement }>
      >((acc, section) => {
        const element = document.getElementById(section.id);
        if (!element) return acc;

        acc.push({ id: section.id, element });
        return acc;
      }, []);

      if (!sections.length) {
        setHashState('', false);
        return;
      }

      const scrollTopWithOffset = window.scrollY + HEADER_OFFSET;
      const firstSectionTop = sections[0].element.offsetTop;

      if (scrollTopWithOffset < firstSectionTop - 8) {
        setHashState('', syncUrl);
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      const visibleSections = sections
        .map((section) => {
          const rect = section.element.getBoundingClientRect();
          const centerDistance = Math.abs(
            rect.top + rect.height / 2 - viewportCenter
          );
          const isVisible = rect.bottom > HEADER_OFFSET && rect.top < window.innerHeight;

          return {
            ...section,
            centerDistance,
            isVisible,
          };
        })
        .filter((section) => section.isVisible)
        .sort((a, b) => a.centerDistance - b.centerDistance);

      if (visibleSections.length) {
        setHashState(toHashFromId(visibleSections[0].id), syncUrl);
        return;
      }

      const latestPastSection = [...sections].reverse().find((section) => {
        return scrollTopWithOffset >= section.element.offsetTop;
      });

      setHashState(
        latestPastSection ? toHashFromId(latestPastSection.id) : '',
        syncUrl
      );
    },
    [pathname, setHashState]
  );

  const queueRecompute = useCallback(
    (syncUrl: boolean) => {
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        recomputeActiveSection(syncUrl);
      });
    },
    [recomputeActiveSection]
  );

  const setActiveHashFromHref = useCallback(
    (href: string) => {
      setHashState(toHashFromHref(href), false);
    },
    [setHashState]
  );

  const navigateToHref = useCallback(
    (href: string) => {
      if (pathname !== '/') return false;

      const targetHash = toHashFromHref(href);
      clearNavigationLock();
      navigationLockRef.current = true;
      lockedHashRef.current = targetHash;

      setHashState(targetHash, true);
      scrollToHashTarget(targetHash);

      navigationUnlockTimerRef.current = window.setTimeout(() => {
        clearNavigationLock();
        queueRecompute(true);
      }, NAVIGATION_LOCK_MS);

      return true;
    },
    [clearNavigationLock, pathname, queueRecompute, setHashState]
  );

  useEffect(() => {
    if (pathname !== '/') {
      setHashState('', false);
      return;
    }

    const initialHash = getValidLocationHash();
    if (initialHash && toIdFromHash(initialHash)) {
      setHashState(initialHash, false);
    } else {
      recomputeActiveSection(true);
    }

    const observer = new IntersectionObserver(
      () => queueRecompute(true),
      {
        threshold: OBSERVER_THRESHOLDS,
        rootMargin: OBSERVER_ROOT_MARGIN,
      }
    );

    SECTION_CONFIG.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    const onScroll = () => queueRecompute(true);
    const onResize = () => queueRecompute(true);
    const onHashChange = () => {
      if (navigationLockRef.current) return;

      const nextHash = getValidLocationHash();
      if (!nextHash || !toIdFromHash(nextHash)) {
        queueRecompute(true);
        return;
      }

      setHashState(nextHash, false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('hashchange', onHashChange);
      clearNavigationLock();
      clearUrlSyncTimer();

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    clearNavigationLock,
    clearUrlSyncTimer,
    pathname,
    queueRecompute,
    recomputeActiveSection,
    setHashState,
  ]);

  return {
    activeHash,
    setActiveHashFromHref,
    navigateToHref,
  };
}
