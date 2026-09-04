import { filterAndSortLaunches } from "../launch-filters";
import type { Launch } from "../../../../api/schemas";

function createLaunch(overrides: Partial<Launch> = {}): Launch {
  return {
    id: "launch-1",
    name: "Starlink Mission",
    date_utc: new Date().toISOString(),
    date_unix: Math.floor(Date.now() / 1000),
    success: true,
    upcoming: false,
    details: "Test launch",
    flight_number: 1,
    rocket: "rocket-1",
    launchpad: "launchpad-1",
    cores: [],
    links: {
      patch: {
        small: null,
        large: null,
      },
      webcast: null,
      youtube_id: null,
      wikipedia: null,
      article: null,
    },
    ...overrides,
  };
}

const defaultOptions = {
  search: "",
  datePreset: "all" as const,
  statuses: [],
  rocketIds: [],
  launchpadIds: [],
  sort: "date-newest" as const,
};

describe("filterAndSortLaunches", () => {
  it("returns all launches when no filters are applied", () => {
    const launches = [
      createLaunch({ id: "1" }),
      createLaunch({ id: "2" }),
      createLaunch({ id: "3" }),
    ];

    const result = filterAndSortLaunches(launches, defaultOptions);

    expect(result).toHaveLength(3);
  });

  it("filters launches by name search", () => {
    const launches = [
      createLaunch({
        id: "1",
        name: "Starlink Mission",
      }),
      createLaunch({
        id: "2",
        name: "GPS Launch",
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      search: "starlink",
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Starlink Mission");
  });

  it("search is case insensitive and trims whitespace", () => {
    const launches = [
      createLaunch({
        name: "Starlink Mission",
      }),
      createLaunch({
        name: "GPS Launch",
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      search: "  STARLINK  ",
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Starlink Mission");
  });

  it("filters upcoming launches", () => {
    const launches = [
      createLaunch({
        id: "upcoming",
        upcoming: true,
        success: null,
      }),
      createLaunch({
        id: "completed",
        upcoming: false,
        success: true,
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      statuses: ["upcoming"],
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("upcoming");
  });

  it("filters successful launches", () => {
    const launches = [
      createLaunch({
        id: "success",
        upcoming: false,
        success: true,
      }),
      createLaunch({
        id: "failure",
        upcoming: false,
        success: false,
      }),
      createLaunch({
        id: "upcoming",
        upcoming: true,
        success: null,
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      statuses: ["success"],
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("success");
  });

  it("filters failed launches", () => {
    const launches = [
      createLaunch({
        id: "success",
        success: true,
        upcoming: false,
      }),
      createLaunch({
        id: "failure",
        success: false,
        upcoming: false,
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      statuses: ["failure"],
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("failure");
  });

  it("supports multiple status filters", () => {
    const launches = [
      createLaunch({
        id: "success",
        success: true,
        upcoming: false,
      }),
      createLaunch({
        id: "failure",
        success: false,
        upcoming: false,
      }),
      createLaunch({
        id: "upcoming",
        success: null,
        upcoming: true,
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      statuses: ["success", "upcoming"],
    });

    expect(result).toHaveLength(2);
    expect(result.map((launch) => launch.id)).toEqual(
      expect.arrayContaining(["success", "upcoming"]),
    );
  });

  it("filters by rocket", () => {
    const launches = [
      createLaunch({
        id: "falcon",
        rocket: "falcon-9",
      }),
      createLaunch({
        id: "heavy",
        rocket: "falcon-heavy",
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      rocketIds: ["falcon-9"],
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("falcon");
  });

  it("filters by launchpad", () => {
    const launches = [
      createLaunch({
        id: "pad-1",
        launchpad: "lc-39a",
      }),
      createLaunch({
        id: "pad-2",
        launchpad: "sls-40",
      }),
      createLaunch({
        id: "no-pad",
        launchpad: null,
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      launchpadIds: ["lc-39a"],
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("pad-1");
  });

  it("sorts launches by oldest date", () => {
    const launches = [
      createLaunch({
        id: "new",
        date_unix: 300,
      }),
      createLaunch({
        id: "old",
        date_unix: 100,
      }),
      createLaunch({
        id: "middle",
        date_unix: 200,
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      sort: "date-oldest",
    });

    expect(result.map((launch) => launch.id)).toEqual(["old", "middle", "new"]);
  });

  it("sorts launches by newest date", () => {
    const launches = [
      createLaunch({
        id: "old",
        date_unix: 100,
      }),
      createLaunch({
        id: "new",
        date_unix: 300,
      }),
      createLaunch({
        id: "middle",
        date_unix: 200,
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      sort: "date-newest",
    });

    expect(result.map((launch) => launch.id)).toEqual(["new", "middle", "old"]);
  });

  it("sorts launches by name ascending", () => {
    const launches = [
      createLaunch({
        id: "z",
        name: "Zeta Mission",
      }),
      createLaunch({
        id: "a",
        name: "Alpha Mission",
      }),
      createLaunch({
        id: "b",
        name: "Beta Mission",
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      sort: "name-asc",
    });

    expect(result.map((launch) => launch.name)).toEqual([
      "Alpha Mission",
      "Beta Mission",
      "Zeta Mission",
    ]);
  });

  it("sorts launches by name descending", () => {
    const launches = [
      createLaunch({
        name: "Alpha Mission",
      }),
      createLaunch({
        name: "Zeta Mission",
      }),
      createLaunch({
        name: "Beta Mission",
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      sort: "name-desc",
    });

    expect(result.map((launch) => launch.name)).toEqual([
      "Zeta Mission",
      "Beta Mission",
      "Alpha Mission",
    ]);
  });

  it("combines search, status, rocket and launchpad filters", () => {
    const launches = [
      createLaunch({
        id: "match",
        name: "Starlink Mission",
        success: true,
        upcoming: false,
        rocket: "rocket-1",
        launchpad: "pad-1",
      }),
      createLaunch({
        id: "wrong-rocket",
        name: "Starlink Mission",
        success: true,
        upcoming: false,
        rocket: "rocket-2",
        launchpad: "pad-1",
      }),
      createLaunch({
        id: "wrong-status",
        name: "Starlink Mission",
        success: false,
        upcoming: false,
        rocket: "rocket-1",
        launchpad: "pad-1",
      }),
    ];

    const result = filterAndSortLaunches(launches, {
      ...defaultOptions,
      search: "starlink",
      statuses: ["success"],
      rocketIds: ["rocket-1"],
      launchpadIds: ["pad-1"],
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("match");
  });

  it("does not mutate the original launch array", () => {
    const launches = [
      createLaunch({
        id: "1",
        date_unix: 100,
      }),
      createLaunch({
        id: "2",
        date_unix: 300,
      }),
    ];

    const originalOrder = launches.map((launch) => launch.id);

    filterAndSortLaunches(launches, {
      ...defaultOptions,
      sort: "date-newest",
    });

    expect(launches.map((launch) => launch.id)).toEqual(originalOrder);
  });
});
