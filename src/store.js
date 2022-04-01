import createVanilla from "zustand/vanilla";
import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const store = createVanilla(
  subscribeWithSelector((set, get) => ({
    isTreasureOpen: false,
    selectedPanel: "Open",
    showSelfieFrame: false,
    shouldRenderSelfie: false,
    thumbnailUrl: null,
    thumbnailBlob: null,
    avatarBlobl: null,
    paused: false,
    closeTreasure: () => set({ isTreasureOpen: false, selectedPanel: "Open" }),
    openTreasure: () => set({ isTreasureOpen: true, selectedPanel: "Claim" }),
    setSelectedPanel: (panel) => set({ selectedPanel: panel }),
    setShowSelfieFrame: (showSelfieFrame) => set({ showSelfieFrame }),
    setShouldRenderSelfie: (shouldRenderSelfie) => set({ shouldRenderSelfie }),
    setThumbnailUrl: (thumbnailUrl) => {
      const { thumbnailUrl: previous } = get();
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      set({ thumbnailUrl });
    },
    setPaused: (paused) => set({ paused }),
  }))
);

export const useStore = create(store);
