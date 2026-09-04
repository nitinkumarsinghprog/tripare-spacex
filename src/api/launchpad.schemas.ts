import { z } from "zod";

export const LaunchpadSchema = z.object({
  id: z.string(),
  name: z.string(),
  full_name: z.string(),
  status: z.string(),
  locality: z.string(),
  region: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  launch_attempts: z.number(),
  launch_successes: z.number(),
  details: z.string().nullable(),
});

export type Launchpad = z.infer<typeof LaunchpadSchema>;
