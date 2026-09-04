import { create } from "zustand";

export type DataSource = "network" | "cache";

interface AppState {
  isOffline: boolean;
  isSyncing: boolean;
  dataSource: DataSource;
  lastSyncedAt: string | null;
  syncError: string | null;

  setOffline: (value: boolean) => void;
  setSyncing: (value: boolean) => void;
  setDataSource: (value: DataSource) => void;
  setLastSyncedAt: (value: string | null) => void;
  setSyncError: (value: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOffline: false,
  isSyncing: false,
  dataSource: "cache",
  lastSyncedAt: null,
  syncError: null,

  setOffline: (value) => set({ isOffline: value }),
  setSyncing: (value) => set({ isSyncing: value }),
  setDataSource: (value) => set({ dataSource: value }),
  setLastSyncedAt: (value) => set({ lastSyncedAt: value }),
  setSyncError: (value) => set({ syncError: value }),
}));
