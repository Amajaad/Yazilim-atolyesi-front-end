import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

let session: Awaited<ReturnType<APIRequestContext["storageState"]>>;
let userId: string;
const origin = process.env.UI_TEST_URL || "http://localhost:3001";

test.beforeAll(async ({ playwright }) => {
  const api = await playwright.request.newContext({ baseURL: origin });
  const login = await api.post("/api/club/auth/login", {
    headers: { Origin: origin },
    data: { email: process.env.E2E_ADMIN_EMAIL || "admin@yazilimatolyesi.local", password: process.env.E2E_ADMIN_PASSWORD || "ChangeMe123!" },
  });
  expect(login.status()).toBe(200);
  session = await api.storageState();
  userId = (await (await api.get("/api/club/users/me")).json()).userId;
  await api.dispose();
});
test.beforeEach(async ({ context }) => { await context.addCookies(session.cookies); });

async function openBoard(page: Page) {
  await page.goto("/yonetim#ekip-gorevleri");
  await expect(page.getByRole("heading", { name: "Ekip görevleri", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Görev oluştur", exact: true })).toBeVisible();
}
async function addMember(page: Page, name: string) {
  await page.getByRole("button", { name: /^Ekip üyeleri/ }).click();
  await page.getByRole("dialog").getByLabel("Üye adı", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Üye ekle", exact: true }).click();
  await expect(page.getByRole("dialog").getByText(name, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Kapat", exact: true }).click();
}
async function addTask(page: Page, title: string, assignee?: string, status = "BACKLOG") {
  await page.getByRole("button", { name: "+ Görev oluştur", exact: true }).click();
  const modal = page.getByRole("dialog");
  await modal.getByLabel("Görev başlığı", { exact: true }).fill(title);
  await modal.getByLabel("Açıklama ve tamamlanma ölçütü").fill("Filtre seçildiğinde doğru kayıtları göster. Mobilde kontrol et.");
  if (assignee) await modal.getByLabel("Atanan ekip üyesi").selectOption({ label: assignee });
  await modal.getByRole("combobox", { name: "Durum", exact: true }).selectOption(status);
  await modal.getByRole("button", { name: "Görevi kaydet", exact: true }).click();
  await expect(modal).not.toBeVisible();
}

test("ekipler ayrı tutulur; görev atama, üye önizlemesi ve yenileme çalışır", async ({ page }) => {
  const mutations: string[] = [];
  page.on("request", req => { if (req.url().includes("/api/club/") && req.method() !== "GET") mutations.push(req.url()); });
  await openBoard(page);
  await addMember(page, "Ayşe Frontend");
  await addTask(page, "Duyuru filtresi", "Ayşe Frontend");
  await expect(page.getByRole("region", { name: "Backlog", exact: true }).getByRole("button", { name: "Görevi aç: Duyuru filtresi" })).toBeVisible();
  await page.getByRole("button", { name: /^Backend ekibi/ }).click();
  await expect(page.getByRole("button", { name: "Görevi aç: Duyuru filtresi" })).toHaveCount(0);
  await addMember(page, "Can Backend");
  await addTask(page, "API filtreleme", "Can Backend", "TODO");
  await page.getByRole("button", { name: /^Frontend ekibi/ }).click();
  await page.getByRole("button", { name: "+ Görev oluştur", exact: true }).click();
  await expect(page.getByLabel("Atanan ekip üyesi").getByRole("option", { name: "Can Backend" })).toHaveCount(0);
  await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
  await page.getByRole("combobox", { name: "Görünüm", exact: true }).selectOption({ label: "Ekip üyesi · Ayşe Frontend" });
  await expect(page.getByRole("button", { name: /^Backend ekibi/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "+ Görev oluştur", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Görevi aç: Duyuru filtresi" }).click();
  await expect(page.getByLabel("Atanan ekip üyesi")).toBeDisabled();
  await page.getByRole("combobox", { name: "Durum", exact: true }).selectOption("DONE");
  await page.getByLabel("Çalışma notu").fill("Mobil ve masaüstü kontrolü tamamlandı.");
  await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
  await expect(page.getByRole("region", { name: "Tamamlandı", exact: true }).getByRole("button", { name: "Görevi aç: Duyuru filtresi" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("region", { name: "Tamamlandı", exact: true }).getByRole("button", { name: "Görevi aç: Duyuru filtresi" })).toBeVisible();
  await page.getByRole("button", { name: "Görevi aç: Duyuru filtresi" }).click();
  await expect(page.getByLabel("Çalışma notu")).toHaveValue("Mobil ve masaüstü kontrolü tamamlandı.");
  expect(mutations).toEqual([]);
});

test("başkasının görevi önizlemede salt okunur; üye kaldırılınca görev korunur", async ({ page }) => {
  await openBoard(page);
  await addMember(page, "Ayşe"); await addMember(page, "Deniz");
  await addTask(page, "Form tasarımı", "Deniz");
  await page.getByRole("combobox", { name: "Görünüm", exact: true }).selectOption({ label: "Ekip üyesi · Ayşe" });
  await page.getByRole("button", { name: "Görevi aç: Form tasarımı" }).click();
  await expect(page.getByRole("combobox", { name: "Durum", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Değişiklikleri kaydet" })).toHaveCount(0);
  await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
  await page.getByRole("button", { name: "Yönetici görünümüne dön" }).click();
  await page.getByRole("button", { name: /^Ekip üyeleri/ }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Deniz üyeliğini kaldır" }).click();
  await page.getByRole("button", { name: "Kapat", exact: true }).click();
  await expect(page.getByRole("button", { name: "Görevi aç: Form tasarımı" })).toContainText("Atanmamış");
  await page.getByRole("button", { name: "Görevi aç: Form tasarımı" }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Görevi sil", exact: true }).click();
  await expect(page.getByRole("button", { name: "Görevi aç: Form tasarımı" })).toHaveCount(0);
});

test("form kapanışında değişiklik korunur; arama ve dosya indirme çalışır", async ({ page }) => {
  await openBoard(page);
  await addTask(page, "İletişim ekranı");
  await page.getByRole("button", { name: "Görevi aç: İletişim ekranı" }).click();
  await page.getByLabel("Görev başlığı", { exact: true }).fill("İletişim formu");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
  await page.getByLabel("Görev ara").fill("bulunamayan");
  await expect(page.getByRole("button", { name: "Görevi aç: İletişim formu" })).toHaveCount(0);
  await page.getByLabel("Görev ara").fill("iletişim");
  await expect(page.getByRole("button", { name: "Görevi aç: İletişim formu" })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Kayıtları indir" }).click();
  expect((await download).suggestedFilename()).toBe("ekip-gorevleri.json");
});

test("depolama hatası veriyi silmez; başarısız kayıtta form açık kalır", async ({ page }) => {
  await openBoard(page);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); }; });
  await page.getByRole("button", { name: "+ Görev oluştur", exact: true }).click();
  await page.getByLabel("Görev başlığı", { exact: true }).fill("Korunacak görev");
  await page.getByRole("button", { name: "Görevi kaydet", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Değişiklik kaydedilemedi");
  await expect(page.getByLabel("Görev başlığı", { exact: true })).toHaveValue("Korunacak görev");
});

test("bozuk yerel veri otomatik sıfırlanmaz", async ({ page }) => {
  await page.addInitScript(key => { localStorage.setItem(key, "invalid-json"); }, `club-team-board:v1:${userId}`);
  await page.goto("/yonetim#ekip-gorevleri");
  await expect(page.getByRole("region", { name: "Ekip görevleri", exact: true }).getByRole("alert")).toContainText("Yerel pano okunamadı");
  await expect(page.getByRole("button", { name: "+ Görev oluştur", exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), `club-team-board:v1:${userId}`)).toBe("invalid-json");
});

test("masaüstü ve mobil pano görünümü", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openBoard(page);
  await addMember(page, "Ayşe Yılmaz"); await addMember(page, "Deniz Kaya");
  await addTask(page, "Duyuru kategorilerini düzenle", undefined);
  await addTask(page, "Üyelik formunu mobilde kontrol et", "Ayşe Yılmaz", "TODO");
  await addTask(page, "İletişim sayfasını geliştir", "Deniz Kaya", "IN_PROGRESS");
  await addTask(page, "Ana sayfa görsellerini düzenle", "Ayşe Yılmaz", "DONE");
  await page.screenshot({ path: ".e2e-results/team-board-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Görevi aç: Ana sayfa görsellerini düzenle" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: ".e2e-results/team-board-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Görevi aç: Ana sayfa görsellerini düzenle" }).click();
  expect(await page.getByRole("dialog").evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy();
});

