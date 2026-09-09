## 1. Application Foundation

- [x] 1.1 Scaffold a Next.js TypeScript application with linting, formatting, unit-test, and browser-test scripts, and verify the development server starts and all baseline checks pass.
- [x] 1.2 Add prototype configuration for the database, business timezone, and Teresa name/email, and verify valid configuration loads without requiring form, Google, or email-provider settings.
- [x] 1.3 Establish responsive Schools, global Emails, and VWMs application areas with accessible navigation, form controls, status treatments, and loading/error states, and verify representative pages at mobile and desktop viewport sizes.

## 2. Persistence And Seed Data

- [x] 2.1 Add SQLite migration tooling and model the Teresa identity, VWM directory entries, schools, contacts, projects, additional recipients, global templates, project automation settings, workflow occurrences, extension events, and simulated sent-email snapshots, and verify a new database can be created entirely from migrations.
- [x] 2.2 Add constraints for valid project relationships and unique project-occurrence-template keys, and verify persistence tests reject duplicate simulated-send keys and orphaned records.
- [x] 2.3 Implement repository functions for project updates, VWM directory and assignment, recipients, global templates, kickoff/closing settings, enabled workflows, extension events, occurrences, and Sent Emails history, and verify tests cover successful operations and invalid updates.
- [x] 2.4 Add an idempotent seed command for Teresa, sample VWMs, intake-compatible school/contact/request data, recipients, mock hours, default-enabled automation, kickoff/closing dates, and nine global templates, and verify repeated seeding produces one consistent data set.

## 3. Seeded Intake Data And Mock Hours

- [x] 3.1 Ensure seeded projects contain the school name, primary contact name/email, and request details expected from a future external intake integration, and verify each seeded project automatically appears as an available school tab.
- [x] 3.2 Keep submission UI and external form configuration out of the application, and verify browser tests find no submission section, form link, or placeholder.
- [x] 3.3 Define the `SchoolHoursSource` boundary with a seeded mock Google Sheets adapter keyed by school identifier, and verify tests return used/remaining values and an unavailable result for an unknown school.
- [x] 3.4 Display mock used and remaining hours with prototype-source labeling and no edit controls, and verify browser tests cover populated and unavailable states.

## 4. Project Administration

- [x] 4.1 Build the project list and detail workspace with school, contact, request, assignment, date, lifecycle, email-option, and read-only hour context, and verify seeded projects can be found and opened.
- [x] 4.2 Add editing for school details, primary/additional recipients, CSM details, and lifecycle state, and verify valid edits persist after reload while malformed addresses are rejected.
- [x] 4.3 Build VWM directory controls for adding, editing, and removing name/email entries, and verify invalid entries are rejected and assigned entries require reassignment or unassignment before removal.
- [x] 4.4 Place project VWM assignment above date settings and support assignment/reassignment from the directory, and verify the selected VWM name/email persists after reload.
- [x] 4.5 Add kickoff and closing date inputs above a default-enabled checklist for kickoff, six-week, two-week, closing, and used-hours automation, and verify no editable VWM-follow-up, six-week, or two-week date exists.
- [x] 4.6 Implement one Submit action that saves kickoff/closing dates and enabled states together, recalculates unprocessed six-week/two-week occurrences, and verify two projects retain independent settings after reload.
- [x] 4.7 Add the manual extension date action, and verify a valid later date records the previous/new dates, updates closing/lifecycle state, recalculates future reminders, and triggers one Teresa extension occurrence.

## 5. Global Email Configuration And Rendering

- [x] 5.1 Define the nine global templates, fixed Teresa/VWM sender roles, recipient rules, paired sequence order, and exact variable inventories from the lifecycle email specification, and verify configuration tests cover every template.
- [x] 5.2 Build the global Emails area with subject/body inputs and supported variables for all nine templates, and verify one saved edit is displayed and used globally rather than stored per school.
- [x] 5.3 Reject unsupported template variables and render simulated email content from global templates plus school-specific values, and verify supported substitutions and missing-value errors for every template family.
- [x] 5.4 Resolve fixed sender metadata from Teresa configuration or the school's assigned VWM, and verify missing required VWM data prevents that template from being recorded as simulated sent.
- [x] 5.5 Resolve primary/additional school recipients and include the CSM on the Teresa two-week and both closing templates, and verify each template records the expected recipient list.
- [x] 5.6 Resolve `used_hours` and `remaining_hours` through `SchoolHoursSource` during rendering, and verify zero-hours templates consume mock adapter values without accepting an in-app hour mutation.

## 6. Simulated Sending And Scheduling

- [x] 6.1 Create kickoff, closing-minus-42-day, closing-minus-14-day, and closing occurrences from submitted dates and enabled states, and verify disabled workflows, future dates, and superseded dates do not process.
- [x] 6.2 Detect the first unprocessed zero-remaining-hours occurrence from `SchoolHoursSource`, and verify it triggers the enabled used-hours workflow once while positive hours trigger nothing.
- [x] 6.3 Process kickoff as Teresa then VWM, closing as VWM then Teresa, and used-hours as VWM then Teresa with no delay, and verify six-week, two-week, and extension each process one Teresa template.
- [x] 6.4 Store immutable template, content, sender, recipient, processing-time, and simulated sent-status snapshots without defining or invoking a mail transport, and verify global template edits do not alter existing snapshots.
- [x] 6.5 Add database-backed idempotency and an unsecured due-simulation endpoint, and verify repeated/concurrent processing cannot create duplicate records while one invalid school does not stop other schools.
- [x] 6.6 Build each school's Sent Emails list below its automation settings, and verify it displays all associated simulated sends with template, sender, recipients, time, and status without a preview activity area.

## 7. End-To-End Verification And Handoff

- [x] 7.1 Add browser tests for seeded school tabs, absence of submission UI, VWM directory/assignment, read-only hours, recipients, global email inputs/variables, two-date settings, default-enabled checklists, Submit, extension, and Sent Emails, and verify the suite passes on mobile and desktop viewports.
- [x] 7.2 Add an end-to-end test that processes kickoff, derived reminders, closing, zero-hours, and extension for a seeded school while asserting fixed sender order, recipients, CSM, mock hours, global substitutions, simulated history, rescheduling, and duplicate prevention.
- [x] 7.3 Run type checking, linting, unit/integration tests, browser tests, migration-from-empty, and a production build, and resolve all failures until every command passes.
- [x] 7.4 Document local setup, intake-compatible synthetic seed data, mock hours boundary, global templates, due-simulation invocation, database reset, stakeholder demo steps, and the explicit absence of submission UI, live Google integration, email delivery, and production security, and verify a fresh checkout can follow the documentation successfully.
