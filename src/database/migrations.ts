import { getDatabase } from "./database";

const CURRENT_SCHEMA_VERSION = 1;

export async function runMigrations(): Promise<void> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};
    `);
  }
}
