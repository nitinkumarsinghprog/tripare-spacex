import type { Launch } from "../../api/schemas";

const ROCKETS = [
  "5e9d0d95eda69973a809d1ec",
  "5e9d0d95eda69955f709d1eb",
  "5e9d0d95eda69974db09d1ed",
];

const LAUNCHPADS = [
  "5e9e4502f5090995de566f86",
  "5e9e4501f509094ba4566f84",
  "5e9e4501f509092b78566f83",
  "5e9e4502f509094188566f88",
];

const MISSION_PREFIXES = [
  "Starlink",
  "GPS",
  "Transporter",
  "CRS",
  "Crew",
  "Falcon",
  "Dragon",
  "Globalstar",
];

const MISSION_SUFFIXES = [
  "Mission",
  "Deployment",
  "Resupply",
  "Launch",
  "Flight",
  "Batch",
];

function createLaunch(index: number): Launch {
  const year = 2015 + (index % 12);
  const month = index % 12;
  const day = (index % 27) + 1;

  const date = new Date(
    Date.UTC(year, month, day, 12, 0, 0),
  );

  const isUpcoming = index < 20;
  const success = isUpcoming
    ? null
    : index % 17 === 0
      ? false
      : true;

  const prefix =
    MISSION_PREFIXES[index % MISSION_PREFIXES.length];

  const suffix =
    MISSION_SUFFIXES[index % MISSION_SUFFIXES.length];

  const missionNumber = Math.floor(index / 8) + 1;

  const id = `fixture-launch-${String(index + 1).padStart(4, "0")}`;

  return {
    id,
    name: `${prefix} ${missionNumber} ${suffix}`,
    date_utc: date.toISOString(),
    date_unix: Math.floor(date.getTime() / 1000),
    success,
    upcoming: isUpcoming,
    details: `Development fixture mission ${index + 1}. This deterministic record is used to test offline browsing, filtering, sorting, and 1000+ item list performance.`,
    flight_number: index + 1,
    rocket: ROCKETS[index % ROCKETS.length],
    launchpad: LAUNCHPADS[index % LAUNCHPADS.length],
    cores: [
      {
        flight: (index % 15) + 1,
        reused: index % 3 !== 0,
        gridfins: true,
        legs: true,
        landing_attempt: !isUpcoming,
        landing_success: !isUpcoming && index % 11 !== 0,
        landing_type: "ASDS",
        landpad: LAUNCHPADS[index % LAUNCHPADS.length],
      },
    ],
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
  };
}

export const LAUNCH_FIXTURES: Launch[] = Array.from(
  { length: 1200 },
  (_, index) => createLaunch(index),
);
