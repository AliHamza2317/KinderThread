"use client";

/**
 * "The Edit": photographs mounted on a slowly turning ring. Drag (or use the
 * buttons) to turn it; tap the front photo to open that collection.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { createImageMaterial } from "./image-material";

export type RingItem = { src: string; href: string; label: string };

const R = 4;
const H = 2.75;
const FOV = 30;

export type RingControl = { target: number; current: number; dragging: boolean };

function Panel({ tex, i, count, ring, onSelect }: { tex: THREE.Texture; i: number; count: number; ring: React.RefObject<RingControl>; onSelect: (i: number) => void }) {
  const step = (Math.PI * 2) / count;
  const gap = step * 0.14;
  const len = step - gap;
  const arcW = R * len;
  const mat = useMemo(() => createImageMaterial(tex, [arcW, H], arcW * 0.07), [tex, arcW]);
  const geo = useMemo(() => new THREE.CylinderGeometry(R, R, H, 24, 8, true, i * step - len / 2, len), [i, step, len]);
  const hover = useRef(0);
  const target = useRef(0);
  useFrame((state, delta) => {
    hover.current = THREE.MathUtils.damp(hover.current, target.current, 6, delta);
    const a = i * step - ring.current.current;
    const facing = Math.cos(a);
    mat.uniforms.uOpacity.value = THREE.MathUtils.clamp((facing - 0.18) / 0.5, 0, 1);
    mat.uniforms.uHover.value = hover.current * 0.6;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh
      geometry={geo}
      material={mat}
      onPointerOver={(e) => {
        e.stopPropagation();
        target.current = 1;
      }}
      onPointerOut={() => (target.current = 0)}
      onClick={(e) => {
        e.stopPropagation();
        if (Math.abs(e.delta) > 6) return; // ignore clicks that ended a drag
        onSelect(i);
      }}
    />
  );
}

function Ring({ items, ring, onSelect }: { items: RingItem[]; ring: React.RefObject<RingControl>; onSelect: (i: number) => void }) {
  const textures = useTexture(items.map((i) => i.src));
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  useFrame((state, delta) => {
    const r = ring.current;
    r.current = THREE.MathUtils.damp(r.current, r.target, r.dragging ? 12 : 3.2, delta);
    if (group.current) {
      // CylinderGeometry measures angles from +z, so turning the group by -angle brings panel i to the front
      group.current.rotation.y = -r.current;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.012;
    }
    // keep the front photo comfortably inside the frame on narrow screens
    const aspect = size.width / size.height;
    const arc = (R * Math.PI * 2) / items.length;
    const fit = (arc * 1.35) / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)) / aspect;
    const dist = Math.max(6.4, fit);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, R + dist, 4, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.35, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.35 + state.pointer.y * 0.2, 3, delta);
    camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={group}>
      {textures.map((t, i) => (
        <Panel key={i} tex={t} i={i} count={items.length} ring={ring} onSelect={onSelect} />
      ))}
    </group>
  );
}

export default function RingCarousel({ items, active, ring, onSelect }: { items: RingItem[]; active: boolean; ring: React.RefObject<RingControl>; onSelect: (i: number) => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.35, R + 8], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Ring items={items} ring={ring} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
