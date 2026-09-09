## Why

Finalsite's school project communications currently depend on Teresa and virtual webmasters manually tracking intake details, assignments, dates, hours, and follow-up emails. A working prototype is needed to demonstrate shared email configuration and school-specific automation while continuing to treat the internal Google Spreadsheet as the eventual source of truth for school hours.

## What Changes

- Define a future intake boundary where responses from an external client form automatically create or populate school project tabs. The prototype does not show a submission section or integrate with a form and instead uses seeded school records.
- Add a school project workspace where Teresa can assign a virtual webmaster (VWM), manage school and CSM recipients, and enter only kickoff and closing dates. Six-week and two-week reminder dates are derived from the closing date.
- Display mock used and remaining hours as read-only values behind an integration boundary shaped for the internal Google Spreadsheet; the application does not provide controls for editing hours.
- Add an editable VWM directory containing each VWM's name and email address for assignment and simulated sender metadata.
- Add a global Emails tab where nine templates are edited once and shared across all schools: Teresa kickoff, VWM kickoff follow-up, Teresa six-week reminder, Teresa two-week reminder, VWM closing, Teresa closing, VWM used-hours, Teresa used-hours, and Teresa extension. Each template has fixed sender metadata, editable subject and body content, and a visible variable list.
- Enable all five automatic workflows by default. Submitting a school's automation checklist saves its enabled states and kickoff/closing dates, then recalculates scheduled messages.
- Process paired messages in order without delay: Teresa then the assigned VWM for kickoff, and the assigned VWM then Teresa for closing and used-hours. Trigger the used-hours pair when remaining hours reaches zero.
- Add a manual extension action whose new date replaces the closing date, recalculates future six-week and two-week reminders, and records a Teresa extension message.
- Show a per-school Sent Emails list of simulated sends instead of an email preview area. The prototype does not integrate with an email provider or send external messages.
- Omit authentication, authorization, credential protection, anti-abuse controls, and other production security measures from this demonstration prototype.

## Illustrative Prototype Layout

```text
Future: [External client form] -> [Intake integration] -> [School tabs]
Prototype:                [Seeded schools] -----------> [School tabs]

+-----------------------------------------------------------------------+
| EMAIL AUTOMATION PROTOTYPE              [Schools] [Emails] [VWMs]     |
+-----------------------------------------------------------------------+
| SCHOOL: North High                                                   |
| VWM Assignment [Alex Smith <alex@example.com> v]                     |
|                                                                      |
| DATE SETTINGS                                                        |
| Kickoff [date]                       Closing [date]                    |
|                                                                      |
| AUTOMATION (enabled by default)                         [Submit]       |
| [x] Kickoff + VWM follow-up     [x] Six-week reminder                 |
| [x] Two-week reminder           [x] Closing pair                     |
| [x] Used-hours pair when remaining hours reaches zero                |
|                                                                      |
| EXTENSION [new closing date] [Extend Project]                        |
|                                                                      |
| SENT EMAILS                                                          |
| Date | Template | Sender | Recipients | Simulated sent status        |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| GLOBAL EMAILS TAB, SHARED BY EVERY SCHOOL                            |
| Kickoff (Teresa) | Follow-up (VWM) | Six-week (Teresa)               |
| Two-week (Teresa) | Closing (VWM) | Closing (Teresa)                 |
| Used-hours (VWM) | Used-hours (Teresa) | Extension (Teresa)          |
| Subject [........................] Body [........................]      |
| Variables [template-specific list]                         [Save]     |
+-----------------------------------------------------------------------+
```

## Capabilities

### New Capabilities

- `school-project-intake`: Future integration boundary for external form responses to populate school projects, represented by seeded projects without form integration in this prototype.
- `project-administration`: Prototype management of school details, an editable VWM directory and assignment, kickoff/closing dates, CSM information, default-enabled automation, manual extensions, and read-only hours supplied through a mock Google Sheets adapter.
- `lifecycle-email-automation`: Global shared email templates, derived reminder scheduling, event triggering, fixed sender sequences, simulated send processing, and per-school sent-email history without external delivery.

### Modified Capabilities

None.

## Impact

- Introduces an unsecured demonstration web application with Schools, Emails, and VWMs areas; school data is seeded because external intake integration is deferred.
- Introduces persisted records for schools, contacts, projects, VWM directory entries and assignments, kickoff/closing dates, automation settings, global email templates, and simulated sent-email history.
- Defines a mock read-only Google Sheets adapter for used and remaining hours; live spreadsheet access and Google credentials are deferred, and the values cannot be changed in the application.
- Excludes external form submission processing, external email delivery, authentication, authorization, provider credentials, anti-abuse controls, and production security hardening.
- The prototype is not intended for public or production deployment and does not demonstrate production-ready security or email deliverability.
