"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="page-loading">
      <h1>Sayfa yüklenemedi.</h1>
      <p>Lütfen yeniden dene.</p>
      <button className="club-button" onClick={reset}>
        Tekrar dene
      </button>
      <a className="back-link" href="/">
        Ana sayfaya dön
      </a>
    </main>
  );
}
