import { getDatabase } from "./database";

export interface Bookmark {
  launchId: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function saveBookmark(
  launchId: string,
  note: string | null = null,
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO bookmarks (
      launch_id,
      note,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?)
    ON CONFLICT(launch_id)
    DO UPDATE SET
      note = excluded.note,
      updated_at = excluded.updated_at
    `,
    launchId,
    note,
    now,
    now,
  );
}

export async function removeBookmark(launchId: string): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
    DELETE FROM bookmarks
    WHERE launch_id = ?
    `,
    launchId,
  );
}

export async function isBookmarked(launchId: string): Promise<boolean> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{ launch_id: string }>(
    `
    SELECT launch_id
    FROM bookmarks
    WHERE launch_id = ?
    `,
    launchId,
  );

  return row !== null;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    launch_id: string;
    note: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `
    SELECT
      launch_id,
      note,
      created_at,
      updated_at
    FROM bookmarks
    ORDER BY updated_at DESC
    `,
  );

  return rows.map((row) => ({
    launchId: row.launch_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
