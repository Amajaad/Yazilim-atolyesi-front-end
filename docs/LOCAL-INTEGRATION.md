# Yerel frontend–backend bağlantısı

26 Eylül 2026

Tarayıcı → Next.js `http://localhost:3001/api/club/*` → Spring Boot
`http://127.0.0.1:8080/api/v1/*` → PostgreSQL.

## Çalıştırma

Gereksinimler: Node.js, npm ve çalışan Docker Desktop. Java 21 Docker imajının
içindedir; bilgisayardaki Java sürümünü değiştirmek gerekmez.

Çalışma alanının kökünde:

```powershell
docker compose -f compose.local.yaml up -d --build
Invoke-RestMethod http://127.0.0.1:8080/actuator/health
```

`compose.local.yaml` ayrı `yazilim-atolyesi-local` Compose projesini kullanır.
PostgreSQL host portu açılmaz; diğer projelerin 5432/3000 portları ve mevcut
veritabanları kullanılmaz. Veritabanı ve yüklenen medya ayrı kalıcı volume'larda tutulur.
Bu dosya yerel geliştirme içindir; backend yalnızca 127.0.0.1:8080 üzerinden sunulur.

Frontend klasöründe, ilk kurulumda `.env.example` dosyasını `.env.local` olarak
kopyala (var olan ortam ayarlarını ezme):

```powershell
npm ci
npm run build
npm run start:local
```

Site: **http://localhost:3001**. Geliştirme sırasında `npm run dev:local` kullanılabilir.
`start:local` ile `dev:local` aynı anda çalıştırılmaz.

Ortam değişkenleri:

```dotenv
CLUB_API_URL=http://127.0.0.1:8080/api/v1
CLUB_SITE_URL=http://localhost:3001
```

`CLUB_API_URL` sadece Next.js sunucusunca kullanılır. `CLUB_SITE_URL` tarayıcıdan
açılan sitenin origin'idir; POST kaynak kontrolü ve Secure çerez kararı buna göre
verilir. Başka domain/port kullanılırsa bu değer de değiştirilip sunucu yeniden
başlatılır. Canlı ortamda HTTPS site adresi kullanılır.

Swagger: http://127.0.0.1:8080/swagger-ui.html

Yerel başlangıç yöneticisi backend README'sinde tanımlıdır:
`admin@yazilimatolyesi.local` / `ChangeMe123!`. Yönetici girişi sonrasında
`/yonetim` paneli açılır. Kullanımı: [ADMIN-DASHBOARD.md](ADMIN-DASHBOARD.md).

## Bağlanan akışlar

- Ana sayfa duyuruları ve duyuru listesi: gerçek API, arama, sayfalama, detay.
- Kayıt: ilgi alanları, eğitim seçenekleri ve metin sürümü backend'den alınır;
  kayıt sonrası üyelik `PENDING` olur.
- Giriş: JWT tarayıcı JavaScript'ine verilmez, HttpOnly/SameSite=Lax çerezde tutulur.
- Profil: kişisel bilgiler ve `membership.status` okunur; yönetici onayı yenilemede görünür.
- Çıkış: yerel oturum çerezi silinir. Backend JWT'si ayrıca iptal edilmez.
- İletişim: gerçek API'ye gönderilir; hata halinde form korunur.
- Kesinti: örnek duyuru gösterilmez; boş liste ve bağlantı hatası ayrı gösterilir.
- Backend'in `X-Request-Id`, `Retry-After` ve hız sınırı başlıkları proxy'den aktarılır.

Yönetim paneli, dinamik sayfa blokları, iletişim/sosyal ayarlar ve medya bağlantısı
sonraki dashboard çalışmasında eklendi. Üyelerin kendi profilini düzenleme ekranı
henüz eklenmedi. Canlı ortam kurulumunda güvenilen reverse proxy üzerinden
istemci IP aktarımı ayrıca yapılandırılmalı; mevcut backend hız sınırlaması aksi
halde Next.js sunucusunun IP'sini ortak kullanır.

## Gerçek uçtan uca test

Yukarıdaki servisler çalışırken frontend klasöründe:

```powershell
npx playwright install chromium
npm run test:e2e
```

Testler gerçek Spring API ve PostgreSQL kullanır. Başarılı yanıtlar taklit edilmez.
Üretilen test kullanıcısı, duyurular ve mesajlar test sonunda temizlenir.
Kayıt ve iletişim verilerinin PostgreSQL'e yazıldığı SQL ile de doğrulanır.
Son senaryo yalnızca bu Compose projesinin backend'ini kısa süre durdurur ve
`finally` bloğunda tekrar başlatır. Test sırasında yerel site kısa süre API 503 döner.

Senaryolar:

1. Ana sayfa, duyuru arama/sayfalama/detay ve boş sonuç.
2. Kayıt, izin kayıtları, yanlış şifre, giriş, çerez, yenileme, yönetici onayı ve çıkış.
3. Tekrar e-posta, eski metin sürümü, doğrulama hataları, yabancı origin ve kapalı proxy yolları.
4. İletişim formu ve veritabanı kaydı.
5. Geçersiz oturum çerezinin temizlenmesi.
6. Mobil genişlikte gerçek backend kesintisi, formun korunması ve yeniden gönderim.

JSON sonuçları: `frontend/.e2e-results/results.json`.
Hata ekran görüntüleri: `frontend/.e2e-results/artifacts/`.

26 Eylül 2026 doğrulama sonucu: üretim derlemesi ve TypeScript kontrolü başarılı;
Playwright **6/6**, backend test paketi **8/8** geçti. Kesinti senaryosu sonunda
backend sağlık yanıtı `UP`, frontend üzerinden üyelik seçenekleri yanıtı `200`.
Test sonrası test kullanıcıları, test duyuruları ve test mesajları için kalan kayıt
sayısı ayrı ayrı **0** olarak PostgreSQL'den kontrol edildi.

Backend'in mevcut test paketini Java 21 ile çalıştırmak için kök dizinde:

```powershell
docker build --target build -t yazilim-atolyesi-local-tests ./yazilim_atolyesi_websitesi
docker run --rm yazilim-atolyesi-local-tests sh mvnw -B -ntp test
```

Backend test paketi H2 kullanır; Playwright senaryoları gerçek PostgreSQL üzerindedir.

## Durdurma

Frontend terminalinde Ctrl+C. Kök dizinde:

```powershell
docker compose -f compose.local.yaml stop
```

Veritabanı ve medya volume'ları korunur.
