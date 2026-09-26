export default function Loading() {
  return (
    <main id="main-content" className="page-loading" aria-busy="true">
      <p role="status">Sayfa yükleniyor…</p>
      <div className="skeleton" />
      <div className="skeleton" />
    </main>
  );
}
