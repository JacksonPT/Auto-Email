import { describe, expect, it } from "vitest";
import { loadConfig } from "@/lib/config";

describe("prototype configuration", () => {
  it("loads without external integration settings", () => {
    const value = loadConfig({
      DATABASE_PATH: "./data/test.db",
      BUSINESS_TIMEZONE: "America/Chicago",
      TERESA_NAME: "Teresa Test",
      TERESA_EMAIL: "teresa@test.example",
    });

    expect(value.teresa).toEqual({
      name: "Teresa Test",
      email: "teresa@test.example",
    });
    expect(value.businessTimezone).toBe("America/Chicago");
  });

  it("rejects an invalid sender address", () => {
    expect(() =>
      loadConfig({
        DATABASE_PATH: "./data/test.db",
        BUSINESS_TIMEZONE: "UTC",
        TERESA_NAME: "Teresa",
        TERESA_EMAIL: "not-an-email",
      }),
    ).toThrow("Invalid prototype configuration");
  });
});
