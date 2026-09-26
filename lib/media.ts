export function safeLink(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try { const url = new URL(value); if (["http:", "https:"].includes(url.protocol)) return url.href; } catch { /* Invalid link. */ }
  return undefined;
}
export function mediaUrl(value?: string) {
  if (value?.startsWith("/api/v1/media/images/")) return value.replace("/api/v1/", "/api/club/");
  return safeLink(value);
}
