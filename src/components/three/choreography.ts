/**
 * Scroll choreography for the 3D intro, as pure functions of progress (0–1).
 *
 *  SCENE 01  Intro          0.00–0.12  compact monolith inside a dark-glass shell
 *  SCENE 02  System expands 0.10–0.44  shell dissolves, layers separate, labels
 *  SCENE 03  Transformation 0.42–0.72  connections draw, modules align, statement
 *  SCENE 04  Hero           0.72–1.00  system settles to the right, hero resolves
 *
 * The DOM overlay timeline in ScrollIntro.tsx uses the same breakpoints.
 */

export type SceneTier = "high" | "mobile" | "low";

export const SCENE = {
  introEnd: 0.12,
  expand: [0.1, 0.44] as const,
  connect: [0.42, 0.68] as const,
  resolve: [0.7, 0.96] as const,
  labelsIn: [0.19, 0.29] as const,
  labelsOut: [0.42, 0.48] as const,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const DEG = Math.PI / 180;

export type SceneState = {
  /** Vertical distance between level bases. */
  spacing: number;
  /** Dark-glass shell visibility. */
  shell: number;
  /** Connection lines drawing in (late scene 02). */
  draw: number;
  /** Connections energised: pulses + nodes (scene 03). */
  connect: number;
  /** Module alignment 0 (scattered) – 1 (aligned). */
  align: number;
  /** Floor + dimension annotation visibility. */
  annotate: number;
  camera: {
    distance: number;
    azimuth: number;
    elevation: number;
    /**
     * Horizontal lens shift as a fraction of frame width (positive = object
     * moves right). Applied as a film offset, so perspective is unchanged —
     * like the shift lens of an architectural camera.
     */
    shift: number;
    /** Look-at height. */
    targetY: number;
  };
  /** Per-label opacity, top (AI) to bottom (Systems). */
  labels: [number, number, number, number];
};

export function sceneState(p: number, tier: SceneTier): SceneState {
  const mobile = tier === "mobile";
  const expand = easeInOut(smoothstep(SCENE.expand[0], SCENE.expand[1], p));
  const connect = smoothstep(SCENE.connect[0], SCENE.connect[1], p);
  const resolve = easeInOut(smoothstep(SCENE.resolve[0], SCENE.resolve[1], p));

  const spacing = lerp(lerp(0.56, mobile ? 0.98 : 1.08, expand), mobile ? 0.78 : 0.84, resolve);

  // Camera path: far & elevated → closer & lower → orbit → settle.
  // (Portrait phones need more distance: the horizontal field of view is narrow.)
  const distance = mobile
    ? lerp(lerp(lerp(19.5, 22.5, expand), 19.4, connect), 22, resolve)
    : lerp(lerp(lerp(13.2, 11.2, expand), 11.8, connect), 13.4, resolve);
  const azimuth = mobile
    ? lerp(lerp(lerp(36, 46, expand), 58, connect), 42, resolve)
    : lerp(lerp(lerp(36, 54, expand), 74, connect), 42, resolve);
  const elevation = lerp(lerp(lerp(24, 13, expand), 19, connect), mobile ? 18 : 17, resolve);
  // Lens shift: nudge the system right while the statement plays, then settle it beside the hero.
  const shift = mobile
    ? lerp(lerp(0, 0.12, expand), 0, connect)
    : lerp(lerp(0, 0.13, connect), 0.28, resolve);
  const targetY = mobile
    ? lerp(lerp(lerp(-0.6, -0.2, expand), -2, connect), -3, resolve)
    : lerp(0, 0.1, resolve);

  const labelIn = (i: number) => smoothstep(SCENE.labelsIn[0] + i * 0.025, SCENE.labelsIn[1] + i * 0.025, p);
  const labelOut = 1 - smoothstep(SCENE.labelsOut[0], SCENE.labelsOut[1], p);
  const labels = [0, 1, 2, 3].map((i) => labelIn(i) * labelOut) as SceneState["labels"];

  return {
    spacing,
    shell: 1 - smoothstep(0.08, 0.3, p),
    draw: smoothstep(0.24, 0.52, p),
    connect,
    align: smoothstep(SCENE.connect[0] + 0.04, SCENE.connect[1] + 0.06, p),
    annotate: smoothstep(0.18, 0.32, p) * (1 - smoothstep(0.62, 0.74, p)),
    camera: {
      distance,
      azimuth: azimuth * DEG,
      elevation: elevation * DEG,
      shift,
      targetY,
    },
    labels,
  };
}
