"use client";

/**
 * Full-frame photo slideshow drawn with a single WebGL quad.
 * - Slides change with a soft "liquid" wipe (procedural noise, no extra assets).
 * - Under the cursor the photo ripples gently, like fabric touched by a breeze.
 * Images are cover-fitted in the shader, so any portrait/landscape photo works.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { gsap } from "gsap";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform vec2 uCoverA;
  uniform vec2 uCoverB;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uAspect;
  uniform float uZoom;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  vec2 cover(vec2 uv, vec2 s) { return (uv - 0.5) * s + 0.5; }

  void main() {
    vec2 uv = vUv;

    // cursor ripple
    vec2 d = uv - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    float ripple = sin(dist * 32.0 - uTime * 4.5) * exp(-dist * 6.5) * 0.009 * uHover;
    vec2 dir = d / max(dist, 1e-4);
    dir.x /= uAspect;
    uv += dir * ripple;

    // liquid wipe between slide A and slide B
    float n = fbm(uv * vec2(2.4, 3.2) + vec2(0.0, uTime * 0.04));
    float p = uProgress;
    float m = smoothstep(n - 0.09, n + 0.09, p * 1.2 - 0.1);
    float edge = 1.0 - abs(m * 2.0 - 1.0);
    vec2 push = vec2(edge * 0.02, edge * 0.06);

    vec2 uvA = (uv - 0.5) * (uZoom - 0.07 * p) + 0.5 + push;
    vec2 uvB = (uv - 0.5) * (uZoom + 0.1 * (1.0 - p)) + 0.5 - push;
    vec4 a = texture2D(uTexA, cover(uvA, uCoverA));
    vec4 b = texture2D(uTexB, cover(uvB, uCoverB));
    vec3 col = mix(a.rgb, b.rgb, m);
    // a whisper of light along the wipe edge
    col += edge * 0.05;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function coverScale(tex: THREE.Texture, aspect: number) {
  const img = tex.image as { width?: number; height?: number } | undefined;
  const ia = img?.width && img?.height ? img.width / img.height : 0.8;
  return aspect > ia ? new THREE.Vector2(1, ia / aspect) : new THREE.Vector2(aspect / ia, 1);
}

export type SlideshowPointer = { inside: boolean };

function Quad({ srcs, index, pointer, onReady }: { srcs: string[]; index: number; pointer: React.RefObject<SlideshowPointer>; onReady: () => void }) {
  const textures = useTexture(srcs);
  const { size } = useThree();
  const aspect = size.width / size.height;
  const t = useRef({ from: index, to: index, p: 1 });
  const hover = useRef(0);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));

  const mat = useMemo(() => {
    textures.forEach((tx) => {
      tx.colorSpace = THREE.SRGBColorSpace;
      tx.generateMipmaps = false;
      tx.minFilter = THREE.LinearFilter;
      tx.needsUpdate = true;
    });
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTexA: { value: textures[index] },
        uTexB: { value: textures[index] },
        uCoverA: { value: new THREE.Vector2(1, 1) },
        uCoverB: { value: new THREE.Vector2(1, 1) },
        uProgress: { value: 1 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uAspect: { value: 1 },
        uZoom: { value: 1 },
      },
    });
    // textures are stable for the life of the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);

  useEffect(() => onReady(), [onReady]);

  // start a transition whenever the active slide changes
  useEffect(() => {
    const s = t.current;
    if (index === s.to) return;
    s.from = s.p >= 0.5 ? s.to : s.from; // mid-transition: continue from whatever is mostly visible
    s.to = index;
    s.p = 0;
    mat.uniforms.uTexA.value = textures[s.from];
    mat.uniforms.uTexB.value = textures[s.to];
    const tween = gsap.to(s, { p: 1, duration: 1.7, ease: "power2.inOut", overwrite: true });
    return () => {
      tween.kill();
    };
  }, [index, mat, textures]);

  useFrame((state, delta) => {
    const s = t.current;
    const u = mat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uProgress.value = s.p;
    u.uAspect.value = aspect;
    u.uCoverA.value.copy(coverScale(u.uTexA.value as THREE.Texture, aspect));
    u.uCoverB.value.copy(coverScale(u.uTexB.value as THREE.Texture, aspect));
    // slow breathing zoom keeps the frame alive between slides
    u.uZoom.value = 0.97 - Math.sin(state.clock.elapsedTime * 0.25) * 0.015;
    hover.current = THREE.MathUtils.damp(hover.current, pointer.current.inside ? 1 : 0, 3.5, delta);
    u.uHover.value = hover.current;
    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, (state.pointer.x + 1) / 2, 6, delta);
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, (state.pointer.y + 1) / 2, 6, delta);
    u.uMouse.value.copy(mouse.current);
  });

  return (
    <mesh frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function LiquidSlideshow({
  srcs,
  index,
  active,
  lite,
  pointer,
  onReady,
}: {
  srcs: string[];
  index: number;
  active: boolean;
  lite?: boolean;
  pointer: React.RefObject<SlideshowPointer>;
  onReady: () => void;
}) {
  return (
    <Canvas
      orthographic
      dpr={lite ? [1, 1.5] : [1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Quad srcs={srcs} index={index} pointer={pointer} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
