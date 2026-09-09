## Purpose

Represent the school project records that a future external client intake integration will populate while using seeded data for the prototype.

## ADDED Requirements

### Requirement: No in-application submission experience

The prototype SHALL NOT display a school submission form, Google Form link, or submission placeholder within the application.

#### Scenario: User navigates the prototype

- **WHEN** a user views the prototype application
- **THEN** the system provides no school submission section or form controls

### Requirement: Seeded school project records

The prototype SHALL provide seeded school project records containing the school name, primary contact name and email, and project request details expected from a future external intake integration.

#### Scenario: Seeded project is loaded

- **WHEN** the prototype seed data is loaded
- **THEN** each seeded school project is automatically available as a school tab with its school, contact, and request details

### Requirement: Deferred external intake integration

The prototype SHALL NOT connect to an external form, distribute a form, process responses, or claim that a live response created a school project.

#### Scenario: External form response exists

- **WHEN** a client submits information through an external form outside the prototype
- **THEN** the prototype does not receive that response and continues to display only seeded school project records
