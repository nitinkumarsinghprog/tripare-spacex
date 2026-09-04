import type { Launch } from "../../../api/schemas";
import type {
  DatePreset,
  LaunchStatus,
  SortOption,
} from "../../../store/filter.store";

interface LaunchFilterOptions {
  search: string;
  datePreset: DatePreset;
  statuses: LaunchStatus[];
  rocketIds: string[];
  launchpadIds: string[];
  sort: SortOption;
}

function getDateCutoff(preset: DatePreset): number | null {
  if (preset === "all") {
    return null;
  }

  const now = Date.now();

  if (preset === "30d") {
    return now - 30 * 24 * 60 * 60 * 1000;
  }

  return now - 365 * 24 * 60 * 60 * 1000;
}

function matchesStatus(launch: Launch, statuses: LaunchStatus[]): boolean {
  if (statuses.length === 0) {
    return true;
  }

  if (statuses.includes("upcoming") && launch.upcoming) {
    return true;
  }

  if (
    statuses.includes("success") &&
    !launch.upcoming &&
    launch.success === true
  ) {
    return true;
  }

  if (
    statuses.includes("failure") &&
    !launch.upcoming &&
    launch.success === false
  ) {
    return true;
  }

  return false;
}

export function filterAndSortLaunches(
  launches: Launch[],
  options: LaunchFilterOptions,
): Launch[] {
  const search = options.search.trim().toLowerCase();
  const cutoff = getDateCutoff(options.datePreset);

  const filtered = launches.filter((launch) => {
    if (search.length > 0 && !launch.name.toLowerCase().includes(search)) {
      return false;
    }

    if (
      cutoff !== null &&
      launch.date_unix * 1000 < cutoff &&
      !launch.upcoming
    ) {
      return false;
    }

    if (!matchesStatus(launch, options.statuses)) {
      return false;
    }

    if (
      options.rocketIds.length > 0 &&
      !options.rocketIds.includes(launch.rocket)
    ) {
      return false;
    }

    if (
      options.launchpadIds.length > 0 &&
      (launch.launchpad === null ||
        !options.launchpadIds.includes(launch.launchpad))
    ) {
      return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (options.sort) {
      case "date-oldest":
        return a.date_unix - b.date_unix;

      case "name-asc":
        return a.name.localeCompare(b.name);

      case "name-desc":
        return b.name.localeCompare(a.name);

      case "date-newest":
      default:
        return b.date_unix - a.date_unix;
    }
  });
}
