export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a
      className={`club-brand${footer ? " club-brand-footer" : ""}`}
      href="/#anasayfa"
      aria-label="Yazılım Atölyesi — Ana sayfa"
    >
      <img src="/club-logo.png" alt="" width="502" height="497" />
      <span>
        <strong>YAZILIM ATÖLYESİ</strong>
        <small>GÖNÜLLÜ YAZILIM KULÜBÜ</small>
      </span>
    </a>
  );
}
