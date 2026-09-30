"use client";
import { filterVisibleItems } from "../lib/content";
import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { request } from "../lib/api";
import type { Announcement } from "../lib/content";
import { mapAnnouncement, type ApiAnnouncement } from "../lib/announcement";
import { Icon } from "./icon";
import { Dialog } from "./dialog";
import { mediaUrl } from "../lib/media";

const CATEGORIES = ["Tümü", "Genel", "Etkinlik", "Proje", "Eğitim"];

export function AnnouncementList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read state directly from URL query parameters
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const pageParam = Number(searchParams.get("page") || "0");

  // Local state for instant input responsiveness
  const [searchInput, setSearchInput] = useState(queryParam);
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [retry, setRetry] = useState(0);

  // Synchronize local search input if URL changes externally
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Helper function to update search params in the URL
const updateParams = (updates: Record<string, string | null>) => {
  // 1. Merge existing searchParams with new updates
  const currentQ = updates.q !== undefined ? updates.q : searchParams.get("q");
  const currentCategory = updates.category !== undefined ? updates.category : searchParams.get("category");
  const currentPage = updates.page !== undefined ? updates.page : searchParams.get("page");

  // 2. Build new URLSearchParams in a clean, consistent order
  const params = new URLSearchParams();

  if (currentQ) params.set("q", currentQ);
  if (currentCategory && currentCategory !== "Tümü") params.set("category", currentCategory);
  if (currentPage && currentPage !== "0") params.set("page", currentPage);

  startTransition(() => {
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  });
};

  // Debounce user typing into the search input before updating URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== queryParam) {
        updateParams({ q: searchInput || null, page: "0" });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch data when URL parameters or retry triggers change
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const categoryQuery =
      categoryParam && categoryParam !== "Tümü"
        ? `&category=${encodeURIComponent(categoryParam)}`
        : "";

    request<{ content: ApiAnnouncement[]; totalPages: number }>(
      `announcements?page=${pageParam}&size=9&q=${encodeURIComponent(queryParam)}${categoryQuery}`,
      { signal: controller.signal },
    )
      .then((data) => {
        const visible = filterVisibleItems<ApiAnnouncement>(
          data.content as any,
        );
        setItems(visible.map(mapAnnouncement));
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Duyurular yüklenirken bir hata oluştu.");
          setItems([]);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [pageParam, queryParam, categoryParam, retry]);

  return (
    <>
      <div className="list-tools mb-5 d-flex">
        {/* Search Field */}
        <div className="">
          {" "}
          <p>Duyurularda ara</p>
          <label htmlFor="announcement-search">
            <input
              id="announcement-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Başlık veya konu"
            />
          </label>
        </div>

        <div className="category-filter">
          <label htmlFor="announcement-category">Kategori</label>

          <select
            id="announcement-category"
            value={categoryParam || "Tümü"}
            onChange={(e) =>
              updateParams({
                category: e.target.value === "Tümü" ? null : e.target.value,
                page: "0",
              })
            }
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Retry Button on Error */}
        {error && (
          <button
            type="button"
            className="club-button button-outline"
            onClick={() => {
              updateParams({ page: "0" });
              setRetry((x) => x + 1);
            }}
          >
            Tekrar dene
          </button>
        )}
      </div>

      {error && (
        <p className="content-note" role="status">
          {error}
        </p>
      )}

      {loading ? (
        <p className="form-loading" role="status">
          Duyurular yükleniyor…
        </p>
      ) : error ? null : items.length ? (
        <div className="announcement-grid">
          {items.map((item) => {
            const detailHref = item.slug
              ? `/duyurular/${item.slug}`
              : `/duyurular/${item.id}`;

            return (
              <article className="announcement-card" key={item.id}>
                {mediaUrl(item.coverImageUrl) && (
                  <img
                    className="announcement-cover"
                    src={mediaUrl(item.coverImageUrl)}
                    alt={item.coverImageAltText || item.title}
                    loading="lazy"
                  />
                )}
                <div className="announcement-main">
                  <div className="announcement-date">
                    <strong>{item.day}</strong>
                    <span>{item.month}</span>
                  </div>
                  <div>
                    <h3>
                      <Link href={detailHref} className="card-title-link">
                        {item.title}
                      </Link>
                    </h3>
                    <p>{item.summary}</p>
                  </div>
                </div>
                <div className="announcement-meta">
                  <span>
                    <Icon name="calendar" />
                    {item.dateLabel}
                  </span>
                  <span className="category-label">{item.category}</span>
                </div>
                <div className="announcement-actions flex gap-2 mt-2">
                  <Link
                    href={detailHref}
                    className="club-button button-outline"
                  >
                    Detay Sayfası
                  </Link>
                  {item.content && (
                    <Dialog label="Hızlı Bakış" title={item.title}>
                      <p className="announcement-content">{item.content}</p>
                    </Dialog>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-state" role="status">
          {queryParam || categoryParam
            ? "Aramana veya filtrene uygun duyuru bulunamadı."
            : "Henüz yayınlanmış duyuru bulunmuyor."}
          {(queryParam || categoryParam) && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setSearchInput("");
                updateParams({ q: null, category: null, page: "0" });
              }}
            >
              Filtreleri temizle
            </button>
          )}
        </p>
      )}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Duyuru sayfaları">
          <button
            type="button"
            className="club-button button-outline"
            disabled={pageParam === 0 || loading}
            aria-label="Önceki sayfa"
            onClick={() => updateParams({ page: String(pageParam - 1) })}
          >
            Önceki
          </button>
          <span>
            {pageParam + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="club-button button-outline"
            disabled={pageParam >= totalPages - 1 || loading}
            aria-label="Sonraki sayfa"
            onClick={() => updateParams({ page: String(pageParam + 1) })}
          >
            Sonraki
          </button>
        </nav>
      )}
    </>
  );
}