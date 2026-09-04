import { getDatabase } from "./database";
import type { Launch } from "../api/schemas";

export async function saveLaunches(launches: Launch[]): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    for (const launch of launches) {
      const imageUrl = launch.links.patch.small;
      const webcastUrl = launch.links.webcast;

      await db.runAsync(
        `
        INSERT OR REPLACE INTO launches (
          id,
          name,
          date_utc,
          date_unix,
          success,
          upcoming,
          details,
          flight_number,
          rocket_id,
          launchpad_id,
          image_url,
          webcast_url,
          data_json,
          synced_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        launch.id,
        launch.name,
        launch.date_utc,
        launch.date_unix,
        launch.success === null ? null : launch.success ? 1 : 0,
        launch.upcoming ? 1 : 0,
        launch.details,
        launch.flight_number,
        launch.rocket,
        launch.launchpad,
        imageUrl,
        webcastUrl,
        JSON.stringify(launch),
        new Date().toISOString(),
      );
    }
  });
}

export async function getCachedLaunches(): Promise<Launch[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    data_json: string;
  }>(
    `
    SELECT data_json
    FROM launches
    ORDER BY date_unix DESC
    `,
  );

  return rows.map((row) => JSON.parse(row.data_json) as Launch);
}

export async function getCachedLaunch(id: string): Promise<Launch | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{
    data_json: string;
  }>(
    `
    SELECT data_json
    FROM launches
    WHERE id = ?
    `,
    id,
  );

  if (!row) {
    return null;
  }

  return JSON.parse(row.data_json) as Launch;
}

export async function getLastSyncTime(): Promise<string | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{
    synced_at: string;
  }>(
    `
    SELECT synced_at
    FROM launches
    ORDER BY synced_at DESC
    LIMIT 1
    `,
  );

  return row?.synced_at ?? null;
}
