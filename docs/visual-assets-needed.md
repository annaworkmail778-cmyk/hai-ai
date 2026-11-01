# Visual assets needed

The site ships without photography or rendered imagery. Every project visual
is a **coded composition** (`src/components/visuals/`): an SVG interface or
system drawing in the site's own art direction. They are good enough to
launch with. Real material from real projects will always be stronger.

No image-generation service was available when the site was built, so
nothing below has been generated. Each item lists what to produce, the
format, and an art-direction brief you can give a photographer, a 3D artist
or an image model.

## Art direction for every asset

- **Palette:** black `#000`, ink `#080808`, graphite `#111`, paper `#F3F2EE`,
  white, neutral grey `#999`. One accent only: signal orange `#FF5B14`,
  in small amounts.
- **Mood:** architectural, editorial, calm. Studio light, soft shadows,
  matte and brushed-metal materials, generous negative space.
- **Avoid:** blue or purple gradients, glowing "AI" spheres, robots,
  humanoid AI, brains, circuit-board clichés, stock handshakes, floating
  holograms and laptop mockups at an angle.
- **Interfaces:** show real product screens when a client allows it. Blur
  or replace personal data. Never show fake client logos or invented
  metrics.

## Formats

| Use | Size (px) | Format | Notes |
| --- | --- | --- | --- |
| Project cover | 2400 × 1500 (16:10) | JPG or WebP, ≤ 600 KB | Shown full-bleed in the case study (wide crop) and as a 4:5 portrait card on the work page. Keep the subject inside the central 50 % width, or set `position` (focal point). |
| Gallery — `full` | 2400 × 1350 (16:9) | JPG/WebP | Shown 4:5 on phones. |
| Gallery — `inset` / `split-*` | 2000 × 1250 (16:10) | JPG/WebP | |
| Ambient video (as a visual) | 1920 × 1080, 6–12 s loop | MP4 (H.264), ≤ 6 MB, no audio | Plays muted only while visible and never for reduced-motion users. A poster JPG is required. |
| Case-study film | 1920 × 1080 | MP4 (H.264) + poster | Plays only when the visitor presses play. |
| Logo | vector | SVG drawn in `currentColor` | See BRAND_REPLACEMENT_GUIDE.md. |

Put files in `public/projects/<slug>/` and reference them from the project
file (see PROJECT_CONTENT_GUIDE.md).

## Per project

All six projects are **examples** (marked "Example" on the site). Each one
is explained by an interactive, coded demo (`src/components/demos/`), so it
needs no imagery to work. When you publish **real client work**, give each
project:

| Slot | What to provide |
| --- | --- |
| Cover | One strong image of the product or the result (also used for cards, previews and the share image). |
| Screens (`gallery`) | Two to four real screenshots or photos, with a one-line caption each. |
| Film (optional) | A short screen recording of the system in use, with a poster frame. |

Replace the examples with real projects rather than "upgrading" an example
with imagery that suggests it was a real engagement.

### Covers of the current examples (coded compositions)

| Project | Composition | Suggested real replacement |
| --- | --- | --- |
| AI lead management | `lead-pipeline` | CRM / inquiry list with an AI-filled card |
| Real estate sales platform | `realestate-plan` | Apartment selector or availability board |
| Booking automation | `booking-calendar` | Staff calendar with online bookings |
| Operations dashboard | `ops-dashboard` | The live dashboard on a large screen |
| AI customer support | `support-inbox` | Support inbox with an AI reply and its sources |
| Corporate website | `web-editorial` | Desktop and phone captures of the live site |

## Site-wide

| Asset | Status | Where |
| --- | --- | --- |
| Logo (SVG) | Placeholder glyph + wordmark | `src/config/brand.ts` → `logo` |
| Favicon / app icons | Placeholder glyph, generated | `src/app/[lang]/icon.svg`, `apple-icon.tsx` |
| Legacy `src/app/favicon.ico` | Next.js default triangle from the previous site | Replace with the final mark or delete. |
| Open Graph images | Generated per locale and per project | `src/app/[lang]/opengraph-image.tsx`, `work/[slug]/opengraph-image.tsx` |
| 3D intro object | Coded (Three.js), no files needed | `src/components/three/` |
| About page photography (optional) | Not used | Studio/team photography in the same art direction can be added to the About page if wanted. Use only real people with their consent. |

## Optional briefs for an image model

Use only for atmosphere or abstract plates, never to fake product screens,
clients or results.

1. *"Architectural model of stacked matte graphite plates connected by thin
   brushed-steel columns, one plate edge lit with a thin orange light seam,
   studio softbox lighting, black seamless background, high detail,
   minimalist, editorial photography, 16:10."*
2. *"Overhead view of a paper architectural drawing with fine black linework
   and one small orange marker, soft daylight, off-white paper texture,
   minimal, 16:10."*
3. *"Close-up of brushed aluminium and dark glass surfaces meeting at a
   precise edge, shallow depth of field, cool neutral light, black
   background, no logos, 16:9."*
