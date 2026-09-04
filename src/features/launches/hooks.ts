import { useQuery, useQueryClient } from "@tanstack/react-query";

import { initializeSync, syncLaunches } from "../../services/sync.service";
import { useAppStore } from "../../store/app.store";
import { fetchLaunchpad } from "../../api/launchpads";
import {
  getCachedLaunchpad,
  saveLaunchpad,
} from "../../database/launchpads.repository";

export const launchQueryKey = ["launches"] as const;

export const launchpadQueryKey = (launchpadId: string) =>
  ["launchpad", launchpadId] as const;

export function useLaunches() {
  const queryClient = useQueryClient();
  const setDataSource = useAppStore((state) => state.setDataSource);
  const setLastSyncedAt = useAppStore((state) => state.setLastSyncedAt);
  const setSyncError = useAppStore((state) => state.setSyncError);

  return useQuery({
    queryKey: launchQueryKey,
    queryFn: async () => {
      const cachedResult = await initializeSync();

      void syncLaunches()
        .then((syncedResult) => {
          setDataSource(syncedResult.source);
          setLastSyncedAt(syncedResult.lastSyncedAt);
          setSyncError(syncedResult.error?.message ?? null);
          queryClient.setQueryData(launchQueryKey, syncedResult);
        })
        .catch((error: unknown) => {
          console.error("Failed to synchronize launches:", error);
        });

      setDataSource(cachedResult.source);
      setLastSyncedAt(cachedResult.lastSyncedAt);
      setSyncError(cachedResult.error?.message ?? null);
      return cachedResult;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}

export function useLaunchpad(launchpadId: string | null) {
  return useQuery({
    queryKey: launchpadId
      ? launchpadQueryKey(launchpadId)
      : ["launchpad", "empty"],

    queryFn: async () => {
      if (!launchpadId) {
        return null;
      }

      // 1. Try local SQLite first
      const cachedLaunchpad = await getCachedLaunchpad(launchpadId);

      console.log("LAUNCHPAD ID:", launchpadId);
      console.log("CACHED LAUNCHPAD:", cachedLaunchpad);

      if (cachedLaunchpad) {
        return cachedLaunchpad;
      }

      // 2. Fetch from SpaceX API if not cached
      const launchpad = await fetchLaunchpad(launchpadId);

      // 3. Persist for offline usage
      await saveLaunchpad(launchpad);

      return launchpad;
    },

    enabled: launchpadId !== null,

    staleTime: 1000 * 60 * 60 * 24,

    gcTime: 1000 * 60 * 60 * 24 * 7,

    retry: 2,
  });
}
