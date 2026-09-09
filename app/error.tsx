"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state page-shell">
      <p className="eyebrow">Something went wrong</p>
      <h1>The project desk could not load.</h1>
      <p>The prototype data is still safe. Try the request again.</p>
      <button className="button button-primary" onClick={reset} type="button">
        Try again
      </button>
    </div>
  );
}
