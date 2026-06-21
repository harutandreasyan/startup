import { create } from 'zustand';

const KEY = 'creatorai-sidebar-collapsed';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

function initial(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY) === '1';
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: initial(),
  toggle: () => {
    const next = !get().collapsed;
    localStorage.setItem(KEY, next ? '1' : '0');
    set({ collapsed: next });
  },
}));
