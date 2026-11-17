"use client";

/**
 * Hero scene: real photographs floating in 3D depth around the headline.
 * Mouse = parallax by depth, hover = soft cloth ripple + zoom, scroll = the
 * camera glides forward through the gallery as the hero leaves the screen.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createImageMaterial } from "./image-material";

export type GalleryItem = { src: string; href: string; label: string };

const CAM_Z = 10;
const FOV = 35;
const halfH = (z: number) => (CAM_Z - z) * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

// normalised screen positions (x, y in -1..1) + depth; text lives in the middle
const DESKTOP: [number, number, number, number][] = [
  [-0.8, 0.5, -1.2, 1],
  [-0.56, -0.6, 0.6, 0.85],
  [-0.95, -0.3, -3.2, 1.1],
  [0.8, 0.52, -0.6, 0.95],
  [0.6, -0.58, 1.1, 0.8],
  [0.95, -0.12, -2.8, 1.1],
  [-0.36, 0.6, -5, 0.8],
  [0.4, 0.62, -4.4, 0.75],
];
// phones: the copy sits low, so the photographs gather in the upper half
const MOBILE: [number, number, number, number][] = [
  [-0.62, 0.5, -0.5, 1],
  [0.62, 0.56, 0.2, 0.95],
  [0.02, 0.3, -2.6, 1],
  [-0.9, 0.06, -3, 0.9],
  [0.9, 0.1, -2.6, 0.9],
  [0.1, 0.74, -5, 0.8],
];

type Shared = { onHover: (label: string | null) => void; onSelect: (href: string) => void; scroll: React.RefObject<number>; play: boolean; segments: number };

function Plane({ item, index, layout, onHover, onSelect, scroll, play, segments }: Shared & { item: GalleryItem & { tex: THREE.Texture }; index: number; layout: [number, number, number, number] }) {
  const { size, gl } = useThree();
  const aspect = size.width / size.height;
  const [nx, ny, z, k] = layout;
  const h = halfH(z);
  const w = h * aspect;
  const planeH = h * 0.42 * k * (aspect < 1 ? 0.95 : 1);
  const planeW = planeH * 0.8;
  const mat = useMemo(() => createImageMaterial(item.tex, [planeW, planeH], planeW * 0.08), [item.tex, planeW, planeH]);
  const mesh = useRef<THREE.Mesh>(null);
  const hover = useRef(0);
  const target = useRef(0);
  const intro = useRef({ v: 0 });
  const base = useMemo(() => new THREE.Vector3(nx * (w - planeW * 0.6), ny * (h - planeH * 0.55), z), [nx, ny, z, w, h, planeW, planeH]);

  useEffect(() => {
    if (!play) return;
    const a = gsap.fromTo(intro.current, { v: 0 }, { v: 1, duration: 1.4, delay: 0.15 + index * 0.08, ease: "power2.out" });
    const b = mesh.current && gsap.fromTo(mesh.current.scale, { x: 0.6, y: 0.6, z: 1 }, { x: 1, y: 1, z: 1, duration: 1.8, delay: 0.1 + index * 0.08, ease: "expo.out" });
    return () => {
      a.kill();
      if (b) b.kill();
    };
  }, [index, play]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const m = mesh.current;
    if (!m) return;
    hover.current = THREE.MathUtils.damp(hover.current, target.current, 6, delta);
    mat.uniforms.uTime.value = t;
    mat.uniforms.uHover.value = hover.current;
    mat.uniforms.uWave.value = 0.5 + Math.abs(scroll.current) * 2;
    const depth = (CAM_Z - z) / CAM_Z;
    m.position.set(
      base.x + state.pointer.x * 0.35 * (1.2 - depth),
      base.y + Math.sin(t * 0.55 + index * 1.3) * 0.08 + state.pointer.y * 0.25 * (1.2 - depth),
      base.z,
    );
    m.rotation.y = THREE.MathUtils.damp(m.rotation.y, state.pointer.x * 0.12 + (hover.current * 0.05), 4, delta);
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, -state.pointer.y * 0.08, 4, delta);
    // fade planes that the camera is about to pass
    const camZ = state.camera.position.z;
    const fade = THREE.MathUtils.clamp((camZ - z - 1.2) / 2.5, 0, 1);
    m.visible = fade > 0.01;
    mat.uniforms.uOpacity.value = intro.current.v * fade;
  });

  return (
    <mesh
      ref={mesh}
      material={mat}
      onPointerOver={(e) => {
        e.stopPropagation();
        target.current = 1;
        if (!document.documentElement.classList.contains("has-custom-cursor")) gl.domElement.style.cursor = "pointer";
        onHover(item.label);
      }}
      onPointerOut={() => {
        target.current = 0;
        gl.domElement.style.cursor = "";
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        gl.domElement.style.cursor = "";
        onSelect(item.href);
      }}
    >
      <planeGeometry args={[planeW, planeH, segments, segments]} />
    </mesh>
  );
}

function Scene({ items, lite, ...shared }: Shared & { items: GalleryItem[]; lite: boolean }) {
  const textures = useTexture(items.map((i) => i.src));
  const { size, camera } = useThree();
  const layouts = size.width / size.height < 1 ? MOBILE : lite ? DESKTOP.slice(0, 6) : DESKTOP;
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  useFrame((_, delta) => {
    // glide forward through the gallery as the hero scrolls away
    const targetZ = CAM_Z - shared.scroll.current * 7;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 5, delta);
  });
  return (
    <>
      {layouts.map((layout, i) => {
        const item = items[i % items.length];
        return <Plane key={i} index={i} layout={layout} item={{ ...item, tex: textures[i % items.length] }} {...shared} />;
      })}
    </>
  );
}

export default function FloatingGallery({
  items,
  active,
  play,
  lite = false,
  onHover,
  scroll,
}: {
  items: GalleryItem[];
  active: boolean;
  play: boolean;
  lite?: boolean;
  onHover: (l: string | null) => void;
  scroll: React.RefObject<number>;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      className={ready ? "opacity-100 transition-opacity duration-700" : "opacity-0"}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 50 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => setReady(true)}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Scene items={items} lite={lite} onHover={onHover} onSelect={(href) => router.push(href)} scroll={scroll} play={play} segments={lite ? 12 : 24} />
      </Suspense>
    </Canvas>
  );
}
