import { Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { addVwmAction, deleteVwmAction, updateVwmAction } from "@/app/actions";
import { listVirtualWebmasters } from "@/lib/repository";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VirtualWebmastersPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const vwms = listVirtualWebmasters();
  const notice = typeof params.notice === "string" ? params.notice : null;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="page-shell vwms-page">
      <div className="page-intro">
        <div>
          <h1>Virtual webmaster directory</h1>
        </div>
        <div className="directory-count">
          <UsersRound aria-hidden="true" />
          <strong>{vwms.length}</strong>
          <span>available VWMs</span>
        </div>
      </div>

      {notice ? <p className="notice">{notice}</p> : null}
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="panel add-vwm-panel">
        <div>
          <h2>New virtual webmaster</h2>
        </div>
        <form action={addVwmAction}>
          <label className="field">
            <span>Name</span>
            <input name="name" placeholder="Full name" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              name="email"
              placeholder="name@example.com"
              required
              type="email"
            />
          </label>
          <button className="button button-primary" type="submit">
            <Plus aria-hidden="true" size={17} /> Add VWM
          </button>
        </form>
      </section>

      <div className="vwm-grid">
        {vwms.map((vwm) => (
          <article className="panel vwm-card" key={vwm.id}>
            <header>
              <span className="avatar" aria-hidden="true">
                {vwm.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span>
                <strong>{vwm.name}</strong>
                <small>
                  {vwm.assignmentCount} active{" "}
                  {vwm.assignmentCount === 1 ? "assignment" : "assignments"}
                </small>
              </span>
            </header>
            <form action={updateVwmAction}>
              <input name="id" type="hidden" value={vwm.id} />
              <label className="field">
                <span>Name</span>
                <input defaultValue={vwm.name} name="name" required />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  defaultValue={vwm.email}
                  name="email"
                  required
                  type="email"
                />
              </label>
              <button className="button" type="submit">
                <UserRound aria-hidden="true" size={16} /> Save changes
              </button>
            </form>
            <form action={deleteVwmAction}>
              <input name="id" type="hidden" value={vwm.id} />
              <button
                className="button button-danger"
                disabled={vwm.assignmentCount > 0}
                title={
                  vwm.assignmentCount > 0
                    ? "Reassign this VWM's schools before removing"
                    : undefined
                }
                type="submit"
              >
                <Trash2 aria-hidden="true" size={15} /> Remove
              </button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
