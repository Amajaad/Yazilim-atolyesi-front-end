# PDF-based frontend implementation

## Sources and route mapping

The approved source is `../yazılım atolyesi tasarımı.pdf` (one 1300 × 2000 page). The second copy, `yazılım atolyesi tasarımı .pdf`, also has one page and the same layout, typography and colors; embedded image recompression accounts for tiny pixel differences. Both were rasterized and inspected in full with PyMuPDF. Text, shape bounding boxes, image placement and fill colors were extracted for comparison. Fonts are embedded as unnamed Type3 glyphs, so an exact named web font cannot be recovered. Arial/Helvetica is the closest available local fallback used here; no unrelated display font is introduced.

| PDF area | Implementation |
| --- | --- |
| Full homepage | `/`, existing Header, Hero, Pillars, Announcements, About, Team, Workflow and Footer components |
| Registration CTAs | Existing `/uye-kaydi`, styled with the same panels, controls, colors and typography |
| Login CTA | Existing `/giris-yap`, same visual system |
| All announcements link | `/duyurular`, existing announcement API, details and pagination when available |
| About details | Native dialog opened from the PDF's “Devamını Oku” button |
| Contact | Footer anchor and dialog, reusing the existing contact intent and fields, plus subject required by the existing API |
| Team cards | Existing registration route with the selected interest, resolved against the API's actual interest IDs |

Old `hero-tasarimlari` and `public/design-explorations` pages are unapproved archives. They are not imported or linked by the production UI and were not used as design inputs.

## Visual implementation

- The homepage keeps the PDF's desktop hierarchy and proportions, rather than promoting every section into a large independent block.
- Following user review, sizing is optimized for 100% browser zoom: a 100px desktop header, 350px hero, smaller section headings and reduced section gaps. The palette and section arrangement remain.
- Background `#03051a`, main panels `#11153d`, deeper panels `#0c0f2f`, borders `#252050`, accent `#cf3da6`. Magenta gradients are limited to the buttons/CTA treatment present in the PDF.
- The hero displays the original `public/club-logo.png` directly, up to 310px square on desktop, without stretching or decorative effects, as requested.
- The user-supplied root `Logo.png` (945 × 945) is copied byte-for-byte to `public/club-logo.png` and used in the header, hero and footer. Its circular proportions are preserved instead of repeating the stretched, low-resolution PDF reference.
- The PDF does not specify mobile. The header changes to a menu at 950px; panels and grids stack progressively, with larger readable supporting text on mobile and all existing navigation destinations available.
- Keyboard focus, skip navigation, semantic controls and native dialog focus/escape behavior extend the design without adding decorative elements.

## Content decisions

Existing homepage copy and original announcements remain the fallback content. Team descriptions, working rules and contact details absent from the prior frontend were transcribed from the approved PDF. Dates are not changed to suggest that old events are upcoming. A live API `publishedAt` is labeled as a publication date, not invented as an event date.

The PDF's `+450 Aktif Üye` is not backed by current site data or an API counter. The same small visual slot uses the existing “Gönüllü topluluk” label. Social URLs are not supplied in the website's current data; the four PDF-style controls disclose that a link has not been provided instead of navigating to fabricated accounts.

## Backend integration, without backend changes

The original frontend did not make API requests and its forms immediately showed simulated success. Forms now call the existing Spring contracts. The frontend-only `/api/club/[...path]` adapter allows only the public content/options/settings/contact endpoints, login/registration, and the current-user endpoint. It does not expose admin endpoints or alter validation, roles, permissions, approval rules or database models.

Set `CLUB_API_URL` to the backend API root; default is `http://localhost:8080/api/v1`. For example in `.env.local`:

```dotenv
CLUB_API_URL=http://localhost:8080/api/v1
```

- The backend JWT is transported in an HttpOnly, SameSite cookie with its original expiry; authenticated profile reads forward it as a bearer token. Login and logout survive page navigation, while cross-origin mutations are rejected.
- Registration uses the real required account, personal, education, membership and declaration fields in three steps. Interests and legal text/version are loaded from the backend; IDs or legal versions are never fabricated. Optional personal and education fields remain available in disclosures.
- Password constraints match the existing registration contract (8–72 characters, upper/lowercase and digit). Successful registration displays pending review, not approved membership.
- No local “success” timer or simulated submission remains in production. Loading, validation, request errors, retries and successful responses are explicit; failed requests preserve input. If required registration options/legal text cannot load, submission is disabled and can be retried.
- If the public announcement service is down, the existing site content is retained on the homepage. The full list explicitly explains the fallback. A reachable empty service displays the empty state instead of inventing announcements.

The actual Spring service was not listening on port 8080 during this implementation. Live database registration and mail processing were therefore not exercised. These require starting the existing backend as documented in its README. No backend source/configuration/database changes were made.

## Validation

- Production build and TypeScript checks passed.
- `tests/pdf-ui.cjs` runs browser/transport checks against a temporary in-memory HTTP fixture; no live accounts, messages, or database records are created. It checks contact error/retry/success, registration payload and pending state, interest selection, field validation, step persistence, invalid/valid login, HttpOnly session, reload/logout, live/empty/fallback announcements, details dialogs, CSRF rejection and proxy allowlisting.
- Home, login, registration and announcements were checked at 320, 390, 768, 1024, 1300 and 1440 CSS pixels, with no horizontal overflow.
- Automated axe-core WCAG 2 A/AA and 2.1 AA checks passed on those four pages at mobile and desktop sizes. This is not a full manual screen-reader audit.
- Desktop screenshots were compared side by side with a 1300 × 2000 PDF raster; mobile and auth screenshots were visually reviewed. Generated review images are local-only under `.pdf-review/`. No arbitrary numerical fidelity certification is claimed.

To rerun browser tests, install Playwright and axe-core in a separate test-tools directory and point `PLAYWRIGHT_MODULE` to the Playwright package and `AXE_MODULE` to `axe-core/axe.min.js`. Run `npm run build`, then `npm run start -- --port 3001`, and `node tests/pdf-ui.cjs`. The test fixture owns loopback port 8080 for its duration and exits if that port is occupied. Use a test-only frontend instance configured with the default backend root; do not run the fixture alongside a real backend. The regular development server can remain at port 3000.

## Readability follow-up

Small navigation, announcement, button and footer text now uses at least 14px; the secondary brand caption uses 11px. Overview panels align together. Responsive checks passed on all four public pages at 320, 390, 768, 1024 and 1300px with no horizontal overflow or page errors. The homepage was reviewed at 1366 x 768 at normal zoom; mobile menu/anchor navigation and automated WCAG A/AA checks passed. Production build passed.

Latest sizing review: increased supporting type from 12px to 14px and body copy from 14px to 16px, with proportionate heading, button and logo sizes. Content containers now use the available viewport width with shared 16-32px responsive side gutters; the menu switches at 1100px to retain room for larger labels. Additional breakpoint checks from 360px to 1920px found no page overflow or clipped headings. No CSS zoom or transforms are used to scale the interface.

Full-width follow-up: removed fixed desktop width caps from the header, hero and homepage section containers. Their outer edges share one responsive gutter, including tablet and mobile. Readable text widths remain constrained inside larger panels. Verified 320-1920px layouts, all four public pages, mobile navigation and homepage accessibility checks without overflow or browser errors.
