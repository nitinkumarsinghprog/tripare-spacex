import { getDatabase } from "./database";

const CURRENT_SCHEMA_VERSION = 3;

export async function runMigrations(): Promise<void> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  let currentVersion = result?.user_version ?? 0;

  // Migration 1
  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA user_version = 1;
    `);

    currentVersion = 1;
  }

  // Migration 2 - Launchpads
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

    currentVersion = 2;
  }

  // Migration 3 - Bookmarks
  if (currentVersion < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        launch_id TEXT PRIMARY KEY NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (launch_id) REFERENCES launches(id)
          ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_bookmarks_updated
        ON bookmarks(updated_at);

      PRAGMA user_version = 3;
    `);

    currentVersion = 3;
  }

  if (currentVersion !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Database migration failed. Expected schema version ${CURRENT_SCHEMA_VERSION}, got ${currentVersion}.`,
    );
  }
}
