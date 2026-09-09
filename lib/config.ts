import path from "node:path";
import { z } from "zod";

const configurationSchema = z.object({
  DATABASE_PATH: z.string().min(1).default("./data/prototype.db"),
  BUSINESS_TIMEZONE: z.string().min(1).default("America/New_York"),
  TERESA_NAME: z.string().min(1).default("Teresa"),
  TERESA_EMAIL: z.string().email().default("teresa@example.com"),
});

export type AppConfig = {
  databasePath: string;
  businessTimezone: string;
  teresa: { name: string; email: string };
};

export function loadConfig(
  environment: Record<string, string | undefined> = process.env,
): AppConfig {
  const result = configurationSchema.safeParse(environment);

  if (!result.success) {
    throw new Error(
      `Invalid prototype configuration: ${z.prettifyError(result.error)}`,
    );
  }

  return {
    databasePath: path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      result.data.DATABASE_PATH,
    ),
    businessTimezone: result.data.BUSINESS_TIMEZONE,
    teresa: {
      name: result.data.TERESA_NAME,
      email: result.data.TERESA_EMAIL,
    },
  };
}

export const config = loadConfig();
