"use client";
import { useEffect, useRef, useState } from "react";
import { boardKey, emptyBoard, parseBoard, stages, teams, type BoardData, type Stage, type TeamId, type TeamMember, type TeamTask } from "../../lib/team-board";
import { ErrorNotice, Modal } from "./shared";
import s from "./dashboard.module.css";
import b from "./team-board.module.css";

function useLocalBoard(userId: string) {
  const key = boardKey(userId);
  const [data, setData] = useState<BoardData>(emptyBoard);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const rawRef = useRef<string | null>(null);
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(key);
        const next = raw ? parseBoard(raw) : emptyBoard();
        rawRef.current = raw; setData(next); setReady(true); setError(null);
      } catch { setReady(false); setError(new Error("Yerel pano okunamadı. Kayıtların üzerine yazılmadı. Tarayıcı depolama iznini kontrol edip sayfayı yenile.")); }
    };
    load();
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  function save(next: BoardData) {
    if (!ready) return false;
    try {
      if (localStorage.getItem(key) !== rawRef.current) throw new Error("Pano başka bir sekmede değişti. Sayfayı yenileyip tekrar dene.");
      const raw = JSON.stringify(next);
      parseBoard(raw);
      localStorage.setItem(key, raw);
      rawRef.current = raw; setData(next); setError(null); return true;
    } catch (e) {
      setError(e instanceof Error && e.message.startsWith("Pano başka") ? e : new Error("Değişiklik kaydedilemedi. Tarayıcı depolama iznini veya boş alanı kontrol et; formun açık tutuldu."));
      return false;
    }
  }
  return { data, ready, error, save };
}

const formatDue = (value: string) => new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
const newTask = (teamId: TeamId, status: Stage = "BACKLOG"): TeamTask => {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), teamId, title: "", description: "", assigneeId: null, status, dueDate: "", note: "", createdAt: now, updatedAt: now };
};

export function TeamBoard({ userId }: { userId: string }) {
  const { data, ready, error, save } = useLocalBoard(userId);
  const [teamId, setTeamId] = useState<TeamId>("frontend");
  const [query, setQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [viewerId, setViewerId] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);
  const [editing, setEditing] = useState<TeamTask | null>(null);
  const [saved, setSaved] = useState("");
  const viewer = data.members.find(m => m.id === viewerId);
  const activeTeam = viewer?.teamId ?? teamId;
  const team = teams.find(t => t.id === activeTeam)!;
  const members = data.members.filter(m => m.teamId === activeTeam);
  const tasks = data.tasks.filter(t => t.teamId === activeTeam);
  const completed = tasks.filter(t => t.status === "DONE").length;
  const filtered = tasks.filter(t => (!assigneeFilter || (assigneeFilter === "unassigned" ? t.assigneeId === null : t.assigneeId === assigneeFilter))
    && `${t.title} ${t.description}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  function switchTeam(id: TeamId) { setTeamId(id); setQuery(""); setAssigneeFilter(""); setSaved(""); }
  function persist(next: BoardData, message: string) { if (!save(next)) return false; setSaved(message); return true; }
  function exportBoard() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ekip-gorevleri.json"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <>
    <div className={b.notice}><span aria-hidden="true">◇</span><div><strong>Yerel önizleme · Bu tarayıcıya kaydedilir</strong><p>Bu pano henüz ortak kullanıma açık değil. Üyeler ve görevler gerçek hesaplara bağlı değildir; başka cihazlarla paylaşılmaz. Ekip üyesi görünümü bir önizlemedir.</p></div></div>
    <ErrorNotice error={error} />
    {!ready ? <p className={s.empty}>{error ? "Kayıtlar korunuyor. Sorunu giderdikten sonra sayfayı yenile." : "Pano hazırlanıyor…"}</p> : <>
      {!viewer && <div className={b.teams} aria-label="Ekip seçimi">{teams.map(t => <button key={t.id} className={b.team} aria-pressed={activeTeam === t.id} onClick={() => switchTeam(t.id)}><span className={b.teamIcon} aria-hidden="true">{t.icon}</span><span><strong>{t.name}</strong><small>{data.members.filter(m => m.teamId === t.id).length} üye · {data.tasks.filter(task => task.teamId === t.id).length} görev</small></span></button>)}</div>}
      {viewer && <div className={b.preview}><p><strong>Ekip üyesi önizlemesi: {viewer.name}</strong><br />Yalnızca {team.name.toLocaleLowerCase("tr-TR")} gösterilir. Kendine atanan işlerin durumunu ve çalışma notunu değiştirebilirsin.</p><button className={s.secondary} onClick={() => { setViewerId(""); setAssigneeFilter(""); }}>Yönetici görünümüne dön</button></div>}
      <div className={b.summary}><div><h2>{team.name}</h2><p>{team.description}</p></div><div className={b.actions}>
        {!viewer && <><button className={s.secondary} onClick={() => setMembersOpen(true)}>Ekip üyeleri ({members.length})</button><button className={s.secondary} onClick={exportBoard}>Kayıtları indir</button><button className={s.primary} onClick={() => setEditing(newTask(activeTeam))}>+ Görev oluştur</button></>}
      </div></div>
      <div className={b.muted}>{tasks.length} görevden {completed} tanesi tamamlandı · %{percent}</div>
      <div className={b.progress} role="progressbar" aria-label="Ekip ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div style={{ width: `${percent}%` }} /></div>
      <div className={b.filters}><label className={b.search}>Görev ara<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Başlık veya açıklama" maxLength={160} /></label>
        <label>Sorumlu<select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}><option value="">Tüm görevler</option><option value="unassigned">Atanmamış</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}{viewer?.id === m.id ? " (Ben)" : ""}</option>)}</select></label>
        {!viewer && <label>Görünüm<select value="" onChange={e => { setViewerId(e.target.value); setAssigneeFilter(""); setQuery(""); setSaved(""); }}><option value="">Yönetici</option>{members.map(m => <option key={m.id} value={m.id}>Ekip üyesi · {m.name}</option>)}</select></label>}
      </div>
      {!members.length && !viewer && <p className={b.muted}>Görevleri backlog’a ekleyebilirsin. Birine atamak için önce “Ekip üyeleri” bölümünden isim ekle.</p>}
      <p className={b.saved} role="status">{saved || "Kartı açarak ayrıntıları ve çalışma notunu görüntüle."}</p>
      <div className={b.board}>{stages.map(stage => {
        const cards = filtered.filter(t => t.status === stage.id);
        return <section className={b.column} key={stage.id} data-stage={stage.id} aria-label={stage.name}>
          <div className={b.columnHeader}><h3>{stage.name}</h3><span className={b.count}>{cards.length}</span></div><p className={b.hint}>{stage.hint}</p>
          {cards.length === 0 && <p className={b.empty}>{query || assigneeFilter ? "Filtreye uyan görev yok." : "Henüz görev yok."}</p>}
          {cards.map(task => {
            const member = members.find(m => m.id === task.assigneeId);
            const late = task.dueDate && task.status !== "DONE" && new Date(`${task.dueDate}T23:59:59`).getTime() < Date.now();
            return <button key={task.id} className={b.task} onClick={() => setEditing(task)} aria-label={`Görevi aç: ${task.title}`}>
              <strong>{task.title}</strong>{task.description && <p>{task.description}</p>}
              <span className={b.taskFooter}><span className={b.initial} aria-hidden="true">{member?.name[0]?.toLocaleUpperCase("tr-TR") || "—"}</span>{member?.name || "Atanmamış"}</span>
              {task.dueDate && <span className={`${b.due} ${late ? b.late : ""}`}>{late ? "Süresi geçti · " : "Hedef · "}{formatDue(task.dueDate)}</span>}
            </button>;
          })}
          {!viewer && <button className={b.newTask} onClick={() => setEditing(newTask(activeTeam, stage.id))}>+ {stage.name} için görev ekle</button>}
        </section>;
      })}</div>
      {membersOpen && <MembersModal teamName={team.name} members={members} tasks={tasks} onClose={() => setMembersOpen(false)} onAdd={name => persist({ ...data, members: [...data.members, { id: crypto.randomUUID(), name, teamId: activeTeam }] }, "Ekip üyesi bu tarayıcıya eklendi.")} onRemove={id => persist({ ...data, members: data.members.filter(m => m.id !== id), tasks: data.tasks.map(t => t.assigneeId === id ? { ...t, assigneeId: null, updatedAt: new Date().toISOString() } : t) }, "Üye kaldırıldı; görevleri atanmamış olarak korundu.")} error={error} />}
      {editing && <TaskModal key={editing.id} task={editing} members={members} teamName={team.name} viewerId={viewer?.id} existing={data.tasks.some(t => t.id === editing.id)} onClose={() => setEditing(null)} error={error}
        onSave={task => {
          const current = data.tasks.find(t => t.id === task.id);
          if (current && current.updatedAt !== editing.updatedAt) { window.alert("Bu görev başka bir sekmede değişti. Pencereyi kapatıp görevi yeniden aç."); return false; }
          if (!current && data.tasks.some(t => t.id === editing.id) === false && editing.title) { window.alert("Bu görev artık mevcut değil. Pencereyi kapatıp yeniden kontrol et."); return false; }
          if (task.teamId !== activeTeam || (task.assigneeId && !members.some(m => m.id === task.assigneeId))) return false;
          if (viewer && (!current || current.assigneeId !== viewer.id)) return false;
          const next = { ...(viewer && current ? { ...current, status: task.status, note: task.note } : task), updatedAt: new Date().toISOString() };
          if (!persist({ ...data, tasks: current ? data.tasks.map(t => t.id === next.id ? next : t) : [...data.tasks, next] }, "Görev bu tarayıcıya kaydedildi.")) return false;
          setEditing(null); return true;
        }} onDelete={() => {
          if (viewer) return;
          if (persist({ ...data, tasks: data.tasks.filter(t => t.id !== editing.id) }, "Görev silindi.")) setEditing(null);
        }} />}
    </>}
  </>;
}

function MembersModal({ teamName, members, tasks, onClose, onAdd, onRemove, error }: { teamName: string; members: TeamMember[]; tasks: TeamTask[]; onClose: () => void; onAdd: (name: string) => boolean; onRemove: (id: string) => boolean; error: unknown }) {
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<unknown>(null);
  return <Modal title={`${teamName} · Üyeler`} onClose={onClose}><div className={s.form}>
    <p className={b.muted}>Buraya eklediğin isimler “Ekip üyesi” olarak gösterilir. Gerçek kullanıcı hesabı oluşturulmaz ve davet gönderilmez.</p><ErrorNotice error={formError || error} />
    <form className={b.memberForm} onSubmit={e => { e.preventDefault(); const value = name.trim(); if (!value) { setFormError(new Error("Üye adı boş olamaz.")); return; } if (members.some(m => m.name.toLocaleLowerCase("tr-TR") === value.toLocaleLowerCase("tr-TR"))) { setFormError(new Error("Bu isim ekipte zaten var.")); return; } if (onAdd(value)) { setName(""); setFormError(null); } }}>
      <label>Üye adı<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Ad Soyad" /></label><button className={s.primary}>Üye ekle</button>
    </form>
    <ul className={b.memberList}>{members.map(member => <li key={member.id}><span className={s.avatar}>{member.name[0]}</span><div><strong>{member.name}</strong><small>Ekip üyesi · {tasks.filter(t => t.assigneeId === member.id).length} görev</small></div><button type="button" className={b.danger} aria-label={`${member.name} üyeliğini kaldır`} onClick={() => { if (window.confirm(`${member.name} ekipten kaldırılsın mı? Görevleri silinmez, atanmamış olur.`)) onRemove(member.id); }}>Kaldır</button></li>)}</ul>
    {!members.length && <p className={b.muted}>Henüz ekip üyesi yok. İlk ismi ekleyerek başla.</p>}
    <footer className={s.formActions}><button className={s.secondary} onClick={onClose}>Kapat</button></footer>
  </div></Modal>;
}

function TaskModal({ task, members, teamName, viewerId, existing, onClose, onSave, onDelete, error }: { task: TeamTask; members: TeamMember[]; teamName: string; viewerId?: string; existing: boolean; onClose: () => void; onSave: (task: TeamTask) => boolean; onDelete: () => void; error: unknown }) {
  const [draft, setDraft] = useState(task);
  const [formError, setFormError] = useState<unknown>(null);
  const dirty = JSON.stringify(task) !== JSON.stringify(draft);
  const readOnly = !!viewerId && task.assigneeId !== viewerId;
  const close = () => { if (!dirty || window.confirm("Kaydedilmemiş değişiklikler silinsin mi?")) onClose(); };
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return <Modal title={existing ? "Görev ayrıntıları" : "Yeni görev"} onClose={close}><form className={s.form} onSubmit={e => {
    e.preventDefault(); if (readOnly) return;
    if (!draft.title.trim()) { setFormError(new Error("Görev başlığı boş olamaz.")); return; }
    onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim(), note: draft.note.trim() });
  }}><p className={b.muted}>{teamName} · Küçük, tamamlanabilir bir iş tanımla.</p><ErrorNotice error={formError || error} />
    {readOnly && <p className={b.readOnly}>Bu görev başka bir üyeye ait. Ayrıntıları görüntüleyebilirsin.</p>}
    <label>Görev başlığı<input required maxLength={160} readOnly={!!viewerId} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Örn. Duyuru listesine kategori filtresi ekle" /></label>
    <label>Açıklama ve tamamlanma ölçütü<textarea rows={4} maxLength={3000} readOnly={!!viewerId} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Ne yapılacak? Tamamlandığını nasıl kontrol edeceğiz?" /></label>
    <div className={s.formGrid}><label>Atanan ekip üyesi<select disabled={!!viewerId} value={draft.assigneeId || ""} onChange={e => setDraft({ ...draft, assigneeId: e.target.value || null })}><option value="">Atanmamış</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <label>Durum<select disabled={readOnly} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Stage })}>{stages.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label></div>
    <label>Hedef tarih (isteğe bağlı)<input type="date" min="2000-01-01" max="2100-12-31" readOnly={!!viewerId} value={draft.dueDate} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} /></label>
    <label>Çalışma notu<textarea rows={3} maxLength={1000} readOnly={readOnly} value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} placeholder="İlerleme, takıldığın nokta veya tamamlanan işin sonucu" /></label>
    {existing && <p className={b.muted}>Son güncelleme: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(task.updatedAt))}</p>}
    <footer className={s.formActions}>{existing && !viewerId && <button type="button" className={b.danger} onClick={() => { if (window.confirm(`“${task.title}” görevi silinsin mi?`)) onDelete(); }}>Görevi sil</button>}<button type="button" className={s.secondary} onClick={close}>Vazgeç</button>{!readOnly && <button className={s.primary}>{existing ? "Değişiklikleri kaydet" : "Görevi kaydet"}</button>}</footer>
  </form></Modal>;
}
