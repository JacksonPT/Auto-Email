import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDatabase } from "@/lib/database";
import { MockGoogleSheetsHoursSource } from "@/lib/hours";
import {
  assignVirtualWebmaster,
  createExtension,
  getSchoolDetail,
  listSentEmails,
  saveAutomationSettings,
  updateGlobalTemplate,
} from "@/lib/repository";
import { processDueSimulations, processOccurrence } from "@/lib/simulation";

function dateFromNow(days: number): string {
  const value = new Date();
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

describe("simulated email processing", () => {
  let directory: string;
  let database: Database.Database;

  beforeEach(() => {
    directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "auto-email-simulation-"),
    );
    database = createDatabase(path.join(directory, "test.db"));
    for (const id of [
      "school-northstar",
      "school-harbor",
      "school-ridgeview",
      "school-pinecrest",
    ]) {
      saveAutomationSettings(
        id,
        {
          kickoffDate: dateFromNow(30),
          closingDate: dateFromNow(120),
          kickoffEnabled: false,
          sixWeekEnabled: false,
          twoWeekEnabled: false,
          closingEnabled: false,
          usedHoursEnabled: false,
        },
        database,
      );
    }
  });

  afterEach(() => {
    database.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it("processes kickoff in Teresa-then-VWM order exactly once", () => {
    saveAutomationSettings(
      "school-northstar",
      {
        kickoffDate: dateFromNow(0),
        closingDate: dateFromNow(90),
        kickoffEnabled: true,
        sixWeekEnabled: false,
        twoWeekEnabled: false,
        closingEnabled: false,
        usedHoursEnabled: false,
      },
      database,
    );
    const now = new Date(`${dateFromNow(0)}T12:00:00.000Z`);
    const first = processDueSimulations({ database, now });
    const sent = listSentEmails("school-northstar", database);

    expect(first.simulatedSent).toBe(2);
    expect(sent.map((item) => item.templateKey)).toEqual([
      "teresa_kickoff",
      "vwm_kickoff_followup",
    ]);
    expect(processDueSimulations({ database, now }).simulatedSent).toBe(0);
  });

  it("triggers the VWM-then-Teresa hours sequence once at zero", () => {
    saveAutomationSettings(
      "school-harbor",
      {
        kickoffDate: dateFromNow(0),
        closingDate: dateFromNow(90),
        kickoffEnabled: false,
        sixWeekEnabled: false,
        twoWeekEnabled: false,
        closingEnabled: false,
        usedHoursEnabled: true,
      },
      database,
    );
    const hoursSource = new MockGoogleSheetsHoursSource({
      "school-harbor": { used: 30, remaining: 0 },
    });
    const first = processDueSimulations({ database, hoursSource });
    const second = processDueSimulations({ database, hoursSource });

    expect(first.simulatedSent).toBe(2);
    expect(
      listSentEmails("school-harbor", database).map((item) => item.templateKey),
    ).toEqual(["vwm_used_hours", "teresa_used_hours"]);
    expect(second.simulatedSent).toBe(0);
  });

  it("extends closing, recalculates reminders, and processes Teresa's extension", () => {
    const previous = getSchoolDetail("school-ridgeview", database)!.automation
      .closingDate;
    const newClosingDate = dateFromNow(160);
    const { occurrenceId } = createExtension(
      "school-ridgeview",
      newClosingDate,
      database,
    );
    const outcome = processOccurrence(occurrenceId, { database });
    const school = getSchoolDetail("school-ridgeview", database)!;

    expect(outcome).toEqual({ sent: 1, errors: [] });
    expect(school.lifecycleState).toBe("extended");
    expect(school.automation.closingDate).toBe(newClosingDate);
    expect(previous).not.toBe(newClosingDate);
    expect(listSentEmails(school.id, database)[0].templateKey).toBe(
      "teresa_extension",
    );
  });

  it("keeps sent snapshots immutable after a global template edit", () => {
    saveAutomationSettings(
      "school-northstar",
      {
        kickoffDate: dateFromNow(0),
        closingDate: dateFromNow(90),
        kickoffEnabled: true,
        sixWeekEnabled: false,
        twoWeekEnabled: false,
        closingEnabled: false,
        usedHoursEnabled: false,
      },
      database,
    );
    processDueSimulations({
      database,
      now: new Date(`${dateFromNow(0)}T12:00:00.000Z`),
    });
    const original = listSentEmails("school-northstar", database).find(
      (item) => item.templateKey === "teresa_kickoff",
    )!;
    updateGlobalTemplate(
      "teresa_kickoff",
      "Updated for {{school_name}}",
      "Updated body",
      database,
    );

    expect(
      listSentEmails("school-northstar", database).find(
        (item) => item.templateKey === "teresa_kickoff",
      )?.subject,
    ).toBe(original.subject);
  });

  it("continues processing other schools when required VWM data is missing", () => {
    assignVirtualWebmaster("school-northstar", null, database);
    saveAutomationSettings(
      "school-northstar",
      {
        kickoffDate: dateFromNow(0),
        closingDate: dateFromNow(90),
        kickoffEnabled: true,
        sixWeekEnabled: false,
        twoWeekEnabled: false,
        closingEnabled: false,
        usedHoursEnabled: false,
      },
      database,
    );
    saveAutomationSettings(
      "school-harbor",
      {
        kickoffDate: dateFromNow(0),
        closingDate: dateFromNow(42),
        kickoffEnabled: false,
        sixWeekEnabled: true,
        twoWeekEnabled: false,
        closingEnabled: false,
        usedHoursEnabled: false,
      },
      database,
    );

    const result = processDueSimulations({
      database,
      now: new Date(`${dateFromNow(0)}T12:00:00.000Z`),
    });
    expect(
      result.errors.some((item) => item.message.includes("required sender")),
    ).toBe(true);
    expect(listSentEmails("school-harbor", database)).toHaveLength(1);
  });

  it("derives reminders and processes the closing sequence with CSM recipients", () => {
    saveAutomationSettings(
      "school-northstar",
      {
        kickoffDate: dateFromNow(-60),
        closingDate: dateFromNow(0),
        kickoffEnabled: false,
        sixWeekEnabled: true,
        twoWeekEnabled: true,
        closingEnabled: true,
        usedHoursEnabled: false,
      },
      database,
    );
    const result = processDueSimulations({
      database,
      now: new Date(`${dateFromNow(0)}T12:00:00.000Z`),
    });
    const sent = listSentEmails("school-northstar", database);

    expect(result.simulatedSent).toBe(4);
    expect(sent.map((item) => item.templateKey).sort()).toEqual(
      [
        "teresa_six_week",
        "teresa_two_week",
        "vwm_closing",
        "teresa_closing",
      ].sort(),
    );
    for (const key of ["teresa_two_week", "vwm_closing", "teresa_closing"]) {
      expect(
        sent.find((item) => item.templateKey === key)?.recipients,
      ).toContain("nina.foster@finalsite.example");
    }
    const closingOrder = database
      .prepare(
        `
        SELECT e.template_key AS templateKey FROM simulated_sent_emails e
        JOIN workflow_occurrences o ON o.id = e.occurrence_id
        WHERE e.school_id = 'school-northstar' AND o.workflow = 'closing'
        ORDER BY e.sequence_order
      `,
      )
      .all() as Array<{ templateKey: string }>;
    expect(closingOrder.map((item) => item.templateKey)).toEqual([
      "vwm_closing",
      "teresa_closing",
    ]);
  });

  it("uses one edited global template across multiple schools", () => {
    updateGlobalTemplate(
      "teresa_six_week",
      "Shared reminder for {{school_name}}",
      "Closing: {{closing_date}}",
      database,
    );
    for (const id of ["school-northstar", "school-ridgeview"]) {
      saveAutomationSettings(
        id,
        {
          kickoffDate: dateFromNow(-1),
          closingDate: dateFromNow(42),
          kickoffEnabled: false,
          sixWeekEnabled: true,
          twoWeekEnabled: false,
          closingEnabled: false,
          usedHoursEnabled: false,
        },
        database,
      );
    }
    processDueSimulations({
      database,
      now: new Date(`${dateFromNow(0)}T12:00:00.000Z`),
    });

    expect(listSentEmails("school-northstar", database)[0].subject).toBe(
      "Shared reminder for Northstar Academy",
    );
    expect(listSentEmails("school-ridgeview", database)[0].subject).toBe(
      "Shared reminder for Ridgeview Preparatory",
    );
  });
});
