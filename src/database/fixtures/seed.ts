import { initializeDatabase } from "../database";
import { saveLaunches } from "../launches.repository";
import { LAUNCH_FIXTURES } from "./launches.fixture";

export async function seedLaunchFixtures(): Promise<void> {
  await initializeDatabase();
  await saveLaunches(LAUNCH_FIXTURES);
}
