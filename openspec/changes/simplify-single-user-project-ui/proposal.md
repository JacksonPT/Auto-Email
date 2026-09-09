## Why

The prototype exposes too much decorative status, explanatory copy, and project metadata for a single operator who only needs to assign a virtual webmaster, manage school contacts and dates, and review email activity. Simplifying the interface and describing each project as an ongoing school retainer will make the demonstration faster to understand and closer to the real operating model.

## What Changes

- Replace the dashboard-style presentation with a compact single-user workspace using only the controls and information needed for daily project management.
- Remove the school/simulated-send metric strip, descriptive hero text, global-email callout, fixed-sender badge, available-VWM count, intake-compatible labels, and other redundant presentation cards.
- Simplify the selected-school summary so it displays only the school name and read-only used/remaining hours.
- Keep a straightforward list of active school projects and automatically remove a project from that list when its closing date is reached. Preserve its records and Sent Emails history internally rather than permanently deleting it.
- Reframe projects as school-to-VWM retainer assignments for future requests, not task-specific engagements. Remove project-request fields, seeded task descriptions, and task-oriented language from the interface and demonstration data.
- Move the simplified Project Details section to the left side of the school workspace and retain only school name, primary contact, primary email, additional recipients, CSM name, and CSM email.
- Remove lifecycle-state display, editing, and lifecycle-state-dependent project management behavior from the user interface.
- Preserve the existing VWM assignment, kickoff/closing date controls, automation checklist, extension action, global email templates, read-only hours source, and Sent Emails behavior, but present them with fewer wrappers and less explanatory content.
- Restyle the application to match Finalsite branding with a coral-red primary accent, charcoal-gray text, white surfaces, restrained light-gray borders/backgrounds, and the Finalsite mark or wordmark where an approved asset is available.

## Capabilities

### New Capabilities

- `single-user-retainer-workspace`: Minimal Finalsite-branded Schools, Emails, and VWMs interfaces centered on school retainer assignments and essential editable details.
- `active-project-retirement`: Automatic removal of projects from the active project list at closing while retaining their underlying records and email history.

### Modified Capabilities

None. The earlier prototype capabilities have not yet been archived into the main specification set; this follow-up defines the simplified behavior as focused replacement capabilities.

## Impact

- Changes the layout and content of `app/schools/page.tsx`, `app/emails/page.tsx`, `app/vwms/page.tsx`, shared navigation, and global styling.
- Removes lifecycle-state and project-request inputs from server actions and repository-facing page mutations while retaining existing database columns for compatibility with seeded prototype data.
- Updates active-project queries and due processing so projects at or past closing no longer appear in the active list or generate new scheduled simulations.
- Revises seed data, labels, tests, and README guidance to use retainer-oriented language without task-specific descriptions.
- Does not add authentication, external form integration, live spreadsheet access, or real email delivery.
