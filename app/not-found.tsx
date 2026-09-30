import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container py-16 text-center">
      <h1 className="text-4xl font-bold mb-2">404 - Sayfa Bulunamadı</h1>
      <p className="text-muted-foreground mb-6">
        Aradığınız duyuru kaldırılmış, adı değiştirilmiş veya hiç var olmamış olabilir.
      </p>
      <Link href="/duyurular" className="button-primary">
        Duyurular Sayfasına Dön
      </Link>
    </main>
  );
}