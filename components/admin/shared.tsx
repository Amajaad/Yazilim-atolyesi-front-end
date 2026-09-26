"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ApiError, request } from "../../lib/api";
import styles from "./dashboard.module.css";

export const names: Record<string, string> = {
  ADMIN: "Yönetici", EDITOR: "Editör", MEMBER: "Üye", PENDING: "Onay bekliyor", APPROVED: "Onaylandı", REJECTED: "Reddedildi",
  DRAFT: "Taslak", PUBLISHED: "Yayında", ARCHIVED: "Arşivde", NEW: "Yeni", READ: "Okundu", REPLIED: "Yanıtlandı",
  ACTIVE: "Aktif", PASSIVE: "Pasif", SUSPENDED: "Askıya alındı", HOME: "Ana sayfa", ABOUT: "Hakkımızda", CONTACT: "İletişim",
  HERO: "Karşılama alanı", SLIDER: "Vitrin kartı", TEXT: "Metin", FEATURE: "Özellik", CONTACT_INFO: "İletişim bilgisi", CUSTOM: "Diğer içerik",
  BEGINNER: "Başlangıç", INTERMEDIATE: "Orta", ADVANCED: "İleri", TEXT_SETTING: "Metin", EMAIL: "E-posta", URL: "Bağlantı", PHONE: "Telefon", JSON: "JSON",
};
export function date(value?: string) { return value ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" }).format(new Date(value)) : "—"; }
export function Badge({ value }: { value: string }) { return <span className={styles.badge} data-tone={["APPROVED", "PUBLISHED", "ACTIVE", "READ"].includes(value) ? "green" : ["REJECTED", "SUSPENDED"].includes(value) ? "red" : "purple"}>{names[value] || value}</span>; }
export function ErrorNotice({ error }: { error: unknown }) {
  if (!error) return null;
  const expired = error instanceof ApiError && error.status === 401;
  return <div className={styles.error} role="alert"><strong>{expired ? "Oturumun sona erdi." : error instanceof Error ? error.message : "İşlem tamamlanamadı."}</strong>
    {error instanceof ApiError && error.fieldErrors.length > 0 && <ul>{error.fieldErrors.map((item, i) => <li key={i}>{item.message}</li>)}</ul>}
    {expired && <a href="/giris-yap">Tekrar giriş yap →</a>}
  </div>;
}
export function useRemote<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    request<T>(path).then(value => { if (active) setData(value); }).catch(e => { if (active) setError(e); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, revision]);
  return { data, loading, error, refresh: () => setRevision(x => x + 1) };
}
export function useMutation() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const lock = useRef(false);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try { await action(); } catch (e) { setError(e); } finally { lock.current = false; setBusy(false); }
  }
  return { busy, error, run };
}
export function Modal({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className={styles.modal} aria-label={title} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>
    <header className={styles.modalHeader}><div><span className={styles.eyebrow}>YAZILIM ATÖLYESİ</span><h2>{title}</h2></div><button type="button" className={styles.iconButton} aria-label="Pencereyi kapat" disabled={busy} onClick={onClose}>×</button></header>
    {children}
  </dialog>;
}
export function ListState({ loading, error, empty, retry }: { loading: boolean; error: unknown; empty: boolean; retry: () => void }) {
  if (loading) return <div className={styles.empty} role="status">Veriler yükleniyor…</div>;
  if (error) return <><ErrorNotice error={error} /><button className={styles.secondary} onClick={retry}>Tekrar dene</button></>;
  if (empty) return <div className={styles.empty}><span aria-hidden="true">◇</span><h3>Henüz bir kayıt yok</h3><p>Yeni kayıtlar burada görünecek. Filtre kullanıyorsan değiştirmeyi deneyebilirsin.</p></div>;
  return null;
}
export function Pagination({ page, pages, total, setPage }: { page: number; pages: number; total: number; setPage: (value: number) => void }) {
  return <div className={styles.pagination}><span>{total} kayıt · Sayfa {page + 1} / {Math.max(1, pages)}</span><div><button disabled={page === 0} onClick={() => setPage(page - 1)}>← Önceki</button><button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sonraki →</button></div></div>;
}
export function Options({ values }: { values: string[] }) { return <>{values.map(value => <option value={value} key={value}>{names[value] || value}</option>)}</>; }
