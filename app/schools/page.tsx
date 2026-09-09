import {
  CalendarDays,
  Check,
  Clock3,
  MailCheck,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  assignVwmAction,
  extendProjectAction,
  saveAutomationAction,
  updateSchoolAction,
} from "@/app/actions";
import { config } from "@/lib/config";
import { lifecycleStates, subtractDays } from "@/lib/domain";
import { schoolHoursSource } from "@/lib/hours";
import {
  getSchoolDetail,
  listSchools,
  listVirtualWebmasters,
} from "@/lib/repository";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function displayState(state: string) {
  return state.replaceAll("_", " ");
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function displayTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: config.businessTimezone,
  }).format(new Date(value));
}

export default async function SchoolsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const schools = listSchools();
  const selectedId =
    typeof params.school === "string" ? params.school : schools[0]?.id;
  if (!selectedId) notFound();
  const school = getSchoolDetail(selectedId);
  if (!school) notFound();
  const vwms = listVirtualWebmasters();
  const hours = schoolHoursSource.getHours(school.id);
  const notice = typeof params.notice === "string" ? params.notice : null;
  const error = typeof params.error === "string" ? params.error : null;

  const automationOptions = [
    {
      name: "kickoffEnabled",
      checked: school.automation.kickoffEnabled,
      title: "Kickoff + VWM follow-up",
      detail: `Runs ${displayDate(school.automation.kickoffDate)}`,
    },
    {
      name: "sixWeekEnabled",
      checked: school.automation.sixWeekEnabled,
      title: "Six-week reminder",
      detail: displayDate(subtractDays(school.automation.closingDate, 42)),
    },
    {
      name: "twoWeekEnabled",
      checked: school.automation.twoWeekEnabled,
      title: "Two-week reminder",
      detail: displayDate(subtractDays(school.automation.closingDate, 14)),
    },
    {
      name: "closingEnabled",
      checked: school.automation.closingEnabled,
      title: "Closing sequence",
      detail: displayDate(school.automation.closingDate),
    },
    {
      name: "usedHoursEnabled",
      checked: school.automation.usedHoursEnabled,
      title: "Hours-used sequence",
      detail: "When remaining hours reach zero",
    },
  ];

  return (
    <div className="page-shell schools-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">School workspace</p>
          <h1>Every project, on its own clock.</h1>
          <p className="lede">
            Assign the team, set two dates, and let the shared email sequence
            take it from there.
          </p>
        </div>
        <div className="metric-strip" aria-label="Project summary">
          <span>
            <strong>{schools.length}</strong> schools
          </span>
          <span>
            <strong>{school.sentEmails.length}</strong> simulated sends
          </span>
        </div>
      </div>

      <nav className="school-tabs" aria-label="School projects">
        {schools.map((item) => (
          <Link
            aria-current={item.id === school.id ? "page" : undefined}
            href={`/schools?school=${item.id}`}
            key={item.id}
          >
            <span>{item.name}</span>
            <small>{displayState(item.lifecycleState)}</small>
          </Link>
        ))}
      </nav>

      {notice ? <p className="notice">{notice}</p> : null}
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="school-banner">
        <div>
          <p className="eyebrow">Selected project</p>
          <h2>{school.name}</h2>
          <p>{school.requestDetails}</p>
        </div>
        <div className="hours-card" aria-label="Read-only prototype hours">
          <span>Mock sheet hours</span>
          {hours ? (
            <div>
              <p>
                <strong>{hours.used}</strong>
                Used
              </p>
              <i />
              <p>
                <strong>{hours.remaining}</strong>
                Remaining
              </p>
            </div>
          ) : (
            <p className="muted">Hours unavailable</p>
          )}
          <small>Read-only prototype data</small>
        </div>
      </section>

      <div className="school-layout">
        <div className="school-main">
          <section className="panel automation-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Automation settings</p>
                <h2>Set the project rhythm</h2>
              </div>
              <CalendarDays aria-hidden="true" />
            </div>
            <div className="panel-body">
              <form action={assignVwmAction} className="assignment-form">
                <input name="schoolId" type="hidden" value={school.id} />
                <label className="field">
                  <span>Virtual webmaster</span>
                  <select
                    defaultValue={school.assignedVwmId ?? ""}
                    name="vwmId"
                  >
                    <option value="">Unassigned</option>
                    {vwms.map((vwm) => (
                      <option key={vwm.id} value={vwm.id}>
                        {vwm.name} &lt;{vwm.email}&gt;
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button" type="submit">
                  <UserRoundCheck aria-hidden="true" size={17} /> Save
                  assignment
                </button>
              </form>

              <form action={saveAutomationAction}>
                <input name="schoolId" type="hidden" value={school.id} />
                <div className="section-rule">
                  <span>Date settings</span>
                  <small>Reminder dates calculate automatically</small>
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Kickoff date</span>
                    <input
                      defaultValue={school.automation.kickoffDate}
                      name="kickoffDate"
                      required
                      type="date"
                    />
                  </label>
                  <label className="field">
                    <span>Closing date</span>
                    <input
                      defaultValue={school.automation.closingDate}
                      name="closingDate"
                      required
                      type="date"
                    />
                  </label>
                </div>

                <div className="section-rule">
                  <span>Lifecycle emails</span>
                  <small>Enabled by default</small>
                </div>
                <div className="automation-list">
                  {automationOptions.map((option) => (
                    <label className="automation-check" key={option.name}>
                      <input
                        defaultChecked={option.checked}
                        name={option.name}
                        type="checkbox"
                      />
                      <span className="check-box">
                        <Check aria-hidden="true" size={15} strokeWidth={3} />
                      </span>
                      <span>
                        <strong>{option.title}</strong>
                        <small>{option.detail}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="form-actions submit-row">
                  <p>Submitting recalculates all unprocessed dates.</p>
                  <button className="button button-primary" type="submit">
                    Submit automation
                  </button>
                </div>
              </form>

              <form action={extendProjectAction} className="extension-form">
                <input name="schoolId" type="hidden" value={school.id} />
                <div>
                  <p className="eyebrow">Manual extension</p>
                  <h3>Move the close date</h3>
                  <p>The reminder schedule will follow the new date.</p>
                </div>
                <label className="field">
                  <span>Extended to</span>
                  <input
                    min={school.automation.closingDate}
                    name="newClosingDate"
                    required
                    type="date"
                  />
                </label>
                <button className="button" type="submit">
                  Extend project
                </button>
              </form>
            </div>
          </section>

          <section className="panel sent-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Running history</p>
                <h2>Sent emails</h2>
              </div>
              <MailCheck aria-hidden="true" />
            </div>
            {school.sentEmails.length > 0 ? (
              <div className="sent-list">
                {school.sentEmails.map((email) => (
                  <details key={email.id}>
                    <summary>
                      <span className="sent-icon">
                        <Check aria-hidden="true" size={14} strokeWidth={3} />
                      </span>
                      <span>
                        <strong>{email.templateLabel}</strong>
                        <small>{email.subject}</small>
                      </span>
                      <span className="sent-meta">
                        {displayTimestamp(email.processedAt)}
                        <small>Simulated sent</small>
                      </span>
                    </summary>
                    <div className="sent-content">
                      <p>
                        <strong>From:</strong> {email.senderName} &lt;
                        {email.senderEmail}&gt;
                      </p>
                      <p>
                        <strong>To:</strong> {email.recipients.join(", ")}
                      </p>
                      <pre>{email.body}</pre>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="panel-body empty-history">
                <Clock3 aria-hidden="true" />
                <p>No simulated sends yet. Due workflows will appear here.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="panel details-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Intake-compatible data</p>
              <h2>Project details</h2>
            </div>
          </div>
          <form action={updateSchoolAction} className="panel-body">
            <input name="schoolId" type="hidden" value={school.id} />
            <label className="field">
              <span>School name</span>
              <input defaultValue={school.name} name="name" required />
            </label>
            <label className="field">
              <span>Primary contact</span>
              <input
                defaultValue={school.primaryContactName}
                name="primaryContactName"
                required
              />
            </label>
            <label className="field">
              <span>Primary email</span>
              <input
                defaultValue={school.primaryContactEmail}
                name="primaryContactEmail"
                required
                type="email"
              />
            </label>
            <label className="field">
              <span>Additional recipients</span>
              <textarea
                defaultValue={school.additionalRecipients.join(", ")}
                name="additionalRecipients"
                rows={2}
              />
            </label>
            <label className="field">
              <span>CSM name</span>
              <input defaultValue={school.csmName} name="csmName" />
            </label>
            <label className="field">
              <span>CSM email</span>
              <input
                defaultValue={school.csmEmail}
                name="csmEmail"
                type="email"
              />
            </label>
            <label className="field">
              <span>Lifecycle state</span>
              <select
                defaultValue={school.lifecycleState}
                name="lifecycleState"
              >
                {lifecycleStates.map((state) => (
                  <option key={state} value={state}>
                    {displayState(state)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Project request</span>
              <textarea
                defaultValue={school.requestDetails}
                name="requestDetails"
                required
                rows={5}
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">
                Save project details
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
