/**
 * Custom Earth Cloud Shader
 * Renders volumetric clouds with:
 * - Smooth 8-bit alpha density sampling (no binary pixelation)
 * - Soft wispy atmospheric scattering
 * - Crisp white day-side scattering with forward solar sheen
 * - Warm golden-peach sunset terminator tinting
 * - Soft celestial starlit clouds swirling over dark oceans
 * - Subtle atmospheric rim blend
 */

import * as THREE from 'three';

export const CloudShader = {
  uniforms: {
    uCloudTexture: { value: null },
    uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
    uCloudColor: { value: new THREE.Color(0xffffff) },
    uSunsetCloudColor: { value: new THREE.Color('#ff8533') },
    uOpacity: { value: 0.62 },
    uTime: { value: 0.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    void main() {
      vUv = uv;
      vNormal = normalize(mat3(modelMatrix) * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D uCloudTexture;
    uniform vec3 uSunDirection;
    uniform vec3 uCloudColor;
    uniform vec3 uSunsetCloudColor;
    uniform float uOpacity;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 sunDir = normalize(uSunDirection);
      vec3 viewDir = normalize(vViewDirection);

      // Cloud density sample from ALPHA channel (full 8-bit smooth gradient)
      vec4 cloudSample = texture2D(uCloudTexture, vUv);
      float densityBreath = 1.0 + sin(vWorldPosition.x * 8.0 + uTime * 0.35) * 0.025 + cos(vWorldPosition.y * 10.0 + uTime * 0.25) * 0.015;
      float cloudDensity = cloudSample.a * densityBreath;

      // Discard completely transparent pixels
      if (cloudDensity < 0.02) discard;

      // Sun lighting
      float nDotL = dot(normal, sunDir);
      float dayFactor = smoothstep(-0.06, 0.22, nDotL);

      // Terminator sunset color on clouds (warm golden-peach glow at dusk)
      float sunsetFactor = smoothstep(-0.10, 0.02, nDotL) * (1.0 - smoothstep(0.02, 0.22, nDotL));
      vec3 sunsetCloudTone = vec3(1.0, 0.70, 0.42);
      vec3 cloudLitBase = mix(uCloudColor, sunsetCloudTone, sunsetFactor * 0.85);

      // Forward scattering: brilliant silver-white edge towards the sun
      float forwardScatter = pow(max(0.0, dot(viewDir, -sunDir)), 2.6) * 0.42;
      vec3 dayCloudColor = cloudLitBase * (max(0.06, nDotL) * 1.12 + 0.14 + forwardScatter);

      // Celestial night clouds: delicate luminous starlit wisps matching reference photo
      // Reflecting starlight and earthshine, soft pearlescent slate-white
      vec3 nightCloudColor = vec3(0.62, 0.72, 0.86) * (cloudDensity * 0.70 + 0.30);

      vec3 finalCloudColor = mix(nightCloudColor, dayCloudColor, dayFactor);
      
      // Night alpha allows city lights underneath to shine through brightly while preserving cloud swirl forms
      float finalAlpha = cloudDensity * uOpacity * mix(0.48, 1.0, dayFactor);

      // Atmospheric rim blending on clouds
      float viewAngle = max(0.0, dot(normal, viewDir));
      float rim = pow(1.0 - viewAngle, 3.5);
      finalCloudColor += vec3(0.25, 0.82, 1.0) * rim * (dayFactor * 0.85 + 0.25);

      gl_FragColor = vec4(finalCloudColor, clamp(finalAlpha, 0.0, 0.92));
    }
  `
};
