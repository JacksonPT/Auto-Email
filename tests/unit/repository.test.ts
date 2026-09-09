import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDatabase } from "@/lib/database";
import {
  addVirtualWebmaster,
  assignVirtualWebmaster,
  deleteVirtualWebmaster,
  getSchoolDetail,
  listGlobalTemplates,
  listSchools,
  saveAutomationSettings,
  updateGlobalTemplate,
  updateSchool,
  updateVirtualWebmaster,
} from "@/lib/repository";

describe("SQLite repositories and seed data", () => {
  let directory: string;
  let database: Database.Database;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "auto-email-repo-"));
    database = createDatabase(path.join(directory, "test.db"));
  });

  afterEach(() => {
    database.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it("migrates and seeds one consistent data set", () => {
    expect(listSchools(database)).toHaveLength(4);
    expect(listGlobalTemplates(database)).toHaveLength(9);

    const seededAgain = createDatabase(path.join(directory, "test.db"));
    expect(listSchools(seededAgain)).toHaveLength(4);
    expect(listGlobalTemplates(seededAgain)).toHaveLength(9);
    seededAgain.close();
  });

  it("updates intake-compatible project and recipient data", () => {
    const school = getSchoolDetail("school-northstar", database)!;
    updateSchool(
      {
        id: school.id,
        name: "Northstar School",
        primaryContactName: school.primaryContactName,
        primaryContactEmail: school.primaryContactEmail,
        requestDetails: school.requestDetails,
        csmName: school.csmName,
        csmEmail: school.csmEmail,
        lifecycleState: "extended",
        additionalRecipients: ["one@example.com", "two@example.com"],
      },
      database,
    );
    const updated = getSchoolDetail(school.id, database)!;
    expect(updated.name).toBe("Northstar School");
    expect(updated.lifecycleState).toBe("extended");
    expect(updated.additionalRecipients).toEqual([
      "one@example.com",
      "two@example.com",
    ]);
  });

  it("manages VWM entries and persists school assignment", () => {
    const id = addVirtualWebmaster(
      { name: "Taylor Green", email: "taylor.green@example.com" },
      database,
    );
    updateVirtualWebmaster(
      { id, name: "Taylor Greene", email: "taylor.greene@example.com" },
      database,
    );
    assignVirtualWebmaster("school-ridgeview", id, database);
    expect(
      getSchoolDetail("school-ridgeview", database)?.assignedVwmEmail,
    ).toBe("taylor.greene@example.com");
    expect(() => deleteVirtualWebmaster(id, database)).toThrow(
      "Reassign or unassign",
    );
    assignVirtualWebmaster("school-ridgeview", null, database);
    deleteVirtualWebmaster(id, database);
    expect(
      database
        .prepare("SELECT id FROM virtual_webmasters WHERE id = ?")
        .get(id),
    ).toBeUndefined();
  });

  it("rejects invalid addresses and assigned VWM deletion", () => {
    const school = getSchoolDetail("school-northstar", database)!;
    expect(() =>
      updateSchool(
        {
          id: school.id,
          name: school.name,
          primaryContactName: school.primaryContactName,
          primaryContactEmail: "invalid",
          requestDetails: school.requestDetails,
          lifecycleState: school.lifecycleState,
          additionalRecipients: [],
        },
        database,
      ),
    ).toThrow();
    expect(() => deleteVirtualWebmaster("vwm-alex", database)).toThrow(
      "Reassign or unassign",
    );
  });

  it("adds directory entries and validates global templates", () => {
    expect(
      addVirtualWebmaster(
        { name: "Taylor Wood", email: "taylor@example.com" },
        database,
      ),
    ).toBeTruthy();
    expect(() =>
      updateGlobalTemplate(
        "teresa_kickoff",
        "Hello {{unknown}}",
        "Body",
        database,
      ),
    ).toThrow("Unsupported variables");
  });

  it("supersedes old schedule occurrences when settings change", () => {
    saveAutomationSettings(
      "school-northstar",
      {
        kickoffDate: "2030-01-01",
        closingDate: "2030-04-01",
        kickoffEnabled: true,
        sixWeekEnabled: true,
        twoWeekEnabled: true,
        closingEnabled: true,
        usedHoursEnabled: true,
      },
      database,
    );
    const pending = database
      .prepare(
        "SELECT workflow, due_at FROM workflow_occurrences WHERE school_id = ? AND status = 'pending'",
      )
      .all("school-northstar") as Array<{ workflow: string; due_at: string }>;
    expect(pending).toHaveLength(4);
    expect(pending.find((item) => item.workflow === "six_week")?.due_at).toBe(
      "2030-02-18T00:00:00.000Z",
    );
  });

  it("enforces foreign keys for orphaned records", () => {
    expect(() =>
      database
        .prepare(
          "INSERT INTO additional_recipients (id, school_id, email) VALUES ('x', 'missing', 'x@y.com')",
        )
        .run(),
    ).toThrow();
  });

  it("rejects duplicate project-occurrence-template records", () => {
    const occurrence = database
      .prepare(
        "SELECT id FROM workflow_occurrences WHERE school_id = ? LIMIT 1",
      )
      .get("school-northstar") as { id: string };
    const insert = database.prepare(`
      INSERT INTO simulated_sent_emails
        (id, school_id, occurrence_id, template_key, sequence_order, sender_name,
         sender_email, recipients_json, subject, body, processed_at)
      VALUES (?, 'school-northstar', ?, 'teresa_kickoff', 1, 'Teresa',
         'teresa@example.com', '["contact@example.com"]', 'Subject', 'Body', CURRENT_TIMESTAMP)
    `);
    insert.run("sent-one", occurrence.id);
    expect(() => insert.run("sent-two", occurrence.id)).toThrow(
      "UNIQUE constraint failed",
    );
  });
});
