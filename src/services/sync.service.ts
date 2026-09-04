import { fetchLaunches } from "../api/launches";

import {
  saveLaunches,
  getCachedLaunches,
  getLastSyncTime,
} from "../database/launches.repository";

import {
  getCachedLaunchpad,
  saveLaunchpad,
} from "../database/launchpads.repository";

import { initializeDatabase } from "../database/database";
import { runMigrations } from "../database/migrations";
import { isNetworkAvailable } from "./network.service";
import { logger } from "./logging.service";

import { seedLaunchFixtures } from "../database/fixtures/seed";
import { LAUNCHPAD_FIXTURES } from "../database/fixtures/launchpads.fixture";

const MAX_RETRIES = 1;
const BASE_RETRY_DELAY = 500;

let syncPromise: Promise<SyncResult> | null = null;

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

/**
 * Make sure launchpad fixtures exist in SQLite.
 *
 * This is important because the SpaceX API may be unavailable.
 * Launches can exist in cache while their related launchpads
 * are missing.
 */
async function ensureLaunchpadFixtures(): Promise<void> {
  for (const launchpad of LAUNCHPAD_FIXTURES) {
    const cachedLaunchpad = await getCachedLaunchpad(launchpad.id);

    if (!cachedLaunchpad) {
      await saveLaunchpad(launchpad);

      logger.info(`Seeded launchpad fixture: ${launchpad.id}`);
    }
  }
}

/**
 * Get launches from SQLite.
 *
 * If no launches exist, seed development fixtures.
 * Also make sure all launchpad fixtures exist.
 */
async function getCachedOrSeedLaunches(): Promise<
  Awaited<ReturnType<typeof getCachedLaunches>>
> {
  let launches = await getCachedLaunches();

  // Development fixtures are deterministic.
  // Refresh them so changes to fixture data (such as Media URLs)
  // are reflected in SQLite.
  if (launches.length > 0) {
    const isFixtureData = launches.some((launch) =>
      launch.id.startsWith("fixture-launch-"),
    );

    if (isFixtureData) {
      logger.info(
        "Development fixtures detected; refreshing SQLite fixture data",
      );

      await seedLaunchFixtures();

      launches = await getCachedLaunches();

      logger.info(
        `Development fixtures refreshed: ${launches.length} launches`,
      );

      return launches;
    }

    return launches;
  }

  logger.info("No cached launches found; seeding development fixtures");

  await seedLaunchFixtures();

  launches = await getCachedLaunches();

  logger.info(`Development fixtures ready: ${launches.length} launches`);

  return launches;
}

export async function initializeSync(): Promise<SyncResult> {
  // 1. Make sure database exists
  await initializeDatabase();

  // 2. Run migrations
  await runMigrations();

  // 3. Get cached launches and make sure launchpads exist
  const cachedLaunches = await getCachedOrSeedLaunches();

  const cachedSyncTime = await getLastSyncTime();

  // 4. Check network
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

  // 5. Try SpaceX API
  try {
    const launches = await fetchWithRetry();

    await saveLaunches(launches);

    // Keep launchpad fixtures available even when
    // the launchpad API is unavailable.
    await ensureLaunchpadFixtures();

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

    // API failure (including 525) should not affect
    // launchpad availability from local SQLite.
    await ensureLaunchpadFixtures();

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

export function syncLaunches(): Promise<SyncResult> {
  if (syncPromise !== null) {
    return syncPromise;
  }

  syncPromise = performSync();

  return syncPromise.finally(() => {
    syncPromise = null;
  });
}

async function performSync(): Promise<SyncResult> {
  // Make sure DB + migrations are also available
  // when this function is called independently.
  await initializeDatabase();
  await runMigrations();

  const networkAvailable = await isNetworkAvailable();

  if (!networkAvailable) {
    const launches = await getCachedOrSeedLaunches();
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

    await ensureLaunchpadFixtures();

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

    const launches = await getCachedOrSeedLaunches();

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
