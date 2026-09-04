import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "tripare.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS launches (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      date_utc TEXT NOT NULL,
      date_unix INTEGER NOT NULL,
      success INTEGER,
      upcoming INTEGER NOT NULL,
      details TEXT,
      flight_number INTEGER,
      rocket_id TEXT NOT NULL,
      launchpad_id TEXT,
      image_url TEXT,
      webcast_url TEXT,
      data_json TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_launches_date
      ON launches(date_unix);

    CREATE INDEX IF NOT EXISTS idx_launches_name
      ON launches(name);

    CREATE INDEX IF NOT EXISTS idx_launches_status
      ON launches(success, upcoming);

    CREATE INDEX IF NOT EXISTS idx_launches_rocket
      ON launches(rocket_id);

    CREATE INDEX IF NOT EXISTS idx_launches_launchpad
      ON launches(launchpad_id);

    CREATE TABLE IF NOT EXISTS bookmarks (
      launch_id TEXT PRIMARY KEY NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (launch_id) REFERENCES launches(id)
        ON DELETE CASCADE
    );
  `);
}
