import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { SceneState } from "./choreography";
import { brand } from "@/config/brand";
import { LOGO } from "@/config/logo";

/**
 * "The growing business" — the 3D model of the intro.
 *
 * Four floating glass panels, one per thing Riseup takes off the owner's plate
 * (bottom → top):
 *   level 0  Sales        bar chart that grows with the scroll
 *   level 1  Bookings     a calendar whose slots fill up
 *   level 2  Automation   a loop of nodes with pulses running round it
 *   level 3  Customers    chat bubbles popping around the Riseup mark
 * An orange growth arrow (the swoosh of the logo) spirals up through them.
 *
 * The scroll choreography (choreography.ts) drives it through `update`.
 */

/** Panel size (world units) and thickness. Labels are projected onto the corners. */
export const FOOTPRINT = 2.2;
export const PLATE = 0.05;
export const FLOOR_Y = -2.45;

/** Base height of level i for a given spacing (stack is roughly centred on y=0). */
export const levelBase = (i: number, spacing: number) => (i - 1.5) * spacing - 0.2;

const ORANGE = new THREE.Color(brand.accent);
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ── Shaders: drafting-grid floor and soft contact shadow ─────────── */

const floorVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const floorFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec3 vWorld;
  float gridLine(vec2 p, float size) {
    vec2 c = p / size;
    vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    float minor = gridLine(vWorld.xz, 0.55);
    float major = gridLine(vWorld.xz, 2.2);
    float fade = 1.0 - smoothstep(1.5, 8.5, length(vWorld.xz));
    gl_FragColor = vec4(uColor, (minor * 0.28 + major * 0.7) * fade * uOpacity);
  }
`;
const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const glowFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.0, 1.0, d);
    gl_FragColor = vec4(uColor, a * a * uOpacity);
  }
`;

/* ── Sparks rising around the model ───────────────────────────────── */

const sparkVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uHeight;
  uniform float uPixel;
  varying float vFade;
  void main() {
    float t = fract(uTime * (0.05 + aSeed * 0.05) + aSeed * 13.7);
    vec3 p = position;
    p.y = -2.2 + t * uHeight;
    float a = aSeed * 40.0 + uTime * 0.15;
    p.x += sin(a) * 0.12;
    p.z += cos(a) * 0.12;
    vFade = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.7, 1.0, t));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uPixel * (0.6 + aSeed) * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const sparkFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.2, 1.0, d);
    gl_FragColor = vec4(uColor, a * vFade * uOpacity);
  }
`;

export type SystemOptions = {
  /** 1 = full detail (desktop), lower = lighter (mobile / low-end). */
  detail: number;
  shadows: boolean;
};

export type SystemModel = {
  root: THREE.Group;
  /** The four panels, bottom → top. Labels are projected onto their corners. */
  levels: THREE.Group[];
  update: (state: SceneState, time: number) => void;
  dispose: () => void;
};

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function createSystem({ detail, shadows }: SystemOptions): SystemModel {
  const root = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(o: T): T => {
    disposables.push(o);
    return o;
  };
  const W = FOOTPRINT;

  /* Materials ──────────────────────────────────────────────────── */
  const glassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x0b0b0c,
      metalness: 0.55,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.9,
    }),
  );
  const metalMat = track(new THREE.MeshStandardMaterial({ color: 0xd9d8d3, metalness: 1, roughness: 0.22 }));
  const paperMat = track(new THREE.MeshStandardMaterial({ color: 0xe8e6e0, metalness: 0.15, roughness: 0.45 }));
  const darkMat = track(new THREE.MeshStandardMaterial({ color: 0x2b2b2d, metalness: 0.7, roughness: 0.35 }));
  const glowMat = track(new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false }));
  const whiteGlowMat = track(new THREE.MeshBasicMaterial({ color: 0xf3f2ee, toneMapped: false }));
  const edgeMat = track(new THREE.LineBasicMaterial({ color: 0xe8e6e0, transparent: true, opacity: 0.55 }));

  /* Panels ─────────────────────────────────────────────────────── */
  const panelShape = roundedRect(W, W, 0.16);
  const panelGeo = track(
    new THREE.ExtrudeGeometry(panelShape, { depth: PLATE, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 8 }),
  );
  panelGeo.rotateX(-Math.PI / 2);
  const edgeGeo = track(new THREE.BufferGeometry().setFromPoints(panelShape.getPoints(10).map((p) => new THREE.Vector3(p.x, 0, -p.y))));

  const levels: THREE.Group[] = [];
  const edges: THREE.LineLoop[] = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const panel = new THREE.Mesh(panelGeo, glassMat);
    panel.castShadow = shadows;
    panel.receiveShadow = shadows;
    const edge = new THREE.LineLoop(edgeGeo, edgeMat);
    edge.position.y = PLATE + 0.013;
    g.add(panel, edge);
    edges.push(edge);
    levels.push(g);
    root.add(g);
  }
  const top = PLATE + 0.012;

  /* Level 0 — Sales: a bar chart ───────────────────────────────── */
  const unit = track(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const BARS = 7;
  const barTargets = Array.from({ length: BARS }, (_, i) => 0.12 + (i / (BARS - 1)) ** 1.6 * 0.55 + hash(i) * 0.04);
  const bars = Array.from({ length: BARS }, (_, i) => {
    const bar = new THREE.Mesh(unit, i === BARS - 1 ? glowMat : paperMat);
    bar.position.set(-0.78 + i * 0.26, top, 0.15);
    bar.scale.set(0.13, 0.1, 0.13);
    bar.castShadow = shadows;
    levels[0].add(bar);
    return bar;
  });
  // Baseline of the chart.
  const axis = new THREE.Mesh(unit, darkMat);
  axis.position.set(0, top, 0.32);
  axis.scale.set(1.9, 0.012, 0.03);
  levels[0].add(axis);

  /* Level 1 — Bookings: calendar slots that fill up ────────────── */
  const COLS = 7;
  const ROWS = 5;
  const slotGeo = track(new THREE.BoxGeometry(0.2, 0.035, 0.2).translate(0, 0.0175, 0));
  const slots = new THREE.InstancedMesh(slotGeo, track(new THREE.MeshStandardMaterial({ metalness: 0.4, roughness: 0.4 })), COLS * ROWS);
  slots.frustumCulled = false;
  const slotOrder = Array.from({ length: COLS * ROWS }, (_, i) => i).sort((a, b) => hash(a + 3) - hash(b + 3));
  const slotRank = new Array<number>(COLS * ROWS);
  slotOrder.forEach((slot, rank) => (slotRank[slot] = rank));
  const m4 = new THREE.Matrix4();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      m4.makeTranslation(-0.75 + c * 0.25, top, -0.55 + r * 0.25);
      slots.setMatrixAt(r * COLS + c, m4);
    }
  }
  levels[1].add(slots);
  const slotOff = new THREE.Color(0x2a2a2c);
  const slotOn = ORANGE.clone();
  const slotWhite = new THREE.Color(0xe6e4de);

  /* Level 2 — Automation: nodes on a loop, pulses running round ─── */
  const LOOP_R = 0.68;
  const NODES = 6;
  const nodeGeo = track(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 24).translate(0, 0.06, 0));
  for (let i = 0; i < NODES; i++) {
    const a = (i / NODES) * Math.PI * 2;
    const node = new THREE.Mesh(nodeGeo, i % 3 === 0 ? glowMat : metalMat);
    node.position.set(Math.cos(a) * LOOP_R, top, Math.sin(a) * LOOP_R);
    node.castShadow = shadows;
    levels[2].add(node);
  }
  const ringGeo = track(new THREE.TorusGeometry(LOOP_R, 0.012, 8, 96));
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, darkMat);
  ring.position.y = top + 0.06;
  levels[2].add(ring);
  const hubGeo = track(new THREE.CylinderGeometry(0.2, 0.24, 0.18, 32).translate(0, 0.09, 0));
  const hub = new THREE.Mesh(hubGeo, metalMat);
  hub.position.y = top;
  hub.castShadow = shadows;
  levels[2].add(hub);
  const pulseGeo = track(new THREE.SphereGeometry(0.045, 16, 12));
  const pulses = Array.from({ length: 3 }, () => {
    const p = new THREE.Mesh(pulseGeo, glowMat);
    levels[2].add(p);
    return p;
  });
  // Spokes from the hub to every node.
  const spokePts: THREE.Vector3[] = [];
  for (let i = 0; i < NODES; i++) {
    const a = (i / NODES) * Math.PI * 2;
    spokePts.push(new THREE.Vector3(0, top + 0.06, 0), new THREE.Vector3(Math.cos(a) * LOOP_R, top + 0.06, Math.sin(a) * LOOP_R));
  }
  const spokeGeo = track(new THREE.BufferGeometry().setFromPoints(spokePts));
  const spokeMat = track(new THREE.LineBasicMaterial({ color: 0x8a8a8a, transparent: true, opacity: 0.6 }));
  levels[2].add(new THREE.LineSegments(spokeGeo, spokeMat));

  /* Level 3 — Customers: the Riseup mark with chat bubbles ──────── */
  const markGroup = new THREE.Group();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${LOGO.mark}"/><path d="${LOGO.swoosh}"/></svg>`;
  const parsed = new SVGLoader().parse(svg);
  const S = 0.00095;
  parsed.paths.forEach((path, i) => {
    const shapes = SVGLoader.createShapes(path);
    const geo = track(
      new THREE.ExtrudeGeometry(shapes, { depth: 70, bevelEnabled: true, bevelThickness: 8, bevelSize: 6, bevelSegments: 2, curveSegments: detail >= 1 ? 6 : 3 }),
    );
    // SVG space → world: centre on the mark's viewBox, scale down, turn upright (SVG y points down).
    geo.translate(-1080, -780, -35);
    geo.scale(S, S, S);
    geo.rotateX(Math.PI);
    const mesh = new THREE.Mesh(geo, i === 0 ? paperMat : glowMat);
    mesh.castShadow = shadows;
    markGroup.add(mesh);
  });
  markGroup.position.set(0, top + 0.44, -0.2);
  levels[3].add(markGroup);

  const bubbleShape = roundedRect(1, 0.17, 0.085);
  const bubbleGeo = track(new THREE.ExtrudeGeometry(bubbleShape, { depth: 0.03, bevelEnabled: false, curveSegments: 6 }));
  const BUBBLES = [
    { x: -0.78, y: 0.42, w: 0.5, us: false },
    { x: 0.8, y: 0.62, w: 0.56, us: true },
    { x: -0.74, y: 0.82, w: 0.38, us: false },
    { x: 0.78, y: 1.02, w: 0.46, us: true },
  ];
  const bubbleMeshes = BUBBLES.map((b) => {
    const mesh = new THREE.Mesh(bubbleGeo, b.us ? glowMat : whiteGlowMat);
    mesh.position.set(b.x, top + b.y - 0.2, 0.55);
    mesh.scale.set(b.w, 1, 1);
    levels[3].add(mesh);
    return mesh;
  });

  /* Growth arrow spiralling up through the stack ───────────────── */
  const arrowMat = glowMat;
  let arrowGeo: THREE.TubeGeometry | null = null;
  const arrow = new THREE.Mesh(new THREE.BufferGeometry(), arrowMat);
  arrow.frustumCulled = false;
  const headGeo = track(new THREE.ConeGeometry(0.11, 0.3, 24));
  const head = new THREE.Mesh(headGeo, arrowMat);
  root.add(arrow, head);
  const TUBE_SEG = detail >= 1 ? 360 : 200;
  const RADIAL = 8;
  let builtSpacing = -1;
  let arrowCurve: THREE.CatmullRomCurve3 | null = null;
  const buildArrow = (spacing: number) => {
    const bottomY = levelBase(0, spacing) - 0.25;
    const topY = levelBase(3, spacing) + 1.55;
    const pts: THREE.Vector3[] = [];
    const turns = 1.6;
    const N = 48;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const a = -Math.PI * 0.75 + t * turns * Math.PI * 2;
      const r = 1.75 - t * 0.55;
      pts.push(new THREE.Vector3(Math.cos(a) * r, bottomY + (topY - bottomY) * t, Math.sin(a) * r));
    }
    arrowCurve = new THREE.CatmullRomCurve3(pts);
    arrowGeo?.dispose();
    arrowGeo = new THREE.TubeGeometry(arrowCurve, TUBE_SEG, 0.032, RADIAL, false);
    arrow.geometry = arrowGeo;
    builtSpacing = spacing;
  };

  /* Sparks ─────────────────────────────────────────────────────── */
  const SPARKS = detail >= 1 ? 90 : 45;
  const sparkPos = new Float32Array(SPARKS * 3);
  const sparkSeed = new Float32Array(SPARKS);
  for (let i = 0; i < SPARKS; i++) {
    const a = hash(i) * Math.PI * 2;
    const r = 1.2 + hash(i + 50) * 2.2;
    sparkPos.set([Math.cos(a) * r, 0, Math.sin(a) * r], i * 3);
    sparkSeed[i] = hash(i + 99);
  }
  const sparkGeo = track(new THREE.BufferGeometry());
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute("aSeed", new THREE.BufferAttribute(sparkSeed, 1));
  const sparkUniforms = {
    uTime: { value: 0 },
    uHeight: { value: 6 },
    uPixel: { value: Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1) * 3 },
    uColor: { value: ORANGE.clone() },
    uOpacity: { value: 0.9 },
  };
  const sparkMat = track(
    new THREE.ShaderMaterial({
      uniforms: sparkUniforms,
      vertexShader: sparkVertex,
      fragmentShader: sparkFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  root.add(sparks);

  /* Floor: drafting grid, warm glow and contact shadow ──────────── */
  const floorUniforms = { uOpacity: { value: 0.5 }, uColor: { value: new THREE.Color(0x9a9a9a) } };
  const floorGeo = track(new THREE.PlaneGeometry(26, 26));
  const floor = new THREE.Mesh(
    floorGeo,
    track(new THREE.ShaderMaterial({ uniforms: floorUniforms, vertexShader: floorVertex, fragmentShader: floorFragment, transparent: true, depthWrite: false })),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  root.add(floor);

  const glowGeo = track(new THREE.PlaneGeometry(7, 7));
  const warmUniforms = { uOpacity: { value: 0.35 }, uColor: { value: ORANGE.clone() } };
  const warm = new THREE.Mesh(
    glowGeo,
    track(
      new THREE.ShaderMaterial({
        uniforms: warmUniforms,
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  warm.rotation.x = -Math.PI / 2;
  warm.position.y = FLOOR_Y + 0.003;
  root.add(warm);

  if (shadows) {
    const receiver = new THREE.Mesh(floorGeo, track(new THREE.ShadowMaterial({ opacity: 0.4 })));
    receiver.rotation.x = -Math.PI / 2;
    receiver.position.y = FLOOR_Y + 0.002;
    receiver.receiveShadow = true;
    root.add(receiver);
  }

  // A warm key light from the arrow side keeps the metal parts orange-tinted.
  const warmLight = new THREE.PointLight(ORANGE, 6, 9, 2);
  warmLight.position.set(1.8, 1.2, 1.6);
  root.add(warmLight);

  /* Per-frame update ───────────────────────────────────────────── */
  const tmpColor = new THREE.Color();
  const tan = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  const update = (state: SceneState, time: number) => {
    const { spacing } = state;
    levels.forEach((g, i) => {
      g.position.y = levelBase(i, spacing) + Math.sin(time * 0.8 + i * 1.3) * 0.025;
      g.rotation.y = Math.sin(time * 0.3 + i) * 0.02;
    });
    edgeMat.opacity = 0.35 + 0.35 * state.connect;

    // How "busy" the business is: rises as the visitor scrolls.
    const busy = 0.35 + 0.65 * smooth(0.0, 0.75, state.draw * 0.6 + state.connect * 0.4);

    // Sales: bars grow, with a gentle live wobble.
    bars.forEach((bar, i) => {
      const h = barTargets[i] * (0.3 + 0.7 * busy) + Math.sin(time * 1.6 + i) * 0.015;
      bar.scale.y = Math.max(0.02, h);
    });

    // Bookings: slots fill up; one slot keeps blinking as "new booking".
    const lit = Math.round((COLS * ROWS - 4) * busy);
    const blink = slotOrder[(Math.floor(time * 0.8) % 8) + Math.max(0, lit - 8)];
    for (let s = 0; s < COLS * ROWS; s++) {
      const on = slotRank[s] < lit;
      tmpColor.copy(on ? (slotRank[s] % 5 === 0 ? slotWhite : slotOn) : slotOff);
      if (s === blink) tmpColor.lerp(slotWhite, 0.5 + 0.5 * Math.sin(time * 6));
      slots.setColorAt(s, tmpColor);
    }
    if (slots.instanceColor) slots.instanceColor.needsUpdate = true;

    // Automation: pulses circle the loop, faster when busy.
    pulses.forEach((p, k) => {
      const a = time * (0.6 + busy * 0.9) + (k / pulses.length) * Math.PI * 2;
      p.position.set(Math.cos(a) * LOOP_R, top + 0.06, Math.sin(a) * LOOP_R);
    });
    hub.rotation.y = time * 0.4;

    // Customers: bubbles pop in one after another on a loop.
    const cycle = (time % 6) / 6;
    bubbleMeshes.forEach((b, k) => {
      const t = smooth(k * 0.14, k * 0.14 + 0.08, cycle) * (1 - smooth(0.88, 0.97, cycle));
      b.scale.y = 0.001 + t;
      b.scale.z = 0.001 + t;
      b.visible = t > 0.01;
    });
    markGroup.rotation.y = Math.sin(time * 0.5) * 0.35;

    // Growth arrow draws up the stack with the scroll.
    if (Math.abs(spacing - builtSpacing) > 0.004) buildArrow(spacing);
    const grow = 0.18 + 0.82 * smooth(0, 1, Math.max(state.draw, state.connect * 0.9, state.align));
    if (arrowGeo && arrowCurve) {
      const per = RADIAL * 6;
      arrowGeo.setDrawRange(0, Math.floor(TUBE_SEG * grow) * per);
      const tip = Math.min(0.999, grow);
      arrowCurve.getPointAt(tip, head.position);
      arrowCurve.getTangentAt(tip, tan).normalize();
      head.quaternion.setFromUnitVectors(up, tan);
    }

    // Ambient: sparks, grid, glow.
    sparkUniforms.uTime.value = time;
    sparkUniforms.uOpacity.value = 0.5 + 0.5 * busy;
    floorUniforms.uOpacity.value = 0.3 + 0.35 * state.annotate;
    warmUniforms.uOpacity.value = 0.22 + 0.25 * busy;
    warmLight.intensity = 3 + 5 * busy;

    root.rotation.y = Math.sin(time * 0.12) * 0.05;
  };

  return {
    root,
    levels,
    update,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
      arrowGeo?.dispose();
      slots.dispose();
    },
  };
}
