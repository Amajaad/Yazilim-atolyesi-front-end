# Frontend–Backend Entegrasyon Planı

Tarih: 24 Eylül 2026

Güncelleme (26 Eylül 2026): Temel bağlantı uygulandı. Güncel çalıştırma ve gerçek uçtan uca test adımları [LOCAL-INTEGRATION.md](LOCAL-INTEGRATION.md) dosyasındadır. Aşağıdaki metin ilk planı ve ikinci kapsam işlerini korur; eski “başlatılmadı” ifadeleri 24 Eylül incelemesini anlatır.

## 1. Mevcut durum

- Frontend: `frontend`, Next.js.
- Backend: `yazilim_atolyesi_websitesi`, Java 21 ve Spring Boot.
- Veritabanı: PostgreSQL; Docker Compose ve Flyway geçişleri mevcut.
- Backend API kökü: `http://localhost:8080/api/v1`.
- Frontend'de duyuru, üyelik, giriş ve iletişim için API çağrıları yazılmış; uçtan uca çalışmaları bu incelemede doğrulanmadı.
- `frontend/lib/server-api.ts`, `CLUB_API_URL` tanımlı değilse yukarıdaki yerel backend adresini kullanıyor. Backend başlatıldığında mevcut ekranlar otomatik olarak gerçek veri istemeye başlayabilir.

İlgili dosyalar:

- `frontend/lib/api.ts`: tarayıcı istekleri ve hata işleme.
- `frontend/lib/server-api.ts`: backend adresi ve ana sayfa duyuruları.
- `frontend/app/api/club/[...path]/route.ts`: aracı API, oturum çerezi ve izin verilen yollar.
- `frontend/components/auth-form.tsx`: kayıt, giriş ve çıkış.
- `frontend/components/contact-form.tsx`: iletişim formu.
- `frontend/components/announcement-list.tsx`: duyuru arama ve sayfalama.
- `yazilim_atolyesi_websitesi/docs/API.md`: backend endpoint ve veri sözleşmeleri.

## 2. Hedef bağlantı yapısı

```text
Tarayıcı → Next.js /api/club/* → Spring Boot /api/v1/* → PostgreSQL
```

Mevcut aracı API korunacak. Ana sayfa duyuruları Next.js sunucusundan doğrudan backend'e okunmaya devam edebilir. Tarayıcının kullandığı yollar aynı origin altında kalacak; backend adresi sunucu tarafındaki `CLUB_API_URL` üzerinden yönetilecek.

Kimlik doğrulama ve yetkilendirmede backend esas alınacak. Mevcut JWT'nin `HttpOnly` çerezde tutulması yaklaşımı korunacak; token tarayıcı depolamasına taşınmayacak.

## 3. Uygulama sırası

### Aşama 1 — Çalışma ortamı

1. Java 21, Docker ve gerekli portların uygunluğunu kontrol et.
2. Backend klasöründeki Docker Compose ile PostgreSQL'i başlat.
3. Windows üzerinde Maven Wrapper ile backend'i çalıştır: `./mvnw.cmd spring-boot:run`.
4. Flyway geçişlerinin tamamlandığını ve `/actuator/health` yanıtını doğrula.
5. Frontend ortamında `CLUB_API_URL=http://localhost:8080/api/v1` değerini açıkça tanımla ve frontend'i yeniden başlat.

Bu komutlar plan hazırlanırken çalıştırılmadı. Compose dosyası PostgreSQL'i başlatır; backend ayrıca çalıştırılır.

### Aşama 2 — Veri sözleşmeleri ve temel ekranlar

Aşağıdaki endpointler backend'in `/api/v1` köküne göredir.

| Ekran / işlem | Endpoint | Yapılacak doğrulama |
|---|---|---|
| Ana sayfa ve duyurular | `GET /announcements` | Alan eşleştirmesi, sıralama, arama, sayfalama ve tarihler |
| Üyelik seçenekleri | `GET /membership/options` | İlgi alanı UUID'leri ve enum değerleri |
| Başvuru metinleri | `GET /settings/public?prefix=legal.` | Gösterilen metin ile gönderilen sürümün eşleşmesi |
| Üyelik başvurusu | `POST /auth/register` | İç içe form alanları, doğrulama hataları ve `PENDING` sonucu |
| Giriş | `POST /auth/login` | Başarılı giriş, token ve çerez oluşturulması |
| Oturum / profil | `GET /users/me` | Sayfa yenilemede oturumun korunması ve profil alanları |
| İletişim | `POST /contact/messages` | Başarılı kayıt ve alan hataları |

Frontend TypeScript tipleri backend DTO'larıyla karşılaştırılacak. Özellikle isteğe bağlı alanlar, `null` değerler, sayfalı yanıtlar ve iç içe alan hata adları kontrol edilecek.

### Aşama 3 — Oturum deneyimi

1. Üst menüyü oturum durumuna göre kullanıcı bilgisi ve çıkış gösterecek şekilde düzenle.
2. Süresi dolan oturumlarda yeniden giriş akışını tamamla.
3. `401` ile `403` yanıtlarını ayrı ele al; yetki eksikliğini bağlantı hatası olarak gösterme.
4. Üyelik başvuru durumuyla kullanıcı rolünü ayrı tut. Başvuru sonrası giriş mümkündür; `MEMBER` rolü yönetici onayında verilir.
5. Mevcut `/api/club/auth/logout` işleminin yalnızca frontend çerezini sildiğini dikkate al. Backend'de token iptali gerekip gerekmediğini ayrıca kararlaştır.
6. Canlı ortamda HTTPS, güvenli çerez ve POST origin kontrolünün dağıtım yapısıyla uyumunu doğrula.

### Aşama 4 — Hata ve kesinti davranışları

- Gerçek boş duyuru listesiyle backend bağlantı hatasını ayır.
- Mevcut örnek duyuru yedeğinin canlı ortamda kullanılıp kullanılmayacağını netleştir. Ana sayfa şu anda yedeğe geçiş bilgisini kullanıcıya göstermiyor.
- Form gönderimi başarısız olduğunda girilen bilgileri koru; başarı mesajını yalnızca başarılı API yanıtında göster.
- `400`, `401`, `403`, `409`, `429` ve servis kesintisi yanıtlarını uygun mesajlarla işle.
- `Retry-After` bilgisini kullanıcı deneyimine yansıt; hata takibi için `X-Request-Id` aktarımını tamamla.
- Canlı ortamda aracı sunucunun backend rate limit anahtarlarına etkisini doğrula; bütün kullanıcıların tek IP altında sınırlanması riskini değerlendir.

### Aşama 5 — İkinci kapsam: içerikler ve medya

1. Hakkımızda, ana sayfa blokları ve iletişim bilgilerini `/pages/{page}` ve `/settings/public` üzerinden eşleştir.
2. Backend'in döndürdüğü göreli görsel adresleri için medya yönlendirmesi veya uygun erişilebilir adres dönüşümü ekle.
3. Mevcut JSON aracı katmanına görselleri doğrudan göndermeden önce binary yanıt ve gerekiyorsa multipart yükleme desteğini ayrı tasarla.
4. Profil düzenleme ve yönetim panelini ayrı iş paketi olarak ele al.

Mevcut aracı katman yalnızca belirli `GET` ve `POST` yollarına izin veriyor; sayfa içerikleri, medya, profil güncellemeleri ve yönetim endpointleri için kontrollü genişletme gerekiyor. Yetkili işlemlerde token aktarımı yalnızca mevcut `users/me` yoluyla sınırlı kalmamalı; backend rol kontrolleri korunmalı.

## 4. Doğrulama ve kabul ölçütleri

- PostgreSQL ve backend sağlıklı çalışıyor; şema geçişleri tamamlanıyor.
- Duyurular gerçek API verisiyle listeleniyor; arama, sayfalama ve boş sonuç doğru gösteriliyor.
- Üyelik seçenekleri ve başvuru metinleri backend'den geliyor.
- Kayıt başvurusu veritabanına yazılıyor ve kullanıcıya onay beklediği bildiriliyor.
- Kayıt → giriş → profil → sayfa yenileme → çıkış akışı çalışıyor.
- Yanlış şifre, tekrar kullanılan e-posta ve eski başvuru metni sürümü anlaşılır hatalar üretiyor.
- Süresi dolmuş oturum ve yetkisiz erişim doğru yönetiliyor.
- İletişim mesajının veritabanına kaydedildiği doğrulanıyor.
- Backend kesintisinde formlar veri kaybetmiyor ve sahte başarı göstermiyor.
- Mevcut backend testleri ile frontend tip kontrolü ve derlemesi geçiyor; temel akışlar tarayıcıdan doğrulanıyor.

## 5. Öncelik ve kapsam sınırı

İlk teslim kapsamı: duyurular, üyelik başvurusu, giriş/çıkış, mevcut profil gösterimi ve iletişim formu.

İkinci teslim kapsamı: dinamik sayfa içerikleri, görseller, profil düzenleme ve yönetim paneli.

Uygulamaya geçiş ayrıca istendiğinde bu plan sırayla yürütülecek. Bu belge bağlantıyı kendiliğinden etkinleştirmez.
