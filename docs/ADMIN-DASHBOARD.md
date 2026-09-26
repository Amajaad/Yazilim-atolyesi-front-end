# Yönetim paneli

Panel: **http://localhost:3001/yonetim**

Sitedeki **Giriş Yap** bağlantısından yönetici veya editör hesabıyla giriş yapınca
panel otomatik açılır. Giriş yapmış yöneticiler ana menüde **Yönetim Paneli**
bağlantısını görür. Panelin altındaki çıkış düğmesi oturumu kapatır.

Yerel geliştirme yöneticisi: `admin@yazilimatolyesi.local` / `ChangeMe123!`.
Şifre panelin **Hesap güvenliği** bölümünden değiştirilebilir.

## Bölümler

| Bölüm | Yapılabilen işlemler | Yetki |
|---|---|---|
| Genel bakış | Bekleyen başvurular, yeni mesajlar, duyuru ve kullanıcı sayıları | ADMIN / EDITOR; role göre görünüm |
| Üyelik başvuruları | Arama, durum filtresi, detay ve izin geçmişi, onay/ret ve not | ADMIN |
| Duyurular | Arama, sayfalama, taslak/yayın/arşiv, oluşturma/düzenleme/silme, görsel yükleme, sabitleme ve sıra | ADMIN / EDITOR |
| Gelen mesajlar | Mesaj okuma, arama, sayfalama, takip durumunu değiştirme ve silme | ADMIN / EDITOR |
| Sayfa içerikleri | Ana sayfa/hakkımızda/iletişim blokları, görsel ve bağlantı, aktiflik, sıra ve öne çıkarma | ADMIN / EDITOR |
| Site ayarları | Public/private ayar oluşturma, düzenleme, silme; iletişim/sosyal/KVKK | ADMIN / EDITOR |
| Kullanıcılar | Arama, sayfalama, roller ve aktif/pasif/askıda hesap durumu | ADMIN |
| Hesap güvenliği | Mevcut şifreyi doğrulayarak şifre değiştirme | ADMIN / EDITOR |

Ret kararında değerlendirme notu zorunludur. Onayda backend `MEMBER` rolünü verir.
Hesabın kendi rolü/durumu, panelde yanlışlıkla erişim kaybını önlemek için düzenlenemez.
Mesaj durumunu “Yanıtlandı” yapmak e-posta göndermez; bu sadece takip bilgisidir.
Silme işlemleri kalıcıdır ve panel onay sorar.

## Sitede görünen değişiklikler

- Duyurular yayınlandığında duyuru listesinde ve sırasına göre ana sayfada görünür.
- İleri tarihli yayınlar zamanı gelene kadar ziyaretçiye gösterilmez.
- Görseller Next.js medya yolu üzerinden sunulur; backend'in yerel adresi tarayıcıya verilmez.
- HOME sayfasının ilk aktif HERO bloğu karşılama alanını doldurur. Diğer aktif HOME
  blokları karşılama alanının altında kartlar halinde gösterilir. SLIDER bu aşamada
  bir vitrin kartıdır, otomatik kayan carousel değildir.
- ABOUT blokları hakkımızda bölümünde, CONTACT blokları footer iletişim bölümünde görünür.
- İçerikleri gizlemek için “Sitede göster” işaretini kaldırmak yeterlidir.
- Public `contact.email`, `contact.phone`, `contact.address` ayarları footer'a bağlanır.
- Public `social.github`, `social.linkedin`, `social.instagram`, `social.youtube`
  ayarları sosyal medya bağlantılarına bağlanır.
- KVKK ve iletişim metinleri üyelik formunda kullanılır. Metin güncellenince ilgili
  sürüm anahtarı da güncellenmelidir.
- Yeni, farklı ayar anahtarları backend'de saklanır; otomatik olarak yeni arayüz alanı oluşturmaz.
- Takım alanları, çalışma akışı ve kurallar mevcut frontend tasarımından gelmeye devam eder.

## Güvenlik ve oturum

`/yonetim` sayfası sunucuda mevcut profili okuyarak yetki kontrolü yapar.
Normal üyeler paneli göremez. Backend her yönetim isteğinde güncel rolleri doğrular;
menüleri gizlemek tek erişim kontrolü değildir.

JWT HttpOnly çerezde kalır. Proxy sadece açıkça listelenen HTTP metotları ve yolları
aktarır; POST/PUT/PATCH/DELETE istekleri site origin'ini doğrular. `204` silme yanıtları,
multipart yüklemeler, binary görseller, `401`/`403` ve alan hataları desteklenir.
Süresi dolan oturumlarda yeniden giriş bağlantısı gösterilir.

## Çalıştırma ve test

Servisleri başlatmak için [LOCAL-INTEGRATION.md](LOCAL-INTEGRATION.md) adımlarını uygula.
Frontend üretim derlemesinden sonra sunucuyu yeniden başlat.

```powershell
npm run build
npm run start:local
```

Ayrı terminalde:

```powershell
npm run test:e2e
```

`tests/e2e/admin.spec.ts` gerçek backend üzerinde ziyaretçi/üye/editör yetkilerini,
yönetici girişini, görselli duyuru CRUD işlemlerini, başvuru kararlarını, kullanıcı
rol ve durum değişikliklerini, mesaj takibini, içerik/ayar değişikliğinin sitede
görünmesini, mobil görünümü ve şifre değişimini doğrular.

Testler sadece localhost ortamında çalışır. Sentetik veriler temizlenir;
test sırasında değiştirilen iletişim ayarı önceki değerine geri alınır.
E-posta gönderilmez. Test yöneticisinin bilgileri değiştirilmişse
`E2E_ADMIN_EMAIL` ve `E2E_ADMIN_PASSWORD` ortam değişkenlerini ayarla.

26 Eylül 2026 doğrulaması: üretim derlemesi ve TypeScript kontrolü başarılı.
Dashboard'ın 5 senaryosu ve mevcut entegrasyonun 6 senaryosu birlikte **11/11** geçti.
Masaüstü ve 390 px mobil ekran görüntüleri kontrol edildi. Test kullanıcıları,
duyuruları, içerikleri ve mesajlarının temizlendiği PostgreSQL'den doğrulandı.
