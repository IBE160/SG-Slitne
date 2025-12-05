// Ultra-minimal store test
import { create } from 'zustand';

interface SimpleStore {
  count: number;
  increment: () => void;
}

export const useSimpleStore = create<SimpleStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
