## Purpose

Provide one operator with a minimal Finalsite-branded workspace for managing school virtual-webmaster retainers without decorative dashboard elements or task-specific project concepts.

## ADDED Requirements

### Requirement: Minimal application navigation
The system SHALL provide direct navigation to Schools, Emails, and VWMs without displaying dashboard totals, simulated-send totals, explanatory hero metrics, or user-management controls.

#### Scenario: User opens an application area
- **WHEN** the user opens Schools, Emails, or VWMs
- **THEN** the system displays the selected working area with only its title, primary controls, and relevant records

### Requirement: Compact school summary
The system SHALL display a selected school's name and read-only used and remaining hours in one compact summary without selected-project labels, request descriptions, source badges, or prototype explanations.

#### Scenario: User selects an active school
- **WHEN** the user selects a school with available hours data
- **THEN** the system displays the school name together with its used and remaining hours

#### Scenario: Hours are unavailable
- **WHEN** the selected school has no available hours record
- **THEN** the system displays the school name and a concise unavailable-hours state

### Requirement: Retainer-oriented project language
The system SHALL describe each project as an ongoing assignment of a virtual webmaster to a school for future requests and SHALL NOT display task-specific project descriptions, project-request fields, or intake-compatibility language.

#### Scenario: User reviews a school project
- **WHEN** the user views the school workspace or seeded demonstration content
- **THEN** the system uses school, assignment, retainer, contact, date, and email language without describing a specific requested task

### Requirement: Simplified project details
The system SHALL place Project Details on the left side of the desktop school workspace and limit the editable fields to school name, primary contact name, primary contact email, additional recipients, CSM name, and CSM email.

#### Scenario: User edits project details
- **WHEN** the user opens Project Details
- **THEN** the system displays only the six supported school and contact fields with a single save action

#### Scenario: User saves valid project details
- **WHEN** the user submits valid changes to the supported fields
- **THEN** the system persists and redisplays those changes without requiring a lifecycle state or project request

#### Scenario: User enters an invalid email address
- **WHEN** the user submits an invalid primary, additional-recipient, or CSM email address
- **THEN** the system rejects the invalid value and identifies that the details were not saved

### Requirement: Essential school controls
The system SHALL retain VWM assignment, kickoff and closing dates, the five automation options, the automation submit action, manual extension, read-only hours, and Sent Emails while presenting them without redundant wrapper cards or explanatory callouts.

#### Scenario: User manages an active retainer
- **WHEN** the user opens an active school
- **THEN** the essential assignment, schedule, automation, extension, and email-history controls remain available in one straightforward workspace

### Requirement: Simplified global email management
The system SHALL retain all nine global template editors with fixed sender information and supported variables while removing the global-impact callout and decorative fixed-sender badge.

#### Scenario: User edits a global template
- **WHEN** the user opens an email template
- **THEN** the system displays its name, sender as plain supporting text, subject, body, supported variables, and save action without auxiliary promotional or status cards

### Requirement: Simplified VWM directory
The system SHALL retain VWM add, edit, assignment-count context, and eligible removal actions without displaying an available-VWM summary count card.

#### Scenario: User opens the VWM directory
- **WHEN** the user views VWMs
- **THEN** the system displays the directory controls and VWM records without a separate aggregate-count presentation

### Requirement: Finalsite visual identity
The system SHALL use a restrained Finalsite visual palette based on coral red, charcoal gray, white, and light neutral gray across desktop and mobile layouts.

#### Scenario: User views the application
- **WHEN** any application area is rendered
- **THEN** primary accents use Finalsite coral, text uses charcoal gray, surfaces remain white, and teal, gold, and decorative gradient treatments are absent

#### Scenario: Approved logo asset is unavailable
- **WHEN** the application has no approved Finalsite logo file
- **THEN** the header uses a text wordmark treatment without embedding a copied screenshot or fetching an external brand asset
