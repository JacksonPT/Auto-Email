## Context

The existing Next.js prototype has three functional areas backed by SQLite, but its visual hierarchy was designed as a stakeholder dashboard. It includes aggregate metrics, large editorial headings, descriptive callouts, status badges, multiple nested cards, lifecycle state controls, and request-specific copy. The actual operator is one project manager assigning a VWM to each school as an ongoing retainer and maintaining the automation around that relationship.

The existing data model and simulation engine are working and tested. This change should simplify their presentation and active-list behavior without introducing destructive migrations or changing the no-integration prototype boundaries. See `proposal.md` and the two capability specs for the required behavior.

## Goals / Non-Goals

**Goals:**

- Make the three application areas immediately understandable to one operator without dashboard training or explanatory UI.
- Center the Schools workspace on essential contact details, VWM assignment, hours, dates, automation, extension, and sent history.
- Replace task-specific project language with school retainer language.
- Remove projects from the active list based on their closing date while preserving records for processing and future recovery.
- Align the interface with the supplied Finalsite coral-and-charcoal identity on desktop and mobile.

**Non-Goals:**

- Adding multi-user navigation, permissions, dashboards, reporting, or user personalization.
- Permanently deleting closed projects or adding an archive-management screen.
- Changing the nine-template sequence, simulation semantics, mock-hours boundary, or email/form integrations.
- Redesigning the database around the removed lifecycle-state and request fields.
- Reconstructing the Finalsite logo from the reference screenshot or fetching an external logo asset.

## Decisions

### Flatten the visual hierarchy instead of introducing a new component system

Keep the existing React pages and custom CSS, but reduce each page to one heading and its working content. Remove metric strips, promotional callouts, decorative badges, large gradient banners, aggregate VWM counts, repeated eyebrow labels, and nested panels that do not separate distinct actions.

On desktop, the selected school layout uses a narrow left Project Details section and a wider right operations section. The compact school summary above them contains only school name and hour values. Mobile preserves the same information order in one column, with Project Details first.

Alternative considered: introduce a third-party design system. That would add dependency and visual complexity to a change whose purpose is subtraction.

### Use a restrained Finalsite palette from shared CSS tokens

Replace teal, gold, cream, gradients, and decorative shadows with a small token set derived from the supplied identity reference: coral red (`#f05268`) for primary actions and active accents, charcoal (`#56565a`) for primary text, white for working surfaces, and light neutral grays for page backgrounds and borders. Keep contrast-compliant darker coral for interactive hover/focus states.

Use a typographic `FINALSITE` treatment in the header until an approved logo asset is available. Do not embed the supplied screenshot as a production asset or attempt to redraw the logo mark from it.

Alternative considered: preserve the current teal structure and add coral accents. The result would mix identities and would not satisfy the request to match company colors.

### Treat project records as retainers, not task requests

Remove `requestDetails` and `lifecycleState` from school page view models, editable action inputs, forms, headings, seeded descriptions, and template-variable help. Remove `project_request_details` from the kickoff template allowlists and default bodies. Existing SQLite columns remain in place so the change does not require destructive migration; repository writes leave those legacy values untouched.

For fresh databases, seed a neutral internal request value only where the existing non-null schema requires it. The value is not shown or exposed as an email variable. Add a targeted migration that removes the exact `{{project_request_details}}` token from existing kickoff subject/body content and variable metadata without changing unrelated custom copy. Existing school rows may retain old hidden request values until a future schema cleanup.

Alternative considered: drop both columns immediately. Rebuilding SQLite tables adds migration risk without changing any visible behavior.

### Derive active membership directly from closing date

Add one business-date helper using the configured `BUSINESS_TIMEZONE`. The project-list repository accepts or obtains that date and returns only projects where `closing_date` is later than today. At the start of the closing date, the project disappears from Schools navigation.

Do not delete or mutate the school, automation, occurrence, extension, or sent-email rows. Do not use `lifecycle_state` to decide visibility. The due-simulation processor continues querying occurrences independently of the active-list repository, so the closing pair can still be recorded after the project leaves the list.

If the selected query-string school is no longer active, select the first remaining active school rather than returning a not-found page. If no active projects remain, show one compact empty state.

Alternative considered: set an archived flag in a scheduled cleanup job. Date-derived membership requires no additional mutation, cannot miss a transition, and automatically honors a pre-closing extension.

### Keep essential controls but remove secondary explanation

The simplified Project Details section retains school name, primary contact name/email, additional recipients, and CSM name/email. VWM assignment, kickoff/closing settings, five automation options, Submit, extension, and Sent Emails remain functionally unchanged in the adjacent operations area.

The Emails area keeps all nine editors, plain fixed-sender text, subject/body inputs, variable chips, and Save. Remove the global-impact callout and fixed-sender badge. The VWMs area keeps add/edit/delete and per-record assignment counts, but removes the aggregate count block. Preserve concise validation and empty/error messages because they communicate action outcomes rather than explain the product.

Alternative considered: combine Schools, Emails, and VWMs into one page. The global template and directory scopes are distinct from one selected school; retaining three direct navigation items is simpler than one long mixed form.

## Risks / Trade-offs

- [A project disappears before the closing simulation endpoint runs] -> Keep due processing independent from active-list queries and test processing after retirement.
- [There is no UI for retained closed records] -> Preserve data by design and document that archive browsing is intentionally deferred.
- [Removing request variables invalidates an existing customized kickoff template] -> Remove only the exact legacy token from existing subject/body content and variable metadata while preserving all unrelated custom copy.
- [Approximate colors differ from an official brand guide] -> Centralize the palette in CSS variables so exact approved values can be substituted without another layout change.
- [A very small UI can hide useful context] -> Retain action results, validation errors, derived dates, sender labels, assignment counts on VWM records, and unavailable-hours messaging.
- [Legacy lifecycle and request columns remain] -> Keep them isolated from page contracts and schedule a destructive cleanup only if the prototype becomes a maintained product.

## Migration Plan

1. Add business-date filtering and repository tests before changing page structure.
2. Remove request/lifecycle fields from school view models, mutations, templates, seed copy, and browser expectations while leaving database columns intact.
3. Restructure Schools into compact summary, left details, and right operations; then simplify Emails and VWMs.
4. Replace global style tokens and header treatment with the Finalsite palette and verify responsive layouts.
5. Run migration-from-empty, unit/integration tests, desktop/mobile browser tests, type checking, linting, formatting, and production build.

Rollback restores the previous page composition, repository list query, domain variable lists, and CSS tokens. No retained project data requires reversal because this change does not delete records.
