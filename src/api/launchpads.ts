import { apiGet } from "./client";
import { LaunchpadSchema, type Launchpad } from "./launchpad.schemas";

export async function fetchLaunchpad(launchpadId: string): Promise<Launchpad> {
  const data = await apiGet<unknown>(`/v4/launchpads/${launchpadId}`);

  return LaunchpadSchema.parse(data);
}
