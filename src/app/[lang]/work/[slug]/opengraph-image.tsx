import { ImageResponse } from "next/og";
import { COMPANY_NAME } from "@/config/brand";
import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pad2 } from "@/i18n/format";
import { getProject, getProjects } from "@/content/projects";
import { localize, projectContent } from "@/content/localize";
import type { SystemMap } from "@/content/types";
import { og, OG_SIZE, OgGrid, OgWordmark, ogFonts } from "@/lib/og";

export const alt = `${COMPANY_NAME} — case study`;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.flatMap((lang) => getProjects().map((p) => ({ lang, slug: p.slug })));
}

type Group = "input" | "core" | "output";
const GROUPS: Group[] = ["input", "core", "output"];
const BOX = { w: 150, h: 48, gap: 14, col: 172 };
const AREA = { x: 662, y: 168 };

/** A compact version of the case-study system diagram. */
function MiniSystem({
  system,
  locale,
  legend,
  colors,
}: {
  system: SystemMap;
  locale: Parameters<typeof localize>[1];
  legend: Record<Group, string>;
  colors: { fg: string; mute: string; line: string; box: string; core: string };
}) {
  const shown = new Map<string, { x: number; y: number; group: Group }>();
  const columns = GROUPS.map((g, gi) => {
    const nodes = system.nodes.filter((n) => n.group === g).slice(0, 4);
    const total = nodes.length * BOX.h + (nodes.length - 1) * BOX.gap;
    const top = AREA.y + 60 + (4 * BOX.h + 3 * BOX.gap - total) / 2;
    return nodes.map((n, i) => {
      const pos = { x: AREA.x + gi * BOX.col, y: top + i * (BOX.h + BOX.gap), group: g };
      shown.set(n.id, pos);
      return { n, ...pos };
    });
  });
  const edges = system.edges
    .map(([from, to]) => [shown.get(from), shown.get(to)] as const)
    .filter(([a, b]) => a && b && a.group !== b.group) as Array<
    readonly [{ x: number; y: number }, { x: number; y: number }]
  >;

  return (
    <>
      <svg width={OG_SIZE.width} height={OG_SIZE.height} style={{ position: "absolute", top: 0, left: 0 }}>
        {edges.map(([a, b], i) => {
          const [l, r] = a.x < b.x ? [a, b] : [b, a];
          const x1 = l.x + BOX.w;
          const y1 = l.y + BOX.h / 2;
          const x2 = r.x;
          const y2 = r.y + BOX.h / 2;
          const mid = (x1 + x2) / 2;
          return (
            <path
              key={i}
              d={`M${x1} ${y1} L${mid} ${y1} L${mid} ${y2} L${x2} ${y2}`}
              fill="none"
              stroke={colors.line}
              strokeWidth="1.4"
            />
          );
        })}
      </svg>
      {GROUPS.map((g, gi) => (
        <div
          key={g}
          style={{
            position: "absolute",
            left: AREA.x + gi * BOX.col,
            top: AREA.y,
            width: BOX.w,
            paddingBottom: 10,
            borderBottom: `1px solid ${colors.line}`,
            fontFamily: og.mono,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: colors.mute,
          }}
        >
          {legend[g]}
        </div>
      ))}
      {columns.flat().map(({ n, x, y, group }) => (
        <div
          key={n.id}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: BOX.w,
            height: BOX.h,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 12px",
            border: `1.3px solid ${group === "core" ? colors.fg : colors.line}`,
            borderRadius: 4,
            background: group === "core" ? colors.core : colors.box,
            fontSize: localize(n.label, locale).length > 22 ? 12 : 13.5,
            lineHeight: 1.15,
            color: colors.fg,
            overflow: "hidden",
          }}
        >
          <div style={{ width: 7, height: 7, flexShrink: 0, background: group === "core" ? og.signal : colors.mute }} />
          <div style={{ display: "flex" }}>{localize(n.label, locale)}</div>
        </div>
      ))}
    </>
  );
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const dict = getDictionary(locale);
  const project = getProject(slug);
  if (!project) return new Response("Not found", { status: 404 });
  const c = projectContent(project, locale);
  const index = getProjects().findIndex((p) => p.slug === project.slug);
  const light = project.theme === "light";
  const colors = light
    ? { bg: og.paper, fg: "#111111", mute: og.muteInk, line: "#cfccc3", grid: "#e9e7e1", box: "#f7f6f2", core: "#ffffff" }
    : { bg: og.ink, fg: og.paper, mute: og.mute, line: "#333333", grid: "#121212", box: "#0f0f0f", core: "#1a1a1a" };
  const titleSize = c.title.length > 34 ? 50 : c.title.length > 22 ? 58 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: colors.bg,
          color: colors.fg,
          fontFamily: og.sans,
        }}
      >
        <OgGrid color={colors.grid} />
        <MiniSystem system={project.system} locale={locale} legend={dict.caseStudy.legend} colors={colors} />
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 64,
            right: 64,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <OgWordmark color={colors.fg} />
          <div
            style={{
              display: "flex",
              fontFamily: og.mono,
              fontSize: 15,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: colors.mute,
            }}
          >
            {`${dict.nav.work} · ${pad2(index + 1)} / ${pad2(getProjects().length)}`}
          </div>
        </div>
        <div style={{ position: "absolute", left: 64, top: 168, width: 548, display: "flex", flexDirection: "column" }}>
          {project.status === "concept" && (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 12px",
                  border: `1px solid ${colors.line}`,
                  fontFamily: og.mono,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: colors.mute,
                }}
              >
                <div style={{ width: 7, height: 7, background: og.signal }} />
                {dict.common.concept}
              </div>
            </div>
          )}
          <div style={{ marginTop: 26, fontSize: titleSize, fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
            {c.title}
          </div>
          <div style={{ marginTop: 22, fontSize: 21, lineHeight: 1.38, color: colors.mute }}>{c.subtitle}</div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 52,
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${colors.line}`,
            paddingTop: 20,
            fontFamily: og.mono,
            fontSize: 15,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: colors.mute,
          }}
        >
          <div style={{ display: "flex" }}>{c.industry}</div>
          <div style={{ display: "flex" }}>{String(project.year)}</div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
