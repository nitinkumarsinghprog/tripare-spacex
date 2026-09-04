import { apiGet } from "./client";
import { LaunchesSchema, LaunchSchema, type Launch } from "./schemas";

export async function fetchLaunches(signal?: AbortSignal): Promise<Launch[]> {
  const data = await apiGet<unknown>("/v5/launches", signal);

  return LaunchesSchema.parse(data);
}

export async function fetchLaunch(
  id: string,
  signal?: AbortSignal,
): Promise<Launch> {
  const data = await apiGet<unknown>(`/v5/launches/${id}`, signal);

  return LaunchSchema.parse(data);
}
