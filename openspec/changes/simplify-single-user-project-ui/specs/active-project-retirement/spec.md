## Purpose

Keep the single-user project list focused on current school retainers by automatically retiring projects at closing without destroying their historical data.

## ADDED Requirements

### Requirement: Active project list
The system SHALL list only projects whose closing date is later than the current business date.

#### Scenario: Project closes today
- **WHEN** the current business date reaches a project's closing date
- **THEN** the project no longer appears in the active project list

#### Scenario: Project closes in the future
- **WHEN** a project's closing date is later than the current business date
- **THEN** the project remains available in the active project list

### Requirement: Retired project retention
The system SHALL retain a retired project's school details, VWM assignment, automation settings, occurrences, extension events, and Sent Emails records after removing it from the active list.

#### Scenario: Project is retired
- **WHEN** a project reaches its closing date
- **THEN** the system hides it from the active list without deleting its persisted records

### Requirement: Closing processing remains independent
The system SHALL continue processing an enabled closing occurrence when it becomes due even if the project is no longer displayed in the active project list.

#### Scenario: Closing processor runs after list retirement
- **WHEN** the processor evaluates an unprocessed closing occurrence at or after its due time
- **THEN** the system records the configured closing email sequence for the retained project

### Requirement: Closing-date extensions preserve active access
The system SHALL use the latest saved closing date to determine whether a project belongs in the active list.

#### Scenario: User extends a project before closing
- **WHEN** the user changes the closing date to a later date before the current closing date is reached
- **THEN** the project remains active until the new closing date

### Requirement: No lifecycle-state controls
The system SHALL determine active-list membership from the closing date and SHALL NOT expose lifecycle-state display or editing controls.

#### Scenario: User manages an active project
- **WHEN** the user views or edits a project
- **THEN** no lifecycle-state value or selector is displayed or required
