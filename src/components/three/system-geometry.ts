/**
 * Geometry specification for "The System" — an abstract architectural model
 * of a business: four stacked levels inside a structural frame.
 *
 *   level 3  AI          processor core with glass fins and a light seam
 *   level 2  Automation  a loop of nodes joined by pipes
 *   level 1  Software    interface slabs carrying glass screens
 *   level 0  Systems     a dense grid of infrastructure blocks
 *
 * All units are world units. Positions are level-local (origin at the
 * centre of the level's base plate).
 */

export const FOOTPRINT = 2.2;
export const PLATE = 0.05;
export const BEAM = 0.034;
/** Height of the structural frame above the top level's plate. */
export const ROOF = 0.66;

export type MaterialKey = "module" | "polished" | "core" | "glass" | "light";

export type ModuleSpec = {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  mat: MaterialKey;
  /** Extra height above the plate top (for stacked parts). */
  lift?: number;
  /** Rotation around Y (radians). */
  ry?: number;
  /** Scatter offset applied before the system "aligns" (scene 03). */
  dx?: number;
  dz?: number;
};

/** Deterministic pseudo-random in [0, 1). */
export function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const scatter = (seed: number, amount = 0.16) => ({
  dx: (hash(seed) - 0.5) * amount * 2,
  dz: (hash(seed + 41) - 0.5) * amount * 2,
});

function systemsLevel(detail: number): ModuleSpec[] {
  const n = detail > 0.75 ? 5 : 4;
  const pitch = 1.7 / (n - 1);
  const size = pitch * 0.72;
  const out: ModuleSpec[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const k = i * n + j;
      const r = hash(k + 3);
      const h = 0.07 + 0.2 * r;
      const x = -0.85 + i * pitch;
      const z = -0.85 + j * pitch;
      out.push({ x, z, w: size, h, d: size, mat: r > 0.82 ? "polished" : "module", ...scatter(k, 0.1) });
      if (hash(k + 17) > 0.72) {
        // A status light on top of some blocks.
        out.push({ x, z, w: size * 0.7, h: 0.008, d: 0.022, mat: "light", lift: h, ...scatter(k, 0.1) });
      }
    }
  }
  return out;
}

function softwareLevel(): ModuleSpec[] {
  const slabs = [
    { x: -0.22, z: -0.6, w: 1.5, screen: 1.25 },
    { x: 0.18, z: 0.02, w: 1.66, screen: 1.4 },
    { x: -0.08, z: 0.62, w: 1.3, screen: 1.05 },
  ];
  const out: ModuleSpec[] = [];
  slabs.forEach((s, i) => {
    const sc = scatter(100 + i, 0.18);
    out.push({ x: s.x, z: s.z, w: s.w, h: 0.08, d: 0.28, mat: "module", ...sc });
    out.push({ x: s.x, z: s.z, w: s.screen, h: 0.44, d: 0.012, mat: "glass", lift: 0.08, ...sc });
    out.push({ x: s.x, z: s.z, w: s.screen, h: 0.014, d: 0.024, mat: "polished", lift: 0.52, ...sc });
  });
  out.push({ x: 0.82, z: -0.62, w: 0.3, h: 0.14, d: 0.3, mat: "polished", ...scatter(120) });
  out.push({ x: -0.84, z: 0.1, w: 0.26, h: 0.2, d: 0.26, mat: "module", ...scatter(121) });
  return out;
}

function automationLevel(): ModuleSpec[] {
  const out: ModuleSpec[] = [];
  const half = 0.75;
  // Loop of nodes around a square path.
  const perSide = 3;
  let k = 0;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < perSide; i++) {
      const t = -half + (i * (2 * half)) / perSide;
      const [x, z] =
        side === 0 ? [t, -half] : side === 1 ? [half, t] : side === 2 ? [-t, half] : [-half, -t];
      const corner = i === 0;
      out.push({
        x,
        z,
        w: corner ? 0.16 : 0.11,
        h: corner ? 0.16 : 0.11,
        d: corner ? 0.16 : 0.11,
        mat: corner ? "polished" : "module",
        ...scatter(200 + k++, 0.2),
      });
    }
  }
  // Pipes joining the loop, and two diagonals through the hub.
  const pipe = 0.032;
  out.push({ x: 0, z: -half, w: 2 * half, h: pipe, d: pipe, mat: "polished", lift: 0.04 });
  out.push({ x: 0, z: half, w: 2 * half, h: pipe, d: pipe, mat: "polished", lift: 0.04 });
  out.push({ x: -half, z: 0, w: pipe, h: pipe, d: 2 * half, mat: "polished", lift: 0.04 });
  out.push({ x: half, z: 0, w: pipe, h: pipe, d: 2 * half, mat: "polished", lift: 0.04 });
  out.push({ x: 0, z: 0, w: 2 * half * Math.SQRT2, h: pipe, d: pipe, mat: "module", lift: 0.04, ry: Math.PI / 4 });
  out.push({ x: 0, z: 0, w: 2 * half * Math.SQRT2, h: pipe, d: pipe, mat: "module", lift: 0.04, ry: -Math.PI / 4 });
  // Hub.
  out.push({ x: 0, z: 0, w: 0.36, h: 0.18, d: 0.36, mat: "core" });
  out.push({ x: 0, z: 0, w: 0.3, h: 0.008, d: 0.3, mat: "light", lift: 0.18 });
  return out;
}

function aiLevel(detail: number): ModuleSpec[] {
  const out: ModuleSpec[] = [];
  const core = 0.64;
  out.push({ x: 0, z: 0, w: core, h: 0.3, d: core, mat: "core" });
  // Light seam around the core's top edge.
  const seam = 0.008;
  out.push({ x: 0, z: -core / 2, w: core, h: seam, d: seam, mat: "light", lift: 0.3 });
  out.push({ x: 0, z: core / 2, w: core, h: seam, d: seam, mat: "light", lift: 0.3 });
  out.push({ x: -core / 2, z: 0, w: seam, h: seam, d: core, mat: "light", lift: 0.3 });
  out.push({ x: core / 2, z: 0, w: seam, h: seam, d: core, mat: "light", lift: 0.3 });
  // Glass fins passing through the core.
  const fins = detail > 0.75 ? 11 : 7;
  for (let i = 0; i < fins; i++) {
    const x = -0.52 + (i * 1.04) / (fins - 1);
    out.push({ x, z: 0, w: 0.01, h: 0.58, d: 0.96, mat: "glass" });
    out.push({ x, z: 0, w: 0.014, h: 0.012, d: 0.96, mat: "polished", lift: 0.58 });
  }
  // Corner anchors.
  for (const [x, z] of [
    [-0.82, -0.82],
    [0.82, -0.82],
    [0.82, 0.82],
    [-0.82, 0.82],
  ]) {
    out.push({ x, z, w: 0.12, h: 0.12, d: 0.12, mat: "polished" });
  }
  return out;
}

export function buildLevels(detail: number): ModuleSpec[][] {
  return [systemsLevel(detail), softwareLevel(), automationLevel(), aiLevel(detail)];
}

/** Vertical conduit anchors (x, z), shared by every gap between levels. */
export const CONDUITS: Array<[number, number]> = [
  [-0.55, -0.55],
  [0.55, -0.55],
  [0.55, 0.55],
  [-0.55, 0.55],
  [0, -0.95],
  [0.95, 0],
  [0, 0.95],
  [-0.95, 0],
];

/** Which conduits run through each gap (0: systems→software, …). */
export const GAP_CONDUITS: number[][] = [
  [0, 1, 2, 3, 4],
  [0, 2, 5, 6, 7],
  [1, 3, 4, 5, 6],
];

/** One diagonal brace per gap: [from conduit, to conduit]. */
export const GAP_BRACES: Array<[number, number]> = [
  [0, 2],
  [5, 7],
  [4, 6],
];

/** Conduits rendered with the accent pulse (the system's "signal path"). */
export const ACCENT_CONDUITS = new Set(["0:2", "1:2", "2:5"]);
