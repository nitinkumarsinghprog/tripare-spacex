import { initializeDatabase } from "../database";
import { saveLaunches } from "../launches.repository";
import { saveLaunchpad } from "../launchpads.repository";

import { LAUNCH_FIXTURES } from "./launches.fixture";
import { LAUNCHPAD_FIXTURES } from "./launchpads.fixture";

export async function seedLaunchFixtures(): Promise<void> {
  await initializeDatabase();

  await saveLaunches(LAUNCH_FIXTURES);

  for (const launchpad of LAUNCHPAD_FIXTURES) {
    await saveLaunchpad(launchpad);
  }
}
