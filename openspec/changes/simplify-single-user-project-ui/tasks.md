## 1. Active Project Retirement

- [ ] 1.1 Add a configured-business-timezone date helper and verify unit tests cover dates on both sides of a UTC/business-date boundary.
- [ ] 1.2 Filter the school-list repository to closing dates later than the current business date and verify projects closing today are excluded while future projects remain.
- [ ] 1.3 Update school selection so a retired query-string project falls back to the first active school and verify an all-retired data set renders a compact empty state instead of a not-found response.
- [ ] 1.4 Keep simulation processing independent from active-list filtering and verify an enabled closing sequence is recorded after its project disappears from the active list.
- [ ] 1.5 Verify a pre-closing extension moves active-list retirement to the new closing date without deleting project, occurrence, extension, or Sent Emails records.

## 2. Retainer Data And Language

- [ ] 2.1 Remove lifecycle state and project request from school page view models, editable actions, and repository update contracts, and verify project details save without either field.
- [ ] 2.2 Remove `project_request_details` from kickoff variable allowlists and default copy, add a targeted migration for the exact legacy token in existing templates, and verify unrelated customized content remains unchanged.
- [ ] 2.3 Replace task-specific seeded project descriptions with a neutral internal retainer value required only by the legacy schema, and verify no task/request description is exposed in seeded UI or rendered email content.
- [ ] 2.4 Update user-facing labels and README language to describe school retainers and VWM assignments rather than requested tasks, and verify a repository-wide user-facing copy check finds no stale task-specific terminology.

## 3. Simplified Schools Workspace

- [ ] 3.1 Remove the school/simulated-send metric strip, large explanatory hero, intake labels, and redundant selected-project presentation, and verify the Schools page starts with a compact active-project list and working content.
- [ ] 3.2 Replace the selected-school banner with a compact summary containing only school name and used/remaining hours, and verify populated and unavailable-hours browser states contain no request text or source/prototype badges.
- [ ] 3.3 Move the simplified Project Details section to the left desktop column with only school, primary contact/email, additional recipients, and CSM name/email, and verify mobile places the same section before operations.
- [ ] 3.4 Consolidate VWM assignment, date settings, automation checklist, Submit, extension, and Sent Emails into a straightforward right-side flow without redundant explanatory cards, and verify all existing actions still persist and render correctly.
- [ ] 3.5 Remove lifecycle-state and project-request controls from the Schools DOM and verify browser tests find neither field at desktop or mobile widths.

## 4. Simplified Emails, VWMs, And Branding

- [ ] 4.1 Remove the global-impact callout and decorative fixed-sender badge from Emails while retaining plain sender text, nine editors, variables, and Save, and verify global template editing still passes browser coverage.
- [ ] 4.2 Remove the aggregate available-VWM count presentation while retaining add/edit/delete controls and per-record assignment counts, and verify VWM lifecycle browser tests pass.
- [ ] 4.3 Replace teal, gold, cream, gradients, and decorative shadows with centralized Finalsite coral, charcoal, white, and neutral-gray CSS tokens, and verify representative pages contain the approved token values and no legacy color tokens.
- [ ] 4.4 Simplify the header to a Finalsite text wordmark plus Schools, Emails, and VWMs navigation without a prototype badge, and verify keyboard focus and responsive navigation remain usable.
- [ ] 4.5 Remove obsolete CSS and icon imports made unreachable by the simplified composition, and verify linting and TypeScript report no unused code.

## 5. Verification And Handoff

- [ ] 5.1 Update unit and integration tests for active retirement, retained history, retainer-only update contracts, and legacy-token migration, and verify the full unit suite passes.
- [ ] 5.2 Update desktop and mobile browser tests for the reduced Schools, Emails, and VWMs interfaces and verify removed metrics, badges, lifecycle/request fields, and task descriptions are absent.
- [ ] 5.3 Run migration-from-empty, seed idempotency, type checking, linting, formatting, unit/integration tests, browser tests, and the production build, and resolve every failure.
- [ ] 5.4 Update README screenshots/descriptions or demo steps to match the simplified Finalsite-branded workspace and active-project retirement behavior, and verify local setup and simulation instructions remain accurate.
