## Context

The workspace currently contains planning files but no application implementation. The prototype needs to demonstrate school-specific scheduling driven by globally managed email content while leaving external intake, spreadsheet, and delivery systems disconnected. See `proposal.md` for motivation and the capability specs for observable behavior.

School tabs are created from intake-compatible seed data, with no submission UI. School hours come from a mock adapter shaped for a future read-only Google Sheets integration. Email processing produces simulated sent-email records, and the prototype has no authentication or production security controls. These constraints make the application suitable only for a local or private demonstration with synthetic data.

## Goals / Non-Goals

**Goals:**

- Build one portable full-stack application that demonstrates project setup, VWM assignment, global email configuration, derived scheduling, and simulated sending with minimal setup.
- Keep project data, VWM directory entries, global templates, school automation settings, occurrences, and immutable simulated sent-email snapshots in an inspectable relational model.
- Keep Google Form, school-hours, and email-output boundaries explicit so real integrations can replace prototype adapters later.
- Make scheduled and hours-triggered simulation idempotent so repeated processing does not create duplicate sent-email records.
- Use responsive, accessible interfaces suitable for a stakeholder demonstration.

**Non-Goals:**

- Building, linking, embedding, or processing responses from an external intake form.
- Connecting to the internal Google Spreadsheet or configuring Google credentials in this prototype.
- Editing used or remaining hours in the application.
- Connecting to SMTP, Microsoft Graph, or another mail provider or sending external email.
- Authentication, authorization, secret-protected routes, throttling, anti-abuse controls, credential hardening, and production deployment.
- A general-purpose campaign or workflow builder.

## Decisions

### Use a single TypeScript full-stack application

Implement the prototype as a Next.js application with server-rendered pages and server-side mutations backed by a relational database. This keeps the Schools, global Emails, and VWM areas, mock hours source, and simulation processor in one portable unit while preserving boundaries for later integrations.

Alternative considered: separate frontend, API, and worker services. That structure is operationally heavier than a prototype needs and would slow delivery without changing the demonstrated workflow.

### Start with SQLite and an explicit data access layer

Use SQLite for local and single-instance demonstrations, migrations for reproducible setup, and repository functions rather than direct database access from UI components. Model the Teresa sender identity, VWM directory entries, schools, contacts, projects, additional recipients, global templates, project automation settings, workflow occurrences, and simulated sent-email snapshots separately. Store timestamps in UTC and render them in one configured business timezone.

Store one row per global template with subject, body, and a non-editable sender role. Store each project's kickoff date, closing date, and five enabled states separately. A uniqueness constraint over each project occurrence and template prevents duplicate simulated sent-email records if processing is repeated.

Alternative considered: require hosted PostgreSQL immediately. PostgreSQL is the likely production destination, but requiring infrastructure now makes a portable prototype harder to run. Avoid SQLite-specific behavior so migration remains straightforward.

### Seed intake-compatible projects without submission UI

Seed schools, primary contacts, and project request details in the shape expected from a future external form integration. Do not include a form URL, submission section, response endpoint, webhook, Google client, or submission table in the prototype.

Alternative considered: build a temporary in-app form or expose a Google Form link. Either option would introduce an application surface that is not part of the intended future intake flow.

### Read hours through a mock Google Sheets adapter

Define a `SchoolHoursSource` boundary that returns used and remaining hours by a stable school identifier. Back it with seeded mock records for the prototype and expose its values as read-only in the project workspace. The adapter returns an unavailable state for schools without a matching record.

A future Google Sheets implementation can replace the mock adapter without changing project administration or simulated email rendering. The processor treats the first observed zero-remaining-hours occurrence as the used-hours trigger. Spreadsheet identifiers, tab layout, matching columns, refresh behavior, and Google credentials are deliberately deferred until the live integration is requested.

Alternative considered: connect directly to the private spreadsheet now. That would require Google authentication and source-specific decisions that conflict with the requested prototype scope.

### Represent automation as configured workflow records

Create one project automation record containing kickoff and closing dates plus enabled states for kickoff, six-week, two-week, closing, and used-hours workflows. New projects initialize every state to enabled. Treat the checklist Submit action as one mutation that saves the settings and rebuilds unprocessed date occurrences: kickoff at its entered date, six-week at closing minus 42 days, two-week at closing minus 14 days, and closing at its entered date.

Represent the manual extension as an immutable event containing the previous and new closing dates. The same transaction updates closing, marks the project extended, recalculates future reminder occurrences, and creates the Teresa extension occurrence.

Alternative considered: store independently editable dates for every message. Deriving reminders from one closing date avoids contradictory schedules and matches the business timeline.

### Store one global fixed-sender template set

Store nine editable global subject/body templates and their variable allowlists. Sender roles are fixed in configuration: Teresa kickoff, VWM kickoff follow-up, Teresa six-week, Teresa two-week, VWM closing, Teresa closing, VWM used-hours, Teresa used-hours, and Teresa extension. Template edits affect future processing for every school but never mutate existing sent-email snapshots.

Resolve Teresa from seeded sender configuration and assigned VWMs from editable directory entries containing name and email. The lifecycle email specification defines the exact variable allowlists rather than allowing arbitrary data access from template text.

Alternative considered: store templates per project. Global templates meet the requirement to edit each message once for every school and avoid content drift.

### Separate rendering from simulated sending

The processor loads a template occurrence, resolves its school-specific variables, sender, and recipients, substitutes available values, and persists an immutable snapshot with a simulated sent status. Paired workflows enqueue or process their two templates in fixed order with no delay.

Do not define or invoke a mail transport in this prototype. Sender and recipient addresses are simulation metadata only.

Alternative considered: retain a preview record and preview UI. A sent-email simulation better demonstrates lifecycle history while still making external delivery impossible.

### Invoke an idempotent due-email processor from cron

Expose an unsecured scheduled-job entry point that claims due date occurrences and checks the hours source for newly observed zero-hours occurrences. It processes each project independently and creates simulated sent-email snapshots only when the required content, sender, and recipients resolve. Stable occurrence keys and database uniqueness prevent repeated invocations from duplicating records.

Alternative considered: an always-running in-process timer. Timers are unreliable in serverless deployments and during local restarts, while an idempotent invoked job works in both environments.

### Keep validation limited to prototype data quality

Validate the shape of editable names, email addresses, kickoff/closing dates, lifecycle states, and global subject/body content so the demonstration produces meaningful simulated sends. Used and remaining hours do not participate in mutations because they come from the read-only hours source.

Alternative considered: omit all validation. Basic data-quality checks are retained because invalid dates and addresses would undermine the simulation; they are not presented as security controls.

## Risks / Trade-offs

- [Mock hours can differ from the internal spreadsheet] -> Label them as prototype data, keep them read-only, and retain the source boundary for a later Google Sheets adapter.
- [External form submissions do not create projects] -> Keep submission UI out of the prototype and use intake-compatible seeded projects.
- [Simulated sent status does not prove email deliverability] -> Label every history record as simulated and avoid claims about provider acceptance or mailbox authority.
- [A global template edit affects every school's future messages] -> Keep immutable sent snapshots and clearly label the Emails area as global.
- [Changing closing can move reminder dates] -> Rebuild only unprocessed reminder occurrences and retain already recorded sent-email history.
- [The unsecured processor and project workspace are unsafe for public use] -> Limit the prototype to local or private demonstrations with synthetic data and require a separate production-hardening change before deployment.
- [Scheduler retries or concurrent runs could duplicate simulated sends] -> Use stable occurrence keys, database uniqueness constraints, and idempotent processing.
- [SQLite has limited concurrent-write and deployment support] -> Target a single prototype instance and isolate persistence so engineers can migrate to PostgreSQL.
- [Unconfirmed final copy may change] -> Store global subject and body content so users can revise all future simulated sends without code changes.

## Migration Plan

1. Scaffold the application and SQLite migrations without form, spreadsheet, authentication, or delivery integrations.
2. Seed the Teresa identity, VWM directory entries, mock school hours, intake-compatible school projects, recipients, kickoff/closing dates, default-enabled automation, and nine global templates with synthetic demonstration data.
3. Verify that the application has Schools, Emails, and VWM areas without a submission surface.
4. Exercise VWM assignment, read-only hours, schedule submission/recalculation, global email editing, variable substitution, paired sequences, zero-hours triggering, extension rescheduling, duplicate prevention, and per-school Sent Emails history.
5. Confirm that no login, Google API client, mail transport, provider credentials, or external delivery path is present.

The prototype has no pre-existing production data migration. Rollback consists of stopping the application and discarding or restoring its local SQLite database.

## Open Questions

- What are the final approved default subjects and bodies for each workflow?
- Which business timezone should the prototype use when evaluating scheduled simulated-send dates?
