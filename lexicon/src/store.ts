import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Store {
  addModalOpen: boolean;
  setAddModalOpen: (addModalOpen: boolean) => void;

  space: null | string;
  setSpace: (space: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  addModalOpen: false,
  setAddModalOpen: (addModalOpen: boolean) => set({ addModalOpen }),

  space: null,
  setSpace: (space: string) => set({ space }),
}));
