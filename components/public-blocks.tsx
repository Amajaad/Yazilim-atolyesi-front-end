import type { ContentRecord } from "../lib/admin-types";
import { mediaUrl, safeLink } from "../lib/media";

export function PublicBlocks({ blocks }: { blocks: ContentRecord[] }) {
  return <>{blocks.map(block => <article className="managed-block" key={block.id}>
    {mediaUrl(block.imageUrl) && <img src={mediaUrl(block.imageUrl)} alt={block.imageAltText || ""} loading="lazy" />}
    {block.title && <h3>{block.title}</h3>}
    {block.subtitle && <p className="managed-subtitle">{block.subtitle}</p>}
    {block.body && <p className="managed-body">{block.body}</p>}
    {safeLink(block.linkUrl) && <a className="club-button button-outline" href={safeLink(block.linkUrl)}>{block.linkLabel || "Devamını oku"}</a>}
  </article>)}</>;
}
