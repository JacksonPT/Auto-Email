## Purpose

Configure shared lifecycle email templates and generate simulated sent-email records from school dates, assignments, contacts, and read-only hours without external delivery.

## ADDED Requirements

### Requirement: Supported lifecycle email workflows

The system SHALL support five independently enabled automatic workflows: kickoff with VWM follow-up, six-week reminder, two-week reminder, project closing, and used-hours. The system SHALL also support a separate manual extension action.

#### Scenario: User reviews supported workflows

- **WHEN** a prototype user reviews the lifecycle email options for a project
- **THEN** the system displays the five automatic workflows as checklist options and displays extension as a separate action

### Requirement: Enabled workflow enforcement

The system SHALL process an automatic lifecycle email sequence only when its workflow is enabled for the project.

#### Scenario: Enabled lifecycle workflow becomes due

- **WHEN** an enabled workflow reaches its calculated date or triggering hours condition
- **THEN** the system processes that workflow's simulated email sequence

#### Scenario: Disabled lifecycle workflow becomes due

- **WHEN** a disabled workflow reaches its calculated date or triggering hours condition
- **THEN** the system does not create simulated sent-email records for that occurrence

### Requirement: Date-based email scheduling

The system SHALL schedule the kickoff sequence on the user-entered kickoff date, the six-week reminder 42 days before the closing date, the two-week reminder 14 days before the closing date, and the closing sequence on the user-entered closing date.

#### Scenario: Kickoff date is reached

- **WHEN** the enabled kickoff workflow reaches the project's kickoff date
- **THEN** the system processes the kickoff sequence

#### Scenario: Six-week reminder date is reached

- **WHEN** the enabled six-week workflow reaches 42 days before the project's closing date
- **THEN** the system processes the Teresa six-week reminder

#### Scenario: Two-week reminder date is reached

- **WHEN** the enabled two-week workflow reaches 14 days before the project's closing date
- **THEN** the system processes the Teresa two-week reminder

#### Scenario: Closing date is reached

- **WHEN** the enabled closing workflow reaches the project's closing date
- **THEN** the system processes the closing sequence

#### Scenario: Closing date changes before future reminders

- **WHEN** a prototype user submits a new closing date before a calculated reminder has been processed
- **THEN** the system recalculates that reminder from the new closing date and does not process it on the superseded date

### Requirement: Hours-triggered email workflow

The system SHALL process the used-hours sequence once when an enabled project's read-only remaining hours reaches zero in the mock Google Sheets adapter.

#### Scenario: Remaining hours reaches zero

- **WHEN** processing observes zero remaining hours for a project whose used-hours workflow is enabled and has not been processed for that zero-hours occurrence
- **THEN** the system processes the used-hours sequence with the current used and remaining hours

#### Scenario: Remaining hours is greater than zero

- **WHEN** processing observes a positive remaining-hours value
- **THEN** the system does not process a used-hours sequence for that project

### Requirement: Manual extension workflow

The system SHALL process one Teresa extension message when a prototype user successfully extends a project to a new closing date.

#### Scenario: Project is extended

- **WHEN** a prototype user successfully replaces the closing date through the project extension action
- **THEN** the system processes the Teresa extension template using the previous and new closing dates

### Requirement: Ordered email sequences

The system SHALL process every paired workflow in its defined order without a delay between its two templates.

#### Scenario: Kickoff sequence is processed

- **WHEN** the kickoff workflow becomes due
- **THEN** the system processes the Teresa kickoff template followed immediately by the assigned VWM follow-up template

#### Scenario: Closing sequence is processed

- **WHEN** the closing workflow becomes due
- **THEN** the system processes the assigned VWM closing template followed immediately by the Teresa closing template

#### Scenario: Used-hours sequence is processed

- **WHEN** the used-hours workflow is triggered
- **THEN** the system processes the assigned VWM used-hours template followed immediately by the Teresa used-hours template

#### Scenario: Single-message workflow is processed

- **WHEN** a six-week, two-week, or extension workflow is processed
- **THEN** the system processes one Teresa template for that workflow

### Requirement: Global email template management

The system SHALL provide one global Emails area containing editable subject and body inputs for nine templates shared by every school project: Teresa kickoff, VWM kickoff follow-up, Teresa six-week reminder, Teresa two-week reminder, VWM closing, Teresa closing, VWM used-hours, Teresa used-hours, and Teresa extension.

#### Scenario: User edits a global email template

- **WHEN** a prototype user saves subject or body content for one of the nine templates
- **THEN** the system uses that content for future processing of the template across every school project

#### Scenario: User reviews the global Emails area

- **WHEN** a prototype user opens the Emails area
- **THEN** the system displays all nine templates with their fixed Teresa or VWM sender roles

### Requirement: Lifecycle email variables

The system SHALL list the supported variables in each global template input section and SHALL limit simulated-send substitution to the variables listed for that template.

The common variables are `school_name`, `primary_contact_name`, `primary_contact_email`, `assigned_vwm_name`, `assigned_vwm_email`, `sender_name`, `sender_email`, `kickoff_date`, `closing_date`, `six_week_reminder_date`, `two_week_reminder_date`, `used_hours`, and `remaining_hours`.

- Teresa kickoff and VWM kickoff follow-up SHALL support all common variables plus `project_request_details`.
- Teresa six-week reminder SHALL support all common variables.
- Teresa two-week reminder SHALL support all common variables plus `csm_name` and `csm_email`.
- VWM closing and Teresa closing SHALL support all common variables plus `csm_name` and `csm_email`.
- VWM used-hours and Teresa used-hours SHALL support all common variables.
- Teresa extension SHALL support all common variables plus `previous_closing_date` and `new_closing_date`.

#### Scenario: User reviews template variables

- **WHEN** a prototype user opens a global template input section
- **THEN** the system displays only the common and template-specific variables supported by that template

#### Scenario: User includes a supported variable

- **WHEN** saved subject or body content contains a variable supported by that template
- **THEN** the processed simulated email replaces it with the applicable school's value

#### Scenario: User includes an unsupported variable

- **WHEN** a prototype user attempts to save content containing a variable not supported by that template
- **THEN** the system rejects the content and identifies the unsupported variable

### Requirement: Simulated email rendering

The system SHALL render each simulated email from its global template and the supported values of the school project whose workflow is being processed.

#### Scenario: Simulated email is prepared

- **WHEN** a lifecycle template is processed with all referenced school-project values available
- **THEN** the system produces a subject and body with supported variables replaced by that school's values

#### Scenario: Required template data is unavailable

- **WHEN** saved template content references a supported variable whose school-project value is unavailable
- **THEN** the system does not record the email as simulated sent and identifies the unavailable value

### Requirement: Sender identity selection

The system SHALL associate every global template with its fixed Teresa or VWM sender role and SHALL resolve sender metadata from the configured Teresa identity or the school's assigned VWM directory entry.

#### Scenario: Teresa template is processed

- **WHEN** a template with the fixed Teresa sender role is processed
- **THEN** the system records the configured Teresa name and email address as the simulated sender

#### Scenario: VWM template is processed

- **WHEN** a template with the fixed VWM sender role is processed
- **THEN** the system records the name and email address of the VWM directory entry currently assigned to the school project

#### Scenario: Required sender identity is unavailable

- **WHEN** a VWM template is due but the school project has no assigned VWM with a usable name and email address
- **THEN** the system does not record that email as simulated sent and identifies the missing sender information

### Requirement: Recipient selection

The system SHALL use the project's primary and additional school recipients for lifecycle emails and SHALL include the project's CSM on the Teresa two-week reminder and both project closing emails.

#### Scenario: Standard lifecycle recipients

- **WHEN** the system processes a template other than the two-week reminder or either closing template
- **THEN** it records the project's primary and additional school recipients

#### Scenario: Closing-related recipients

- **WHEN** the system processes the Teresa two-week reminder or either closing template
- **THEN** it records the project's primary contact, additional school recipients, and CSM

#### Scenario: Required recipient is unavailable

- **WHEN** a template is due but a recipient required for that template has no usable email address
- **THEN** the system does not record that email as simulated sent and identifies the missing recipient information

### Requirement: Simulated sent-email output

The prototype SHALL render successful lifecycle processing as simulated sent emails and SHALL NOT connect to an external email provider or contact recipients.

#### Scenario: Lifecycle email is processed

- **WHEN** a lifecycle template is successfully processed
- **THEN** the system stores it with a simulated sent status without contacting an external mail provider or recipient

### Requirement: Per-school sent-email history

The system SHALL retain and display a Sent Emails list for each school containing every successfully processed simulated email's template, sender, recipients, rendered content snapshot, processing time, and simulated sent status.

#### Scenario: User reviews a school's sent emails

- **WHEN** a prototype user opens a school's Sent Emails section
- **THEN** the system displays all simulated sent-email records associated with that school

#### Scenario: Global template changes after processing

- **WHEN** a prototype user changes a global template after a simulated email was recorded
- **THEN** the existing sent-email record retains the content, sender, and recipients used when it was processed

### Requirement: Duplicate simulated-send prevention

The system SHALL prevent more than one simulated sent-email record for the same template and lifecycle occurrence.

#### Scenario: Scheduled processing runs more than once

- **WHEN** scheduled processing evaluates a template occurrence that already has a simulated sent-email record
- **THEN** the system does not create another sent-email record for that template occurrence

#### Scenario: A trigger is processed more than once

- **WHEN** the same zero-hours or extension occurrence is evaluated after its templates were recorded
- **THEN** the system does not create another sent-email record for those template occurrences
