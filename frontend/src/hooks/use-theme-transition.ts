"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

type ThemeMode = "light" | "dark";

export function useThemeTransition() {
  const { resolvedTheme, setTheme } = useTheme();
  const restoreTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (restoreTimerRef.current !== null) {
        window.clearTimeout(restoreTimerRef.current);
      }
      document.documentElement.classList.remove("theme-switching");
    };
  }, []);

  const setThemeWithTransition = useCallback(
    (nextTheme: ThemeMode) => {
      const root = document.documentElement;
      root.classList.add("theme-switching");

      if (restoreTimerRef.current !== null) {
        window.clearTimeout(restoreTimerRef.current);
      }

      setTheme(nextTheme);

      restoreTimerRef.current = window.setTimeout(() => {
        root.classList.remove("theme-switching");
        restoreTimerRef.current = null;
      }, 180);
    },
    [setTheme]
  );

  const toggleThemeWithTransition = useCallback(() => {
    const currentTheme: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";
    const nextTheme: ThemeMode = currentTheme === "dark" ? "light" : "dark";

    setThemeWithTransition(nextTheme);
  }, [resolvedTheme, setThemeWithTransition]);

  return {
    resolvedTheme,
    setThemeWithTransition,
    toggleThemeWithTransition,
  };
}

