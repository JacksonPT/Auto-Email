import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import { subtractDays, type WorkflowKey } from "@/lib/domain";
import { getDatabase } from "@/lib/database";
import { schoolHoursSource, type SchoolHoursSource } from "@/lib/hours";
import { getSchoolDetail } from "@/lib/repository";
import { renderTemplate } from "@/lib/templates";

type SqliteDatabase = Database.Database;

const workflowTemplates: Record<WorkflowKey, string[]> = {
  kickoff: ["teresa_kickoff", "vwm_kickoff_followup"],
  six_week: ["teresa_six_week"],
  two_week: ["teresa_two_week"],
  closing: ["vwm_closing", "teresa_closing"],
  used_hours: ["vwm_used_hours", "teresa_used_hours"],
  extension: ["teresa_extension"],
};

const csmTemplates = new Set([
  "teresa_two_week",
  "vwm_closing",
  "teresa_closing",
]);

type OccurrenceRow = {
  id: string;
  schoolId: string;
  workflow: WorkflowKey;
  sourceKey: string;
};

type TemplateRow = {
  key: string;
  senderRole: "teresa" | "vwm";
  subject: string;
  body: string;
};

export type ProcessingResult = {
  processedOccurrences: number;
  simulatedSent: number;
  errors: Array<{ occurrenceId: string; message: string }>;
};

function addZeroHourOccurrences(
  database: SqliteDatabase,
  hoursSource: SchoolHoursSource,
  now: Date,
): void {
  const projects = database
    .prepare(
      `
      SELECT s.id FROM schools s
      JOIN project_automation a ON a.school_id = s.id
      WHERE a.used_hours_enabled = 1
    `,
    )
    .all() as Array<{ id: string }>;
  const insert = database.prepare(`
    INSERT OR IGNORE INTO workflow_occurrences
      (id, school_id, workflow, source_key, due_at)
    VALUES (?, ?, 'used_hours', 'zero-hours', ?)
  `);

  for (const project of projects) {
    const hours = hoursSource.getHours(project.id);
    if (hours?.remaining === 0) {
      insert.run(randomUUID(), project.id, now.toISOString());
    }
  }
}

function extensionDates(occurrenceId: string, database: SqliteDatabase) {
  return database
    .prepare(
      `
      SELECT e.previous_closing_date AS previousClosingDate,
        e.new_closing_date AS newClosingDate
      FROM extension_events e
      JOIN workflow_occurrences o ON o.source_key = 'extension:' || e.id
      WHERE o.id = ?
    `,
    )
    .get(occurrenceId) as
    { previousClosingDate: string; newClosingDate: string } | undefined;
}

export function processOccurrence(
  occurrenceId: string,
  options: {
    database?: SqliteDatabase;
    hoursSource?: SchoolHoursSource;
    now?: Date;
  } = {},
): { sent: number; errors: string[] } {
  const database = options.database ?? getDatabase();
  const hoursSource = options.hoursSource ?? schoolHoursSource;
  const now = options.now ?? new Date();

  return database.transaction(() => {
    const occurrence = database
      .prepare(
        `
        SELECT id, school_id AS schoolId, workflow, source_key AS sourceKey
        FROM workflow_occurrences WHERE id = ? AND status = 'pending'
      `,
      )
      .get(occurrenceId) as OccurrenceRow | undefined;
    if (!occurrence) return { sent: 0, errors: [] };

    const school = getSchoolDetail(occurrence.schoolId, database);
    if (!school) return { sent: 0, errors: ["School project not found."] };
    const hours = hoursSource.getHours(school.id);
    const teresa = database
      .prepare("SELECT name, email FROM staff_identity WHERE id = 1")
      .get() as { name: string; email: string } | undefined;
    const extension = extensionDates(occurrence.id, database);
    const values: Record<string, string | number | null> = {
      school_name: school.name,
      primary_contact_name: school.primaryContactName,
      primary_contact_email: school.primaryContactEmail,
      assigned_vwm_name: school.assignedVwmName,
      assigned_vwm_email: school.assignedVwmEmail,
      kickoff_date: school.automation.kickoffDate,
      closing_date: school.automation.closingDate,
      six_week_reminder_date: subtractDays(school.automation.closingDate, 42),
      two_week_reminder_date: subtractDays(school.automation.closingDate, 14),
      used_hours: hours?.used ?? null,
      remaining_hours: hours?.remaining ?? null,
      project_request_details: school.requestDetails,
      csm_name: school.csmName || null,
      csm_email: school.csmEmail || null,
      previous_closing_date: extension?.previousClosingDate ?? null,
      new_closing_date: extension?.newClosingDate ?? null,
      sender_name: null,
      sender_email: null,
    };

    const errors: string[] = [];
    let sent = 0;
    for (const [index, templateKey] of workflowTemplates[
      occurrence.workflow
    ].entries()) {
      const template = database
        .prepare(
          `
          SELECT key, sender_role AS senderRole, subject, body
          FROM global_templates WHERE key = ?
        `,
        )
        .get(templateKey) as TemplateRow | undefined;
      if (!template) {
        errors.push(`Template ${templateKey} is missing.`);
        continue;
      }

      const sender =
        template.senderRole === "teresa"
          ? teresa
          : school.assignedVwmName && school.assignedVwmEmail
            ? { name: school.assignedVwmName, email: school.assignedVwmEmail }
            : undefined;
      if (!sender) {
        errors.push(`${templateKey}: required sender information is missing.`);
        continue;
      }

      const recipients = [
        school.primaryContactEmail,
        ...school.additionalRecipients,
      ];
      if (csmTemplates.has(templateKey)) {
        if (!school.csmEmail) {
          errors.push(`${templateKey}: CSM email is missing.`);
          continue;
        }
        recipients.push(school.csmEmail);
      }

      try {
        const templateValues = {
          ...values,
          sender_name: sender.name,
          sender_email: sender.email,
        };
        const subject = renderTemplate(template.subject, templateValues);
        const body = renderTemplate(template.body, templateValues);
        const result = database
          .prepare(
            `
            INSERT OR IGNORE INTO simulated_sent_emails
              (id, school_id, occurrence_id, template_key, sequence_order,
               sender_name, sender_email, recipients_json, subject, body, processed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          )
          .run(
            randomUUID(),
            school.id,
            occurrence.id,
            template.key,
            index + 1,
            sender.name,
            sender.email,
            JSON.stringify([...new Set(recipients)]),
            subject,
            body,
            now.toISOString(),
          );
        sent += result.changes;
      } catch (error) {
        errors.push(
          `${templateKey}: ${error instanceof Error ? error.message : "Rendering failed."}`,
        );
      }
    }

    database
      .prepare(
        `
        UPDATE workflow_occurrences SET status = 'processed', processed_at = ? WHERE id = ?
      `,
      )
      .run(now.toISOString(), occurrence.id);
    return { sent, errors };
  })();
}

export function processDueSimulations(
  options: {
    database?: SqliteDatabase;
    hoursSource?: SchoolHoursSource;
    now?: Date;
  } = {},
): ProcessingResult {
  const database = options.database ?? getDatabase();
  const hoursSource = options.hoursSource ?? schoolHoursSource;
  const now = options.now ?? new Date();
  addZeroHourOccurrences(database, hoursSource, now);

  const occurrences = database
    .prepare(
      `
      SELECT id FROM workflow_occurrences
      WHERE status = 'pending' AND due_at <= ?
      ORDER BY due_at, created_at
    `,
    )
    .all(now.toISOString()) as Array<{ id: string }>;
  const result: ProcessingResult = {
    processedOccurrences: 0,
    simulatedSent: 0,
    errors: [],
  };

  for (const occurrence of occurrences) {
    try {
      const outcome = processOccurrence(occurrence.id, {
        database,
        hoursSource,
        now,
      });
      result.processedOccurrences += 1;
      result.simulatedSent += outcome.sent;
      result.errors.push(
        ...outcome.errors.map((message) => ({
          occurrenceId: occurrence.id,
          message,
        })),
      );
    } catch (error) {
      result.errors.push({
        occurrenceId: occurrence.id,
        message: error instanceof Error ? error.message : "Simulation failed.",
      });
    }
  }
  return result;
}
