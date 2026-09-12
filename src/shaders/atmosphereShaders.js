/**
 * Atmospheric Rim Glow Shader (Rayleigh scattering halo)
 * Renders Earth's iconic blue atmospheric horizon with:
 * - Brilliant electric cyan-blue day limb with forward-scattering solar corona
 * - Fiery golden-amber sunset scattering along the twilight terminator limb
 * - Deep celestial indigo-violet night horizon
 * - Razor-thin Apollo-grade physical falloff
 */

import * as THREE from 'three';

export const AtmosphereShader = {
  uniforms: {
    uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
    uAtmosphereColor: { value: new THREE.Color('#38bdf8') },
    uSunsetAtmosphereColor: { value: new THREE.Color('#ff8a3d') },
    uNightAtmosphereColor: { value: new THREE.Color('#0a1628') },
    uIntensity: { value: 2.1 },
    uPower: { value: 4.2 },
    uTime: { value: 0.0 }
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    void main() {
      vNormal = normalize(mat3(modelMatrix) * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 uSunDirection;
    uniform vec3 uAtmosphereColor;
    uniform vec3 uSunsetAtmosphereColor;
    uniform vec3 uNightAtmosphereColor;
    uniform float uIntensity;
    uniform float uPower;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewDirection);
      vec3 sunDir = normalize(uSunDirection);

      // Grazing Fresnel rim: 0 at sphere center, 1 at edge
      float dotNV = max(0.0, dot(normal, viewDir));
      float rim = pow(1.0 - dotNV, uPower);

      // Sun alignment on the atmosphere shell
      float sunFacing = dot(normal, sunDir);
      float dayGlowFactor = smoothstep(-0.15, 0.35, sunFacing);

      // Sunset terminator scattering (warm golden-amber horizon arc near the terminator)
      float sunsetRim = smoothstep(-0.25, 0.04, sunFacing) * (1.0 - smoothstep(0.04, 0.30, sunFacing));
      vec3 electricCyan = vec3(0.22, 0.74, 1.0);
      vec3 vibrantSky = mix(electricCyan, uSunsetAtmosphereColor, sunsetRim * 0.65);

      // Forward scattering solar bloom (intense radiant aura near the sun)
      float forwardScatter = pow(max(0.0, dot(viewDir, sunDir)), 2.2);
      vibrantSky = mix(vibrantSky, vec3(0.90, 0.96, 1.0), forwardScatter * 0.75 * dayGlowFactor);

      // Blend night horizon to day sky
      vec3 glowColor = mix(uNightAtmosphereColor, vibrantSky, dayGlowFactor);

      // Inner limb gradient: soft cyan glow with calm celestial respiration
      float atmosphereBreath = 1.0 + sin(uTime * 0.35) * 0.035;
      float alpha = rim * uIntensity * atmosphereBreath * (dayGlowFactor * 0.85 + 0.15);

      gl_FragColor = vec4(glowColor, clamp(alpha, 0.0, 1.0));
    }
  `
};
