"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { StudioEnvironment } from "./StudioEnvironment";
import { createSystem } from "./SystemModel";
import { sceneState, type SceneTier } from "./choreography";
import { FOOTPRINT, PLATE } from "./system-geometry";

export type SceneProgress = { value: number };
export type PointerState = { x: number; y: number };

export type SystemSceneProps = {
  /** Scroll progress of the intro (0–1), written by ScrollIntro. */
  progress: RefObject<SceneProgress>;
  /** Normalised pointer position (-1…1), desktop only. */
  pointer: RefObject<PointerState>;
  /** DOM labels projected onto the four levels (top → bottom). */
  labels: RefObject<Array<HTMLElement | null>>;
  tier: SceneTier;
  /** false = reduced motion: render a still composition on demand only. */
  animate: boolean;
  /** false = section offscreen: stop rendering entirely. */
  active: boolean;
  onReady: () => void;
};

const DPR: Record<SceneTier, [number, number]> = {
  high: [1, 1.75],
  mobile: [1, 1.5],
  low: [1, 1.25],
};

/**
 * The WebGL canvas for the intro. Loaded lazily (client only) by ScrollIntro.
 */
export default function SystemScene(props: SystemSceneProps) {
  const { tier, active, animate } = props;
  return (
    <Canvas
      dpr={DPR[tier]}
      frameloop={!active ? "never" : animate ? "always" : "demand"}
      shadows={tier === "high" ? "percentage" : false}
      camera={{ fov: 26, near: 0.1, far: 80, position: [6, 4, 9] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
        gl.setClearColor(0x000000, 0);
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <StudioEnvironment />
      <directionalLight
        position={[3.5, 7.5, 4.5]}
        intensity={1.5}
        castShadow={tier === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3.4}
        shadow-camera-right={3.4}
        shadow-camera-top={3.4}
        shadow-camera-bottom={-3.4}
        shadow-camera-near={2}
        shadow-camera-far={18}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <ambientLight intensity={0.06} />
      <Rig {...props} />
    </Canvas>
  );
}

const CORNERS: Array<[number, number]> = [
  [-FOOTPRINT / 2, -FOOTPRINT / 2],
  [FOOTPRINT / 2, -FOOTPRINT / 2],
  [FOOTPRINT / 2, FOOTPRINT / 2],
  [-FOOTPRINT / 2, FOOTPRINT / 2],
];

/** Imperative DOM write for a projected label (kept outside React render). */
function placeLabel(el: HTMLElement, x: number, y: number, opacity: number) {
  if (opacity <= 0) {
    if (el.style.opacity !== "0") el.style.opacity = "0";
    return;
  }
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  el.style.opacity = opacity.toFixed(3);
}

function Rig({ progress, pointer, labels, tier, animate, onReady }: SystemSceneProps) {
  const setDpr = useThree((s) => s.setDpr);
  const invalidate = useThree((s) => s.invalidate);

  const system = useMemo(() => createSystem({ detail: tier === "high" ? 1 : 0.6, shadows: tier === "high" }), [tier]);
  useEffect(() => () => system.dispose(), [system]);

  const loop = useRef({
    p: progress.current?.value ?? 0,
    px: 0,
    py: 0,
    time: 0,
    frames: 0,
    ready: false,
    sampleTime: 0,
    sampleFrames: 0,
    dpr: DPR[tier][1],
  });
  const v = useMemo(() => new THREE.Vector3(), []);

  // Reduced motion renders on demand: re-render whenever the target changes.
  useEffect(() => {
    if (animate) return;
    const id = window.setInterval(() => {
      if (Math.abs((progress.current?.value ?? 0) - loop.current.p) > 1e-4) invalidate();
    }, 250);
    return () => window.clearInterval(id);
  }, [animate, invalidate, progress]);

  useFrame((frame, delta) => {
    const camera = frame.camera as THREE.PerspectiveCamera;
    const { scene, size } = frame;
    const st = loop.current;
    const dt = Math.min(delta, 0.05);
    const target = progress.current?.value ?? 0;

    if (animate) {
      st.p += (target - st.p) * (1 - Math.exp(-dt * 6));
      st.time += dt;
      const ptr = pointer.current;
      st.px += ((ptr?.x ?? 0) - st.px) * (1 - Math.exp(-dt * 2.5));
      st.py += ((ptr?.y ?? 0) - st.py) * (1 - Math.exp(-dt * 2.5));
    } else {
      st.p = target;
    }

    const state = sceneState(st.p, tier);
    system.update(state, st.time);

    // Camera orbit + lens shift.
    const az = state.camera.azimuth + st.px * 0.05;
    const el = state.camera.elevation + st.py * 0.035;
    const d = state.camera.distance;
    camera.position.set(
      d * Math.cos(el) * Math.sin(az),
      state.camera.targetY + d * Math.sin(el),
      d * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(0, state.camera.targetY, 0);
    // Lens shift: fraction of frame width → film offset (mm) for the current aspect.
    const skew =
      -state.camera.shift * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect * camera.getFilmWidth();
    if (Math.abs(camera.filmOffset - skew) > 1e-4) {
      camera.filmOffset = skew;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();

    // Slow sweep of the studio lights across the metal.
    scene.environmentRotation.y = st.time * 0.035;

    // Project the four layer labels onto the left-most corner of each level.
    const els = labels.current;
    if (els) {
      system.root.updateMatrixWorld();
      for (let i = 0; i < 4; i++) {
        const el = els[i];
        if (!el) continue;
        const opacity = state.labels[i];
        if (opacity < 0.004) {
          placeLabel(el, 0, 0, 0);
          continue;
        }
        const level = system.levels[3 - i];
        let minX = Infinity;
        let atY = 0;
        for (const [cx, cz] of CORNERS) {
          v.set(cx, PLATE / 2, cz);
          level.localToWorld(v);
          v.project(camera);
          const sx = (v.x * 0.5 + 0.5) * size.width;
          if (sx < minX) {
            minX = sx;
            atY = (-v.y * 0.5 + 0.5) * size.height;
          }
        }
        // Fade labels that drift under the navigation or off the bottom edge.
        const edge = Math.min(1, Math.max(0, (atY - 110) / 70), Math.max(0, (size.height - 40 - atY) / 70));
        // Keep the label text inside the viewport on narrow screens.
        const width = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
        placeLabel(el, Math.max(minX, width + 14), atY, opacity * edge);
      }
    }

    st.frames += 1;
    if (!st.ready && st.frames > (animate ? 2 : 0)) {
      st.ready = true;
      onReady();
    }

    // Adaptive resolution: step the pixel ratio down if frames are slow.
    if (animate && st.ready) {
      st.sampleTime += delta;
      st.sampleFrames += 1;
      if (st.sampleFrames >= 90) {
        const avg = st.sampleTime / st.sampleFrames;
        if (avg > 1 / 45 && st.dpr > 1) {
          st.dpr = Math.max(1, st.dpr - 0.25);
          setDpr(st.dpr);
        }
        st.sampleTime = 0;
        st.sampleFrames = 0;
      }
    }
  });

  return <primitive object={system.root} />;
}
