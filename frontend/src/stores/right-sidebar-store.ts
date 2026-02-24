import { createStore } from 'zustand/vanilla';

type RightSidebarStoreState = {
  isOpen: boolean;
};

type RightSidebarStoreActions = {
  toggleIsOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

export type RightSidebarStore = RightSidebarStoreState &
  RightSidebarStoreActions;
export type RightSidebarStoreApi = ReturnType<typeof createRightSidebarStore>;

const defaultRightSidebarState: RightSidebarStoreState = {
  isOpen: false,
};

export function createRightSidebarStore(
  initState: Partial<RightSidebarStoreState> = {}
) {
  return createStore<RightSidebarStore>()((set) => ({
    ...defaultRightSidebarState,
    ...initState,
    toggleIsOpen: () => {
      set((state) => ({
        isOpen: !state.isOpen,
      }));
    },
    setIsOpen: (isOpen) => {
      set({ isOpen });
    },
  }));
}
