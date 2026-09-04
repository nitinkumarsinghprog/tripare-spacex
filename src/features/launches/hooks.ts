import { useQuery } from "@tanstack/react-query";
import { initializeSync } from "../../services/sync.service";

export const launchQueryKey = ["launches"] as const;

export function useLaunches() {
  return useQuery({
    queryKey: launchQueryKey,
    queryFn: initializeSync,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}
