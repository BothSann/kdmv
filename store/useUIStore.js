import { create } from "zustand";

const useUIStore = create((set) => ({
  isPaginating: false,
  setPaginating: (isPaginating) => set({ isPaginating }),
}));

export default useUIStore;
