import { create } from "zustand";

export type DatePreset = "30d" | "1y" | "all";
export type LaunchStatus = "success" | "failure" | "upcoming";

export type SortOption =
  | "date-newest"
  | "date-oldest"
  | "name-asc"
  | "name-desc";

interface FilterState {
  search: string;
  datePreset: DatePreset;
  statuses: LaunchStatus[];
  rocketIds: string[];
  launchpadIds: string[];
  sort: SortOption;

  setSearch: (search: string) => void;
  setDatePreset: (preset: DatePreset) => void;
  toggleStatus: (status: LaunchStatus) => void;
  toggleRocket: (rocketId: string) => void;
  toggleLaunchpad: (launchpadId: string) => void;
  setSort: (sort: SortOption) => void;
  reset: () => void;
}

const initialState = {
  search: "",
  datePreset: "all" as DatePreset,
  statuses: [] as LaunchStatus[],
  rocketIds: [] as string[],
  launchpadIds: [] as string[],
  sort: "date-newest" as SortOption,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,

  setSearch: (search) => set({ search }),

  setDatePreset: (datePreset) => set({ datePreset }),

  toggleStatus: (status) =>
    set((state) => ({
      statuses: state.statuses.includes(status)
        ? state.statuses.filter((item) => item !== status)
        : [...state.statuses, status],
    })),

  toggleRocket: (rocketId) =>
    set((state) => ({
      rocketIds: state.rocketIds.includes(rocketId)
        ? state.rocketIds.filter((id) => id !== rocketId)
        : [...state.rocketIds, rocketId],
    })),

  toggleLaunchpad: (launchpadId) =>
    set((state) => ({
      launchpadIds: state.launchpadIds.includes(launchpadId)
        ? state.launchpadIds.filter((id) => id !== launchpadId)
        : [...state.launchpadIds, launchpadId],
    })),

  setSort: (sort) => set({ sort }),

  reset: () => set(initialState),
}));
