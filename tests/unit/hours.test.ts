import { describe, expect, it } from "vitest";
import { MockGoogleSheetsHoursSource } from "@/lib/hours";

describe("MockGoogleSheetsHoursSource", () => {
  const source = new MockGoogleSheetsHoursSource({
    known: { used: 9, remaining: 11 },
  });

  it("returns read-only-shaped mock values for a known school", () => {
    expect(source.getHours("known")).toEqual({
      used: 9,
      remaining: 11,
      source: "Mock Google Sheets adapter",
    });
  });

  it("returns unavailable for an unknown school", () => {
    expect(source.getHours("missing")).toBeNull();
  });
});
