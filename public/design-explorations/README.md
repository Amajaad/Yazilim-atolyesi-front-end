# Yazılım Atölyesi — design explorations

Run the existing frontend with `npm run dev`, then open:

http://localhost:3000/design-explorations/index.html

## Review surfaces

- `index.html`: Arabic comparison gallery with real screenshots, rationale, audiences, strengths, trade-offs, mobile behavior, and two interactive preview frames.
- `audit.html`: content inventory, UX findings, existing frontend/backend gaps, source provenance, and separate content proposals.
- `design-01.html` through `design-05.html`: independent Turkish website prototypes.
- Add `?view=register` or `?view=login` to any prototype for its authentication screens.
- Team links preselect the existing interest option in the registration form.
- Contact forms appear on every homepage. The source Contact component exists but is not mounted on the original homepage.

## Isolation

Only this directory is added. No production components, routes, styles, configuration, package manifests, dependencies, or backend files are changed. These standalone documents do not load the production CSS. No API calls, local storage, analytics, or real submissions are made. Forms are explicitly labeled simulations; only use example values.

`content.js` contains the source frontend copy and review metadata. `prototype.js` shares rendering primitives and demo behavior; each direction has its own hero structure, navigation treatment, section order, typography, layout rules, and responsive treatment in `prototype.css`. `review.js` powers the gallery and comparison frames. All dependencies are native browser features. The original low-resolution logo is referenced in place; no generated pictures are used.

## Validation — 22 September 2026

- Browser automation: all five homepages, mobile navigation including login and Escape handling, search/empty/reset, team-to-registration interest selection, required-field errors, password visibility, simulated loading/error/retry/success, login, and contact flows passed.
- Homepage viewport checks: 320, 390, 768, 1024, 1280 and 1440 CSS pixels; no horizontal overflow found.
- Comparison controls: changing direction and switching desktop/mobile preview widths passed. Gallery overflow checks passed at 390, 768 and 1280 pixels.
- Browser JavaScript errors: none recorded during the interaction suite.
- Automated axe-core WCAG 2 A/AA and 2.1 AA checks: no violations on the five homepages, direction 02 registration, comparison gallery, and audit page at 1280 pixels. This is a sampled automated check, not a complete accessibility certification or manual screen-reader audit.
- `npm run typecheck`: passed.
- SHA-256 comparison: zero changes to original files in `app`, `components`, and existing `public` assets relative to the pre-implementation snapshot.
- Desktop and full-page mobile screenshots were visually inspected. Screenshots are stored in `previews/`.

## Content decisions requiring a later review

The original 2025 event content and footer year are preserved. Dates are explicitly described as source content, not a current calendar. No new club statistics or event facts are invented. The original frontend password rule and abbreviated registration fields are retained in this visual study; the backend requires a more extensive application and different password requirements. Integrating that full workflow is a separate product task after direction approval, documented in `audit.html`.

No direction has been selected or ranked. Next stage: prototype review → user approval → production implementation.
