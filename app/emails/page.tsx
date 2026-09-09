import { Globe2, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTemplateAction } from "@/app/actions";
import { getGlobalTemplate, listGlobalTemplates } from "@/lib/repository";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmailsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const templates = listGlobalTemplates();
  const selectedKey =
    typeof params.template === "string" ? params.template : templates[0]?.key;
  if (!selectedKey) notFound();
  const template = getGlobalTemplate(selectedKey);
  if (!template) notFound();
  const notice = typeof params.notice === "string" ? params.notice : null;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="page-shell emails-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Global email library</p>
          <h1>Edit once. Use everywhere.</h1>
          <p className="lede">
            Nine shared templates keep every school on-message while project
            data fills in the details.
          </p>
        </div>
        <div className="global-callout">
          <Globe2 aria-hidden="true" size={19} />
          Changes apply to future simulations for all schools.
        </div>
      </div>

      {notice ? <p className="notice">{notice}</p> : null}
      {error ? <p className="notice notice-error">{error}</p> : null}

      <div className="template-layout">
        <nav className="template-nav panel" aria-label="Email templates">
          <div className="template-nav-heading">
            <Mail aria-hidden="true" size={18} />
            Template sequence
          </div>
          {templates.map((item, index) => (
            <Link
              aria-current={item.key === template.key ? "page" : undefined}
              href={`/emails?template=${item.key}`}
              key={item.key}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.eyebrow}</small>
              </span>
            </Link>
          ))}
        </nav>

        <section className="panel template-editor">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{template.eyebrow} sender</p>
              <h2>{template.label}</h2>
            </div>
            <span className="fixed-badge">
              <LockKeyhole aria-hidden="true" size={13} /> Fixed sender
            </span>
          </div>
          <form action={updateTemplateAction} className="panel-body">
            <input name="templateKey" type="hidden" value={template.key} />
            <label className="field subject-field">
              <span>Subject</span>
              <input defaultValue={template.subject} name="subject" required />
            </label>
            <label className="field body-field">
              <span>Message body</span>
              <textarea
                defaultValue={template.body}
                name="body"
                required
                rows={12}
              />
            </label>

            <div className="variable-section">
              <div>
                <h3>Available variables</h3>
                <p>
                  Use double braces exactly as shown. Variables fill from each
                  school.
                </p>
              </div>
              <div className="variable-list">
                {template.variables.map((variable) => (
                  <code key={variable}>{`{{${variable}}}`}</code>
                ))}
              </div>
            </div>

            <div className="form-actions template-actions">
              <p>Existing Sent Emails remain unchanged.</p>
              <button className="button button-primary" type="submit">
                Save global template
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
