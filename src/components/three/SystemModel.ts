import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { SceneState } from "./choreography";
import { brand } from "@/config/brand";
import {
  ACCENT_CONDUITS,
  BEAM,
  CONDUITS,
  FOOTPRINT as W,
  GAP_BRACES,
  GAP_CONDUITS,
  PLATE,
  ROOF,
  buildLevels,
  hash,
  type MaterialKey,
  type ModuleSpec,
} from "./system-geometry";

export const FLOOR_Y = -2.45;

/** Base height of level i for a given spacing (stack is roughly centred on y=0). */
export const levelBase = (i: number, spacing: number) => (i - 1.5) * spacing - 0.2;

const lineVertex = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  attribute float aAccent;
  varying float vT;
  varying float vSeed;
  varying float vAccent;
  void main() {
    vT = aT;
    vSeed = aSeed;
    vAccent = aAccent;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragment = /* glsl */ `
  uniform float uDraw;
  uniform float uPulse;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uBase;
  uniform vec3 uBright;
  uniform vec3 uAccent;
  varying float vT;
  varying float vSeed;
  varying float vAccent;
  void main() {
    float start = vSeed * 0.5;
    float local = clamp((uDraw - start) / 0.5, 0.0, 1.0);
    if (vT > local) discard;
    float tip = (1.0 - smoothstep(0.0, 0.06, local - vT)) * (1.0 - step(0.999, local));
    float head = fract(uTime * 0.24 + vSeed * 7.13);
    float pulse = (1.0 - smoothstep(0.0, 0.085, abs(vT - head))) * uPulse;
    vec3 bright = mix(uBright, uAccent, vAccent);
    vec3 color = mix(uBase, bright, clamp(pulse + tip, 0.0, 1.0));
    float alpha = uOpacity * (0.5 + 0.5 * clamp(pulse + tip, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

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
    float alpha = (minor * 0.28 + major * 0.7) * fade * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const blobFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = (1.0 - smoothstep(0.0, 1.0, d));
    gl_FragColor = vec4(0.0, 0.0, 0.0, a * a * uOpacity);
  }
`;

const blobVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export type SystemOptions = {
  /** 1 = full detail (desktop), lower = lighter (mobile / low-end). */
  detail: number;
  shadows: boolean;
};

export type SystemModel = {
  root: THREE.Group;
  levels: THREE.Group[];
  update: (state: SceneState, time: number) => void;
  dispose: () => void;
};

function rimGeometry(): THREE.BufferGeometry {
  const half = W / 2 - BEAM / 2;
  const parts = [
    new THREE.BoxGeometry(W, BEAM, BEAM).translate(0, 0, -half),
    new THREE.BoxGeometry(W, BEAM, BEAM).translate(0, 0, half),
    new THREE.BoxGeometry(BEAM, BEAM, W - 2 * BEAM).translate(-half, 0, 0),
    new THREE.BoxGeometry(BEAM, BEAM, W - 2 * BEAM).translate(half, 0, 0),
  ];
  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return merged ?? new THREE.BufferGeometry();
}

export function createSystem({ detail, shadows }: SystemOptions): SystemModel {
  const root = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(o: T): T => {
    disposables.push(o);
    return o;
  };

  /* Materials ──────────────────────────────────────────────────── */
  const materials: Record<MaterialKey | "plate", THREE.Material> = {
    plate: track(new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 1, roughness: 0.4 })),
    module: track(new THREE.MeshStandardMaterial({ color: 0x3c3c3c, metalness: 0.72, roughness: 0.42 })),
    polished: track(new THREE.MeshStandardMaterial({ color: 0xbdbdbd, metalness: 1, roughness: 0.24 })),
    core: track(new THREE.MeshStandardMaterial({ color: 0x0c0c0c, metalness: 1, roughness: 0.2 })),
    // Reflection-only "glass": black metal blended additively — sheen without darkening.
    glass: track(
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.08,
        envMapIntensity: 0.45,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    ),
    light: track(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })),
  };
  const edgeMaterial = track(new THREE.LineBasicMaterial({ color: 0xc8c8c8, transparent: true, opacity: 0.5 }));

  /* Shared geometry ────────────────────────────────────────────── */
  const unit = track(new THREE.BoxGeometry(1, 1, 1));
  const plateGeo = track(new THREE.BoxGeometry(W, PLATE, W));
  const plateEdges = track(new THREE.EdgesGeometry(plateGeo));
  const rimGeo = track(rimGeometry());

  /* Levels ─────────────────────────────────────────────────────── */
  const specsByLevel = buildLevels(detail);
  const levels: THREE.Group[] = [];
  const instanced: Array<{ mesh: THREE.InstancedMesh; specs: ModuleSpec[] }> = [];

  specsByLevel.forEach((specs) => {
    const group = new THREE.Group();

    const plate = new THREE.Mesh(plateGeo, materials.plate);
    plate.position.y = PLATE / 2;
    plate.castShadow = shadows;
    plate.receiveShadow = shadows;

    const edges = new THREE.LineSegments(plateEdges, edgeMaterial);
    edges.position.y = PLATE / 2;

    const rim = new THREE.Mesh(rimGeo, materials.polished);
    rim.position.y = PLATE + BEAM / 2;
    rim.castShadow = shadows;

    group.add(plate, edges, rim);

    (["module", "polished", "core", "glass", "light"] as MaterialKey[]).forEach((key) => {
      const subset = specs.filter((s) => s.mat === key);
      if (!subset.length) return;
      const mesh = new THREE.InstancedMesh(unit, materials[key], subset.length);
      mesh.castShadow = shadows && key !== "glass" && key !== "light";
      mesh.receiveShadow = shadows && key !== "light";
      mesh.frustumCulled = false;
      group.add(mesh);
      instanced.push({ mesh, specs: subset });
    });

    levels.push(group);
    root.add(group);
  });

  /* Frame: columns + roof ring ─────────────────────────────────── */
  const columns = new THREE.InstancedMesh(unit, materials.polished, 4);
  columns.castShadow = shadows;
  columns.frustumCulled = false;
  const roof = new THREE.Mesh(rimGeo, materials.polished);
  roof.castShadow = shadows;
  root.add(columns, roof);
  const corner = W / 2 - BEAM / 2;
  const columnXZ: Array<[number, number]> = [
    [-corner, -corner],
    [corner, -corner],
    [corner, corner],
    [-corner, corner],
  ];

  /* Dark-glass shell (scene 01) ────────────────────────────────── */
  const shellMaterial = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x060606,
      metalness: 0.4,
      roughness: 0.07,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    }),
  );
  const shellEdgeMaterial = track(new THREE.LineBasicMaterial({ color: 0xe8e8e8, transparent: true, opacity: 0.7 }));
  const shell = new THREE.Mesh(unit, shellMaterial);
  shell.renderOrder = 2;
  const shellEdgesGeo = track(new THREE.EdgesGeometry(unit));
  const shellEdges = new THREE.LineSegments(shellEdgesGeo, shellEdgeMaterial);
  shell.add(shellEdges);
  root.add(shell);

  /* Connections between levels (scenes 02–03) ──────────────────── */
  type Segment = { gap: number; from: [number, number]; to: [number, number]; seed: number; accent: number };
  const segments: Segment[] = [];
  GAP_CONDUITS.forEach((ids, gap) => {
    ids.forEach((id, k) => {
      segments.push({
        gap,
        from: CONDUITS[id],
        to: CONDUITS[id],
        seed: hash(gap * 10 + k) * 0.6 + gap * 0.12,
        accent: ACCENT_CONDUITS.has(`${gap}:${id}`) ? 1 : 0,
      });
    });
    const [a, b] = GAP_BRACES[gap];
    segments.push({ gap, from: CONDUITS[a], to: CONDUITS[b], seed: 0.55 + gap * 0.1, accent: 0 });
  });

  const linePositions = new Float32Array(segments.length * 6);
  const lineT = new Float32Array(segments.length * 2);
  const lineSeed = new Float32Array(segments.length * 2);
  const lineAccent = new Float32Array(segments.length * 2);
  segments.forEach((s, i) => {
    lineT[i * 2] = 0;
    lineT[i * 2 + 1] = 1;
    lineSeed[i * 2] = lineSeed[i * 2 + 1] = s.seed;
    lineAccent[i * 2] = lineAccent[i * 2 + 1] = s.accent;
  });
  const lineGeo = track(new THREE.BufferGeometry());
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
  lineGeo.setAttribute("aT", new THREE.BufferAttribute(lineT, 1));
  lineGeo.setAttribute("aSeed", new THREE.BufferAttribute(lineSeed, 1));
  lineGeo.setAttribute("aAccent", new THREE.BufferAttribute(lineAccent, 1));
  const lineUniforms = {
    uDraw: { value: 0 },
    uPulse: { value: 0 },
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uBase: { value: new THREE.Color(0xb4b4b4) },
    uBright: { value: new THREE.Color(0xffffff) },
    uAccent: { value: new THREE.Color(brand.accent) },
  };
  const lineMaterial = track(
    new THREE.ShaderMaterial({
      uniforms: lineUniforms,
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  const lines = new THREE.LineSegments(lineGeo, lineMaterial);
  lines.frustumCulled = false;
  lines.renderOrder = 3;
  root.add(lines);

  // Connection nodes at both ends of every conduit.
  const nodes = new THREE.InstancedMesh(unit, materials.polished, segments.length * 2);
  nodes.frustumCulled = false;
  root.add(nodes);

  /* Ground: drafting grid, soft contact shadow, optional real shadows ── */
  const floorUniforms = { uOpacity: { value: 0.5 }, uColor: { value: new THREE.Color(0x9a9a9a) } };
  const floorMaterial = track(
    new THREE.ShaderMaterial({
      uniforms: floorUniforms,
      vertexShader: floorVertex,
      fragmentShader: floorFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  const floorGeo = track(new THREE.PlaneGeometry(26, 26));
  const floor = new THREE.Mesh(floorGeo, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  root.add(floor);

  const blobUniforms = { uOpacity: { value: 0.85 } };
  const blobMaterial = track(
    new THREE.ShaderMaterial({
      uniforms: blobUniforms,
      vertexShader: blobVertex,
      fragmentShader: blobFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  const blobGeo = track(new THREE.PlaneGeometry(6.2, 6.2));
  const blob = new THREE.Mesh(blobGeo, blobMaterial);
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = FLOOR_Y + 0.004;
  root.add(blob);

  if (shadows) {
    const shadowMaterial = track(new THREE.ShadowMaterial({ opacity: 0.45 }));
    const receiver = new THREE.Mesh(floorGeo, shadowMaterial);
    receiver.rotation.x = -Math.PI / 2;
    receiver.position.y = FLOOR_Y + 0.002;
    receiver.receiveShadow = true;
    root.add(receiver);
  }

  /* Dimension annotation (architectural drawing detail) ───────────── */
  const dimPositions = new Float32Array((1 + 2 + 4) * 6);
  const dimGeo = track(new THREE.BufferGeometry());
  dimGeo.setAttribute("position", new THREE.BufferAttribute(dimPositions, 3).setUsage(THREE.DynamicDrawUsage));
  const dimMaterial = track(new THREE.LineBasicMaterial({ color: 0xbdbdbd, transparent: true, opacity: 0 }));
  const dimension = new THREE.LineSegments(dimGeo, dimMaterial);
  dimension.frustumCulled = false;
  root.add(dimension);

  /* Per-frame update ───────────────────────────────────────────── */
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const yAxis = new THREE.Vector3(0, 1, 0);
  let lastAlign = -1;

  const writeModules = (align: number) => {
    const scatter = 1 - align;
    for (const { mesh, specs } of instanced) {
      specs.forEach((s, i) => {
        p.set(s.x + (s.dx ?? 0) * scatter, PLATE + (s.lift ?? 0) + s.h / 2, s.z + (s.dz ?? 0) * scatter);
        q.setFromAxisAngle(yAxis, s.ry ?? 0);
        sc.set(s.w, s.h, s.d);
        m.compose(p, q, sc);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  };

  const update = (state: SceneState, time: number) => {
    const { spacing } = state;
    levels.forEach((g, i) => {
      g.position.y = levelBase(i, spacing);
    });

    if (Math.abs(state.align - lastAlign) > 1e-4) {
      writeModules(state.align);
      lastAlign = state.align;
    }

    // Frame
    const bottom = levelBase(0, spacing);
    const top = levelBase(3, spacing) + PLATE + ROOF;
    q.identity();
    columnXZ.forEach(([x, z], i) => {
      p.set(x, (bottom + top) / 2, z);
      sc.set(BEAM, top - bottom, BEAM);
      m.compose(p, q, sc);
      columns.setMatrixAt(i, m);
    });
    columns.instanceMatrix.needsUpdate = true;
    roof.position.y = top - BEAM / 2;

    // Shell dissolves outward
    const open = 1 - state.shell;
    shell.visible = state.shell > 0.002;
    shellMaterial.opacity = 0.62 * state.shell;
    shellEdgeMaterial.opacity = 0.75 * state.shell;
    const grow = open * 0.7;
    shell.scale.set(W + 0.12 + grow, top - bottom + 0.12 + grow, W + 0.12 + grow);
    shell.position.y = (top + bottom) / 2;

    // Connections follow the levels
    segments.forEach((s, i) => {
      const y0 = levelBase(s.gap, spacing) + PLATE;
      const y1 = levelBase(s.gap + 1, spacing);
      linePositions.set([s.from[0], y0, s.from[1], s.to[0], y1, s.to[1]], i * 6);
      const pop = Math.min(1, Math.max(0, (state.connect - s.seed * 0.5) / 0.25));
      const size = 0.055 * pop;
      sc.set(size, size, size);
      p.set(s.from[0], y0 + size / 2, s.from[1]);
      m.compose(p, q, sc);
      nodes.setMatrixAt(i * 2, m);
      p.set(s.to[0], y1 - size / 2, s.to[1]);
      m.compose(p, q, sc);
      nodes.setMatrixAt(i * 2 + 1, m);
    });
    lineGeo.attributes.position.needsUpdate = true;
    nodes.instanceMatrix.needsUpdate = true;
    lineUniforms.uDraw.value = state.draw;
    lineUniforms.uPulse.value = state.connect;
    lineUniforms.uTime.value = time;
    lineUniforms.uOpacity.value = Math.min(1, state.draw * 3) * (0.55 + 0.45 * state.connect);

    // Annotation: vertical dimension line with level ticks
    const dx = W / 2 + 0.5;
    const dz = -W / 2 - 0.5;
    let k = 0;
    const seg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => {
      dimPositions.set([ax, ay, az, bx, by, bz], k);
      k += 6;
    };
    seg(dx, bottom, dz, dx, top, dz);
    seg(dx - 0.09, bottom, dz, dx + 0.09, bottom, dz);
    seg(dx - 0.09, top, dz, dx + 0.09, top, dz);
    for (let i = 0; i < 4; i++) {
      const y = levelBase(i, spacing) + PLATE;
      seg(dx - 0.05, y, dz, dx + 0.05, y, dz);
    }
    dimGeo.attributes.position.needsUpdate = true;
    dimMaterial.opacity = 0.6 * state.annotate;
    dimension.visible = state.annotate > 0.01;

    floorUniforms.uOpacity.value = 0.32 + 0.4 * state.annotate;

    // Breathing idle drift
    root.rotation.y = Math.sin(time * 0.12) * 0.035;
  };

  return {
    root,
    levels,
    update,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
      instanced.forEach(({ mesh }) => mesh.dispose());
      columns.dispose();
      nodes.dispose();
    },
  };
}
