import { z } from "zod";

const CoreSchema = z.object({
  flight: z.number().nullable(),
  reused: z.boolean().nullable(),
  gridfins: z.boolean().nullable(),
  legs: z.boolean().nullable(),
  landing_attempt: z.boolean().nullable(),
  landing_success: z.boolean().nullable(),
  landing_type: z.string().nullable(),
  landpad: z.string().nullable(),
});

const LinksSchema = z.object({
  patch: z.object({
    small: z.string().nullable(),
    large: z.string().nullable(),
  }),
  webcast: z.string().nullable(),
  youtube_id: z.string().nullable(),
  wikipedia: z.string().nullable(),
  article: z.string().nullable(),
});

export const LaunchSchema = z.object({
  id: z.string(),
  name: z.string(),
  date_utc: z.string(),
  date_unix: z.number(),
  success: z.boolean().nullable(),
  upcoming: z.boolean(),
  details: z.string().nullable(),
  flight_number: z.number().nullable(),
  rocket: z.string(),
  launchpad: z.string().nullable(),
  cores: z.array(CoreSchema),
  links: LinksSchema,
});

export const LaunchesSchema = z.array(LaunchSchema);

export type Launch = z.infer<typeof LaunchSchema>;
