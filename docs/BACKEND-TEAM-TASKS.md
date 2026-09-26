# Frontend–Backend Bağlantısı: 5 Kişilik Görev Dağılımı

Tarih: 24 Eylül 2026

Bu belge görev planıdır; entegrasyon kodu veya ortam ayarı değiştirilmemiştir. İsimler belli olmadığı için sorumlular Kişi 1–5 olarak adlandırılmıştır. Teknik başlangıç noktası: [entegrasyon planı](BACKEND-INTEGRATION-PLAN.md).

## 1. Hedef ve çalışma biçimi

Hedef; mevcut tasarımı koruyarak duyuruları, üyelik başvurusunu, giriş/çıkışı, profil özetini, iletişim formunu ve temel sayfa içeriklerini mevcut Spring Boot backend'ine bağlamak.

| Sorumlu | İş paketi | Somut teslim |
|---|---|---|
| Kişi 1 | API altyapısı, geliştirme ortamı ve ortak doğrulama | Çalışan aracı API, hata sözleşmesi ve kurulum rehberi |
| Kişi 2 | Giriş, çıkış ve oturum | Oturumla uyumlu giriş ekranı, menü ve profil özeti |
| Kişi 3 | Üyelik başvurusu | Gerçek seçenek ve metinlerle çalışan kayıt formu |
| Kişi 4 | Duyurular | Ana sayfa duyuruları, arama ve sayfalama |
| Kişi 5 | İletişim ve sayfa içerikleri | Çalışan iletişim formu, backend'den gelen sayfa metinleri |

Bağımsızlık, herkesin kendi dosyalarında ve kendi örnek API cevaplarıyla geliştirebilmesi anlamına gelir. Ortak sistemin son doğrulaması birlikte yapılır. Hiç kimse geliştirmeye başlamak için Kişi 1'in tüm altyapıyı bitirmesini beklememelidir.

İlk kapsam dışında: yönetim paneli, başvuru onay ekranı, profil düzenleme, şifre değiştirme, medya yükleme ve yeni bir backend mimarisi. Backend'deki bu özelliklerin varlığı, bu teslimde ekranlarının yapılacağı anlamına gelmez.

## 2. Başlangıçta sabitlenecek ortak kurallar

### API ve veri kuralları

- Tarayıcı çağrıları `/api/club/*` üzerinden yapılır. Spring endpointlerinin kökü `/api/v1` olur.
- Backend adresini yalnızca sunucu tarafındaki `CLUB_API_URL` belirler. Tarayıcı bileşenlerinde `localhost:8080` yazılmaz.
- Backend DTO ve controller kodları esas kaynaktır; `yazilim_atolyesi_websitesi/docs/API.md` ile çelişki varsa kaydedilip Kişi 1'e iletilir.
- Mevcut `request<T>(path, options?)` fonksiyonunun imzası korunur. `path` başında `/` olmadan verilir: `auth/login`, `announcements?page=0&size=9`.
- İstek yardımcı fonksiyonu başarılı durumda ayrıştırılmış yanıtı döndürür, başarısız durumda `ApiError` fırlatır.
- Mevcut `ApiError.message`, `fieldErrors` ve `status` alanları korunur. `code`, `requestId` ve `retryAfterSeconds` gerekirse opsiyonel eklenir; diğer iş paketleri bunların varlığına bağımlı başlamaz.
- Sayfalama sıfırdan başlar. Liste cevaplarında `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last` alanları backend sözleşmesiyle eşleştirilir.
- Tarihler API'den ISO-8601 olarak gelir; gösterimde `Europe/Istanbul` kullanılır.
- JWT tarayıcıya JSON içinde verilmez veya localStorage'a yazılmaz. Mevcut `club_session` adlı HttpOnly çerez yaklaşımı korunur.
- Formlarda başarı yalnızca başarılı API yanıtından sonra gösterilir. Backend kesintisinde kullanıcı girdileri korunur.
- Canlı içerik alınamadığında örnek duyurular gerçek içerik gibi gösterilmez. Boş liste, yüklenme ve hata farklı durumlardır.

### Bağımsız geliştirme için sınırlar

Her kişi kendi özellik klasöründe backend sözleşmesine uygun fixture dosyaları ve servis adaptörü oluşturur. Bileşen testlerinde servis adaptörünün sonucu taklit edilir. Bu örnekler gerçek ortama otomatik yedek veri olarak bağlanmaz.

Önerilen yeni klasörler:

```text
frontend/features/
  session/        # Kişi 2
  registration/   # Kişi 3
  announcements/  # Kişi 4
  site-content/   # Kişi 5
frontend/tests/integration/  # Kişi 1: birleşik akışlar
```

Bu yollar planlanan dosyalardır; henüz oluşturulmuş oldukları varsayılmamalıdır. Ortak test aracı kurulacaksa `package.json` ve kilit dosyasını yalnızca Kişi 1 değiştirir. Diğer kişiler test senaryolarını kendi özellik klasöründe tutar.

### Dosya sahipliği

Tüm yollar depo köküne göredir.

| Dosya / alan | Tek yazma sahibi | Diğer kişilerin çalışma şekli |
|---|---|---|
| `frontend/lib/api.ts` | Kişi 1 | Mevcut arayüzü kullanır |
| `frontend/app/api/club/[...path]/route.ts` | Kişi 1 | Gerekli yol ve metodu teslim notunda bildirir |
| Yeni `frontend/lib/backend-config.ts` | Kişi 1 | Sunucu tarafı adres çözümleme için kullanılır |
| `frontend/package.json`, `package-lock.json`, ortam örnekleri, `next.config.mjs` | Kişi 1 | Bağımlılık ve ayar talebi iletilir |
| `frontend/components/auth-form.tsx`, `header.tsx` | Kişi 2 | Kişi 3 kayıt bileşenini ayrı dosyada geliştirir |
| `frontend/app/giris-yap/page.tsx` | Kişi 2 | Giriş akışının sayfa bağlantısı |
| `frontend/app/uye-kaydi/page.tsx` | Kişi 3 | Yeni kayıt bileşenini kullanır |
| `frontend/components/announcement-list.tsx`, `lib/announcement.ts`, `lib/server-api.ts` | Kişi 4 | Duyuru kodu ve sunucu tarafı okuma |
| `frontend/app/duyurular/page.tsx` | Kişi 4 | Duyuru sayfası bağlantısı |
| `frontend/components/contact-form.tsx`, `sections.tsx`, `hero.tsx` | Kişi 5 | Diğer kişiler bu dosyalara kod eklemez |
| `frontend/app/page.tsx` | Kişi 5 | Kişi 4'ün ana sayfa duyuru bileşenini son aşamada yerleştirir |
| `frontend/lib/content.ts` | Kişi 5 | Kişi 4 yeni duyuru tiplerini kendi alanında tanımlar |
| `frontend/app/layout.tsx`, `globals.css` | Kişi 1 | Zorunlu ortak değişiklikler tek PR üzerinden alınır |
| Backend üretim kodu ve ortak API dokümanı | Kişi 1 | Özellik sahipleri hata raporu ve beklenen davranışı iletir |

Yeni stiller gerekiyorsa her kişi kendi özelliğine ait CSS Module kullanır. Ortak görünüm dosyalarının herkes tarafından değiştirilmesi önlenir. Next.js kodu yazmadan önce `frontend/AGENTS.md` ve ilgili yerel Next.js rehberi okunur.

## 3. Kişi 1 — API altyapısı ve ortam

**Amaç:** Diğer dört iş paketinin kullandığı taşıma ve hata altyapısını tamamlamak.

**Görevler**

1. Java 21, Docker/PostgreSQL ve Maven Wrapper için Windows kurulum/çalıştırma adımlarını yaz. Compose'un yalnızca veritabanını başlattığını açıkla.
2. Sır içermeyen frontend ortam örneğini hazırla. Backend başlatma, Flyway ve sağlık kontrolü adımlarını doğrula.
3. API adres çözümlemesini yeni `lib/backend-config.ts` içine al. Mevcut `server-api.ts` Kişi 4'e ait olduğu için onu değiştirme; aracı rotayı yeni yardımcıya geçir.
4. `request` ve `ApiError` sözleşmesini geriye uyumlu koru. JSON olmayan hata cevapları, zaman aşımı ve boş yanıtları açık şekilde işle.
5. Aracı rotada yol + HTTP metodu izin listesini netleştir. Yalnızca bu teslimin gerektirdiği endpointleri aç; keyfi backend URL'si kabul etme.
6. Giriş tokenını mevcut HttpOnly çerezde sakla; frontend'e kullanıcı ve süre bilgisini döndür. `users/me` için token aktarımı ve geçersiz oturumda çerez temizliğini doğrula.
7. Çıkış işlemini Next.js üzerinde tut. Backend'de mevcut olmayan bir logout endpointine çağrı yapma. Mevcut davranışın tokenı sunucuda iptal etmediğini belgele.
8. POST origin kontrolünü, HTTPS çerez davranışını, `Retry-After` ve `X-Request-Id` aktarımını doğrula.
9. Production rate limiting davranışını aracı sunucu üzerinden incele. Gerçek istemci IP'si gerekiyorsa yalnızca güvenilen proxy zincirine göre çöz; istemcinin gönderdiği başlığa doğrudan güvenme.
10. Ortak test komutlarını belirle; son birleşik doğrulamayı koordine et.

**Bu teslim için yol listesi**

| Metot | Next.js altında yol | İşlem |
|---|---|---|
| GET | `announcements` | Backend'e ilet |
| GET | `membership/options` | Backend'e ilet |
| GET | `settings/public` | Sorgu parametreleriyle backend'e ilet |
| GET | `pages/HOME`, `pages/ABOUT`, `pages/CONTACT` | Gerekli içerik yollarını kontrollü aç |
| GET | `users/me` | Oturum tokenıyla ilet |
| POST | `auth/login`, `auth/register`, `contact/messages` | Backend'e ilet |
| POST | `auth/logout` | Next.js çerezini temizle |

**Bağımsız çalışma:** Sahte upstream cevaplarıyla aracı katmanı test eder; ekranların tamamlanmasını beklemez. Her geliştirici kendi backend/veritabanı ortamını kullanabilir; Kişi 1'in bilgisayarı ortak zorunlu sunucu yapılmaz.

**Kabul ölçütleri**

- İzin verilmeyen yollar/metotlar backend'e iletilmez.
- Login sonrası çerez HttpOnly'dir; istemciye dönen JSON'da token yoktur.
- Oturumsuz `users/me` isteği `401` verir; logout çerezi temizler.
- Backend kesintisi anlamlı hata üretir; backend doğrulama hataları korunur.
- Kurulum rehberi başka bir ekip üyesinin temiz ortamında uygulanabilir.

**Teslim:** Altyapı PR'ı, kurulum rehberi, endpoint listesi ve test sonuçları.

## 4. Kişi 2 — Giriş, çıkış ve oturum

**Amaç:** Kullanıcının giriş yapması, oturumunu anlaması ve güvenilir şekilde çıkış yapması.

**Görevler**

1. `features/session` altında oturum tipleri, servis adaptörü ve giriş bileşeni oluştur.
2. `auth/login`, `users/me` ve yerel `auth/logout` çağrılarını kullan. Login cevabıyla profil cevabının aynı biçimde olduğunu varsayma; backend DTO'larını ayrı eşleştir.
3. Giriş ekranında gönderiliyor, yanlış bilgi, sunucu hatası ve başarılı giriş durumlarını uygula.
4. Profil özetinde ad, e-posta ve üyelik başvuru durumunu göster. `PENDING`, `APPROVED`, `REJECTED` durumlarını rol bilgisinden ayrı değerlendir.
5. Oturum yenileme ve çıkış davranışını tek bir özellik servisi/hook'u üzerinden yönet. İlk render sırasında kontrol tamamlanmadan kullanıcıyı kesin olarak oturumsuz sayma.
6. `header.tsx` içindeki sabit giriş/kayıt bağlantılarını oturum durumuna uyarla. Aynı sayfada giriş/çıkış yapıldığında menüyü güncelle.
7. `401` durumunda yeniden girişe yönlendir veya giriş ekranını göster; `403` ve servis kesintisini ayrı bildir.
8. `auth-form.tsx` içindeki kayıt akışını Kişi 3'ün PR'ı birleşene kadar çalışır tut. Sonra dosyayı sadeleştir; Kişi 3'ün bileşenini değiştirme.

**Bağımsız çalışma:** Oturumsuz, geçerli oturum, süresi dolmuş oturum ve üç üyelik durumuna ait fixture'larla çalışır. Kişi 3'ün kayıt ekranını beklemez; hazır test hesabı veya taklit servis kullanır.

**Kabul ölçütleri**

- Geçerli giriş sonrası kullanıcı bilgisi ve menü güncellenir.
- Yenilemede geçerli oturum korunur; çıkıştan sonra profil verisi temizlenir.
- Hatalı şifre başarılı giriş olarak görünmez.
- Başvurusu bekleyen kullanıcı yanlışlıkla onaylı üye olarak gösterilmez.
- Token JavaScript depolamasına yazılmaz.

**Teslim:** Giriş/oturum PR'ı, durum senaryoları ve doğrulama sonuçları.

## 5. Kişi 3 — Üyelik başvurusu

**Amaç:** Mevcut çok adımlı kayıt deneyimini backend'in gerçek başvuru sözleşmesiyle tamamlamak.

**Görevler**

1. Mevcut `auth-form.tsx` dosyasını başlangıç referansı olarak oku; düzenlemeden kayıt akışını yeni `features/registration/registration-form.tsx` bileşenine taşı.
2. `app/uye-kaydi/page.tsx` sayfasını yeni bileşene bağla. Kayıt bileşeni dışarıdan oturum servisi gerektirmeyen, props zorunluluğu olmayan bir `RegistrationForm` export etsin.
3. `/membership/options` ve `/settings/public?prefix=legal.` sonuçlarını yükle. İlgi alanı UUID'lerini ve enum değerlerini cevaplardan al.
4. `account`, `personal`, `education`, `membership`, `declarations` alanlarını backend DTO'larıyla tek tek eşleştir.
5. Zorunlu alanlar, e-posta/şifre koşulları, aktif öğrenci için sınıf seçimi ve en az bir ilgi alanını kontrol et. İsteğe bağlı alanların boş/null davranışını doğrula.
6. Gösterilen başvuru metninin sürümünü gönder. Zorunlu okuma beyanı ile isteğe bağlı iletişim tercihini ayrı tut.
7. Sunucudan gelen `personal.firstName` gibi alan hatalarını ilgili alan ve forma adımına bağla.
8. Başvuru metni sürümü değişirse yeni metni yüklet; kullanıcıya tekrar incelet. Kullanıcının onayını sessizce yeni sürüme taşıma.
9. Başarıda `PENDING` durumunu açıkla ve giriş bağlantısı sun. Kayıt cevabını login tokenı gibi kullanma.
10. İstek devam ederken tekrar göndermeyi engelle; hata durumunda adımlar arasında girilmiş bilgileri koru.

**Bağımsız çalışma:** Form seçenekleri, metinler, başarılı başvuru, alan hatası, tekrar e-posta ve metin sürümü değişimi fixture'ları kullanır. Login bileşenine bağımlılığı yalnızca `/giris-yap` bağlantısıdır.

**Kabul ölçütleri**

- Seçenekler veya başvuru metni yüklenemediğinde eksik veriyle kayıt gönderilmez.
- Geçerli form backend'de başvuru oluşturur; kullanıcı bekleyen başvuru mesajını görür.
- Sunucu hataları doğru alan/forma adımında görünür.
- İsteğe bağlı iletişim tercihi varsayılan olarak zorunlu hale getirilmez.
- Başarısız gönderimde form verisi korunur; başarıdan önce form temizlenmez.

**Teslim:** Kayıt PR'ı, alan eşleştirme tablosu, form senaryoları ve test sonuçları.

## 6. Kişi 4 — Duyurular

**Amaç:** Ana sayfa ve duyuru listesini gerçek içerikle tutarlı çalıştırmak.

**Görevler**

1. `features/announcements` altında API tipleri, görünüm modeli ve fixture'lar oluştur. `lib/announcement.ts` dönüştürücüsünü bu sözleşmeyle uyumlu tut.
2. `announcement-list.tsx` üzerinde gerçek listeleme, arama, sayfalama, yüklenme ve yeniden deneme akışlarını tamamla.
3. Arama yazılırken gereksiz istekleri azalt; önceki isteği iptal et veya geç gelen cevabın yeni sonucu ezmesini engelle.
4. Arama değişince sayfayı sıfırla. Son sayfa, sonuçsuz arama ve tamamen boş listeyi ayrı kontrol et.
5. Backend'in varsayılan öncelik sırasını koru. Sadece öne çıkan içerik isteniyorsa bunu açık filtreyle yap; istemcide rastgele yeniden sıralama yapma.
6. `lib/server-api.ts` içindeki ana sayfa okumasını güncelle. Kişi 1'in adres yardımcısı hazır olana kadar mevcut `apiBase` kullanılabilir; son aşamada yeni yardımcıya geçir. Eski importları kırmamak için gerekirse geçici re-export koru.
7. Yeni `features/announcements/home-announcements.tsx` dosyasında props gerektirmeyen sunucu bileşeni `HomeAnnouncements` oluştur. Veriyi kendisi okusun; yüklenme/hata/boş durumuyla mevcut duyuru bölümü görünümünü taşısın.
8. `app/page.tsx` ve `sections.tsx` dosyalarını değiştirme. Yeni bileşenin yerleştirme talimatını Kişi 5'e ver: eski ana sayfa duyuru okuması ve `<Announcements items={items} />` yerine `<HomeAnnouncements />`.
9. Mevcut liste içeriğiyle çalışan detay penceresini koru. Ayrı slug sayfası bu teslim için zorunlu değildir.
10. Tarihleri İstanbul saatine göre göster; kesintide eski örnek duyuruları gerçek içerik gibi sunma.

**Bağımsız çalışma:** Sıfır kayıt, tek sayfa, çok sayfa, gecikmeli cevap, sunucu hatası ve sıralama fixture'larıyla geliştirir. Ana sayfaya yerleştirme beklenmeden bileşen testi yapılır.

**Kabul ölçütleri**

- Gerçek API kayıtları doğru sıra ve tarihle gösterilir.
- Arama/sayfalama birlikte çalışır; eski cevap yeni aramayı ezmez.
- Boş liste hata mesajı olarak gösterilmez.
- Backend kesintisinde kullanıcı yeniden deneyebilir ve örnek içerik yanıltıcı biçimde görünmez.
- Ana sayfa bileşeni Kişi 5 tarafından tek bir import ve bileşen yerleştirmesiyle kullanılabilir.

**Teslim:** Duyuru PR'ı, `HomeAnnouncements` bileşeni, entegrasyon notu ve test sonuçları.

## 7. Kişi 5 — İletişim ve sayfa içerikleri

**Amaç:** İletişim mesajını backend'e kaydetmek ve temel site metinlerini mevcut içerik API'sinden okumak.

**Görevler**

1. `contact-form.tsx` alanlarını `ContactMessageRequest` ile karşılaştır; `name`, `email`, `subject`, `message` değerlerini doğrula.
2. Alan hatalarını ilgili alanlarda göster; gönderim sırasında tekrar göndermeyi engelle.
3. Başarılı API yanıtında mesajı alındı olarak göster. Bu işlemin e-posta gönderildiği anlamına geldiğini iddia etme; mevcut endpoint mesajı kaydeder.
4. `features/site-content` altında `HOME`, `ABOUT`, `CONTACT` yanıtları ve public ayarlar için tipler, adaptörler ve fixture'lar oluştur.
5. Backend başlangıç verileri ve içerik anahtarlarını incele; hero başlığı, tanıtım metni, hakkımızda ve iletişim bilgisi için alan eşleştirme tablosu çıkar.
6. Var olmayan ayar anahtarlarını uydurma. Eksik içeriği Kişi 1'e veri ihtiyacı olarak bildir. İlk kapsamda statik kalacak takım/çalışma adımları gibi bölümleri tabloda açıkça belirt.
7. `sections.tsx`, `hero.tsx` ve `app/page.tsx` üzerinden içerikleri bağla. Mevcut tasarımın düzenini koru; API verisinden çalıştırılabilir HTML üretme.
8. İçerik yüklenemediğinde davranışı belirle: sabit kulüp kimliği korunabilir, dinamik bölüm için anlaşılır hata/eksik içerik durumu gösterilir. Eski içerik güncelmiş gibi sunulmaz.
9. Kişi 4'ün PR'ı birleşene kadar mevcut ana sayfa duyuru bağlantısını koru. Bileşen hazır olduğunda `HomeAnnouncements` entegrasyonunu yap ve gereksiz eski duyuru bölümünü temizle.
10. Backend görsellerinin gösterimi zorunlu hale gelirse medya erişim ihtiyacını ayrı iş olarak Kişi 1'e bildir. Bu pakette görsel yükleme veya yönetim paneli ekleme.

**Bağımsız çalışma:** İletişim formu ve içerik bölümleri ayrı fixture'larla çalışır. Duyuru bileşeninin son yerleştirmesi küçük bir birleştirme adımıdır; diğer geliştirmeleri engellemez.

**Kabul ölçütleri**

- Mesaj gerçekten veritabanına kaydolur; başarısız gönderimde form temizlenmez.
- Backend alan hataları kullanıcıya gösterilir.
- Eşleştirme tablosunda dinamik denilen alanlar gerçekten API'den gelir.
- Eksik içerik sayfanın tamamını çökertmez.
- Mobil görünüm, bölüm bağlantıları ve ana sayfa duyuruları korunur.

**Teslim:** İletişim/içerik PR'ı, alan eşleştirme tablosu, ana sayfa birleşimi ve test sonuçları.

## 8. Git, teslim ve birleştirme düzeni

Her kişi ayrı dal ve ayrı çalışma kopyası/worktree kullanır. Aynı klasörde dal değiştirerek ortak çalışma yapılmaz.

| Sorumlu | Önerilen dal |
|---|---|
| Kişi 1 | `integration/api-foundation` |
| Kişi 2 | `integration/session` |
| Kişi 3 | `integration/registration` |
| Kişi 4 | `integration/announcements` |
| Kişi 5 | `integration/contact-content` |

Her PR şunları içerir:

1. Değişen kullanıcı davranışı ve sorumlu olunan dosyalar.
2. Kullanılan endpointler ve örnek istek/yanıtlar; gerçek kişisel veri kullanılmaz.
3. Başarı, hata, boş sonuç ve kesinti doğrulamaları.
4. Çalıştırılan kontrol komutları ve sonuçları.
5. Ortak dosya sahibinden beklenen küçük entegrasyon değişiklikleri.

Ortak API alanı değişecekse kişi kendi dalında sessizce yeni bir sözleşme oluşturmaz. İhtiyacı Kişi 1'e iletir; sözleşme güncellemesi bütün ekibe bildirilir. Özellik sahibi kendi kabul ölçütlerini doğrular; test yükü yalnızca Kişi 1'e bırakılmaz.

## 9. Önerilen takvim ve bağımlılıklar

Süreler mevcut kodu tanıyan ekip için tahmindir; ekip deneyimi ve ortam sorunlarına göre değişir.

| Dönem | Paralel çalışma |
|---|---|
| Başlangıç, 1–2 saat | API sözleşmesi, dosya sahipliği, test yöntemi ve kapsam birlikte sabitlenir |
| 1. gün | Herkes kendi fixture, adaptör ve başarı akışını hazırlar; Kişi 1 ortam/altyapıyı tamamlar |
| 2. gün | Hata ve kesinti durumları, alan eşleştirmeleri, özellik testleri yapılır |
| 3. gün | Gerçek backend ile özellik doğrulamaları ve PR incelemeleri yapılır |
| 4. gün | Ortak dala birleştirme, uçtan uca akış ve mobil kontrol yapılır |

Birleştirme sırası:

1. Kişi 1'in altyapı PR'ı.
2. Kişi 2, 3 ve 4'ün PR'ları; birbirlerine göre zorunlu bir sıra yoktur.
3. Kişi 5'in içerik PR'ı ve Kişi 4'ün bileşeninin ana sayfaya yerleştirilmesi. İçerik PR'ı gerekirse daha önce, duyuru yerleştirmesi küçük ek PR ile alınabilir.
4. Kişi 2'nin eski ortak kayıt kodunu temizlemesi; yalnızca yeni kayıt sayfası birleştiğinde.
5. Kişi 1 koordinasyonunda bütün ekip tarafından son kabul doğrulaması.

## 10. Ortak bitiş ölçütleri

- [ ] Duyuruların kaynağı gerçek backend; arama, sayfalama ve boş sonuç çalışıyor.
- [ ] Başvuru seçenekleri ve metinleri backend'den geliyor.
- [ ] Yeni kayıt veritabanında `PENDING` başvuru oluşturuyor.
- [ ] Aynı kullanıcı giriş yapabiliyor, profilini görebiliyor ve çıkış yapabiliyor.
- [ ] Bekleyen başvuru ile onaylı üyelik birbirine karıştırılmıyor.
- [ ] Sayfa yenileme, süresi dolmuş oturum ve hatalı şifre doğru işleniyor.
- [ ] İletişim mesajı veritabanına kaydoluyor.
- [ ] Dinamik olarak belirlenen temel sayfa içerikleri backend'den geliyor.
- [ ] Backend kesintisinde form verisi korunuyor ve sahte başarı gösterilmiyor.
- [ ] Token tarayıcı depolamasında veya istemciye dönen JSON içinde bulunmuyor.
- [ ] Frontend `npm run typecheck` ve `npm run build` kontrolleri geçiyor.
- [ ] Backend klasöründe `./mvnw.cmd test` geçiyor; gerçek PostgreSQL üzerinde temel akışlar ayrıca doğrulanıyor.
- [ ] Ortak akış temiz test verisiyle ve mobil görünümde doğrulanıyor.

Bu liste tamamlandığında ilk entegrasyon teslimi hazır kabul edilir. Yönetim paneli, medya yükleme ve profil düzenleme için sonraki iş planı ayrıca açılır.
