"use client";

import * as THREE from "three";

let fabricBump: THREE.Texture | null = null;

/** Procedural knit/plush bump texture — generated once, no download. */
export function getFabricBump() {
  if (fabricBump || typeof document === "undefined") return fabricBump;
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  // seeded noise so every load looks identical
  let s = 1337;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const knit = Math.sin((x / size) * Math.PI * 48) * 0.5 + 0.5;
      const v = 150 + rnd() * 70 + knit * 20;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  fabricBump = new THREE.CanvasTexture(c);
  fabricBump.wrapS = fabricBump.wrapT = THREE.RepeatWrapping;
  fabricBump.repeat.set(3, 3);
  return fabricBump;
}

export function plush(color: string, opts: { sheen?: string; roughness?: number; bump?: number } = {}) {
  const m = new THREE.MeshPhysicalMaterial({
    color,
    roughness: opts.roughness ?? 0.92,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(opts.sheen ?? "#fff3e4"),
  });
  const bump = getFabricBump();
  if (bump && opts.bump !== 0) {
    m.bumpMap = bump;
    m.bumpScale = opts.bump ?? 1.2;
  }
  return m;
}

export function glossy(color: string, roughness = 0.3) {
  return new THREE.MeshPhysicalMaterial({ color, roughness, clearcoat: 0.8, clearcoatRoughness: 0.25 });
}
