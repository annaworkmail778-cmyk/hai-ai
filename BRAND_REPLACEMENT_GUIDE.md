# Replacing the placeholder brand

The site launches with neutral placeholders:

| Placeholder | Value |
| --- | --- |
| Company name | `YOUR COMPANY` |
| Tagline | *Technology built around business.* |
| Description | *AI, automation and software systems for modern businesses.* |
| Email / phone | `hello@example.com` / `+374 00 000 000` |
| Domain | `https://www.example.com` |
| Logo | A placeholder glyph (a frame holding one orange module) + the name |

Almost everything comes from **one file: `src/config/brand.ts`.** Change
it there and the navigation, footer, page titles, Open Graph images,
structured data (JSON-LD), contact page and generated icons all follow.

---

## 1. Name, tagline, description

In `src/config/brand.ts`:

```ts
export const COMPANY_NAME = "Your Company";          // wordmark, titles, footer, OG images, JSON-LD
export const TAGLINE = "Technology built around business.";
export const DESCRIPTION = "AI, automation and software systems for modern businesses.";
```

Then update the translated versions in the same file: `brand.tagline.hy/.ru`
and `brand.description.hy/.ru`. Set `legalName` if the registered name
differs (it is used in the © line).

The homepage copy (hero headline, statements, sections) lives in
`src/locales/hy.json`, `ru.json` and `en.json`. It doesn't contain the
company name, so it rarely needs changing for a rebrand.

## 2. Logo

1. Export the logo as a **single-colour SVG drawn in `currentColor`** so it
   turns white on dark sections and black on light ones automatically.
2. Save it as `public/brand/logo.svg`.
3. In `brand.ts`:

   ```ts
   logo: { type: "svg", src: "/brand/logo.svg", width: 148, height: 24 },
   ```

   The navigation and mobile menu render the file instead of the
   placeholder glyph and name.

4. Replace the glyph in the places that draw it directly:

   | File | What it is |
   | --- | --- |
   | `src/components/layout/Wordmark.tsx` → `BrandGlyph` | Placeholder glyph, used while `logo.type` is `"wordmark"` |
   | `src/app/[lang]/icon.svg` | Browser tab icon (static SVG) |
   | `src/app/[lang]/apple-icon.tsx` | Home-screen icon (generated PNG) |
   | `src/lib/og.tsx` → `OgWordmark` | Logo on generated Open Graph images |
   | `src/app/favicon.ico` | **Legacy** icon from the previous site (Next.js default). Replace it with an `.ico` of the new mark, or delete it. |

## 3. Accent colour

The single accent (signal orange `#FF5B14`) is `brand.accent` in
`brand.ts`. It feeds the CSS variable `--color-signal`, the 3D intro's
light seam, the process diagram, the coded project visuals, Open Graph
images and the home-screen icon. The only other copy is the static
`src/app/[lang]/icon.svg`. Keep it a single, sparing accent, and avoid blue.

The neutral palette (black, ink, graphite, paper, mute grey) and the type
scale are tokens in `src/styles/site.css` (`@theme`).

## 4. Typography

Fonts load with `next/font` in `src/app/[lang]/layout.tsx`:

- **Geist** for Latin and Cyrillic, **Noto Sans Armenian** as the
  per-character fallback for Armenian, and **Geist Mono** for labels.
- To change the typeface, swap the `next/font/google` imports (or use
  `next/font/local`) and keep the CSS variable names (`--font-geist`,
  `--font-geist-mono`, `--font-armenian`).
- Make sure any new font covers **Armenian and Cyrillic** (or keep Noto Sans
  Armenian as the fallback).
- Generated Open Graph images use TTF copies in `src/assets/fonts/`. Replace
  them with TTF/OTF files of the new fonts (Satori can't read WOFF2).

## 5. Contact details and social profiles

In `brand.ts`: `email`, `phone`, `address.city` / `address.country` (per
language), `address.timeZone` (drives the live clock in the footer) and
`socialLinks` (label + full URL). Remove profiles you don't use.

Form delivery (email, Telegram, CRM webhook) is configured with environment
variables, not in code. See README → *Contact form*.

## 6. Domain

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.yourcompany.am`) in the
hosting environment. Canonical URLs, hreflang alternates, the sitemap,
robots.txt, Open Graph URLs and JSON-LD use it.

## 7. Final check

Search for anything left over:

```bash
grep -rn "YOUR COMPANY\|example\.com\|000 000" src public --include=*.ts --include=*.tsx --include=*.json --include=*.svg
```

Then run `npm run typecheck && npm run lint && npm run build`, open the
site in all three languages, and share a page link in a messenger to see
the new Open Graph image.
