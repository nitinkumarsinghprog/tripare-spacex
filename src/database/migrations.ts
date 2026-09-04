import { getDatabase } from "./database";

const CURRENT_SCHEMA_VERSION = 2;

export async function runMigrations(): Promise<void> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA user_version = 1;
    `);
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS launchpads (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        status TEXT NOT NULL,
        locality TEXT NOT NULL,
        region TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        launch_attempts INTEGER NOT NULL,
        launch_successes INTEGER NOT NULL,
        details TEXT,
        data_json TEXT NOT NULL,
        synced_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_launchpads_name
        ON launchpads(name);

      CREATE INDEX IF NOT EXISTS idx_launchpads_location
        ON launchpads(latitude, longitude);

      PRAGMA user_version = 2;
    `);
  }
}
