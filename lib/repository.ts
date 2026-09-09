import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  dateToDueAt,
  lifecycleStates,
  subtractDays,
  templateDefinitions,
} from "@/lib/domain";
import { getDatabase } from "@/lib/database";
import { unsupportedVariables } from "@/lib/templates";

export type AutomationSettings = {
  kickoffDate: string;
  closingDate: string;
  kickoffEnabled: boolean;
  sixWeekEnabled: boolean;
  twoWeekEnabled: boolean;
  closingEnabled: boolean;
  usedHoursEnabled: boolean;
};

export type SchoolSummary = {
  id: string;
  name: string;
  lifecycleState: string;
  primaryContactName: string;
};

export type SentEmail = {
  id: string;
  templateKey: string;
  templateLabel: string;
  senderName: string;
  senderEmail: string;
  recipients: string[];
  subject: string;
  body: string;
  processedAt: string;
  status: "simulated_sent";
};

export type SchoolDetail = SchoolSummary & {
  primaryContactEmail: string;
  requestDetails: string;
  csmName: string;
  csmEmail: string;
  assignedVwmId: string | null;
  assignedVwmName: string | null;
  assignedVwmEmail: string | null;
  additionalRecipients: string[];
  automation: AutomationSettings;
  sentEmails: SentEmail[];
};

export type VirtualWebmaster = {
  id: string;
  name: string;
  email: string;
  assignmentCount: number;
};

export type GlobalTemplate = {
  key: string;
  label: string;
  eyebrow: string;
  senderRole: "teresa" | "vwm";
  subject: string;
  body: string;
  variables: string[];
};

const email = z.string().trim().email();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function listSchools(database = getDatabase()): SchoolSummary[] {
  return database
    .prepare(
      `
      SELECT id, name, lifecycle_state AS lifecycleState,
        primary_contact_name AS primaryContactName
      FROM schools ORDER BY name
    `,
    )
    .all() as SchoolSummary[];
}

export function listSentEmails(
  schoolId: string,
  database = getDatabase(),
): SentEmail[] {
  const rows = database
    .prepare(
      `
      SELECT e.id, e.template_key AS templateKey, t.label AS templateLabel,
        e.sender_name AS senderName, e.sender_email AS senderEmail,
        e.recipients_json AS recipientsJson, e.subject, e.body,
        e.processed_at AS processedAt, e.status
      FROM simulated_sent_emails e
      JOIN global_templates t ON t.key = e.template_key
      WHERE e.school_id = ?
      ORDER BY e.processed_at DESC, e.sequence_order ASC
    `,
    )
    .all(schoolId) as Array<
    Omit<SentEmail, "recipients"> & { recipientsJson: string }
  >;

  return rows.map(({ recipientsJson, ...row }) => ({
    ...row,
    recipients: JSON.parse(recipientsJson) as string[],
  }));
}

export function getSchoolDetail(
  schoolId: string,
  database = getDatabase(),
): SchoolDetail | null {
  const row = database
    .prepare(
      `
      SELECT s.id, s.name, s.lifecycle_state AS lifecycleState,
        s.primary_contact_name AS primaryContactName,
        s.primary_contact_email AS primaryContactEmail,
        s.request_details AS requestDetails,
        COALESCE(s.csm_name, '') AS csmName,
        COALESCE(s.csm_email, '') AS csmEmail,
        s.assigned_vwm_id AS assignedVwmId,
        v.name AS assignedVwmName, v.email AS assignedVwmEmail,
        a.kickoff_date AS kickoffDate, a.closing_date AS closingDate,
        a.kickoff_enabled AS kickoffEnabled, a.six_week_enabled AS sixWeekEnabled,
        a.two_week_enabled AS twoWeekEnabled, a.closing_enabled AS closingEnabled,
        a.used_hours_enabled AS usedHoursEnabled
      FROM schools s
      JOIN project_automation a ON a.school_id = s.id
      LEFT JOIN virtual_webmasters v ON v.id = s.assigned_vwm_id
      WHERE s.id = ?
    `,
    )
    .get(schoolId) as
    | (Omit<
        SchoolDetail,
        "additionalRecipients" | "automation" | "sentEmails"
      > & {
        kickoffDate: string;
        closingDate: string;
        kickoffEnabled: number;
        sixWeekEnabled: number;
        twoWeekEnabled: number;
        closingEnabled: number;
        usedHoursEnabled: number;
      })
    | undefined;

  if (!row) return null;
  const recipients = database
    .prepare(
      "SELECT email FROM additional_recipients WHERE school_id = ? ORDER BY email",
    )
    .all(schoolId) as Array<{ email: string }>;

  return {
    id: row.id,
    name: row.name,
    lifecycleState: row.lifecycleState,
    primaryContactName: row.primaryContactName,
    primaryContactEmail: row.primaryContactEmail,
    requestDetails: row.requestDetails,
    csmName: row.csmName,
    csmEmail: row.csmEmail,
    assignedVwmId: row.assignedVwmId,
    assignedVwmName: row.assignedVwmName,
    assignedVwmEmail: row.assignedVwmEmail,
    additionalRecipients: recipients.map((recipient) => recipient.email),
    automation: {
      kickoffDate: row.kickoffDate,
      closingDate: row.closingDate,
      kickoffEnabled: Boolean(row.kickoffEnabled),
      sixWeekEnabled: Boolean(row.sixWeekEnabled),
      twoWeekEnabled: Boolean(row.twoWeekEnabled),
      closingEnabled: Boolean(row.closingEnabled),
      usedHoursEnabled: Boolean(row.usedHoursEnabled),
    },
    sentEmails: listSentEmails(schoolId, database),
  };
}

export function updateSchool(
  input: {
    id: string;
    name: string;
    primaryContactName: string;
    primaryContactEmail: string;
    requestDetails: string;
    csmName?: string;
    csmEmail?: string;
    lifecycleState: string;
    additionalRecipients: string[];
  },
  database = getDatabase(),
): void {
  const value = z
    .object({
      id: z.string().min(1),
      name: z.string().trim().min(1),
      primaryContactName: z.string().trim().min(1),
      primaryContactEmail: email,
      requestDetails: z.string().trim().min(1),
      csmName: z.string().trim().optional().default(""),
      csmEmail: z
        .union([email, z.literal("")])
        .optional()
        .default(""),
      lifecycleState: z.enum(lifecycleStates),
      additionalRecipients: z.array(email),
    })
    .parse(input);

  database.transaction(() => {
    const result = database
      .prepare(
        `
        UPDATE schools SET name = ?, primary_contact_name = ?, primary_contact_email = ?,
          request_details = ?, csm_name = ?, csm_email = ?, lifecycle_state = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      )
      .run(
        value.name,
        value.primaryContactName,
        value.primaryContactEmail,
        value.requestDetails,
        value.csmName,
        value.csmEmail,
        value.lifecycleState,
        value.id,
      );
    if (result.changes !== 1) throw new Error("School project not found.");
    database
      .prepare("DELETE FROM additional_recipients WHERE school_id = ?")
      .run(value.id);
    const insert = database.prepare(
      "INSERT INTO additional_recipients (id, school_id, email) VALUES (?, ?, ?)",
    );
    for (const recipient of [...new Set(value.additionalRecipients)]) {
      insert.run(randomUUID(), value.id, recipient);
    }
  })();
}

export function listVirtualWebmasters(
  database = getDatabase(),
): VirtualWebmaster[] {
  return database
    .prepare(
      `
      SELECT v.id, v.name, v.email, COUNT(s.id) AS assignmentCount
      FROM virtual_webmasters v
      LEFT JOIN schools s ON s.assigned_vwm_id = v.id
      GROUP BY v.id ORDER BY v.name
    `,
    )
    .all() as VirtualWebmaster[];
}

export function addVirtualWebmaster(
  input: { name: string; email: string },
  database = getDatabase(),
): string {
  const value = z
    .object({ name: z.string().trim().min(1), email })
    .parse(input);
  const id = randomUUID();
  database
    .prepare(
      "INSERT INTO virtual_webmasters (id, name, email) VALUES (?, ?, ?)",
    )
    .run(id, value.name, value.email);
  return id;
}

export function updateVirtualWebmaster(
  input: { id: string; name: string; email: string },
  database = getDatabase(),
): void {
  const value = z
    .object({ id: z.string().min(1), name: z.string().trim().min(1), email })
    .parse(input);
  const result = database
    .prepare(
      `
      UPDATE virtual_webmasters SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `,
    )
    .run(value.name, value.email, value.id);
  if (result.changes !== 1) throw new Error("Virtual webmaster not found.");
}

export function deleteVirtualWebmaster(
  id: string,
  database = getDatabase(),
): void {
  const assigned = database
    .prepare("SELECT COUNT(*) AS count FROM schools WHERE assigned_vwm_id = ?")
    .get(id) as { count: number };
  if (assigned.count > 0) {
    throw new Error("Reassign or unassign this VWM before removing them.");
  }
  database.prepare("DELETE FROM virtual_webmasters WHERE id = ?").run(id);
}

export function assignVirtualWebmaster(
  schoolId: string,
  vwmId: string | null,
  database = getDatabase(),
): void {
  const result = database
    .prepare(
      "UPDATE schools SET assigned_vwm_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .run(vwmId || null, schoolId);
  if (result.changes !== 1) throw new Error("School project not found.");
}

type ScheduledWorkflow = "kickoff" | "six_week" | "two_week" | "closing";

function scheduleDefinitions(settings: AutomationSettings): Array<{
  workflow: ScheduledWorkflow;
  enabled: boolean;
  date: string;
}> {
  return [
    {
      workflow: "kickoff",
      enabled: settings.kickoffEnabled,
      date: settings.kickoffDate,
    },
    {
      workflow: "six_week",
      enabled: settings.sixWeekEnabled,
      date: subtractDays(settings.closingDate, 42),
    },
    {
      workflow: "two_week",
      enabled: settings.twoWeekEnabled,
      date: subtractDays(settings.closingDate, 14),
    },
    {
      workflow: "closing",
      enabled: settings.closingEnabled,
      date: settings.closingDate,
    },
  ];
}

export function rebuildDateOccurrences(
  schoolId: string,
  settings: AutomationSettings,
  database = getDatabase(),
): void {
  database
    .prepare(
      `
      UPDATE workflow_occurrences SET status = 'superseded'
      WHERE school_id = ? AND status = 'pending'
        AND workflow IN ('kickoff', 'six_week', 'two_week', 'closing')
    `,
    )
    .run(schoolId);

  const insert = database.prepare(`
    INSERT INTO workflow_occurrences (id, school_id, workflow, source_key, due_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(school_id, workflow, source_key) DO UPDATE SET
      due_at = excluded.due_at,
      status = CASE
        WHEN workflow_occurrences.status = 'processed' THEN 'processed'
        ELSE 'pending'
      END
  `);
  for (const definition of scheduleDefinitions(settings)) {
    if (!definition.enabled) continue;
    const sourceKey = `${definition.workflow}:${definition.date}`;
    insert.run(
      randomUUID(),
      schoolId,
      definition.workflow,
      sourceKey,
      dateToDueAt(definition.date),
    );
  }
}

export function saveAutomationSettings(
  schoolId: string,
  input: AutomationSettings,
  database = getDatabase(),
): void {
  const settings = z
    .object({
      kickoffDate: date,
      closingDate: date,
      kickoffEnabled: z.boolean(),
      sixWeekEnabled: z.boolean(),
      twoWeekEnabled: z.boolean(),
      closingEnabled: z.boolean(),
      usedHoursEnabled: z.boolean(),
    })
    .refine((value) => value.closingDate >= value.kickoffDate, {
      message: "Closing date must be on or after kickoff.",
    })
    .parse(input);

  database.transaction(() => {
    const result = database
      .prepare(
        `
        UPDATE project_automation SET kickoff_date = ?, closing_date = ?,
          kickoff_enabled = ?, six_week_enabled = ?, two_week_enabled = ?,
          closing_enabled = ?, used_hours_enabled = ?, updated_at = CURRENT_TIMESTAMP
        WHERE school_id = ?
      `,
      )
      .run(
        settings.kickoffDate,
        settings.closingDate,
        Number(settings.kickoffEnabled),
        Number(settings.sixWeekEnabled),
        Number(settings.twoWeekEnabled),
        Number(settings.closingEnabled),
        Number(settings.usedHoursEnabled),
        schoolId,
      );
    if (result.changes !== 1)
      throw new Error("School automation settings not found.");
    rebuildDateOccurrences(schoolId, settings, database);
  })();
}

export function createExtension(
  schoolId: string,
  newClosingDate: string,
  database = getDatabase(),
): { eventId: string; occurrenceId: string } {
  const parsedDate = date.parse(newClosingDate);
  return database.transaction(() => {
    const school = getSchoolDetail(schoolId, database);
    if (!school) throw new Error("School project not found.");
    if (parsedDate <= school.automation.closingDate) {
      throw new Error(
        "Extension date must be later than the current closing date.",
      );
    }

    const eventId = randomUUID();
    const occurrenceId = randomUUID();
    database
      .prepare(
        `
        INSERT INTO extension_events
          (id, school_id, previous_closing_date, new_closing_date)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(eventId, schoolId, school.automation.closingDate, parsedDate);
    database
      .prepare(
        `
        UPDATE schools SET lifecycle_state = 'extended', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `,
      )
      .run(schoolId);

    const settings = { ...school.automation, closingDate: parsedDate };
    database
      .prepare(
        `
        UPDATE project_automation SET closing_date = ?, updated_at = CURRENT_TIMESTAMP WHERE school_id = ?
      `,
      )
      .run(parsedDate, schoolId);
    rebuildDateOccurrences(schoolId, settings, database);
    database
      .prepare(
        `
        INSERT INTO workflow_occurrences
          (id, school_id, workflow, source_key, due_at)
        VALUES (?, ?, 'extension', ?, ?)
      `,
      )
      .run(
        occurrenceId,
        schoolId,
        `extension:${eventId}`,
        new Date().toISOString(),
      );
    return { eventId, occurrenceId };
  })();
}

export function listGlobalTemplates(
  database = getDatabase(),
): GlobalTemplate[] {
  const rows = database
    .prepare(
      `
      SELECT key, label, sender_role AS senderRole, subject, body, variables_json AS variablesJson
      FROM global_templates ORDER BY rowid
    `,
    )
    .all() as Array<
    Omit<GlobalTemplate, "variables" | "eyebrow"> & { variablesJson: string }
  >;

  return rows.map(({ variablesJson, ...row }) => ({
    ...row,
    eyebrow:
      templateDefinitions[row.key as keyof typeof templateDefinitions]
        ?.eyebrow ?? row.senderRole,
    variables: JSON.parse(variablesJson) as string[],
  }));
}

export function getGlobalTemplate(
  key: string,
  database = getDatabase(),
): GlobalTemplate | null {
  return (
    listGlobalTemplates(database).find((template) => template.key === key) ??
    null
  );
}

export function updateGlobalTemplate(
  key: string,
  subject: string,
  body: string,
  database = getDatabase(),
): void {
  z.object({
    subject: z.string().trim().min(1),
    body: z.string().trim().min(1),
  }).parse({
    subject,
    body,
  });
  const unsupported = unsupportedVariables(key, subject, body);
  if (unsupported.length > 0) {
    throw new Error(
      `Unsupported variables: ${unsupported.map((item) => `{{${item}}}`).join(", ")}`,
    );
  }
  const result = database
    .prepare(
      `
      UPDATE global_templates SET subject = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?
    `,
    )
    .run(subject.trim(), body.trim(), key);
  if (result.changes !== 1) throw new Error("Global email template not found.");
}
