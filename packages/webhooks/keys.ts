import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      SVIX_TOKEN: z.string().optional(),
    },
    runtimeEnv: {
      SVIX_TOKEN: process.env.SVIX_TOKEN,
    },
  });
