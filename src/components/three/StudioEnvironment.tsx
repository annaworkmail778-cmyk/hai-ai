"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type Softbox = {
  intensity: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
};

/**
 * Photographic studio lighting, baked once into a PMREM environment map:
 * a large top softbox, two long vertical strips (they draw the crisp edge
 * highlights on metal) and a faint back rim. Everything else is black,
 * which keeps reflections deep and contrasty.
 */
const SOFTBOXES: Softbox[] = [
  { intensity: 2.4, position: [0, 7, 0], rotation: [Math.PI / 2, 0, 0], scale: [7, 7] },
  { intensity: 4.2, position: [-7, 0.8, 1.5], rotation: [0, Math.PI / 2, 0], scale: [1.1, 12] },
  { intensity: 2.2, position: [7, 0.2, -1.5], rotation: [0, -Math.PI / 2, 0], scale: [0.7, 12] },
  { intensity: 1.2, position: [0, 2.5, -8], rotation: [0, 0, 0], scale: [14, 0.9] },
  { intensity: 0.35, position: [0, -3, 8], rotation: [0, Math.PI, 0], scale: [10, 1.6] },
];

export function StudioEnvironment() {
  const get = useThree((s) => s.get);

  useEffect(() => {
    const { gl, scene, invalidate } = get();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x000000);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.Material[] = [];

    // Soft-edged diffusion: bright core falling off towards the frame, like a
    // real softbox. Gives polished metal graded highlights instead of flat white.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.55, "#bdbdbd");
      g.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    }
    const falloff = new THREE.CanvasTexture(canvas);

    for (const box of SOFTBOXES) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 1).multiplyScalar(box.intensity),
        map: falloff,
        side: THREE.DoubleSide,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...box.position);
      mesh.rotation.set(...box.rotation);
      mesh.scale.set(box.scale[0], box.scale[1], 1);
      envScene.add(mesh);
    }

    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(envScene, 0.035);
    scene.environment = target.texture;
    scene.environmentIntensity = 1;
    // On-demand canvases (reduced motion) need a fresh frame with lighting.
    invalidate();

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      geometry.dispose();
      falloff.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [get]);

  return null;
}
