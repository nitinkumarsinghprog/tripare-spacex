import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAppStore } from "../store/app.store";
import { subscribeToNetworkChanges } from "../services/network.service";

import { initializeSync, syncLaunches } from "../services/sync.service";

import { launchQueryKey } from "../features/launches/hooks";

export function useAppInitialization(): void {
  const queryClient = useQueryClient();

  const setOffline = useAppStore((state) => state.setOffline);
  const setSyncing = useAppStore((state) => state.setSyncing);
  const setDataSource = useAppStore((state) => state.setDataSource);
  const setLastSyncedAt = useAppStore((state) => state.setLastSyncedAt);
  const setSyncError = useAppStore((state) => state.setSyncError);

  useEffect(() => {
    let mounted = true;

    async function initialize(): Promise<void> {
      if (!mounted) {
        return;
      }

      setSyncing(true);

      try {
        const result = await initializeSync();

        if (!mounted) {
          return;
        }

        setDataSource(result.source);
        setLastSyncedAt(result.lastSyncedAt);
        setSyncError(result.error?.message ?? null);

        queryClient.setQueryData(launchQueryKey, result);
      } finally {
        if (mounted) {
          setSyncing(false);
        }
      }
    }

    void initialize();

    const unsubscribe = subscribeToNetworkChanges((isConnected) => {
      setOffline(!isConnected);

      if (isConnected) {
        void syncLaunches().then((result) => {
          if (!mounted) {
            return;
          }

          setDataSource(result.source);
          setLastSyncedAt(result.lastSyncedAt);
          setSyncError(result.error?.message ?? null);

          queryClient.setQueryData(launchQueryKey, result);
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [
    queryClient,
    setDataSource,
    setLastSyncedAt,
    setOffline,
    setSyncError,
    setSyncing,
  ]);
}
