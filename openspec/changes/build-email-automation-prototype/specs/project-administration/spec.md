## Purpose

Provide prototype users with a central workspace for reviewing and configuring school projects, virtual webmaster assignments, derived automation schedules, contacts, lifecycle state, read-only hours, and simulated sent-email history.

## ADDED Requirements

### Requirement: Project review workspace

The system SHALL list demonstration school projects and display the stored project details and current lifecycle state of a selected project.

#### Scenario: User reviews a project

- **WHEN** a prototype user selects a school project
- **THEN** the system displays its school, contacts, request details, VWM assignment, dates, used and remaining hours, lifecycle state, and email options

### Requirement: School and recipient management

The system SHALL allow a prototype user to update a project's school details, primary school contact, additional school recipient addresses, and CSM name and email address.

#### Scenario: User updates school or recipient information

- **WHEN** a prototype user saves valid changes to school or recipient information
- **THEN** the system persists and displays the updated information for that project

#### Scenario: User enters an invalid recipient address

- **WHEN** a prototype user attempts to save an invalid primary, additional, or CSM email address
- **THEN** the system rejects the invalid value and identifies the field that requires correction

### Requirement: Virtual webmaster directory

The system SHALL allow a prototype user to add, edit, and remove virtual webmaster directory entries containing a name and email address.

#### Scenario: User adds a virtual webmaster

- **WHEN** a prototype user saves a valid virtual webmaster name and email address
- **THEN** the system persists and displays the virtual webmaster in the directory

#### Scenario: User edits a virtual webmaster

- **WHEN** a prototype user changes the name or email address of an existing virtual webmaster
- **THEN** the system persists and displays the updated directory entry

#### Scenario: User enters an invalid virtual webmaster

- **WHEN** a prototype user omits the name or enters an invalid email address for a virtual webmaster
- **THEN** the system rejects the entry and identifies each field that requires correction

#### Scenario: User removes an assigned virtual webmaster

- **WHEN** a prototype user attempts to remove a virtual webmaster who is assigned to a project
- **THEN** the system requires the project to be reassigned or unassigned before removing the directory entry

### Requirement: Virtual webmaster assignment

The system SHALL allow a prototype user to assign, reassign, or remove a virtual webmaster directory entry from a school project and SHALL display the assignment control above the project's date settings.

#### Scenario: User assigns a virtual webmaster

- **WHEN** a prototype user selects a virtual webmaster and saves the project
- **THEN** the system persists and displays that virtual webmaster as the project's current assignment

#### Scenario: User reassigns a project

- **WHEN** a prototype user replaces the assigned virtual webmaster with another directory entry
- **THEN** the system persists the new assignment as the project's current assignment

### Requirement: Project date management

The system SHALL allow a prototype user to manually set only the kickoff and closing dates and SHALL derive six-week and two-week reminder dates from the closing date.

#### Scenario: User sets project dates

- **WHEN** a prototype user submits valid kickoff and closing dates
- **THEN** the system persists those dates and calculates reminder dates six weeks and two weeks before closing

#### Scenario: User changes the closing date

- **WHEN** a prototype user submits a different closing date
- **THEN** the system replaces the closing date and recalculates any future six-week and two-week reminder dates

#### Scenario: User reviews date settings

- **WHEN** a prototype user opens a school's automation settings
- **THEN** the system provides editable kickoff and closing dates without separate editable six-week, two-week, or VWM follow-up dates

### Requirement: Read-only school hours

The prototype SHALL retrieve and display each school's used and remaining hours from a mock Google Sheets adapter and SHALL NOT provide a control that edits either value in the application. The adapter represents the future internal Google Spreadsheet source without connecting to it.

#### Scenario: Mock spreadsheet hours are available

- **WHEN** the mock Google Sheets adapter provides used and remaining hours for the selected school
- **THEN** the system displays both values as read-only prototype data intended to represent the internal spreadsheet

#### Scenario: Mock spreadsheet hours are unavailable

- **WHEN** the mock Google Sheets adapter has no hours for the selected school
- **THEN** the system displays an unavailable state and does not substitute an editable application value

#### Scenario: User reviews hour values

- **WHEN** a prototype user views used or remaining hours
- **THEN** the system provides no action for changing either value within the application

### Requirement: Lifecycle state management

The system SHALL allow a prototype user to view and update a project's lifecycle state, including awaiting review, active, extended, closing, and closed.

#### Scenario: User changes lifecycle state

- **WHEN** a prototype user selects a valid lifecycle state and saves the project
- **THEN** the system persists and displays the selected state

### Requirement: Lifecycle email option management

The system SHALL provide per-project checklist options for kickoff with VWM follow-up, six-week reminder, two-week reminder, project closing, and used-hours automation, with every option enabled by default for a new project.

#### Scenario: User reviews a new project's email options

- **WHEN** a prototype user opens automation settings for a newly created or seeded project without saved overrides
- **THEN** the system displays every automation checklist option as enabled

#### Scenario: User submits automation settings

- **WHEN** a prototype user selects the Submit action after changing enabled options or kickoff and closing dates
- **THEN** the system saves the complete configuration and recalculates future scheduled messages from the submitted dates and options

#### Scenario: Projects have independent configurations

- **WHEN** a prototype user configures different email options for two projects
- **THEN** the system retains each project's configuration independently

### Requirement: Manual project extension

The system SHALL provide a separate project extension action that accepts a new closing date, updates the project schedule, and records the extension email for Teresa.

#### Scenario: User extends a project

- **WHEN** a prototype user submits a valid extension date later than the current closing date
- **THEN** the system replaces the closing date, marks the project extended, recalculates future six-week and two-week reminder dates, and processes the Teresa extension message

#### Scenario: User enters an invalid extension date

- **WHEN** a prototype user submits an extension date that is missing, invalid, or not later than the current closing date
- **THEN** the system rejects the extension without changing the closing date or reminder schedule

### Requirement: Sent emails review

The system SHALL show a Sent Emails section below a school's lifecycle automation settings containing every simulated email processed for that school.

#### Scenario: User reviews sent emails

- **WHEN** a prototype user opens a school's Sent Emails section
- **THEN** the system displays each simulated sent email's template, processing time, sender, recipients, and simulated sent status
