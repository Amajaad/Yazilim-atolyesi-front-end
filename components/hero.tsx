import { club } from "../lib/content";
import type { ContentRecord } from "../lib/admin-types";
import { mediaUrl, safeLink } from "../lib/media";
export function Hero({ block }: { block?: ContentRecord }) {
  return (
    <section id="anasayfa" className="club-hero">
      <div className="hero-copy">
        <p className="university-label">{club.university}</p>
        <h1>
          {block ? block.title : <>Birlikte üretiyor,
          <br />
          öğreniyor, <span>geliştiriyoruz.</span></>}
        </h1>
        {block?.subtitle && <p className="hero-description">{block.subtitle}</p>}
        <p className="hero-description">{block ? block.body : club.intro}</p>
        <div className="hero-actions">
          <a href={safeLink(block?.linkUrl) || "/uye-kaydi"} className="club-button">
            {block?.linkLabel || "Kulübe Katıl"}
          </a>
          <a href="#duyurular" className="club-button button-outline">
            Etkinlikleri Keşfet
          </a>
        </div>
      </div>
      <img
        className="hero-logo"
        src={mediaUrl(block?.imageUrl) || "/club-logo.png"}
        alt={block?.imageAltText || "İstanbul Gedik Üniversitesi Yazılım Atölyesi Kulübü logosu"}
        width="502"
        height="497"
        fetchPriority="high"
      />
    </section>
  );
}
