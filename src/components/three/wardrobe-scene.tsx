"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { GARMENT_OUTLINE, type GarmentKind } from "@/lib/garment-paths";
import { plush } from "./materials";

export type WardrobeSlot = { key: string; garment: GarmentKind; color: string };

const PAINT = "#cbd9b8";
const PAINT_DARK = "#b4c69e";
const WOOD = "#d4a574";
const INSIDE = "#fbf3e3";

const geoCache = new Map<GarmentKind, THREE.ExtrudeGeometry>();
function garmentGeometry(kind: GarmentKind) {
  const hit = geoCache.get(kind);
  if (hit) return hit;
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${GARMENT_OUTLINE[kind]}"/></svg>`);
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
  const g = new THREE.ExtrudeGeometry(shapes, { depth: 18, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 4, curveSegments: 18 });
  g.scale(1, -1, 1); // SVG y points down
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  // hang from the top centre (shoulders)
  g.translate(-(bb.min.x + bb.max.x) / 2, -bb.max.y, -9);
  g.computeVertexNormals();
  geoCache.set(kind, g);
  return g;
}

function Hanger({ slot, x, selected, onSelect, index }: { slot: WardrobeSlot; x: number; selected: boolean; onSelect: () => void; index: number }) {
  const group = useRef<THREE.Group>(null);
  const mat = useMemo(() => plush(slot.color, { sheen: "#ffffff", bump: 1.1 }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.55 }), []);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c7a46a", roughness: 0.35, metalness: 0.6 }), []);
  const hook = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.07, 0.25, 0), new THREE.Vector3(0.14, 0.2, 0)]);
    return new THREE.TubeGeometry(curve, 24, 0.016, 8, false);
  }, []);
  const bar = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.5, -0.12, 0), new THREE.Vector3(0, 0.12, 0), new THREE.Vector3(0.5, -0.12, 0));
    return new THREE.TubeGeometry(curve, 30, 0.035, 10, false);
  }, []);

  // recolour smoothly when the selected colour changes
  useEffect(() => {
    const c = new THREE.Color(slot.color);
    gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: 0.6, ease: "power2.out" });
  }, [slot.color, mat]);

  useEffect(() => {
    if (!group.current) return;
    gsap.to(group.current.position, { z: selected ? 0.55 : 0, duration: 0.8, ease: "expo.out" });
    gsap.to(group.current.scale, { x: selected ? 1.08 : 0.94, y: selected ? 1.08 : 0.94, z: selected ? 1.08 : 0.94, duration: 0.8, ease: "expo.out" });
  }, [selected]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = selected ? Math.sin(t * 0.9) * 0.22 : Math.sin(t * 0.6 + index) * 0.04;
    group.current.rotation.z = Math.sin(t * 0.8 + index * 1.3) * 0.02;
  });

  const { gl } = useThree();
  const scale = 0.00205;
  return (
    <group position={[x, 1.08, 0]}>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          gl.domElement.style.cursor = "pointer";
        }}
        onPointerOut={() => (gl.domElement.style.cursor = "")}
      >
        <mesh geometry={hook} material={metal} />
        <mesh geometry={bar} material={wood} position={[0, -0.02, 0]} castShadow />
        <mesh geometry={garmentGeometry(slot.garment)} material={mat} scale={[scale, scale, scale]} position={[0, -0.05, 0]} castShadow />
      </group>
    </group>
  );
}

function Door({ side, open }: { side: -1 | 1; open: boolean }) {
  const pivot = useRef<THREE.Group>(null);
  const paint = useMemo(() => plush(PAINT, { sheen: "#ffffff", bump: 0.25, roughness: 0.6 }), []);
  const knob = useMemo(() => new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.4 }), []);
  const heart = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.18);
    s.bezierCurveTo(-0.3, 0.02, -0.16, 0.24, 0, 0.1);
    s.bezierCurveTo(0.16, 0.24, 0.3, 0.02, 0, -0.18);
    return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
  }, []);
  const heartMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f4a88c", roughness: 0.7 }), []);
  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: PAINT_DARK, roughness: 0.8 }), []);
  const W = 2.05;
  useEffect(() => {
    if (!pivot.current) return;
    gsap.to(pivot.current.rotation, { y: open ? side * -1.72 : 0, duration: 1.6, ease: "expo.inOut", delay: open ? 0.15 : 0 });
  }, [open, side]);
  return (
    <group ref={pivot} position={[side * -2.12, 0, 0.82]}>
      <group position={[side * (W / 2), 0, 0]}>
        <RoundedBox args={[W, 3.3, 0.1]} radius={0.04} smoothness={3} material={paint} castShadow />
        <RoundedBox args={[W - 0.36, 2.9, 0.04]} radius={0.03} position={[0, 0, 0.06]} material={panelMat} />
        <mesh position={[side * (W / 2 - 0.22), 0, 0.12]} material={knob}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
        <mesh geometry={heart} material={heartMat} position={[0, 0.85, 0.09]} />
      </group>
    </group>
  );
}

function Cabinet() {
  const paint = useMemo(() => plush(PAINT, { sheen: "#ffffff", bump: 0.25, roughness: 0.6 }), []);
  const inside = useMemo(() => new THREE.MeshStandardMaterial({ color: INSIDE, roughness: 0.9 }), []);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.5 }), []);
  const arch = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.25, 0);
    s.lineTo(-2.25, 0.12);
    s.quadraticCurveTo(0, 0.95, 2.25, 0.12);
    s.lineTo(2.25, 0);
    s.lineTo(-2.25, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 });
    g.translate(0, 0, -0.85);
    return g;
  }, []);
  return (
    <group>
      {/* back */}
      <mesh position={[0, 0, -0.78]} material={inside} receiveShadow>
        <boxGeometry args={[4.2, 3.4, 0.06]} />
      </mesh>
      {/* sides */}
      <RoundedBox args={[0.14, 3.5, 1.7]} radius={0.05} position={[-2.17, 0, 0]} material={paint} castShadow receiveShadow />
      <RoundedBox args={[0.14, 3.5, 1.7]} radius={0.05} position={[2.17, 0, 0]} material={paint} castShadow receiveShadow />
      {/* top with a playful arch, and plinth */}
      <RoundedBox args={[4.5, 0.16, 1.75]} radius={0.05} position={[0, 1.75, 0]} material={paint} castShadow />
      <mesh geometry={arch} material={paint} position={[0, 1.8, 0]} castShadow />
      <RoundedBox args={[4.5, 0.22, 1.75]} radius={0.06} position={[0, -1.8, 0]} material={paint} receiveShadow />
      {/* inner floor */}
      <mesh position={[0, -1.66, 0]} material={inside} receiveShadow>
        <boxGeometry args={[4.2, 0.04, 1.6]} />
      </mesh>
      {/* rail */}
      <mesh position={[0, 1.36, 0]} rotation={[0, 0, Math.PI / 2]} material={wood}>
        <cylinderGeometry args={[0.04, 0.04, 4.2, 16]} />
      </mesh>
      {/* little feet */}
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, -2.03, 0.5]} material={wood}>
          <cylinderGeometry args={[0.09, 0.07, 0.25, 16]} />
        </mesh>
      ))}
    </group>
  );
}

export default function WardrobeScene({ slots, selected, onSelect, open, active, rotateNonce = 0, tier }: { slots: WardrobeSlot[]; selected: number; onSelect: (i: number) => void; open: boolean; active: boolean; rotateNonce?: number; tier: "full" | "lite" }) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const xs = slots.map((_, i) => (i - (slots.length - 1) / 2) * 1.04);

  // keyboard / button rotation (+1 / -1 nonce steps)
  useEffect(() => {
    const c = controls.current;
    if (!c || !rotateNonce) return;
    const dir = rotateNonce > 0 ? 1 : -1;
    const az = THREE.MathUtils.clamp(c.getAzimuthalAngle() + dir * 0.3, -0.6, 0.6);
    c.setAzimuthalAngle(az);
    c.update();
  }, [rotateNonce]);

  return (
    <Canvas
      dpr={tier === "full" ? [1, 1.75] : [1, 1.25]}
      shadows={tier === "full"}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.4, 11.6], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <hemisphereLight args={["#fff8ee", "#e8dcc6", 1.25]} />
      <pointLight position={[0, 0.4, 1.2]} intensity={3.2} distance={6} decay={2} color="#fff1dc" />
      <directionalLight position={[3, 5, 6]} intensity={1.5} castShadow={tier === "full"} shadow-mapSize={[1024, 1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0004} />
      <Environment resolution={64}>
        <Lightformer intensity={1.3} position={[0, 4, 5]} scale={[10, 5, 1]} color="#fff6ea" />
        <Lightformer intensity={0.6} position={[-6, 1, 1]} scale={[3, 6, 1]} color="#fde6cf" />
      </Environment>
      <group scale={0.92} position={[0, -0.05, 0]}>
        <Cabinet />
        <Door side={-1} open={open} />
        <Door side={1} open={open} />
        {slots.map((s, i) => (
          <Hanger key={s.key} slot={s} x={xs[i]} index={i} selected={i === selected} onSelect={() => onSelect(i)} />
        ))}
      </group>
      <ContactShadows position={[0, -2.15, 0]} opacity={0.3} scale={12} blur={2.4} far={3} color="#5b3a26" frames={tier === "full" ? Infinity : 80} />
      <OrbitControls
        ref={controls}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minAzimuthAngle={-0.6}
        maxAzimuthAngle={0.6}
        minPolarAngle={Math.PI / 2 - 0.25}
        maxPolarAngle={Math.PI / 2 + 0.05}
        rotateSpeed={0.6}
        target={[0, 0.2, 0]}
        enableRotate={typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches}
      />
    </Canvas>
  );
}
