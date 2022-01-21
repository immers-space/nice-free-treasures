import createVanilla from "zustand/vanilla";
import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const store = createVanilla(
  subscribeWithSelector((set) => ({
    isTreasureOpen: false,
    selectedPanel: "Open",
    closeTreasure: () => set({ isTreasureOpen: false, selectedPanel: "Open" }),
    openTreasure: () => set({ isTreasureOpen: true, selectedPanel: "Claim" }),
    setSelectedPanel: (panel) => set({ selectedPanel: panel }),
  }))
);

export const useStore = create(store);
