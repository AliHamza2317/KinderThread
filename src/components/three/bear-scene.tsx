"use client";

/**
 * The Peek-a-boo Bear — a procedural plush recreation of the bear in the
 * Kinder Thread logo. Built from primitives (no model download).
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { glossy, plush } from "./materials";

const COLORS = {
  fur: "#e6b183",
  furLight: "#f3d3b2",
  muzzle: "#fbefe0",
  cocoa: "#4a2e1e",
  cheek: "#f89776",
  ledge: "#8a9e72",
  stitch: "#fbf1de",
  sun: "#f9b52c",
  honey: "#edaf4b",
  coralButton: "#f4a88c",
  sageButton: "#a9bfaf",
};

type Tier = "full" | "lite";

/* ------------------------------------------------------------------ */

function useBearMaterials() {
  return useMemo(
    () => ({
      fur: plush(COLORS.fur, { sheen: "#ffe6cc" }),
      furLight: plush(COLORS.furLight, { sheen: "#fff4e6", bump: 0.6 }),
      muzzle: plush(COLORS.muzzle, { sheen: "#ffffff", bump: 0.5 }),
      cocoa: glossy(COLORS.cocoa, 0.35),
      line: new THREE.MeshStandardMaterial({ color: COLORS.cocoa, roughness: 0.6 }),
      cheek: new THREE.MeshStandardMaterial({ color: COLORS.cheek, roughness: 0.9, transparent: true, opacity: 0.75 }),
      ledge: plush(COLORS.ledge, { sheen: "#e7f0da", bump: 1.4 }),
      stitch: new THREE.MeshStandardMaterial({ color: COLORS.stitch, roughness: 0.8 }),
    }),
    [],
  );
}

/** Closed, smiling eye (∩) — exactly like the logo bear */
function HappyEye({ x, material }: { x: number; material: THREE.Material }) {
  return (
    <mesh position={[x, 0.25, 0.9]} rotation={[-0.25, x * 0.4, 0]} material={material}>
      <torusGeometry args={[0.115, 0.03, 12, 32, Math.PI]} />
    </mesh>
  );
}

function Bear({ tier, onReady }: { tier: Tier; onReady?: () => void }) {
  const m = useBearMaterials();
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const pawL = useRef<THREE.Group>(null);
  const pawR = useRef<THREE.Group>(null);
  const cheeks = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const waving = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  // track pointer across the whole window so the bear notices you everywhere in the hero
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // entrance: rise from behind the cushion, then paws grab the edge
  useEffect(() => {
    if (!root.current || !pawL.current || !pawR.current) return;
    const tl = gsap.timeline({ delay: 0.25, onComplete: onReady });
    root.current.position.y = -2.6;
    pawL.current.position.y = -0.9;
    pawR.current.position.y = -0.9;
    tl.to(root.current.position, { y: 0, duration: 1.25, ease: "back.out(1.6)" })
      .to(pawL.current.position, { y: 0, duration: 0.5, ease: "back.out(2.4)" }, "-=0.55")
      .to(pawR.current.position, { y: 0, duration: 0.5, ease: "back.out(2.4)" }, "-=0.38");
    return () => {
      tl.kill();
    };
  }, [onReady]);

  // occasional ear twitch
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const twitch = () => {
      const ear = Math.random() > 0.5 ? earL.current : earR.current;
      if (ear) gsap.fromTo(ear.rotation, { z: 0 }, { z: (ear === earL.current ? 1 : -1) * 0.28, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" });
      t = setTimeout(twitch, 2600 + Math.random() * 4200);
    };
    t = setTimeout(twitch, 3200);
    return () => clearTimeout(t);
  }, []);

  const wave = () => {
    if (waving.current || !pawR.current) return;
    waving.current = true;
    const p = pawR.current;
    gsap
      .timeline({ onComplete: () => void (waving.current = false) })
      .to(p.position, { y: 0.85, x: 0.18, z: 0.25, duration: 0.35, ease: "power2.out" })
      .to(p.rotation, { z: 0.45, duration: 0.16, yoyo: true, repeat: 5, ease: "sine.inOut" }, "<0.2")
      .to(p.position, { y: 0, x: 0, z: 0, duration: 0.45, ease: "back.out(2)" });
    if (cheeks.current) gsap.fromTo(cheeks.current.scale, { x: 1, y: 1, z: 1 }, { x: 1.25, y: 1.25, z: 1.25, duration: 0.3, yoyo: true, repeat: 1 });
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    if (body.current) {
      const breathe = 1 + Math.sin(t * 1.6) * 0.012;
      body.current.scale.set(1, breathe, 1);
    }
    if (head.current) {
      const px = pointer.current.x;
      const py = pointer.current.y;
      const targetY = px * 0.42 + Math.sin(t * 0.5) * 0.04;
      const targetX = py * 0.22 + Math.sin(t * 0.8) * 0.02 - (hovered.current ? 0.08 : 0);
      const targetZ = -px * 0.08 + (hovered.current ? Math.sin(t * 6) * 0.04 : Math.sin(t * 0.7) * 0.03);
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, targetY, 4, d);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, targetX, 4, d);
      head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, targetZ, 4, d);
      head.current.position.y = 1.15 + Math.sin(t * 1.6 + 0.4) * 0.015;
    }
    if (cheeks.current && !waving.current) {
      const target = hovered.current ? 1.18 : 1;
      cheeks.current.scale.setScalar(THREE.MathUtils.damp(cheeks.current.scale.x, target, 6, d));
    }
  });

  const shadow = tier === "full";

  return (
    <group
      ref={root}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
        gl.domElement.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hovered.current = false;
        gl.domElement.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        wave();
      }}
    >
      {/* body (mostly hidden behind the cushion) */}
      <group ref={body}>
        <mesh position={[0, -0.45, -0.15]} scale={[1.08, 1, 0.85]} material={m.fur} castShadow={shadow}>
          <sphereGeometry args={[1.05, 48, 48]} />
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.15, 0]}>
        <mesh scale={[1.1, 0.96, 0.95]} material={m.fur} castShadow={shadow}>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
        {/* ears */}
        {([-1, 1] as const).map((s) => (
          <group key={s} ref={s < 0 ? earL : earR} position={[s * 0.8, 0.72, -0.05]}>
            <mesh scale={[1, 1, 0.62]} material={m.fur} castShadow={shadow}>
              <sphereGeometry args={[0.37, 32, 32]} />
            </mesh>
            <mesh position={[0, -0.02, 0.15]} scale={[1, 1, 0.45]} material={m.furLight}>
              <sphereGeometry args={[0.22, 24, 24]} />
            </mesh>
          </group>
        ))}
        {/* muzzle */}
        <mesh position={[0, -0.28, 0.72]} scale={[1.18, 0.86, 0.7]} material={m.muzzle}>
          <sphereGeometry args={[0.42, 40, 40]} />
        </mesh>
        {/* nose */}
        <mesh position={[0, -0.13, 1.02]} scale={[1.45, 1, 0.85]} material={m.cocoa}>
          <sphereGeometry args={[0.12, 24, 24]} />
        </mesh>
        {/* mouth: little "w" smile */}
        <mesh position={[0, -0.255, 1.035]} rotation={[0.35, 0, 0]} material={m.line}>
          <cylinderGeometry args={[0.017, 0.017, 0.11, 8]} />
        </mesh>
        {([-1, 1] as const).map((s) => (
          <mesh key={s} position={[s * 0.082, -0.31, 1.03]} rotation={[-0.35, s * 0.18, Math.PI]} material={m.line}>
            <torusGeometry args={[0.082, 0.019, 10, 24, Math.PI]} />
          </mesh>
        ))}
        {/* eyes */}
        <HappyEye x={-0.38} material={m.line} />
        <HappyEye x={0.38} material={m.line} />
        {/* cheeks */}
        <group ref={cheeks}>
          {([-1, 1] as const).map((s) => (
            <mesh key={s} position={[s * 0.62, -0.08, 0.74]} rotation={[0, s * 0.72, 0]} scale={[1, 0.72, 0.25]} material={m.cheek}>
              <sphereGeometry args={[0.16, 24, 24]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* arms + paws resting on the cushion */}
      {([-1, 1] as const).map((s) => (
        <group key={s} ref={s < 0 ? pawL : pawR}>
          <mesh position={[s * 0.82, -0.42, 0.25]} rotation={[1.25, 0, s * 0.12]} material={m.fur} castShadow={shadow}>
            <capsuleGeometry args={[0.27, 0.55, 8, 24]} />
          </mesh>
          <mesh position={[s * 0.84, -0.47, 0.72]} scale={[1.12, 0.78, 1]} material={m.fur} castShadow={shadow}>
            <sphereGeometry args={[0.32, 32, 32]} />
          </mesh>
          {/* toe lines like the logo paws */}
          {[-1, 1].map((k) => (
            <mesh key={k} position={[s * 0.84 + k * 0.09, -0.5, 1.02]} rotation={[0.3, 0, 0]} material={m.line}>
              <capsuleGeometry args={[0.012, 0.09, 4, 8]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Cushion({ tier }: { tier: Tier }) {
  const m = useBearMaterials();
  const ref = useRef<THREE.Group>(null);
  const stitches = useMemo(() => Array.from({ length: 20 }, (_, i) => -1.86 + i * 0.196), []);
  useEffect(() => {
    if (!ref.current) return;
    gsap.from(ref.current.scale, { x: 0.85, y: 0.6, z: 0.85, duration: 0.9, ease: "back.out(1.8)" });
  }, []);
  return (
    <group ref={ref} position={[0, -1.32, 0.05]}>
      <RoundedBox args={[4.3, 1.35, 1.7]} radius={0.42} smoothness={6} material={m.ledge} receiveShadow={tier === "full"} castShadow={tier === "full"} />
      {stitches.map((x) => (
        <mesh key={x} position={[x, 0.42, 0.86]} rotation={[0, 0, Math.PI / 2]} material={m.stitch}>
          <capsuleGeometry args={[0.022, 0.09, 4, 8]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------ floating details ------------------------------ */

function useFloat(ref: React.RefObject<THREE.Group | null>, base: [number, number, number], speed: number, amp: number, spin = 0.25) {
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.set(base[0], base[1] + Math.sin(t) * amp, base[2]);
    ref.current.rotation.y += spin * 0.01;
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.15;
  });
}

function PopIn({ children, delay }: { children: React.ReactNode; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.scale.setScalar(0.0001);
    const tw = gsap.to(ref.current.scale, { x: 1, y: 1, z: 1, duration: 0.8, delay, ease: "back.out(2.2)" });
    return () => {
      tw.kill();
    };
  }, [delay]);
  return <group ref={ref}>{children}</group>;
}

function SewingButton({ position, color, size = 1, delay }: { position: [number, number, number]; color: string; size?: number; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  useFloat(ref, position, 0.9 + size * 0.2, 0.12, 0.6);
  const mat = useMemo(() => plush(color, { sheen: "#ffffff", bump: 0.3, roughness: 0.55 }), [color]);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.62) }), [color]);
  const profile = useMemo(
    () => [new THREE.Vector2(0, 0.05), new THREE.Vector2(0.22, 0.05), new THREE.Vector2(0.3, 0.09), new THREE.Vector2(0.34, 0.04), new THREE.Vector2(0.33, -0.05), new THREE.Vector2(0, -0.06)],
    [],
  );
  return (
    <group ref={ref}>
      <PopIn delay={delay}>
        <group scale={size} rotation={[Math.PI / 2.4, 0, 0]}>
          <mesh material={mat}>
            <latheGeometry args={[profile, 40]} />
          </mesh>
          {[
            [-0.07, -0.07],
            [0.07, -0.07],
            [-0.07, 0.07],
            [0.07, 0.07],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.055, z]} material={dark}>
              <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
            </mesh>
          ))}
        </group>
      </PopIn>
    </group>
  );
}

function Star({ position, size = 1, delay }: { position: [number, number, number]; size?: number; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  useFloat(ref, position, 0.7, 0.15, 0.9);
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const r = 0.36;
    const k = 0.1;
    s.moveTo(0, r);
    s.quadraticCurveTo(k, k, r, 0);
    s.quadraticCurveTo(k, -k, 0, -r);
    s.quadraticCurveTo(-k, -k, -r, 0);
    s.quadraticCurveTo(-k, k, 0, r);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4, curveSegments: 16 });
    g.center();
    return g;
  }, []);
  const mat = useMemo(() => glossy(COLORS.sun, 0.45), []);
  return (
    <group ref={ref}>
      <PopIn delay={delay}>
        <mesh geometry={geo} material={mat} scale={size} />
      </PopIn>
    </group>
  );
}

/** The golden thread heart from the logo */
function ThreadHeart({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  useFloat(ref, position, 0.6, 0.1, 0.4);
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push(new THREE.Vector3(x / 40, y / 40, Math.sin(t * 2) * 0.03));
    }
    // a little tail of loose thread
    const tail = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.42, 0), new THREE.Vector3(0.18, -0.62, 0.05), new THREE.Vector3(-0.05, -0.85, 0), new THREE.Vector3(0.25, -1.05, -0.05)]);
    return { heart: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.022, 8, true), tail: new THREE.TubeGeometry(tail, 60, 0.02, 8, false) };
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.honey, roughness: 0.55 }), []);
  return (
    <group ref={ref}>
      <PopIn delay={delay}>
        <mesh geometry={geo.heart} material={mat} />
        <mesh geometry={geo.tail} material={mat} />
      </PopIn>
    </group>
  );
}

/** Three little ticks, as in the logo, beside the bear's head */
function Sparkle({ position, flip = false, delay }: { position: [number, number, number]; flip?: boolean; delay: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.sun, roughness: 0.5 }), []);
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 2.2 + (flip ? 1 : 0)) * 0.08);
  });
  const ticks: [number, number, number][] = [
    [0, 0.32, 0.15],
    [0.24, 0.16, -0.55],
    [0.3, -0.12, -1.15],
  ];
  return (
    <group position={position} scale={[flip ? -1 : 1, 1, 1]}>
      <PopIn delay={delay}>
        <group ref={ref}>
          {ticks.map(([x, y, r], i) => (
            <mesh key={i} position={[x, y, 0]} rotation={[0, 0, r]} material={mat}>
              <capsuleGeometry args={[0.035, 0.2, 4, 10]} />
            </mesh>
          ))}
        </group>
      </PopIn>
    </group>
  );
}

/* --------------------------------- scene --------------------------------- */

function Rig() {
  // gentle camera parallax with the pointer
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.25, 0));
  useFrame((state, delta) => {
    const px = state.pointer.x;
    const py = state.pointer.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.35, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.55 + py * 0.2, 2.5, delta);
    camera.lookAt(target.current);
  });
  return null;
}

export default function BearScene({ tier = "full", onReady, active = true }: { tier?: Tier; onReady?: () => void; active?: boolean }) {
  const [dpr] = useState<[number, number]>(tier === "full" ? [1, 1.75] : [1, 1.25]);
  return (
    <Canvas
      dpr={dpr}
      shadows={tier === "full"}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      camera={{ position: [0, 0.55, 8.8], fov: 34, near: 0.1, far: 50 }}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <hemisphereLight args={["#fff8ee", "#d9c6a8", 0.9]} />
      <directionalLight
        position={[3.5, 5, 5]}
        intensity={1.6}
        castShadow={tier === "full"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#ffe2c4" />
      <Environment resolution={64}>
        <Lightformer intensity={1.4} position={[0, 4, 4]} scale={[8, 4, 1]} color="#fff6ea" />
        <Lightformer intensity={0.8} position={[-5, 1, 2]} scale={[3, 6, 1]} color="#fde6cf" />
        <Lightformer intensity={0.6} position={[5, 0, -2]} scale={[3, 6, 1]} color="#e7f0da" />
      </Environment>

      <group position={[0, -0.1, 0]}>
        <Bear tier={tier} onReady={onReady} />
        <Cushion tier={tier} />
        <Sparkle position={[-1.62, 2.15, 0.3]} flip delay={1.3} />
        <Sparkle position={[1.62, 2.15, 0.3]} delay={1.4} />
        <ThreadHeart position={[2.4, 1.2, -0.4]} delay={1.6} />
        {tier === "full" && (
          <>
            <Star position={[-2.3, 1.15, -0.4]} size={0.85} delay={1.7} />
            <Star position={[2.05, -0.45, 0.7]} size={0.5} delay={1.9} />
            <SewingButton position={[-2.05, -0.4, 0.7]} color={COLORS.coralButton} size={0.85} delay={1.8} />
            <SewingButton position={[-2.75, 0.45, -1.8]} color={COLORS.sageButton} size={0.6} delay={2.0} />
          </>
        )}
      </group>

      <ContactShadows position={[0, -2.03, 0]} opacity={0.32} scale={9} blur={2.6} far={3} resolution={512} color="#5b3a26" frames={tier === "full" ? Infinity : 60} />
      <Rig />
    </Canvas>
  );
}
