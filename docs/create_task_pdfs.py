from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import fitz

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "kisi-gorevleri"
OUT.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("ArialBold", "C:/Windows/Fonts/arialbd.ttf"))
ACCENT = colors.HexColor("#932264")
INK = colors.HexColor("#263044")
styles = {
    "body": ParagraphStyle("body", fontName="Arial", fontSize=9.4, leading=13.4, textColor=INK, spaceAfter=5),
    "small": ParagraphStyle("small", fontName="Arial", fontSize=8.2, leading=11.3, textColor=INK),
    "section": ParagraphStyle("section", fontName="ArialBold", fontSize=11, leading=14, textColor=ACCENT, spaceBefore=10, spaceAfter=6),
    "title": ParagraphStyle("title", fontName="ArialBold", fontSize=19, leading=23, textColor=INK, spaceAfter=8),
}

tasks = [
    dict(n=1, file="Kisi-1-Ziyaretci-Sayfalari.pdf", title="Ziyaretçi sayfaları", aim="Duyuruları ve panelden yönetilen içerikleri sitede düzgün göstermek.",
         jobs=["Duyuru listesine arama, kategori filtresi ve sayfalama ekle veya mevcut akışı iyileştir. Filtreleri URL’de koru.",
               "Duyuru detayında yükleme, bulunamadı ve bağlantı hatası durumlarını anlaşılır göster.",
               "Takımlar, çalışma adımları ve kuralları mevcut HOME/CUSTOM içeriklerinden göster. 2. kişiyle team-*, workflow-* ve rule-* anahtarlarında anlaş.",
               "Gizlenen içerikleri gösterme. Ana sayfa, hakkımızda ve iletişim alanlarını mobilde kontrol et."],
         endpoints=[("GET /announcements", "Liste: q, category, page, size"),
                    ("GET /announcements/{slug}", "Duyuru detayı"),
                    ("GET /pages/HOME, /pages/ABOUT, /pages/CONTACT", "Sayfa içerikleri"),
                    ("GET /settings/public", "İletişim ve sosyal bağlantılar"),
                    ("GET /media/images/{id}", "Görsel gösterme")],
         learn="React bileşenleri, Server/Client Component farkı, API verisi, URL parametreleri ve responsive CSS.",
         tips=["Önce mevcut bileşenleri kullan; yeni tasarıma sıfırdan başlama.", "Boş liste ile sunucu hatasını ayır; gizlenen içeriğin yerine eski sabit metni getirme.", "2. kişiyle ilk gün veri alanlarını netleştir; 390 px genişlikte kontrol yap."],
         days="1. gün veri akışı • 2. gün duyurular • 3. gün dinamik bölümler • 4. gün mobil/entegrasyon • 5. gün test ve düzeltme",
         done="Panelde değiştirilen içerik sayfa yenilendiğinde görünür; filtreler korunur ve mobilde yatay taşma olmaz."),
    dict(n=2, file="Kisi-2-Icerik-Yonetimi.pdf", title="İçerik yönetimi", aim="Duyuru, sayfa içeriği ve ayar formlarını daha kolay kullanılabilir hale getirmek.",
         jobs=["Duyuru formunu metin, yayın durumu ve görsel gruplarına ayır. Sabitleme ve öne çıkarma işlemlerini kolaylaştır.",
               "Takım, çalışma adımı ve kural için basit form hazırla. Mevcut HOME/CUSTOM alanlarını kullan; teknik anahtarı form otomatik üretsin.",
               "Sıra numarası ve aktif/pasif kontrolü ekle. İlk deneme içeriklerini panelden girip 1. kişiyle sitede doğrula.",
               "Görsel yüklemeye önizleme ve alternatif metin ekle. Site ayarlarını anlaşılır etiketlerle göster; form hatasında yazılanları koru."],
         endpoints=[("GET/POST /admin/announcements", "Liste / oluşturma"),
                    ("GET/PUT/DELETE /admin/announcements/{id}", "Detay / düzenleme / silme"),
                    ("PATCH /admin/announcements/{id}/priority", "Sıra, pinned, featured"),
                    ("GET/POST /admin/contents", "İçerik listesi / oluşturma"),
                    ("GET/PUT/DELETE /admin/contents/{id}", "İçerik detay / düzenleme / silme"),
                    ("PATCH /admin/contents/{id}/priority", "Sıra ve active alanı"),
                    ("GET/POST /admin/settings; PUT /admin/settings/{id}", "Ayarları listele / ekle / düzenle"),
                    ("POST /admin/media/images", "FormData: file, purpose, altText")],
         learn="Controlled form, TypeScript tipleri, CRUD, PUT/PATCH farkı, doğrulama ve FormData.",
         tips=["Sürükle-bırak yerine sıra numarası kullan; formları küçük tut.", "Görsel listesi endpoint’i yok: medya kütüphanesi yapma, yükleme/önizlemeyle sınırlı kal.", "Kaydetme sürerken düğmeyi kilitle; 4. kişinin ortak hata ve modal bileşenlerini kullan."],
         days="1. gün alanlar • 2. gün duyurular • 3. gün içerik/görsel • 4. gün ayarlar/entegrasyon • 5. gün test",
         done="İçerik oluşturma ve düzenleme gerçek API’de çalışır; görünürlük/sıra sitede doğru yansır; hatada form metni kaybolmaz."),
    dict(n=3, file="Kisi-3-Uye-ve-Mesaj-Yonetimi.pdf", title="Üye ve mesaj yönetimi", aim="Başvuru inceleme, kullanıcı işlemleri ve mesaj takibini kolaylaştırmak.",
         jobs=["Başvurulara arama, durum, kurum ve bölüm filtreleri ekle. Detayı kişisel bilgiler, eğitim ve motivasyon olarak gruplandır.",
               "Onay/red ve değerlendirme notunu kolaylaştır. İşlem başarılıysa listeyi yenile; başarısızsa notu koru.",
               "Kullanıcı rolü/durumu değişikliğinde onay göster. Mesajlarda durum filtresi, detay ve silme onayını iyileştir.",
               "Genel bakışta mevcut listelerden bekleyen başvuru ve yeni mesaj sayılarını göster. Veri gelmezse sıfır yerine hata göster."],
         endpoints=[("GET /admin/members", "q, membershipStatus, institution, department"),
                    ("GET /admin/members/{userId}", "Başvuru detayı"),
                    ("PATCH /admin/members/{userId}/review", "status ve reviewNote"),
                    ("GET /admin/users", "q, role, status ile kullanıcılar"),
                    ("PATCH /admin/users/{id}/roles veya /status", "Rol / durum güncelleme"),
                    ("GET /admin/contact-messages", "q, status ile mesajlar"),
                    ("GET/DELETE /admin/contact-messages/{id}", "Detay / silme"),
                    ("PATCH /admin/contact-messages/{id}/status", "Mesaj durumu"),
                    ("GET /users/me", "Mevcut kullanıcı ve roller")],
         learn="Sayfalı tablolar, filtre state’i, rol bazlı arayüz, modal, işlem onayı ve API hata yönetimi.",
         tips=["Üye/kullanıcı alanları ADMIN içindir; EDITOR için bu isteklere çıkma.", "REPLIED yalnızca durum işaretidir; e-posta gönderildi mesajı gösterme.", "Toplamı totalElements alanından al; sadece görünen satırları sayma. Gelişmiş grafik ekleme."],
         days="1. gün filtre/roller • 2. gün başvurular • 3. gün kullanıcı/mesaj • 4. gün genel bakış • 5. gün test",
         done="İşlemler doğru kaydı günceller; filtre/sayfalama tutarlıdır; yetkisiz alanlar gösterilmez ve hata notu silmez."),
    dict(n=4, file="Kisi-4-Ortak-Altyapi-ve-Test.pdf", title="Ortak altyapı ve test", aim="Ortak frontend davranışlarını hazırlamak ve ekip çalışmalarını birlikte doğrulamak.",
         jobs=["Ortak arama yardımcısına yaklaşık 300 ms debounce ekle. Eski isteğin yeni sonucu değiştirmesini engelle.",
               "Alan hatası, işlem bildirimi ve kaydedilmemiş değişiklik uyarısını ortaklaştır. Modal klavye kullanımını kontrol et.",
               "Oturum bitmesi ile yetki eksikliğini ayrı göster. Ekip bileşenlerini dashboard’a bağla; gerekiyorsa mevcut endpoint yolunu frontend proxy’sine ekle.",
               "Playwright ile içerik kaydet/göster, başvuru incele ve mesaj durumunu test et. Tip kontrolü ve build çalıştır; kısa sonuç notu hazırla."],
         endpoints=[("POST /auth/login", "Giriş akışı"),
                    ("GET /users/me", "Oturum ve rol kontrolü"),
                    ("PATCH /users/me/password", "Mevcut şifre değiştirme akışı"),
                    ("POST /api/club/auth/logout", "Frontend yolu: oturum cookie’sini temizler"),
                    ("Diğer 3 kişinin endpointleri", "Entegrasyon ve test")],
         learn="Custom hook, debounce, AbortController, HTTP durumları, cookie/proxy ve Playwright.",
         tips=["Ortak yardımcıların kullanımını ilk gün ekibe ver; her şeyi son güne bırakma.", "Hata senaryolarında ağ yanıtını taklit et; günlük kullanılan backend’i durdurma.", "Gerçek API testini test verisi/ortamında yap; mock testini gerçek E2E diye raporlama.", "Her kişi kendi ekranını kontrol etsin; sen ortak akışlara odaklan. Yeni test altyapısını gereksiz büyütme."],
         days="1. gün ortak yapı • 2. gün yardımcılar • 3. gün modal/oturum • 4. gün entegrasyon • 5. gün test/teslim",
         done="Tip kontrolü ve build geçer; kritik akışlar doğrulanır; hatada form verisi korunur; testler günlük ortamı etkilemez."),
]

def p(text, style="body"):
    return Paragraph(escape(text), styles[style])

def header(canvas, doc):
    canvas.saveState()
    canvas.drawImage(ImageReader(str(ROOT / "Logo.png")), 43, 749, width=64, height=64, mask="auto")
    canvas.setFont("ArialBold", 11)
    canvas.setFillColor(ACCENT)
    canvas.drawString(122, 790, "YAZILIM ATÖLYESİ")
    canvas.setFont("Arial", 9)
    canvas.setFillColor(INK)
    canvas.drawString(122, 773, "Bir haftalık frontend çalışma kartı")
    canvas.setStrokeColor(colors.HexColor("#E5D4DE"))
    canvas.line(43, 739, 552, 739)
    canvas.line(43, 39, 552, 39)
    canvas.setFont("Arial", 8)
    canvas.drawString(43, 25, "Backend sabit • Mevcut endpointler • Orta seviye • 5 iş günü / yaklaşık 30 saat")
    canvas.restoreState()

for task in tasks:
    path = OUT / task["file"]
    doc = SimpleDocTemplate(str(path), pagesize=(595.28, 841.89), rightMargin=43, leftMargin=43,
                            topMargin=116, bottomMargin=49, title=f"Kişi {task['n']} — {task['title']}", author="Yazılım Atölyesi")
    story = [p(f"Kişi {task['n']} / {task['title']}", "title"), p(task["aim"])]
    story.append(p("Yapılacak işler", "section"))
    story += [p(f"{i}. {job}") for i, job in enumerate(task["jobs"], 1)]
    story.append(p("Kullanılacak endpointler", "section"))
    story.append(p("Backend yollarının başına /api/v1 gelir. Tarayıcıda mevcut /api/club proxy’sini kullan.", "small"))
    story.append(Spacer(1, 5))
    rows = [[p(a, "small"), p(b, "small")] for a, b in task["endpoints"]]
    table = Table(rows, colWidths=[310, 199])
    table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                               ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#F7F1F5"), colors.white]),
                               ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                               ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    story.append(table)
    story += [p("Bilmen gerekenler", "section"), p(task["learn"]), p("Çalışırken tavsiyeler", "section")]
    story += [p("• " + tip) for tip in task["tips"]]
    story += [p("Haftalık akış ve teslim", "section"), p(task["days"], "small"), Spacer(1, 5), p(task["done"])]
    doc.build(story, onFirstPage=header, onLaterPages=header)
    with fitz.open(path) as pdf:
        assert len(pdf) == 1, f"{path.name}: {len(pdf)} sayfa"
        assert "Kişi" in pdf[0].get_text(), "Türkçe metin kontrolü başarısız"
        assert pdf[0].get_images(), "Logo bulunamadı"
        pdf[0].get_pixmap(matrix=fitz.Matrix(1, 1)).save(str(OUT / f"preview-{task['n']}.png"))
    print(f"OK: {path.name} — 1 sayfa, logo ve Türkçe metin doğrulandı")
