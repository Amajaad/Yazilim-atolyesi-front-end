import { notFound } from "next/navigation";
import Link from "next/link";
import { getAnnouncementBySlug, ApiAnnouncement } from "@/lib/announcement";
import { filterVisibleItems } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let announcement: ApiAnnouncement | null = null;
  let hasError = false;

  try {
    announcement = await getAnnouncementBySlug(slug);
  } catch (error) {
    // API/Network failure - flag for clear error UI
    hasError = true;
  }

  // 1. If API returned explicit 404 or missing item -> trigger Next.js 404 page
  if (!announcement && !hasError) {
    notFound();
  }

  // 2. Hide hidden/inactive content if required by filterVisibleItems
  if (announcement) {
    const visible = filterVisibleItems([announcement]);
    if (visible.length === 0) {
      notFound();
    }
  }

  // 3. Render clear error message for unexpected API failure
  if (hasError) {
    return (
      <main className="container py-8">
        <div className="error-card p-6 border rounded-md text-center">
          <h1 className="text-xl font-semibold mb-2">Duyuru Yüklenemedi</h1>
          <p className="text-muted-foreground mb-4">
            Bağlantı hatası veya sunucu kaynaklı bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
          <Link href="/announcements" className="text-button">
            ← Tüm duyurulara dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <article className="container py-8 max-w-3xl">
      <Link href="/announcements" className="text-sm mb-4 inline-block hover:underline">
        ← Duyurulara Dön
      </Link>
      <h1 className="text-3xl font-bold mb-4">{announcement?.title}</h1>
      <div className="prose max-w-none">{announcement?.content}</div>
    </article>
  );
}