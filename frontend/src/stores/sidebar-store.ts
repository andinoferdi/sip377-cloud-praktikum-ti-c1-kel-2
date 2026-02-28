import { createStore } from 'zustand/vanilla';

type SidebarStoreState = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
};

type SidebarStoreActions = {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  syncViewport: (isMobile: boolean) => void;
};

export type SidebarStore = SidebarStoreState & SidebarStoreActions;
export type SidebarStoreApi = ReturnType<typeof createSidebarStore>;

const defaultSidebarState: SidebarStoreState = {
  isExpanded: true,
  isMobileOpen: false,
  isMobile: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
};

export function createSidebarStore(
  initState: Partial<SidebarStoreState> = {}
) {
  return createStore<SidebarStore>()((set) => ({
    ...defaultSidebarState,
    ...initState,
    toggleSidebar: () => {
      set((state) => ({
        isExpanded: !state.isExpanded,
      }));
    },
    toggleMobileSidebar: () => {
      set((state) => ({
        isMobileOpen: !state.isMobileOpen,
      }));
    },
    setIsHovered: (isHovered) => {
      set({ isHovered });
    },
    setActiveItem: (activeItem) => {
      set({ activeItem });
    },
    toggleSubmenu: (item) => {
      set((state) => ({
        openSubmenu: state.openSubmenu === item ? null : item,
      }));
    },
    syncViewport: (isMobile) => {
      set((state) => ({
        isMobile,
        isMobileOpen: isMobile ? state.isMobileOpen : false,
      }));
    },
  }));
}
