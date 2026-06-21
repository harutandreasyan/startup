import { create, type StoreApi, type UseBoundStore } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (type: ToastType, message: string) => void;
  dismiss: (id: string) => void;
}

let counter = 0;

function createStore() {
  return create<ToastState>((set) => ({
    toasts: [],
    push: (type, message) => {
      const id = `toast-${++counter}`;
      set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 4000);
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  }));
}

// Guard against duplicate module evaluation (Vite/HMR) creating two stores —
// the toast() helper and <Toaster/> must share ONE store instance.
const g = globalThis as unknown as { __creatoraiToastStore?: UseBoundStore<StoreApi<ToastState>> };
export const useToastStore = g.__creatoraiToastStore ?? (g.__creatoraiToastStore = createStore());

/** Fire-and-forget toast helpers usable anywhere (no hook needed). */
export const toast = {
  success: (message: string) => useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
  info: (message: string) => useToastStore.getState().push('info', message),
};
