"use client";

import * as THREE from "three";

/**
 * Shader for photo planes: rounded corners (SDF), gentle cloth-like wave on
 * hover, subtle zoom, and an opacity uniform for fades. Pure GLSL, no assets.
 */
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uWave;
  varying vec2 vUv;
  varying float vFold;
  void main() {
    vUv = uv;
    vec3 p = position;
    float wave = sin(uv.y * 3.14159 * 2.0 + uTime * 2.2) * 0.5 + sin(uv.x * 3.14159 * 1.4 - uTime * 1.6) * 0.5;
    float amount = (uHover * 0.06 + uWave * 0.025);
    p.z += wave * amount;
    vFold = wave * amount;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uHover;
  uniform float uOpacity;
  uniform float uRadius;
  uniform vec2 uSize;
  uniform vec2 uImageAspect;
  varying vec2 vUv;
  varying float vFold;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // cover-fit the image into the plane
    vec2 uv = (vUv - 0.5) * uImageAspect + 0.5;
    // soft zoom on hover
    uv = (uv - 0.5) * (1.0 - 0.07 * uHover) + 0.5;
    vec4 tex = texture2D(uTex, uv + vec2(vFold * 0.15, 0.0));
    vec3 col = tex.rgb * (1.0 + vFold * 2.5);

    // rounded corners with an anti-aliased edge
    vec2 p = (vUv - 0.5) * uSize;
    float d = roundedBox(p, uSize * 0.5, uRadius);
    float aa = fwidth(d);
    float mask = 1.0 - smoothstep(-aa, aa, d);

    gl_FragColor = vec4(col, mask * uOpacity);
    #include <colorspace_fragment>
  }
`;

export function createImageMaterial(texture: THREE.Texture, size: [number, number], radius = 0.08, side: THREE.Side = THREE.FrontSide) {
  const img = texture.image as { width?: number; height?: number } | undefined;
  const imgAspect = img?.width && img?.height ? img.width / img.height : size[0] / size[1];
  const planeAspect = size[0] / size[1];
  const cover: [number, number] = planeAspect > imgAspect ? [1, imgAspect / planeAspect] : [planeAspect / imgAspect, 1];
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side,
    uniforms: {
      uTex: { value: texture },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uWave: { value: 0 },
      uOpacity: { value: 0 },
      uRadius: { value: radius },
      uSize: { value: new THREE.Vector2(...size) },
      uImageAspect: { value: new THREE.Vector2(...cover) },
    },
  });
}
