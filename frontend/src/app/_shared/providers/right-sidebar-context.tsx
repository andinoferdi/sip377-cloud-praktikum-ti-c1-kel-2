"use client";

import { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import {
  createRightSidebarStore,
  type RightSidebarStore,
  type RightSidebarStoreApi,
} from "@/stores/right-sidebar-store";

type ContextValues = {
  isOpen: boolean;
  toggleIsOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

const RightSidebarStoreContext = createContext<RightSidebarStoreApi | null>(
  null
);

function useRightSidebarStore<T>(
  selector: (state: RightSidebarStore) => T
): T {
  const rightSidebarStore = useContext(RightSidebarStoreContext);

  if (!rightSidebarStore) {
    throw new Error(
      "useRightSidebarContext must be used within a RightSidebarProvider"
    );
  }

  return useStore(rightSidebarStore, selector);
}

export function RightSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rightSidebarStore] = useState<RightSidebarStoreApi>(() =>
    createRightSidebarStore()
  );

  return (
    <RightSidebarStoreContext.Provider value={rightSidebarStore}>
      {children}
    </RightSidebarStoreContext.Provider>
  );
}

export function useRightSidebarContext(): ContextValues {
  const isOpen = useRightSidebarStore((state) => state.isOpen);
  const toggleIsOpen = useRightSidebarStore((state) => state.toggleIsOpen);
  const setIsOpen = useRightSidebarStore((state) => state.setIsOpen);

  return {
    isOpen,
    toggleIsOpen,
    setIsOpen,
  };
}
