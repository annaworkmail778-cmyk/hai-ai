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

All six projects are **demo concepts**. Replace them with real client work
when it is cleared for publication, rather than "upgrading" a concept with
imagery that suggests it was a real engagement.

### AI Lead Management System — `ai-lead-management`
| Slot | Current composition | Replace with |
| --- | --- | --- |
| Cover | `lead-pipeline` | Real CRM/pipeline screen with a lead's qualification detail open. |
| Gallery 1 (`split-right`) | `lead-conversation` | The AI qualification conversation next to the extracted lead card. |
| Gallery 2 (`full`) | `lead-flow` | System diagram, or a photo of the sales team's real workspace. |

### Real Estate Sales Platform — `real-estate-sales-platform`
| Slot | Current composition | Replace with |
| --- | --- | --- |
| Cover | `realestate-plan` | Interactive floor plan / unit selector screen, or an architectural photo of the development with the interface. |
| Gallery 1 (`full`) | `realestate-matrix` | Live unit availability matrix (chessboard) screen. |
| Gallery 2 (`inset`) | `realestate-mobile` | Buyer flow on phones: unit page, reservation, confirmation. |

### Appointment & Booking Automation — `booking-automation`
| Slot | Current composition | Replace with |
| --- | --- | --- |
| Cover | `booking-calendar` | Staff calendar with automated confirmations and reminders. |
| Gallery 1 (`full`) | `booking-mobile` | Client booking flow on phones. |
| Gallery 2 (`split-left`) | `booking-flow` | System diagram or reception desk photo (no patient data). |

### Business Operations Dashboard — `operations-dashboard`
| Slot | Current composition | Replace with |
| --- | --- | --- |
| Cover | `ops-dashboard` | The live dashboard on a large screen, real but anonymised data. |
| Gallery 1 (`full`) | `ops-timeline` | Order/production timeline view. |
| Gallery 2 (`split-right`) | `ops-flow` | System diagram, or the dashboard in use on the floor. |

### AI Customer Support System — `ai-customer-support`
| Slot | Current composition | Replace with |
| --- | --- | --- |
| Cover | `support-inbox` | Support inbox with an AI-drafted reply and its sources. |
| Gallery 1 (`inset`) | `support-knowledge` | Knowledge base / retrieval management screen. |
| Gallery 2 (`full`) | `support-flow` | System diagram or escalation dashboard. |

### Premium Corporate Web Experience — `corporate-web-experience`
| Slot | Current composition | Replace with |
| --- | --- | --- |
| Cover | `web-editorial` (focus left) | Desktop + phone captures of the live site. |
| Gallery 1 (`full`) | `web-system` | Design-system sheet (type, colour, components). |
| Gallery 2 (`split-left`) | `web-flow` | Content architecture diagram or a scroll sequence. |

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
