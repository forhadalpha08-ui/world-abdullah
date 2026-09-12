/**
 * High-Precision Solar Shaders
 * Simulates realistic solar limb darkening, convective granulation, and pulsating corona flare.
 */

import * as THREE from 'three';

export const SunShader = {
  uniforms: {
    uTexture: { value: null },
    uTime: { value: 0.0 },
    uCoronaColor: { value: new THREE.Color(0xff8800) },
    uCoreColor: { value: new THREE.Color(0xfff5dd) },
    uLimbDarkening: { value: 0.72 }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec3 uCoronaColor;
    uniform vec3 uCoreColor;
    uniform float uLimbDarkening;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Dynamic solar convection surface animation
      vec2 animatedUv = vUv + vec2(uTime * 0.006, uTime * 0.003);
      vec4 texColor = texture2D(uTexture, animatedUv);

      // Limb darkening effect: intensity drops toward the solar limb
      vec3 viewDir = normalize(-vPosition);
      float cosTheta = clamp(dot(vNormal, viewDir), 0.0, 1.0);
      float limbFactor = 1.0 - uLimbDarkening * (1.0 - pow(cosTheta, 0.65));

      // Color grading: incandescent core with deep golden-amber rim
      vec3 solarColor = mix(uCoronaColor, uCoreColor, pow(cosTheta, 1.8) * 0.85);
      solarColor *= texColor.rgb * 1.6;
      solarColor *= limbFactor;

      gl_FragColor = vec4(solarColor, 1.0);
    }
  `
};

export const SunCoronaShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uGlowColor: { value: new THREE.Color(0xff7700) },
    uIntensity: { value: 1.4 }
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform vec3 uGlowColor;
    uniform float uIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = 1.0 - abs(dot(vNormal, viewDir));
      fresnel = pow(fresnel, 2.6);

      // Subtle organic harmonic pulsation
      float pulse = 1.0 + 0.08 * sin(uTime * 2.5) + 0.04 * cos(uTime * 4.2);

      vec3 color = uGlowColor * fresnel * uIntensity * pulse;
      gl_FragColor = vec4(color, fresnel * 0.8);
    }
  `
};
