export default function Loading() {
  return (
    <div className="page-shell" aria-live="polite" aria-busy="true">
      <div className="loading-line" />
      <div className="loading-panel" />
    </div>
  );
}
