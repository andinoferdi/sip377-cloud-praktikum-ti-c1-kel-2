"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
import {
  createSidebarStore,
  type SidebarStore,
  type SidebarStoreApi,
} from "@/stores/sidebar-store";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

const SidebarStoreContext = createContext<SidebarStoreApi | null>(null);

function useSidebarStore<T>(selector: (state: SidebarStore) => T): T {
  const sidebarStore = useContext(SidebarStoreContext);

  if (!sidebarStore) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return useStore(sidebarStore, selector);
}

export function useSidebar(): SidebarContextType {
  const isExpanded = useSidebarStore((state) =>
    state.isMobile ? false : state.isExpanded
  );
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const isHovered = useSidebarStore((state) => state.isHovered);
  const activeItem = useSidebarStore((state) => state.activeItem);
  const openSubmenu = useSidebarStore((state) => state.openSubmenu);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useSidebarStore(
    (state) => state.toggleMobileSidebar
  );
  const setIsHovered = useSidebarStore((state) => state.setIsHovered);
  const setActiveItem = useSidebarStore((state) => state.setActiveItem);
  const toggleSubmenu = useSidebarStore((state) => state.toggleSubmenu);

  return {
    isExpanded,
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
  };
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarStore] = useState<SidebarStoreApi>(() => createSidebarStore());

  useEffect(() => {
    const syncViewport = () => {
      sidebarStore.getState().syncViewport(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
    };
  }, [sidebarStore]);

  return (
    <SidebarStoreContext.Provider value={sidebarStore}>
      {children}
    </SidebarStoreContext.Provider>
  );
}
