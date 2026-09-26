# Plesk'te yayınlama

Bu proje Next.js kullanır. `npm run build` üretim dosyalarını `.next` içine
oluşturur; `npm start` bunları Node.js sunucusunda çalıştırır. `.next` tek başına
statik bir web sitesi değildir. API proxy'si nedeniyle mevcut proje statik
export olarak yayınlanamaz.

## Bilgisayarda deneme

Proje klasöründeki terminalde:

```powershell
npm run build
npm start
```

http://localhost:3000 adresini aç. Durdurmak için Ctrl+C kullan.
Plesk başlangıç dosyasını yerelde denemek için `npm start` yerine `node server.js`
çalıştırabilirsin. İkisini aynı portta aynı anda çalıştırma.

## Linux Plesk + Node.js kurulumu

Bu adımlar Linux Plesk'te Node.js özelliğinin açık olduğunu varsayar.
Plesk özel bir Next.js entegrasyonu sunmadığından, Node.js başlangıç dosyası
olan `server.js` kullanılır. Sunucudaki uyumluluk ayrıca doğrulanmalıdır.
Node.js menüsü yoksa hosting sağlayıcından Node.js Toolkit desteğini sor.

1. Plesk > Websites & Domains altında domaini ekle/seç.
2. Dosya Yöneticisi veya SFTP ile aşağıdaki dosya ve klasörleri örneğin
   `httpdocs` içine, aynı dizin yapısını koruyarak yükle:
   - `app`, `components`, `lib`, `public`
   - `package.json`, `package-lock.json`, `server.js`, `next.config.mjs`
   - `tsconfig.json`, `next-env.d.ts`, `postcss.config.mjs`, `tailwind.config.ts`
3. Bilgisayarındaki `node_modules` ve `.next` klasörlerini yükleme.
   Kurulum ve build sunucuda yapılır; böylece Linux bağımlılıkları kullanılır.
4. Domain > Node.js ayarlarını düzenle:

| Alan | Değer |
| --- | --- |
| Node.js Version | 22.x (proje yerelde 22 ile build ediliyor; Next minimum 20.9 ister) |
| Package Manager | npm |
| Application Root | `httpdocs` |
| Document Root | `httpdocs/public` |
| Application Mode | Production |
| Application Startup File | `server.js` |

Panel yolları `/httpdocs` şeklinde gösterebilir. Başka klasör seçersen iki kök
yolu da ona göre değiştir. Document Root kaynak kod dizini değil, `public` olmalı.

5. Custom Environment Variables alanına `CLUB_API_URL` ekle. Örnek:
   `https://api.example.com/api/v1`. Bu örnek adresi gerçek backend adresiyle değiştir.
   Backend aynı sunucuda gerçekten 8080 portunda çalışıyorsa
   `http://127.0.0.1:8080/api/v1` kullanılabilir. `localhost`, kendi bilgisayarını
   değil uygulamanın çalıştığı sunucuyu ifade eder.
6. Sunucudaki proje dizininde bağımlılıkları build araçlarıyla birlikte kur:

   ```sh
   npm ci --include=dev
   npm run build
   ```

   SSH yoksa panelde NPM Install ve ardından Run Script > `build` kullan.
   Production kurulumunda devDependencies atlanırsa TypeScript/Tailwind build'i
   başarısız olabilir. Bu durumda hosting desteğinden `npm ci --include=dev`
   çalıştırmasını iste veya panelin kurulum ayarlarında dev bağımlılıklarını dahil et.
7. Node.js'i etkinleştir ve Restart App yap. Panel uygulamayı `server.js` ile
   yönetir; Run Script alanından sürekli çalışan `start` komutunu başlatma.

## Domain ve HTTPS

DNS'i hangi firma yönetiyorsa kayıtları oradan düzenle (domain satıcısı,
Cloudflare veya Plesk olabilir). Domainin kök A kaydını hosting IP adresine,
`www` CNAME kaydını kök domaine yönlendir. Var olan kayıtları önce incele;
e-posta MX/TXT kayıtlarını değiştirme. AAAA kaydı varsa doğru sunucuyu
gösterdiğini kontrol et.

DNS doğru sunucuya çözümlendikten sonra Plesk > SSL/TLS Certificates üzerinden
Let's Encrypt sertifikasını kur. `www` için de DNS doğruysa onu dahil et.
Ardından HTTP → HTTPS yönlendirmesini etkinleştir.

## Yayın kontrolü

- Ana sayfa, `/duyurular`, `/giris-yap` ve `/uye-kaydi` açılıyor mu?
- CSS ve resimler yükleniyor mu?
- `/api/club/membership/options` backend'den başarılı cevap alıyor mu?
- Giriş ve form gönderimleri HTTPS altında çalışıyor mu?

Frontend'in açılması backend'in yayında olduğu anlamına gelmez. Ana sayfa
backend erişilemediğinde örnek duyurulara dönebilir. Spring backend ve veritabanı
ayrıca kurulmalıdır. API 503 hatası backend erişimini; formdaki 403 kaynak
doğrulama hatası reverse proxy'nin dış domain/protokol aktarımını araştırmayı
gerektirir. Ayrıntılar Plesk > domain > Logs bölümündedir.

## Kaynaklar

- https://doc.plesk.com/en-US/obsidian/administrator-guide/website-management/hosting-nodejs-applications.76652/
- https://support.plesk.com/hc/en-us/articles/12376965359511-Does-Plesk-support-Next-JS
- https://support.plesk.com/hc/en-us/articles/12377676289815-How-to-install-Let-s-Encrypt-SSL-certificate-for-domain-in-Plesk
- Projeyle gelen `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`
- Projeyle gelen `node_modules/next/dist/docs/01-app/02-guides/custom-server.md`
