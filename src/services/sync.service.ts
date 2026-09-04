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

  if (launches.length > 0) {
    const hasOutdatedFixtureMedia = launches.some(
      (launch) =>
        launch.id.startsWith("fixture-launch-") &&
        (launch.links.patch.small !== null ||
          launch.links.patch.large !== null ||
          launch.links.webcast !== null ||
          launch.links.article !== null ||
          launch.links.wikipedia !== null),
    );

    if (hasOutdatedFixtureMedia) {
      logger.info("Updating development fixtures to remove placeholder media");

      await seedLaunchFixtures();
      launches = await getCachedLaunches();
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

  // 3. Return locally available data immediately. Remote synchronization is
  // started in the background by useLaunches so a slow network cannot block
  // the initial screen.
  const cachedLaunches = await getCachedOrSeedLaunches();
  const cachedSyncTime = await getLastSyncTime();

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
