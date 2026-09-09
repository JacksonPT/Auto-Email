export const lifecycleStates = [
  "awaiting_review",
  "active",
  "extended",
  "closing",
  "closed",
] as const;

export type LifecycleState = (typeof lifecycleStates)[number];
export type SenderRole = "teresa" | "vwm";
export type WorkflowKey =
  "kickoff" | "six_week" | "two_week" | "closing" | "used_hours" | "extension";

export function subtractDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

export function dateToDueAt(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export const commonVariables = [
  "school_name",
  "primary_contact_name",
  "primary_contact_email",
  "assigned_vwm_name",
  "assigned_vwm_email",
  "sender_name",
  "sender_email",
  "kickoff_date",
  "closing_date",
  "six_week_reminder_date",
  "two_week_reminder_date",
  "used_hours",
  "remaining_hours",
] as const;

export const templateDefinitions = {
  teresa_kickoff: {
    label: "Kickoff",
    eyebrow: "Teresa",
    senderRole: "teresa",
    workflow: "kickoff",
    variables: [...commonVariables, "project_request_details"],
    subject: "Your {{school_name}} project is ready to begin",
    body: "Hi {{primary_contact_name}},\n\nYour project kicks off on {{kickoff_date}}. {{project_request_details}}\n\nTeresa",
  },
  vwm_kickoff_followup: {
    label: "Kickoff follow-up",
    eyebrow: "Assigned VWM",
    senderRole: "vwm",
    workflow: "kickoff",
    variables: [...commonVariables, "project_request_details"],
    subject: "A note from your virtual webmaster",
    body: "Hi {{primary_contact_name}},\n\nI am {{assigned_vwm_name}}, your virtual webmaster. I am looking forward to working with {{school_name}}.",
  },
  teresa_six_week: {
    label: "Six-week reminder",
    eyebrow: "Teresa",
    senderRole: "teresa",
    workflow: "six_week",
    variables: [...commonVariables],
    subject: "Six weeks remain for {{school_name}}",
    body: "Hi {{primary_contact_name}},\n\nYour project closes on {{closing_date}}. You have {{remaining_hours}} hours remaining.",
  },
  teresa_two_week: {
    label: "Two-week reminder",
    eyebrow: "Teresa",
    senderRole: "teresa",
    workflow: "two_week",
    variables: [...commonVariables, "csm_name", "csm_email"],
    subject: "Two weeks remain for {{school_name}}",
    body: "Hi {{primary_contact_name}},\n\nTwo weeks remain before your {{closing_date}} closing date. {{csm_name}} is included for visibility.",
  },
  vwm_closing: {
    label: "Project closing",
    eyebrow: "Assigned VWM",
    senderRole: "vwm",
    workflow: "closing",
    variables: [...commonVariables, "csm_name", "csm_email"],
    subject: "Wrapping up your {{school_name}} project",
    body: "Hi {{primary_contact_name}},\n\nIt has been a pleasure supporting your project. Today is the scheduled closing date.",
  },
  teresa_closing: {
    label: "Project closing follow-up",
    eyebrow: "Teresa",
    senderRole: "teresa",
    workflow: "closing",
    variables: [...commonVariables, "csm_name", "csm_email"],
    subject: "Your {{school_name}} project is now closed",
    body: "Hi {{primary_contact_name}},\n\nYour project is complete. {{csm_name}} is included if you need next steps.",
  },
  vwm_used_hours: {
    label: "Hours used",
    eyebrow: "Assigned VWM",
    senderRole: "vwm",
    workflow: "used_hours",
    variables: [...commonVariables],
    subject: "Your project hours have been used",
    body: "Hi {{primary_contact_name}},\n\n{{school_name}} has used {{used_hours}} hours and has {{remaining_hours}} remaining.",
  },
  teresa_used_hours: {
    label: "Hours used follow-up",
    eyebrow: "Teresa",
    senderRole: "teresa",
    workflow: "used_hours",
    variables: [...commonVariables],
    subject: "Next steps for {{school_name}} project hours",
    body: "Hi {{primary_contact_name}},\n\nYour allocated project hours have been used. I am here to help with next steps.",
  },
  teresa_extension: {
    label: "Project extension",
    eyebrow: "Teresa",
    senderRole: "teresa",
    workflow: "extension",
    variables: [
      ...commonVariables,
      "previous_closing_date",
      "new_closing_date",
    ],
    subject: "Your {{school_name}} project has been extended",
    body: "Hi {{primary_contact_name}},\n\nYour project closing date moved from {{previous_closing_date}} to {{new_closing_date}}.",
  },
} as const satisfies Record<
  string,
  {
    label: string;
    eyebrow: string;
    senderRole: SenderRole;
    workflow: WorkflowKey;
    variables: readonly string[];
    subject: string;
    body: string;
  }
>;

export type TemplateKey = keyof typeof templateDefinitions;

export const workflowTemplates: Record<WorkflowKey, readonly TemplateKey[]> = {
  kickoff: ["teresa_kickoff", "vwm_kickoff_followup"],
  six_week: ["teresa_six_week"],
  two_week: ["teresa_two_week"],
  closing: ["vwm_closing", "teresa_closing"],
  used_hours: ["vwm_used_hours", "teresa_used_hours"],
  extension: ["teresa_extension"],
};
