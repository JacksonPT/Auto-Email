import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "@/lib/config";
import { dateToDueAt, subtractDays, templateDefinitions } from "@/lib/domain";

type SqliteDatabase = Database.Database;

function addDays(date: Date, days: number): string {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function migrateDatabase(database: SqliteDatabase): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsDirectory = path.join(process.cwd(), "migrations");
  const applied = database.prepare("SELECT 1 FROM _migrations WHERE name = ?");
  const record = database.prepare("INSERT INTO _migrations (name) VALUES (?)");

  for (const name of fs
    .readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql"))
    .sort()) {
    if (applied.get(name)) continue;
    const sql = fs.readFileSync(path.join(migrationsDirectory, name), "utf8");
    database.transaction(() => {
      database.exec(sql);
      record.run(name);
    })();
  }
}

function seedDateOccurrences(
  database: SqliteDatabase,
  schoolId: string,
  kickoffDate: string,
  closingDate: string,
): void {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO workflow_occurrences
      (id, school_id, workflow, source_key, due_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const dates = [
    ["kickoff", kickoffDate],
    ["six_week", subtractDays(closingDate, 42)],
    ["two_week", subtractDays(closingDate, 14)],
    ["closing", closingDate],
  ] as const;

  for (const [workflow, dueDate] of dates) {
    const sourceKey = `${workflow}:${dueDate}`;
    insert.run(
      `${schoolId}:${sourceKey}`,
      schoolId,
      workflow,
      sourceKey,
      dateToDueAt(dueDate),
    );
  }
}

export function seedDatabase(database: SqliteDatabase): void {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  database.transaction(() => {
    database
      .prepare(
        `
        INSERT INTO staff_identity (id, name, email) VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email
      `,
      )
      .run(config.teresa.name, config.teresa.email);

    const insertVwm = database.prepare(`
      INSERT OR IGNORE INTO virtual_webmasters (id, name, email) VALUES (?, ?, ?)
    `);
    insertVwm.run("vwm-alex", "Alex Morgan", "alex.morgan@example.com");
    insertVwm.run("vwm-jordan", "Jordan Lee", "jordan.lee@example.com");
    insertVwm.run("vwm-maya", "Maya Patel", "maya.patel@example.com");

    const insertSchool = database.prepare(`
      INSERT OR IGNORE INTO schools
        (id, name, primary_contact_name, primary_contact_email, request_details,
         csm_name, csm_email, lifecycle_state, assigned_vwm_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertSchool.run(
      "school-northstar",
      "Northstar Academy",
      "Elena Brooks",
      "elena.brooks@northstar.example",
      "Refresh the admissions landing pages and update program navigation.",
      "Nina Foster",
      "nina.foster@finalsite.example",
      "active",
      "vwm-alex",
    );
    insertSchool.run(
      "school-harbor",
      "Harbor Day School",
      "Marcus Chen",
      "marcus.chen@harbor.example",
      "Create campaign pages for the annual giving initiative.",
      "Theo Grant",
      "theo.grant@finalsite.example",
      "closing",
      "vwm-jordan",
    );
    insertSchool.run(
      "school-ridgeview",
      "Ridgeview Preparatory",
      "Sofia Ramirez",
      "sofia.ramirez@ridgeview.example",
      "Audit content structure and build a new athletics hub.",
      "Nina Foster",
      "nina.foster@finalsite.example",
      "awaiting_review",
      "vwm-maya",
    );
    insertSchool.run(
      "school-pinecrest",
      "Pinecrest School",
      "Avery Thompson",
      "avery.thompson@pinecrest.example",
      "Prepare a content plan for the district news and calendar areas.",
      "Theo Grant",
      "theo.grant@finalsite.example",
      "active",
      "vwm-alex",
    );

    const insertRecipient = database.prepare(`
      INSERT OR IGNORE INTO additional_recipients (id, school_id, email) VALUES (?, ?, ?)
    `);
    insertRecipient.run(
      "recipient-northstar",
      "school-northstar",
      "communications@northstar.example",
    );
    insertRecipient.run(
      "recipient-harbor",
      "school-harbor",
      "advancement@harbor.example",
    );

    const insertTemplate = database.prepare(`
      INSERT OR IGNORE INTO global_templates
        (key, label, sender_role, subject, body, variables_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const [key, definition] of Object.entries(templateDefinitions)) {
      insertTemplate.run(
        key,
        definition.label,
        definition.senderRole,
        definition.subject,
        definition.body,
        JSON.stringify(definition.variables),
      );
    }

    const projects = [
      ["school-northstar", addDays(today, 0), addDays(today, 70)],
      ["school-harbor", addDays(today, -90), addDays(today, 14)],
      ["school-ridgeview", addDays(today, 10), addDays(today, 90)],
      ["school-pinecrest", addDays(today, 21), addDays(today, 110)],
    ] as const;
    const insertAutomation = database.prepare(`
      INSERT OR IGNORE INTO project_automation (school_id, kickoff_date, closing_date)
      VALUES (?, ?, ?)
    `);
    for (const [schoolId, kickoffDate, closingDate] of projects) {
      insertAutomation.run(schoolId, kickoffDate, closingDate);
      seedDateOccurrences(database, schoolId, kickoffDate, closingDate);
    }
  })();
}

export function createDatabase(
  databasePath: string,
  options: { seed?: boolean } = {},
): SqliteDatabase {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("foreign_keys = ON");
  database.pragma("journal_mode = WAL");
  migrateDatabase(database);
  if (options.seed !== false) seedDatabase(database);
  return database;
}

const globalDatabase = globalThis as typeof globalThis & {
  prototypeDatabase?: SqliteDatabase;
};

export function getDatabase(): SqliteDatabase {
  if (!globalDatabase.prototypeDatabase) {
    globalDatabase.prototypeDatabase = createDatabase(config.databasePath);
  }
  return globalDatabase.prototypeDatabase;
}
