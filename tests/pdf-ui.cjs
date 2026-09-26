/* Run against a running Next server. Uses an isolated in-memory upstream on 8080;
   never start this test while the real backend is running. No real data is written.
   PLAYWRIGHT_MODULE / AXE_MODULE may point to separately installed test packages. */
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.UI_TEST_URL || "http://localhost:3001";
const output = path.resolve(__dirname, "../.pdf-review");
let mode = "offline";
let submitted;
const interests = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    code: "BACKEND",
    name: "Backend Geliştirme",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    code: "FRONTEND",
    name: "Frontend Geliştirme",
  },
  {
    id: "10000000-0000-0000-0000-000000000008",
    code: "UI_UX",
    name: "UI/UX Tasarım",
  },
];
const fixture = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let text = "";
  for await (const chunk of req) text += chunk;
  const body = text ? JSON.parse(text) : {};
  const reply = (code, data) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  if (mode === "offline")
    return reply(503, { message: "Sunucuya şu anda ulaşılamıyor." });
  if (url.pathname.endsWith("/membership/options"))
    return reply(200, {
      interestAreas: interests,
      educationStatuses: ["ACTIVE_STUDENT", "GRADUATE"],
      degreeLevels: ["BACHELOR", "MASTER"],
      classLevels: ["YEAR_1", "YEAR_2"],
      experienceLevels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    });
  if (url.pathname.endsWith("/settings/public"))
    return reply(200, [
      {
        key: "legal.kvkk.notice",
        value: "Yalnızca otomatik test için örnek metin.",
      },
      { key: "legal.kvkk.version", value: "test-1" },
      { key: "legal.marketing.notice", value: "Yalnızca test iletişim izni." },
    ]);
  if (url.pathname.endsWith("/announcements"))
    return reply(200, {
      content:
        mode === "empty"
          ? []
          : [
              {
                id: "test-announcement",
                title: "API üzerinden gelen duyuru",
                summary: "Otomatik test içeriği.",
                content: "Duyurunun tam içeriği.",
                category: "Eğitim",
                publishedAt: "2026-09-01T12:00:00Z",
              },
            ],
      totalPages: mode === "empty" ? 0 : 1,
    });
  if (url.pathname.endsWith("/users/me"))
    return req.headers.authorization === "Bearer test-session-token"
      ? reply(200, {
          email: "demo@example.com",
          personal: { firstName: "Demo" },
        })
      : reply(401, { message: "Oturum açman gerekiyor." });
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (url.pathname.endsWith("/auth/login")) {
    if (body.password === "Wrong123")
      return reply(401, { message: "E-posta veya şifre hatalı." });
    return reply(200, {
      accessToken: "test-session-token",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      user: { firstName: "Demo", email: body.email },
    });
  }
  if (url.pathname.endsWith("/auth/register")) {
    submitted = body;
    if (mode === "register-error")
      return reply(400, {
        message: "Alanları kontrol et.",
        fieldErrors: [
          {
            field: "membership.motivation",
            message: "Motivasyonunu gözden geçir.",
          },
        ],
      });
    return reply(201, {
      membershipStatus: "PENDING",
      message: "Başvuru alındı.",
    });
  }
  if (url.pathname.endsWith("/contact/messages"))
    return reply(201, { message: "Mesaj alındı." });
  reply(404, { message: "Test endpoint not found" });
});

(async () => {
  await new Promise((resolve, reject) => {
    fixture.once("error", reject);
    fixture.listen(8080, "127.0.0.1", resolve);
  });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1300, height: 2000 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    fs.mkdirSync(output, { recursive: true });
    await page.goto(base + "/");
    await page.locator(".team-card").first().waitFor();
    assert.equal(await page.locator(".announcement-card").count(), 3);
    await page.screenshot({
      path: path.join(output, "desktop.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Devamını Oku", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "Merak edenler için bir çalışma alanı." })
      .waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog[open]").count(), 0);
    await page
      .getByRole("button", { name: "Mesaj gönder", exact: true })
      .click();
    const contact = page.getByRole("dialog", {
      name: "Bir fikrin mi var? Konuşalım.",
    });
    await contact.getByLabel("Ad soyad").fill("Demo Kullanıcı");
    await contact.getByLabel("E-posta").fill("demo@example.com");
    await contact.getByLabel("Konu", { exact: true }).fill("Test");
    await contact
      .getByLabel("Mesajın")
      .fill("Bu yalnızca otomatik bir test mesajıdır.");
    await contact
      .getByRole("button", { name: "Mesaj gönder", exact: true })
      .click();
    await contact.locator(".form-error").waitFor();
    assert.equal(
      await contact.getByLabel("Konu", { exact: true }).inputValue(),
      "Test",
    );
    mode = "success";
    await contact
      .getByRole("button", { name: "Mesaj gönder", exact: true })
      .click();
    await contact.locator(".form-success").waitFor();
    await page.keyboard.press("Escape");
    console.log(
      "PASS: contact failure preserves input; retry succeeds; dialog Escape",
    );

    await page.goto(base + "/giris-yap");
    await page
      .locator("form")
      .first()
      .getByLabel("E-posta", { exact: true })
      .fill("demo@example.com");
    await page.locator("[name=password]").fill("Wrong123");
    await page.getByRole("button", { name: "Şifreyi göster" }).click();
    assert.equal(
      await page.locator("[name=password]").getAttribute("type"),
      "text",
    );
    await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
    await page.locator(".auth-panel .form-error").waitFor();
    await page.locator("[name=password]").fill("Correct123");
    await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
    await page.locator(".session-panel").waitFor();
    const cookie = (await context.cookies()).find(
      (c) => c.name === "club_session",
    );
    assert(cookie?.httpOnly);
    assert.equal(cookie.sameSite, "Lax");
    assert(
      !(await page.evaluate(() => document.cookie.includes("club_session"))),
    );
    await page.reload();
    await page.locator(".session-panel").waitFor();
    await page.getByRole("button", { name: "Çıkış yap", exact: true }).click();
    await page.locator("[name=password]").waitFor();
    assert(!(await context.cookies()).some((c) => c.name === "club_session"));
    console.log(
      "PASS: invalid/valid login, HttpOnly session, reload and logout",
    );

    await page.goto(base + "/uye-kaydi?interest=Backend");
    await page.getByRole("button", { name: "Devam et", exact: true }).click();
    assert.equal(await page.locator('[data-step="0"]').isVisible(), true);
    for (const [name, value] of Object.entries({
      "personal.firstName": "Demo",
      "personal.lastName": "Kullanıcı",
      "account.email": "demo@example.com",
      "account.password": "Correct123",
      "personal.phone": "+90 555 111 22 33",
    }))
      await page.locator(`[name="${name}"]`).fill(value);
    await page.getByRole("button", { name: "Devam et", exact: true }).click();
    await page.locator('[data-step="1"]').waitFor({ state: "visible" });
    for (const [name, value] of Object.entries({
      "education.institutionName": "Test Üniversitesi",
      "education.faculty": "Mühendislik",
      "education.department": "Bilgisayar Mühendisliği",
    }))
      await page.locator(`[name="${name}"]`).fill(value);
    await page
      .locator('[name="education.degreeLevel"]')
      .selectOption("BACHELOR");
    await page.locator('[name="education.classLevel"]').selectOption("YEAR_2");
    await page.getByRole("button", { name: "Geri", exact: true }).click();
    assert.equal(
      await page.locator('[name="personal.firstName"]').inputValue(),
      "Demo",
    );
    await page.getByRole("button", { name: "Devam et", exact: true }).click();
    await page.getByRole("button", { name: "Devam et", exact: true }).click();
    await page.locator('[data-step="2"]').waitFor({ state: "visible" });
    assert(
      await page.getByLabel("Backend Geliştirme", { exact: true }).isChecked(),
    );
    await page
      .locator('[name="membership.motivation"]')
      .fill(
        "Birlikte öğrenmek ve kulüp projelerine katkıda bulunmak istiyorum.",
      );
    await page
      .locator('[name="membership.experienceLevel"]')
      .selectOption("BEGINNER");
    await page.locator('[name="declarations.privacyNoticeRead"]').check();
    mode = "register-error";
    await page
      .getByRole("button", { name: "Üye kaydı oluştur", exact: true })
      .click();
    await page.locator(".auth-panel .form-error").waitFor();
    assert.equal(await page.locator('[data-step="2"]').isVisible(), true);
    mode = "success";
    await page
      .getByRole("button", { name: "Üye kaydı oluştur", exact: true })
      .click();
    await page.locator(".auth-panel .form-success").waitFor();
    assert.equal(submitted.account.email, "demo@example.com");
    assert.equal(submitted.education.classLevel, "YEAR_2");
    assert.deepEqual(submitted.membership.interestIds, [interests[0].id]);
    assert.equal(submitted.declarations.marketingConsent, false);
    assert.equal(submitted.declarations.privacyNoticeVersion, "test-1");
    assert.equal(submitted.declarations.privacyNoticeRead, true);
    console.log(
      "PASS: registration validation, step persistence, selected interest, backend field error, correct payload, pending success",
    );

    await page.goto(base + "/duyurular");
    await page
      .getByRole("heading", { name: "API üzerinden gelen duyuru" })
      .waitFor();
    await page
      .getByRole("button", { name: "Devamını oku", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "API üzerinden gelen duyuru" })
      .waitFor();
    await page.keyboard.press("Escape");
    mode = "empty";
    await page.reload();
    await page
      .getByText("Henüz yayınlanmış duyuru bulunmuyor.", { exact: true })
      .waitFor();
    mode = "offline";
    await page.reload();
    await page.locator(".content-note").waitFor();
    await page.getByLabel("Duyurularda ara").fill("zzzz");
    await page
      .getByText("Aramana uygun duyuru bulunamadı.", { exact: false })
      .waitFor();
    await page
      .getByRole("button", { name: "Aramayı temizle", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Web Geliştirme Atölyesi" })
      .waitFor();
    console.log(
      "PASS: live content, details, empty, offline fallback and search reset",
    );

    const forbidden = await context.request.post(
      base + "/api/club/auth/logout",
      { headers: { origin: "https://unrelated.invalid" } },
    );
    assert.equal(forbidden.status(), 403);
    assert.equal(
      (await context.request.get(base + "/api/club/admin/users")).status(),
      404,
    );
    console.log("PASS: cross-origin mutation blocked; admin proxy unavailable");

    for (const route of ["/", "/giris-yap", "/uye-kaydi", "/duyurular"]) {
      for (const width of [320, 390, 768, 1024, 1300, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + route);
        await page.locator("h1").waitFor();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          route + " overflow " + width,
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: path.join(
          output,
          (route === "/" ? "home" : route.slice(1)) + "-mobile.png",
        ),
        fullPage: true,
      });
      if (process.env.AXE_MODULE) {
        await page.addScriptTag({ path: process.env.AXE_MODULE });
        const result = await page.evaluate(
          async () =>
            await axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            }),
        );
        console.log(
          "AXE",
          route,
          result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.html),
          })),
        );
        assert.equal(
          result.violations.length,
          0,
          "Accessibility violations " + route,
        );
      }
    }
    await page.goto(base + "/");
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await page
      .locator("#site-navigation")
      .getByRole("link", { name: "Giriş Yap", exact: true })
      .waitFor({ state: "visible" });
    await page
      .locator("#site-navigation")
      .getByRole("link", { name: "Takım Alanı", exact: true })
      .click();
    assert.equal(await page.locator("#site-navigation").isVisible(), false);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: responsive routes, mobile navigation, zero JavaScript errors",
    );
  } finally {
    await browser.close();
  }
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => fixture.close());
