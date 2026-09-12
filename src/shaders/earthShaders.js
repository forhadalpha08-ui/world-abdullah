/**
 * Custom Earth Surface Shader
 * Delivers IMAX-grade photorealistic Earth with:
 * - Natural balanced daytime exposure with deep sapphire oceans and deep pine vegetation
 * - Smooth, brilliant golden city light networks across the night hemisphere
 * - Warm desert sandstone & golden ochre relief in dusk matching reference photography
 * - Smooth volumetric cloud shadows sampled from alpha channel
 * - Fiery sunset terminator scattering
 * - Crisp razor-thin atmospheric limb profile (outer edge only)
 */

import * as THREE from 'three';

export const EarthShader = {
  uniforms: {
    uDayTexture: { value: null },
    uNightTexture: { value: null },
    uSpecularMap: { value: null },
    uNormalMap: { value: null },
    uCloudTexture: { value: null },
    uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
    uAtmosphereColor: { value: new THREE.Color('#38bdf8') },
    uNightCityTint: { value: new THREE.Color('#ffb347') },
    uAmbientLight: { value: 0.03 },
    uNormalScale: { value: 0.95 },
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
    uniform sampler2D uDayTexture;
    uniform sampler2D uNightTexture;
    uniform sampler2D uSpecularMap;
    uniform sampler2D uNormalMap;
    uniform sampler2D uCloudTexture;
    uniform vec3 uSunDirection;
    uniform vec3 uAtmosphereColor;
    uniform vec3 uNightCityTint;
    uniform float uAmbientLight;
    uniform float uNormalScale;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    vec3 adjustSaturation(vec3 color, float sat) {
      float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
      return mix(vec3(lum), color, sat);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 sunDir = normalize(uSunDirection);
      vec3 viewDir = normalize(vViewDirection);

      // Texture samples
      vec4 dayTex = texture2D(uDayTexture, vUv);
      vec4 nightTex = texture2D(uNightTexture, vUv);
      float specTex = texture2D(uSpecularMap, vUv).r;

      // Surface mask: water vs land
      float isWater = smoothstep(0.08, 0.32, specTex);
      float isLand = 1.0 - isWater;

      // Solar lighting
      float nDotL = dot(normal, sunDir);
      float dayFactor = smoothstep(-0.06, 0.18, nDotL);
      float nightFactor = 1.0 - dayFactor;

      // Base terrain color grading
      vec3 albedo = dayTex.rgb;

      // Detect desert / arid terrain
      float desertMask = smoothstep(0.06, 0.28, (albedo.r * 0.75 + albedo.g * 0.50) - albedo.b * 1.10) * isLand;
      
      // Lush vegetation
      float vegMask = smoothstep(0.18, 0.42, albedo.g) * smoothstep(0.10, 0.36, albedo.r) * (1.0 - desertMask) * isLand;
      vec3 lushLand = mix(albedo, vec3(albedo.r * 0.90, albedo.g * 1.14, albedo.b * 0.82), vegMask * 0.45);

      // Latitude zones
      float polarZone = smoothstep(0.30, 0.42, abs(vUv.y - 0.5));
      float tropicalZone = 1.0 - polarZone;

      // Shallow reefs (Caribbean, Red Sea, Persian Gulf)
      float shallowWater = smoothstep(0.20, 0.44, albedo.b) * smoothstep(0.18, 0.36, albedo.g) * tropicalZone * isWater;

      // Polar ice
      float isPolarIce = smoothstep(0.42, 0.75, min(albedo.r, min(albedo.g, albedo.b))) * polarZone;

      // Balanced terrain palettes:
      // (a) Natural golden sandstone desert dunes
      vec3 desertNatural = vec3(albedo.r * 1.14, albedo.g * 1.02, albedo.b * 0.82);
      vec3 landAlbedo = mix(lushLand, desertNatural, desertMask * 0.60);

      // (b) Deep cosmic ocean with vivid turquoise coastal shallows
      vec3 shallowTurquoise = vec3(0.06, 0.52, 0.68);
      vec3 deepOcean = vec3(albedo.r * 0.40, albedo.g * 0.72, albedo.b * 1.30);
      vec3 oceanAlbedo = mix(deepOcean, shallowTurquoise, shallowWater * 0.55);

      // (c) Polar ice
      vec3 iceColor = vec3(albedo.r * 0.96, albedo.g * 0.98, albedo.b * 1.02);

      vec3 richAlbedo = mix(landAlbedo, oceanAlbedo, isWater);
      richAlbedo = mix(richAlbedo, iceColor, isPolarIce * 0.85);

      richAlbedo = adjustSaturation(richAlbedo, 1.20);
      richAlbedo = pow(richAlbedo, vec3(1.02));

      // 1. Direct Sunlight Diffuse
      vec3 sunlightColor = mix(vec3(1.0, 0.80, 0.55), vec3(1.0, 0.98, 0.95), smoothstep(0.0, 0.25, nDotL));

      // Volumetric cloud shadows
      vec2 cloudOffset = -sunDir.xy * 0.0035;
      float cloudShadowSample = texture2D(uCloudTexture, vUv + cloudOffset).a;
      float cloudShadow = 1.0 - smoothstep(0.12, 0.70, cloudShadowSample) * 0.42 * dayFactor;

      float directDiffuse = max(0.0, nDotL);
      vec3 directDayColor = richAlbedo * sunlightColor * (directDiffuse * 1.22 + 0.035) * cloudShadow;

      // 2. Twilight / Dawn Terminator Warmth
      float terminatorBand = smoothstep(-0.14, 0.02, nDotL) * (1.0 - smoothstep(0.02, 0.18, nDotL));
      vec3 dawnWarmth = vec3(1.0, 0.65, 0.35) * terminatorBand * 0.30 * isLand;

      // 3. Specular Ocean Sun Glint
      vec3 halfVector = normalize(sunDir + viewDir);
      float specAngle = max(0.0, dot(normal, halfVector));
      float sharpSpec = pow(specAngle, 160.0) * isWater * dayFactor * 0.50;
      float broadSpec = pow(specAngle, 32.0) * isWater * dayFactor * 0.10;
      vec3 specColor = mix(vec3(1.0, 0.88, 0.70), vec3(1.0, 0.98, 0.95), smoothstep(0.04, 0.22, nDotL));
      vec3 specularReflection = specColor * sharpSpec + vec3(0.30, 0.65, 1.0) * broadSpec;

      // 4. Brilliant Sparkling Golden Night City Lights (matches reference photography)
      // Extract city lum and eliminate background compression noise
      float rawCity = max(nightTex.r, max(nightTex.g, nightTex.b * 0.8));
      
      // Adaptive noise floor: higher in barren deserts where JPEG blocks produce artifacts,
      // lower in populated non-desert terrain to preserve delicate town networks
      float noiseFloor = mix(0.036, 0.072, desertMask);
      float citySignal = max(0.0, rawCity - noiseFloor);

      // Hierarchical brightness layers:
      // A. Extensive web of regional towns, roads, and suburban settlement (delicate golden dusting)
      float cityWeb = pow(smoothstep(0.008, 0.16, citySignal), 1.15);
      // B. Metropolitan centers & dense urban clusters (intense rich gold)
      float cityMetro = pow(smoothstep(0.06, 0.35, citySignal), 1.5);
      // C. Blazing megacity downtown cores (London, Paris, Milan, Rome, Madrid, Cairo)
      float cityCore = pow(smoothstep(0.18, 0.55, citySignal), 2.0);

      vec3 cityAmber = vec3(1.0, 0.58, 0.16);
      vec3 cityGold = vec3(1.0, 0.82, 0.38);
      vec3 cityDiamond = vec3(1.0, 0.98, 0.92);

      vec3 citySpectrum = mix(cityAmber, cityGold, smoothstep(0.01, 0.20, citySignal));
      citySpectrum = mix(citySpectrum, cityDiamond, cityCore * 0.90);

      // Rich glittering intensity matching reference
      vec3 cityLights = citySpectrum * (cityWeb * 16.0 + cityMetro * 28.0 + cityCore * 45.0) * nightFactor * isLand;
      
      // Delicate living electrical twinkle on illuminated urban centers
      float cityTwinkle = 1.0 + sin(dot(vWorldPosition.xy, vec2(12.9898, 78.233)) * 4.0 + uTime * 2.2) * 0.05 * cityCore;
      cityLights *= cityTwinkle;

      // 5. Deep Cosmic Night Oceans & Charcoal Land
      vec3 nightOcean = vec3(0.008, 0.016, 0.032) * isWater * nightFactor;
      vec3 nightLand = vec3(0.012, 0.014, 0.018) * isLand * nightFactor;

      // 6. Atmospheric Rayleigh Limb Scattering along surface edge
      float viewAngle = max(0.0, dot(normal, viewDir));
      float rimFresnel = pow(1.0 - viewAngle, 3.8);
      float sunLimbScatter = max(0.0, dot(viewDir, sunDir) * 0.5 + 0.5);
      vec3 limbScatter = vec3(0.24, 0.78, 1.0) * rimFresnel * (dayFactor * 1.25 + 0.35) * (sunLimbScatter * 0.75 + 0.25);

      // Final composite
      vec3 finalColor = directDayColor + dawnWarmth + specularReflection + cityLights + nightOcean + nightLand + limbScatter * 0.75;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
