# Finalsite Project Desk

A local prototype for configuring school project lifecycle emails and recording simulated sends. It does not connect to an intake form, Google Sheets, or an email provider.

## Local Setup

Requirements:

- Node.js 20.9 or newer
- npm

Install and start the prototype:

```bash
npm install
npm run db:reset
npm run dev
```

Open `http://localhost:3000`. The root redirects to the Schools workspace.

The application works with built-in defaults. To override them, create `.env.local` using `.env.example` as a reference:

```dotenv
DATABASE_PATH=./data/prototype.db
BUSINESS_TIMEZONE=America/New_York
TERESA_NAME=Project Manager
TERESA_EMAIL=project-manager@example.com
```

No form URL, Google credentials, login credentials, scheduler secret, or email-provider settings are required.

## Seeded Demonstration Data

`npm run db:seed` idempotently creates:

- Four intake-compatible school projects with contact and request details, including one unavailable-hours state
- Three virtual webmasters with name and email
- The Project Manager's simulated sender identity
- Read-only mock used and remaining hours
- Kickoff and closing dates with all five automatic workflows enabled
- Nine global subject/body templates

The school records represent the data shape a future external client form will populate. There is intentionally no submission form, form link, or response processing in the prototype.

## Prototype Areas

### Schools

Select a seeded school to:

- Edit school, primary contact, additional recipient, CSM, and lifecycle details
- Assign a VWM from the directory above the date settings
- View read-only hours supplied by the mock Google Sheets adapter
- Set kickoff and closing dates
- Enable or disable the five automatic workflows
- Submit all automation settings and recalculate future dates
- Extend the closing date manually and simulate the Project Manager's extension email
- Review immutable simulated sends in the school's Sent Emails section

Six-week and two-week reminder dates are derived from closing. A zero remaining-hours value triggers the used-hours sequence once.

### Emails

The Emails area stores one shared configuration used by every school. It contains nine fixed-sender templates:

1. Project Manager kickoff
2. VWM kickoff follow-up
3. Project Manager six-week reminder
4. Project Manager two-week reminder
5. VWM closing
6. Project Manager closing follow-up
7. VWM hours-used message
8. Project Manager hours-used follow-up
9. Project Manager extension

Each editor lists its supported `{{variable}}` values. Unsupported variables are rejected. Template changes affect future simulations but do not alter existing Sent Emails snapshots.

### VWMs

The VWM directory supports adding and editing names and email addresses. A VWM assigned to a school cannot be removed until the school is reassigned or unassigned.

## Simulated Scheduling

Invoke the intentionally unsecured local processor:

```bash
curl -X POST http://localhost:3000/api/simulate
```

The processor:

- Claims due kickoff, six-week, two-week, and closing occurrences
- Checks the mock hours source for a first zero-hours occurrence
- Processes paired messages in their fixed order without a delay
- Stores rendered content, sender, recipients, timestamp, and `simulated_sent` status
- Uses database uniqueness to prevent duplicate records
- Continues processing other schools if one school has incomplete data

No network delivery occurs and no mail transport exists in the application.

## Stakeholder Demo

1. Run `npm run db:reset` and `npm run dev`.
2. Open Schools and compare the seeded school tabs, assigned VWMs, and read-only hour balances.
3. Change kickoff or closing for one school, toggle an option, and submit automation.
4. Open Emails, show the nine shared templates and template-specific variables, then save an edit.
5. Open VWMs and demonstrate the reusable assignment directory.
6. Run the simulation endpoint and return to a school to inspect Sent Emails.
7. Extend a project and show the revised closing date plus the Project Manager's immutable extension record.

## Data Commands

```bash
npm run db:migrate  # Apply migrations without resetting data
npm run db:seed     # Add missing seed records without overwriting edits
npm run db:reset    # Delete the local database, migrate, and reseed
```

Rollback for this prototype is stopping the app and running `npm run db:reset`, or restoring a copy of `data/prototype.db`.

## Verification

```bash
npm run typecheck
npm run lint
npm run format
npm test
npm run test:e2e
npm run build
```

Install Chromium once before the browser suite if needed:

```bash
npx playwright install chromium
```

## Explicit Limitations

This prototype is for local or private demonstrations with synthetic data. It deliberately excludes:

- Submission UI and external form integration
- Live Google Sheets access and Google credentials
- In-application hour editing
- Real email delivery or provider credentials
- Authentication, authorization, anti-abuse controls, and production security hardening
- Production deployment guarantees

A separate planning change is required before connecting real client, spreadsheet, or email systems.
