import { describe, expect, it } from "vitest";
import { templateDefinitions, workflowTemplates } from "@/lib/domain";
import { renderTemplate, unsupportedVariables } from "@/lib/templates";

describe("global template configuration", () => {
  it("defines nine templates in the required sequence families", () => {
    expect(Object.keys(templateDefinitions)).toHaveLength(9);
    expect(workflowTemplates.kickoff).toEqual([
      "teresa_kickoff",
      "vwm_kickoff_followup",
    ]);
    expect(workflowTemplates.closing).toEqual([
      "vwm_closing",
      "teresa_closing",
    ]);
    expect(workflowTemplates.used_hours).toEqual([
      "vwm_used_hours",
      "teresa_used_hours",
    ]);
  });

  it("rejects variables outside a template allowlist", () => {
    expect(
      unsupportedVariables(
        "teresa_six_week",
        "Hello {{unknown_value}}",
        "Body",
      ),
    ).toEqual(["unknown_value"]);
  });

  it("renders supported values and reports missing values", () => {
    expect(
      renderTemplate("Hello {{school_name}}", { school_name: "Northstar" }),
    ).toBe("Hello Northstar");
    expect(() =>
      renderTemplate("Hello {{school_name}}", { school_name: null }),
    ).toThrow("Missing value");
  });
});
