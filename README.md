# Yazılım Atölyesi — Frontend

Next.js, React ve TypeScript ile kulüp sitesi ve yönetim paneli.

## Yerel kurulum

```sh
npm ci
```

`.env.example` dosyasını `.env.local` olarak kopyala. Çalışan backend adresini
`CLUB_API_URL`, frontend adresini `CLUB_SITE_URL` olarak ayarla.

```sh
npm run dev:local
```

Site: http://localhost:3001. Yönetim paneli: `/yonetim`.
Backend ayrı depodadır: https://github.com/yazilimatolyesi1/yazilim_atolyesi_websitesi
Backend başlatma talimatları için o deponun belgelerine bak.

## Kontroller

```sh
npm run typecheck
npm run build
npm run start:local
```

Geliştirme ve üretim sunucusunu aynı portta eşzamanlı çalıştırma.
Playwright testleri için frontend ve backend çalışıyor olmalıdır.

## Belgeler

- [Yönetim paneli](docs/ADMIN-DASHBOARD.md)
- [Ekip görevleri](docs/TEAM-BOARD.md)
- [Bir haftalık frontend iş planı](docs/ONE-WEEK-TEAM-PLAN.md)
- [Kişilere ait PDF görev kartları](docs/kisi-gorevleri/)
- [Yerel entegrasyon ve test notları](docs/LOCAL-INTEGRATION.md)

Ekip görevleri şu anda yalnızca tarayıcıda saklanan bir önizlemedir; gerçek ekip
rolleri ve cihazlar arasında ortak görev paylaşımı backend'e bağlı değildir.

Yerel entegrasyon belgesindeki kök `compose.local.yaml` bu frontend deposunun
dışındaki çalışma alanına aittir. Bazı eski E2E testleri bu yerleşimi varsayar ve
backend verilerini/servisini değiştirir; günlük kullanılan ortamda çalıştırmadan
önce test notlarını oku. Ekip panosu testleri yalnızca test tarayıcısında görev
verisi oluşturur.
