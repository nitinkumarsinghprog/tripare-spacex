import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAppStore } from "../store/app.store";
import { subscribeToNetworkChanges } from "../services/network.service";
import { launchQueryKey } from "../features/launches/hooks";

export function useAppInitialization(): void {
  const queryClient = useQueryClient();

  const setOffline = useAppStore((state) => state.setOffline);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkChanges((isConnected) => {
      setOffline(!isConnected);

      if (isConnected) {
        void queryClient.invalidateQueries({
          queryKey: launchQueryKey,
        });
      }
    });

    return unsubscribe;
  }, [queryClient, setOffline]);
}
