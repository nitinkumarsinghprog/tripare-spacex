import { fetchLaunches } from "../api/launches";
import {
  saveLaunches,
  getCachedLaunches,
  getLastSyncTime,
} from "../database/launches.repository";
import { initializeDatabase } from "../database/database";
import { runMigrations } from "../database/migrations";
import { isNetworkAvailable } from "./network.service";
import { logger } from "./logging.service";

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

export interface SyncResult {
  source: "network" | "cache";
  launches: Awaited<ReturnType<typeof getCachedLaunches>>;
  lastSyncedAt: string | null;
  error: Error | null;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function fetchWithRetry(): Promise<
  Awaited<ReturnType<typeof fetchLaunches>>
> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fetchLaunches();
    } catch (error: unknown) {
      lastError = error;

      logger.warn(`Launch sync attempt ${attempt + 1} failed`, error);

      if (attempt === MAX_RETRIES) {
        break;
      }

      const retryDelay = BASE_RETRY_DELAY * Math.pow(2, attempt);

      await delay(retryDelay);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Launch synchronization failed");
}

export async function initializeSync(): Promise<SyncResult> {
  await initializeDatabase();
  await runMigrations();

  const cachedLaunches = await getCachedLaunches();
  const cachedSyncTime = await getLastSyncTime();

  const networkAvailable = await isNetworkAvailable();

  if (!networkAvailable) {
    logger.info("Offline: using cached launches");

    return {
      source: "cache",
      launches: cachedLaunches,
      lastSyncedAt: cachedSyncTime,
      error:
        cachedLaunches.length > 0
          ? null
          : new Error("No cached launch data available"),
    };
  }

  try {
    const launches = await fetchWithRetry();

    await saveLaunches(launches);

    const lastSyncedAt = await getLastSyncTime();

    logger.info(`Launch sync completed: ${launches.length} launches`);

    return {
      source: "network",
      launches,
      lastSyncedAt,
      error: null,
    };
  } catch (error: unknown) {
    logger.error("Launch sync failed; using cached data", error);

    return {
      source: "cache",
      launches: cachedLaunches,
      lastSyncedAt: cachedSyncTime,
      error:
        error instanceof Error
          ? error
          : new Error("Unable to synchronize launches"),
    };
  }
}

export async function syncLaunches(): Promise<SyncResult> {
  const networkAvailable = await isNetworkAvailable();

  if (!networkAvailable) {
    const launches = await getCachedLaunches();
    const lastSyncedAt = await getLastSyncTime();

    return {
      source: "cache",
      launches,
      lastSyncedAt,
      error: new Error("You are offline"),
    };
  }

  try {
    const launches = await fetchWithRetry();

    await saveLaunches(launches);

    const lastSyncedAt = await getLastSyncTime();

    return {
      source: "network",
      launches,
      lastSyncedAt,
      error: null,
    };
  } catch (error: unknown) {
    const launches = await getCachedLaunches();
    const lastSyncedAt = await getLastSyncTime();

    return {
      source: "cache",
      launches,
      lastSyncedAt,
      error:
        error instanceof Error ? error : new Error("Synchronization failed"),
    };
  }
}
