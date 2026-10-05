# Adding and editing portfolio projects

Every project is one TypeScript file in `src/content/projects/`. From that
single file the site generates:

- the card on **/work** (gallery and index views, with capability filters)
- the full **case-study page** `/[lang]/work/<slug>` in Armenian, Russian and English
- the panel in the homepage **Featured Work** section (if `featured: true`)
- "Related work" links on **/solutions** and the homepage capabilities list
- the **system diagram**, the "next project" link, the **sitemap** entries,
  page **metadata**, **JSON-LD** and a generated **Open Graph image**

No component needs to change.

---

## 1. Add a project in five steps

1. **Prepare assets.** Create `public/projects/<slug>/` and add a cover and
   gallery images (sizes in `docs/visual-assets-needed.md`).
2. **Copy the template.** `cp src/content/projects/_template.ts src/content/projects/<slug>.ts`
   and rename the export (e.g. `export const dentalClinicCrm: Project = { … }`).
3. **Fill in the fields** (reference below). English is required; add
   `hy` and `ru` content. Any language you leave out falls back to English.
4. **Register it** in `src/content/projects/index.ts`:

   ```ts
   import { dentalClinicCrm } from "./dental-clinic-crm";

   const registry: Project[] = [
     dentalClinicCrm,
     // …
   ];
   ```

5. **Check it.**

   ```bash
   npm run typecheck   # catches missing or misspelled fields
   npm run dev         # open http://localhost:3000/hy/work/<slug>
   npm run build       # integrity checks run here too
   ```

The build stops with a clear message if a slug is malformed or duplicated,
or if the system diagram references a node that doesn't exist.

## 2. Truthfulness rules

These are not optional.

- `status: "client"` only for real, published work with the client's
  permission. Everything else is `status: "concept"`: it shows a
  **Concept** tag, a disclaimer, and labels outcomes as *expected*.
- `results` for client work: **only verified outcomes the client agreed to
  share.** No estimated percentages, revenue, ROI, conversion rates or
  awards. Qualitative results ("one calendar across all locations") are
  fine when they are true.
- Don't use client names or logos without permission. `client` can be a
  neutral description ("Regional clinic network").
- Images must not imply a client relationship that doesn't exist.

## 3. Field reference

| Field | What it does |
| --- | --- |
| `id` | Stable internal id, e.g. `"p-dental-clinic-crm"`. |
| `slug` | URL segment, lowercase words joined by hyphens. Changing it changes the URL. |
| `status` | `"client"` or `"concept"` (see above). |
| `featured` | `true` shows it in the homepage horizontal showcase. Three or four featured projects work best. |
| `order` | Sort order (ascending) everywhere. Ties are sorted newest first. |
| `year` | Year shown on cards and in the case study. |
| `capabilities` | Ids from `src/config/navigation.ts`: `ai-systems`, `automation`, `custom-software`, `business-applications`, `web-experiences`, `sales-systems`, `internal-tools`. They drive the work filters and the "Related work" lists. |
| `technologies` | Shown in chapter 08 and in the JSON-LD keywords. |
| `theme` | `"dark"` or `"light"`: colour mood of the case study and its "next project" panel. |
| `coverImage` | A `Visual` (below). Used for cards, the case-study hero and previews. |
| `gallery` | Ordered list of `{ visual, layout, caption? }` for chapter 06. |
| `video` | Optional `{ src, poster }` film, shown first in chapter 06; plays only when pressed. |
| `system` | Nodes and edges of the chapter 05 diagram (below). |
| `content.en` / `.hy` / `.ru` | All text (below). |

### Visuals

```ts
// Real image in /public
{ kind: "image", src: "/projects/<slug>/cover.jpg", alt: { en: "…", hy: "…", ru: "…" }, position: "50% 30%" }

// Muted ambient loop (poster required)
{ kind: "video", src: "/projects/<slug>/loop.mp4", poster: "/projects/<slug>/loop.jpg", alt: { en: "…" } }

// Coded composition (interim visuals; ids in src/components/visuals/registry.tsx)
{ kind: "composition", id: "ops-dashboard", alt: { en: "…" }, focus: "left" }
```

- **Alt text** describes what the image shows, in every language. It is
  read by screen readers and search engines.
- **Crops:** covers appear wide (case study), 16:9 (first card on /work)
  and 4:5 portrait (smaller cards and on phones). Keep the subject near the
  centre, or set `position` (images) / `focus` (compositions).

### Gallery layouts

| Layout | Result |
| --- | --- |
| `full` | Edge to edge. Best for wide product screens. |
| `inset` | Large, with margins, caption below. |
| `split-left` | Visual left (⅔), caption right. |
| `split-right` | Visual right (⅔), caption left. |

Two to four gallery items per project read best. Alternate layouts for rhythm.

### System diagram

```ts
system: {
  nodes: [
    { id: "web", group: "input", label: { en: "Website", hy: "Կայք", ru: "Сайт" } },
    { id: "crm", group: "core", label: { en: "CRM pipeline", hy: "…", ru: "…" } },
    { id: "team", group: "output", label: { en: "Sales team", hy: "…", ru: "…" } },
  ],
  edges: [["web", "crm"], ["crm", "team"]],
}
```

`input` = where information comes from, `core` = what was built,
`output` = who or what benefits. Keep labels short (2–3 words) and use 2–4
nodes per group. The same data draws the diagram on the case study, its
accessible text description, and the project's Open Graph image.

### Text fields (`content.<lang>`)

| Field | Where it appears |
| --- | --- |
| `title`, `subtitle` | Hero, cards, metadata. Keep titles under ~40 characters. Very long words (Armenian compounds) break onto two lines on phones. |
| `client`, `industry`, `projectType` | Hero meta list, cards, OG image. |
| `shortDescription` | Cards, search results (meta description) unless `seo.description` is set. |
| `challenge`, `solution` | One line each, homepage showcase panel. |
| `context` | Chapter 01. |
| `challengeDetail[]` | Chapter 02 paragraphs (below the `challenge` statement). |
| `research[]` | Chapter 03 "What we found", ideally four findings. |
| `solutionDetail[]`, `systemsBuilt[]` | Chapter 04. |
| `features[]` | Chapter 06 "Key features", ideally four `{ title, text }`. |
| `results[]` | Chapter 07 (see the truthfulness rules). |
| `services[]` | Chapter 08. |
| `seo` | Optional `{ title, description }` overrides for search results. |

## 4. Remove or replace the demo projects

The six projects shipped with the site are **concept demos** (each file
starts with a `DEMO CONTENT` comment). To retire one, remove it from the
`registry` array in `src/content/projects/index.ts` and delete its file.
Its URL, sitemap entries and links disappear automatically. Keep at least
one project registered.

## 5. Troubleshooting

| Message | Fix |
| --- | --- |
| `slug "…" must be lowercase words joined by hyphens` | Use `a-z`, `0-9` and single hyphens only. |
| `Duplicate project slug` | Two files use the same slug. |
| `system edge a → b references a missing node` | An edge uses an id not listed in `nodes`. |
| TypeScript: property missing in `content.en` | Every English field is required; compare with `_template.ts`. |
| Image not showing | Paths are relative to `public/` and start with `/`, e.g. `/projects/<slug>/cover.jpg`. |
