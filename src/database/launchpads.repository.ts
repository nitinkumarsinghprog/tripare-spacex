import { getDatabase } from "./database";
import type { Launchpad } from "../api/launchpad.schemas";

export async function saveLaunchpad(launchpad: Launchpad): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
    INSERT OR REPLACE INTO launchpads (
      id,
      name,
      full_name,
      status,
      locality,
      region,
      latitude,
      longitude,
      launch_attempts,
      launch_successes,
      details,
      data_json,
      synced_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    launchpad.id,
    launchpad.name,
    launchpad.full_name,
    launchpad.status,
    launchpad.locality,
    launchpad.region,
    launchpad.latitude,
    launchpad.longitude,
    launchpad.launch_attempts,
    launchpad.launch_successes,
    launchpad.details,
    JSON.stringify(launchpad),
    new Date().toISOString(),
  );
}

export async function getCachedLaunchpad(
  id: string,
): Promise<Launchpad | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{
    data_json: string;
  }>(
    `
    SELECT data_json
    FROM launchpads
    WHERE id = ?
    `,
    id,
  );

  if (!row) {
    return null;
  }

  return JSON.parse(row.data_json) as Launchpad;
}

export async function getCachedLaunchpads(): Promise<Launchpad[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ data_json: string }>(
    "SELECT data_json FROM launchpads ORDER BY name ASC",
  );
  return rows.map((row) => JSON.parse(row.data_json) as Launchpad);
}
