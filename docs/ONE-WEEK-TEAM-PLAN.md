# Bir haftalık frontend geliştirme planı — 4 kişi

Backend sabit kalacak. Java kodu, veritabanı şeması ve endpoint sözleşmeleri değişmeyecek. Yalnızca frontend, frontend içindeki Next.js proxy, testler ve belgeler geliştirilecek. Bu belge planı tanımlar; işler henüz uygulanmadı ve önceki backend içeren planın yerini alır.

Tahmin: 5 iş günü × kişi başına 6 saat = 120 kişi-saat. Öğrenme, test ve entegrasyon süreye dahildir. Temel React, TypeScript, HTTP ve Git bilgisi varsayılır; sıfırdan eğitim bu süreye sığmaz. Takvim haftasının son iki günü olası gecikmeler için tampondur.

## Tespit edilen geliştirme alanları

- Aramalar her tuşta istek üretiyor; debounce, istek iptali ve URL'de filtre saklama gerekli.
- Alan hataları ve kaydedilmemiş değişiklik koruması geliştirilmeli.
- Takımlar, çalışma adımları ve kurallar sabit; mevcut içerik API'siyle yönetilebilir.
- Duyuru/içerik formları ve görsel yükleme deneyimi sadeleştirilebilir.
- Başvuru, kullanıcı ve mesaj ekranlarının filtre ve detay akışı iyileştirilebilir.
- Frontend hata testleri günlük backend'i durdurmamalı veya günlük veriyi değiştirmemeli.

## Ortak API kuralları

Tablolardaki yolların backend öneki `/api/v1`'dir. Tarayıcı mevcut `lib/api.ts` yardımcısını kullanır: `request("admin/announcements?page=0&size=10")` çağrısı `/api/club/admin/announcements` üzerinden Next.js proxy'ye, oradan backend'e gider. Server Component istekleri `lib/server-api.ts` yaklaşımını kullanır. Token mevcut HttpOnly cookie akışında kalır; localStorage'a taşınmaz.

ADMIN tüm yönetim alanlarına erişir. EDITOR duyuru, içerik, ayar, medya ve mesaj alanlarını kullanabilir; üye/kullanıcı yönetimi ADMIN gerektirir. Menü gizlemek backend yetkilendirmesinin yerine geçmez.

Duyuru, üye, kullanıcı ve mesaj listeleri sayfalıdır; `page=0` ilk sayfadır. İçerik ve ayar listeleri düz dizi döner. PUT işlemleri mevcut DTO'nun tüm düzenlenebilir alanlarını taşır; PATCH yalnızca desteklenen alanları değiştirir. 400, 401, 403, 404, 409, 429 ve bağlantı hataları ayrı ele alınır. Yazma istekleri otomatik tekrar gönderilmez.

Proxy her backend endpoint'ini açmıyor. Gereken mevcut yolları kişi 4 açık yöntem/yol kurallarıyla ekleyebilir; geniş wildcard açılmaz.

## Kişi 1 — Ziyaretçi sayfaları ve dinamik içerik

Amaç: Panelde düzenlenen verinin public sayfalarda doğru ve mobil uyumlu görünmesi.

Öğrenilecek kavramlar: Server/Client Component, fetch ve DTO eşleme, URL query parametreleri, sayfalama, loading/empty/error durumları, responsive CSS, erişilebilir HTML.

İşler:
1. Duyuru araması, kategori ve sayfalamayı URL ile yönet. Yenileme/geri/ileri gezinmede filtreler korunsun; yeni filtre ilk sayfaya dönsün.
2. Slug üzerinden duyuru detayı göster; bulunamayan kayıt ve bağlantı hatasını ayır. Başlık, tarih, kategori ve görsel alternatif metnini kullan.
3. Takımlar, çalışma adımları ve kuralları `HOME/CUSTOM` kayıtlarına bağla. Kişi 2 ile `team-*`, `workflow-*`, `rule-*` anahtarlarında anlaş. Başlık, açıklama, bağlantı ve sıra alanlarını kullan. Aynı kayıt genel içerik bölümünde ikinci kez görünmesin.
4. Başarılı boş yanıtı API hatasından ayır; tüm kayıtlar gizlendiğinde eski sabit içerikleri geri getirme.
5. Hakkımızda/iletişim/footer veri bağlantıları, uzun metin, eksik görsel ve 390 px ekran görünümünü düzelt.

| Endpoint | Kullanım |
|---|---|
| GET `/announcements?q=&category=&page=0&size=10` | Liste ve filtre |
| GET `/announcements/{slug}` | Duyuru detayı; UUID değil slug |
| GET `/pages/HOME` | Ana sayfa; isteğe bağlı `type=CUSTOM` |
| GET `/pages/ABOUT`, GET `/pages/CONTACT` | Sayfa içerikleri |
| GET `/settings/public` | Public iletişim/sosyal ayarlar; isteğe bağlı `prefix` |
| GET `/media/images/{id}` | Görsel gösterimi |

Detay tarayıcıdan alınacaksa kişi 4 proxy'ye slug yolunu ekler; server fetch için gerekmez. Duyuru API'sindeki ek `pinned`, `featured`, `from`, `to` filtrelerinin hepsini bu haftada arayüze eklemek zorunlu değildir.

Dosya sahipliği: public duyuru sayfaları, sections/public-blocks bileşenleri, ana sayfa, `lib/server-api.ts`, ilgili public stiller.
Süre: 4 saat öğrenme + 7 saat duyurular + 8 saat dinamik içerik + 5 saat mobil/erişilebilirlik + 6 saat test/entegrasyon.
Kabul: Filtre URL'si paylaşılabilir; panel değişikliği yenilemede public sayfaya yansır; gizlenen içerik geri gelmez; hata/boş durumları ayrıdır; mobil yatay taşma yoktur.

## Kişi 2 — Duyuru, içerik ve ayar editörü

Amaç: Teknik anahtar veya JSON yazmadan içerik yönetimi.

Öğrenilecek kavramlar: Controlled forms, TypeScript DTO, CRUD, PUT/PATCH, form doğrulama, FormData, dosya önizleme, dirty state, bileşen kompozisyonu.

İşler:
1. Duyuru formunu metin, yayın durumu, kategori ve görsel gruplarına ayır; taslak/yayın durumunu açık göster.
2. Sabitleme, öne çıkarma ve sıra için hızlı işlemler ekle. Devam eden istekte düğmeyi kilitle; başarısız işlem başarılı görünmesin.
3. Takım/adım/kural editörü hazırla. Formu mevcut `page=HOME`, `type=CUSTOM`, `key`, `title`, `body`, `linkUrl`, `displayOrder`, `active` alanlarına dönüştür. Anahtarı kullanıcı yazmasın. Sürükle-bırak yerine sıra numarası kullan.
4. Sabit içerikleri yalnızca eksik anahtarlar için POST eden, tekrar çalışınca çoğaltmayan frontend aktarım işlemi hazırla. Kullanıcı eylemiyle başlasın; her sayfa açılışında çalışmasın. Backend seed/migration değişikliği yok.
5. Görselde mevcut boyut/tür sınırlarına uygun kontrol, önizleme, alternatif metin ve anlaşılır hata ekle. Yükleme bitmeden kaydı engelle; dönen URL'yi içerikte sakla; object URL'leri temizle.
6. Ayarları anlaşılır etiketlerle grupla. Kişi 4'ün alan hatası ve kaydedilmemiş değişiklik bileşenlerini kullan.

| Endpoint | Kullanım |
|---|---|
| GET/POST `/admin/announcements` | Liste / oluşturma |
| GET/PUT/DELETE `/admin/announcements/{id}` | Detay / düzenleme / silme |
| PATCH `/admin/announcements/{id}/priority` | `displayOrder`, `featured`, `pinned` |
| GET/POST `/admin/contents` | Liste / oluşturma; GET: `page`, `type`, `active`, `featured` |
| GET/PUT/DELETE `/admin/contents/{id}` | Detay / düzenleme / silme |
| PATCH `/admin/contents/{id}/priority` | `displayOrder`, `featured`, `active` |
| GET/POST `/admin/settings` | Liste / oluşturma |
| GET/PUT/DELETE `/admin/settings/{id}` | Detay / düzenleme / silme |
| POST `/admin/media/images` | Multipart: `file`, `purpose`, isteğe bağlı `altText` |
| GET `/media/images/{id}` | Görsel gösterme |
| DELETE `/admin/media/images/{id}` | Kimliği bilinen görseli silme |

Görsel purpose: `ANNOUNCEMENT`, `PAGE_CONTENT`, `SLIDER`, `GENERAL`. Tüm görselleri listeleyen endpoint YOK; tam medya kütüphanesi kapsam dışı. İçerikten görsel bağlantısını kaldırmak dosyayı otomatik silmez. Kullanımdaki dosyanın silinmesi reddedilirse backend hatası gösterilir.

Dosya sahipliği: `components/admin/resources.tsx`, `resource-editor.tsx`, yeni yapılandırılmış içerik editörü ve görsel yükleme bileşeni.
Süre: 4 saat öğrenme + 7 saat duyuru/ayar + 8 saat içerik/aktarım + 5 saat görsel + 6 saat test/entegrasyon.
Kabul: CRUD gerçek API'de çalışır; anahtarlar çoğalmaz; sıra/görünürlük public tarafa yansır; yükleme hatası form metnini silmez.

## Kişi 3 — Başvuru, kullanıcı, mesaj ve genel bakış

Amaç: Başvuruları ve mesajları daha hızlı inceleyen yönetim ekranları.

Öğrenilecek kavramlar: Sayfalı tablolar, filtre state'i, debounce kullanımı, RBAC arayüzü, detay modalı, işlem onayı, enum etiketleri, hata yönetimi.

İşler:
1. Başvuru listesini arama, durum, kurum ve bölüm filtreleriyle geliştir; URL'de sakla; kişi 4'ün istek yardımcısını kullan.
2. Detayı kişisel bilgiler/eğitim/ilgi alanları/motivasyon olarak gruplandır. Onay/red ve değerlendirme notu ekle; işlem sonrası listeyi yenile; hatada notu koru.
3. Kullanıcı listesinde rol/durum filtreleri ve değişiklik onayı ekle. Mevcut kendi hesabını değiştirme engelini koru; UI engelini backend güvenlik garantisi olarak sunma.
4. Mesajlarda durum sekmeleri, arama, detay, durum değişikliği ve silme onayını geliştir. `REPLIED` sadece durum işaretidir; e-posta göndermez.
5. Genel bakış kartlarını erişilebilir listelerin `totalElements` değerinden üret. Bekleyen başvuru/yeni mesaj sayıları örnektir. Bir kart hatası diğerlerini gizlemesin; hata sıfır olarak görünmesin. EDITOR için ADMIN endpointlerine istek atma.

| Endpoint | Kullanım |
|---|---|
| GET `/admin/members` | `q`, `membershipStatus`, `institution`, `department`, `page`, `size` |
| GET `/admin/members/{userId}` | Başvuru detayı |
| PATCH `/admin/members/{userId}/review` | `{status: "APPROVED" veya "REJECTED", reviewNote}` |
| GET `/admin/users` | `q`, `status`, `role`, `page`, `size` |
| PATCH `/admin/users/{id}/roles` | Mevcut DTO'nun `roles` alanı |
| PATCH `/admin/users/{id}/status` | Mevcut DTO'nun `status` alanı |
| GET `/admin/contact-messages` | `q`, `status`, `from`, `to`, `page`, `size` |
| GET `/admin/contact-messages/{id}` | Mesaj detayı |
| PATCH `/admin/contact-messages/{id}/status` | `NEW`, `READ`, `REPLIED`, `ARCHIVED` |
| DELETE `/admin/contact-messages/{id}` | Onay sonrası silme |
| GET `/users/me` | Rol ve erişilebilir menüler |

Üye/kullanıcı ADMIN; mesaj ADMIN veya EDITOR. Ayrı istatistik endpoint'i yok; tarihsel analitik kapsam dışı. Başvuruda `membershipStatus`, kullanıcı/mesajda `status` kullanılır.

Dosya sahipliği: `components/admin/people.tsx`, yeni genel bakış bileşeni ve ilgili stiller; dashboard bağlantısını kişi 4 yapar.
Süre: 4 saat öğrenme + 8 saat başvuru + 5 saat kullanıcı + 5 saat mesaj + 3 saat genel bakış + 5 saat test/entegrasyon.
Kabul: Filtre/sayfalama tutarlı; doğru kayıt güncellenir; hata notu silmez; değişiklik onayı var; rol sınırları doğru; mesaj durumu e-posta gönderimi gibi sunulmaz.

## Kişi 4 — Ortak frontend altyapısı ve test

Amaç: Ortak davranışları geliştirmek ve tüm ekranları birlikte doğrulamak.

Öğrenilecek kavramlar: Custom hook, AbortController, debounce, HTTP durumları, cookie/proxy, erişilebilir modal, Playwright, route interception, test verisi, Git PR.

İşler:
1. İlk gün ortak bileşen arayüzlerini ve dosya sahipliğini sabitle. Mevcut Git geçmişini koruyarak frontend sürüm kontrolünü düzenle; kişi başına branch kullan.
2. Yaklaşık 300 ms debounce ve eski istek iptali ekle; timeout korunsun, iptal bağlantı hatası gibi gösterilmesin, eski cevap yeni listeyi ezmesin.
3. Ortak alan hatası/işlem bildirimi/modal davranışı: ilk hataya odak, kaydedilmemiş değişiklik uyarısı, klavye odağı, çift gönderim engeli. Tüm tarayıcı geçmişini bloke eden kapsamlı navigation guard hariç.
4. Giriş/profil/şifre değişiminde 401 ve 403 deneyimini ayır. Şifre değişince mevcut tarayıcıdan çıkış yaptırılabilir; tüm cihaz tokenlarını iptal etme backend değişmeden vaat edilmez.
5. Gerekirse duyuru slug yolunu frontend proxy allowlist'ine ekle; diğer kişilerin bileşenlerini dashboard'a bağla.
6. Hata testlerini Playwright ağ taklidiyle yap; günlük backend'i kapatma. Gerçek E2E için değişmemiş backend'in ayrı test kurulumu/verisi kullanılsın. Hazır değilse engeli belirt; mock testini gerçek E2E olarak raporlama. Ortam hazırlama backend kodunu değiştirme işi değildir.
7. Kritik akışları doğrula: içerik oluştur/public göster/gizle, başvuru incele, mesaj durumu, oturumsuz/yetkisiz erişim, form hatası, kaydedilmemiş değişiklik, mobil. Typecheck, mevcut lint komutu ve build sonuçlarını belgeye ekle.

| Endpoint | Kullanım |
|---|---|
| POST `/auth/login` | Mevcut giriş |
| GET `/users/me` | Oturum/rol |
| PATCH `/users/me/password` | Mevcut sözleşmeyle şifre değişikliği |
| POST **frontend** `/api/club/auth/logout` | Cookie temizleme; backend logout endpoint'i değildir |
| Kişi 1–3 endpointleri | Entegrasyon ve E2E |

Kayıt regresyon kontrolünde POST `/auth/register` ve GET `/membership/options` kullanılır; kayıt formu baştan tasarlanmaz.

Dosya sahipliği: `lib/api.ts`, `components/admin/shared.tsx`, `dashboard.tsx`, ortak stiller, `app/api/club/[...path]/route.ts`, frontend test/config/dokümanları. Ortak tip değişikliklerini kişi 4 birleştirir.
Süre: 3 saat öğrenme/sözleşme + 8 saat ortak yardımcı/modal + 4 saat oturum/proxy/entegrasyon + 10 saat test/hata + 5 saat kontroller/belge.
Kabul: İptal hata bildirimi üretmez; form verisi korunur; token client storage'a taşınmaz; günlük backend etkilenmez; gerçek ve mock testler ayrı raporlanır; tip kontrolü/build geçer.

## Günlük takvim

| Gün | Kişi 1 | Kişi 2 | Kişi 3 | Kişi 4 |
|---|---|---|---|---|
| 1 | Veri akışı/içerik anahtarları | DTO/form/içerik anahtarları | Filtre/rol inceleme | Git, ortak arayüz, test başlangıcı |
| 2 | Duyuru liste/detay | Duyuru ve öncelik | Başvuru liste/detay | Debounce/iptal/hatalar |
| 3 | Dinamik HOME bölümleri | İçerik editörü/aktarım/görsel | Kullanıcı/mesaj | Modal/oturum/test |
| 4 | Mobil ve entegrasyon | Public doğrulama/ayar | Genel bakış/roller | Entegrasyon/E2E |
| 5 | Düzeltme/demo | Düzeltme/demo | Düzeltme/demo | Kontrol/rapor/teslim |

Dördüncü gün yeni özellik ekleme kapanır. Günlük 10–15 dakika bağımlılık kontrolü yapılır. Kişi 1–2 içerik anahtarlarını ilk gün belirler. Kişi 4 ortak yardımcı arayüzünü ilk gün, çalışan sürümünü ikinci gün verir. Herkes kendi bileşeninde çalışır; ortak dashboard dosyasını kişi 4 birleştirir. Her kişi kendi modülünü test eder; tüm doğrulama kişi 4'e bırakılmaz.

## Teslim ve kapsam dışı

Kişi başına PR, kullanım notu, test kanıtı ve beş dakikalık demo. Kritik akışlar gerçek backend ile çalışmalı; loading/empty/error durumları ve 390 px görünüm doğrulanmalı. Gerçek veri yazan testler test ortamı/verileriyle yürütülmeli.

Yeni backend endpoint'i, migration, JWT iptali, backend yetki kuralı, tam medya kütüphanesi, e-posta gönderimi, gelişmiş analitik, sürükle-bırak CMS ve üretim dağıtımı bu haftanın kapsamı dışındadır.
