// Frontend prototype only. No application roles or backend records are changed.
export const teams = [
  { id: "frontend", name: "Frontend ekibi", description: "Arayüz, kullanıcı deneyimi ve ekranlar.", icon: "</>" },
  { id: "backend", name: "Backend ekibi", description: "API, veri ve sunucu geliştirmeleri.", icon: "{ }" },
] as const;
export type TeamId = typeof teams[number]["id"];
export const stages = [
  { id: "BACKLOG", name: "Backlog", hint: "Henüz planlanmayan işler" },
  { id: "TODO", name: "Yapılacak", hint: "Başlamaya hazır" },
  { id: "IN_PROGRESS", name: "Devam ediyor", hint: "Üzerinde çalışılıyor" },
  { id: "DONE", name: "Tamamlandı", hint: "Bitirilen işler" },
] as const;
export type Stage = typeof stages[number]["id"];
export type TeamMember = { id: string; teamId: TeamId; name: string };
export type TeamTask = {
  id: string; teamId: TeamId; title: string; description: string;
  assigneeId: string | null; status: Stage; dueDate: string;
  note: string; updatedAt: string; createdAt: string;
};
export type BoardData = { version: 1; members: TeamMember[]; tasks: TeamTask[] };
export const emptyBoard = (): BoardData => ({ version: 1, members: [], tasks: [] });
export const boardKey = (userId: string) => `club-team-board:v1:${userId}`;
const text = (value: unknown, max: number): value is string => typeof value === "string" && value.length <= max;
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
export function parseBoard(raw: string): BoardData {
  const data: unknown = JSON.parse(raw);
  const team = (id: unknown) => teams.some(t => t.id === id);
  if (!object(data) || data.version !== 1 || !Array.isArray(data.members) || !Array.isArray(data.tasks)) throw new Error("Geçersiz pano kaydı.");
  const members: TeamMember[] = [];
  for (const m of data.members) {
    if (!object(m) || !text(m.id, 100) || !m.id || !team(m.teamId) || !text(m.name, 80) || !m.name.trim() || members.some(x => x.id === m.id)) throw new Error("Geçersiz ekip üyesi.");
    members.push(m as TeamMember);
  }
  const ids = new Set<string>();
  for (const t of data.tasks) {
    if (!object(t) || !text(t.id, 100) || !t.id || ids.has(t.id) || !team(t.teamId) || !text(t.title, 160) || !t.title.trim()
      || !text(t.description, 3000) || !text(t.note, 1000) || !stages.some(s => s.id === t.status)
      || !text(t.dueDate, 10) || (t.dueDate !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(t.dueDate))
      || !text(t.updatedAt, 40) || !Number.isFinite(Date.parse(t.updatedAt)) || !text(t.createdAt, 40) || !Number.isFinite(Date.parse(t.createdAt))
      || (t.assigneeId !== null && !members.some(m => m.id === t.assigneeId && m.teamId === t.teamId))) throw new Error("Geçersiz görev kaydı.");
    ids.add(t.id);
  }
  return data as BoardData;
}
