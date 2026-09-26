# Ekip görevleri — frontend önizlemesi

Yönetici hesabıyla `/yonetim#ekip-gorevleri` adresini aç veya menüden **Ekip görevleri** seç.

1. Frontend veya Backend ekibini seç.
2. **Ekip üyeleri** üzerinden isim ekle. Bu isimler gerçek kullanıcı hesabı veya davet oluşturmaz.
3. **Görev oluştur** ile başlık, açıklama/tamamlanma ölçütü, sorumlu ve isteğe bağlı hedef tarih gir.
4. Henüz planlanmamış işleri **Backlog**'da tut. Haftaya seçtiğin işleri **Yapılacak**, başlayanları **Devam ediyor**, bitenleri **Tamamlandı** yap.
5. Kartı açıp çalışma notuna ilerleme veya takıldığın noktayı yaz.
6. **Görünüm** listesinden bir üye seçerek o ekibin üye deneyimini dene. Önizlemede üye yalnızca kendine atanan görevin durumunu/notunu değiştirebilir.

Frontend ve Backend kayıtları ayrı tutulur; görev sadece kendi ekibindeki bir isme atanabilir. Üye kaldırıldığında görevler silinmez, atanmamış olur. Görev silme onay ister. Arama ve sorumlu filtresi vardır.

## Agile kullanım

Hafta başında backlog'dan küçük işler seç, her karta tek sorumlu ve kontrol edilebilir bir tamamlanma ölçütü yaz. Her gün durumu/notu güncelle. Hafta sonunda tamamlananları birlikte kontrol et. Sürükle-bırak, sprint modülü veya ayrıntılı rapor zorunlu değildir.

## Bu sürümün sınırı

Kullanıcının isteğiyle backend koduna, şemasına, endpointlerine ve gerçek rollerine dokunulmadı. Yeni “Ekip üyesi” backend rolü YOK; arayüzdeki görünüm yalnızca önizlemedir. Bölüm mevcut ADMIN panelinde bulunur.

Veriler bu tarayıcıda, giriş yapan yöneticiye ait `club-team-board:v1:<userId>` anahtarıyla localStorage'da saklanır. Başka hesaplara, cihazlara veya ekibe otomatik paylaşılmaz. Tarayıcı verileri silinirse kayıtlar kaybolur; **Kayıtları indir** bütün yerel panoyu JSON olarak indirir. JSON içe aktarma bu sürümde yoktur.

Ekiplerin kendi gerçek hesaplarıyla ortak çalışabilmesi için daha sonra backend tarafında ekip üyeliği, görev kayıtları, yetkilendirme ve API bağlantısı gerekir. Bu önizleme gerçek ekip erişim güvenliği sağlamaz. Mevcut site yönetimi rol ve erişim akışları değiştirilmedi.

## Doğrulama

`npm run typecheck`, `npm run build` ve `npx playwright test tests/e2e/team-board.spec.ts`.
Testler mevcut yönetici girişiyle panele erişir; görev/üye verileri izole test tarayıcısında kalır. Backend'e ekip/görev yazılmaz; backend durdurulmaz. Testler ekip ayrımı, atama, üye önizlemesi, kalıcılık, silme, depolama hatası, form koruması ve mobil görünümü kapsar.
