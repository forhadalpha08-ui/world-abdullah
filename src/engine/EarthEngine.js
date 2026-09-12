/**
 * EarthEngine.js
 * Dedicated Photorealistic Earth 3D Engine
 * Features:
 * - Multi-pass Earth shaders (Day, Night city lights, Specular ocean reflection, Normal relief)
 * - Rayleigh atmospheric scattering outer shell
 * - Dynamic cloud deck with alpha transparency & differential rotation
 * - Sunrise horizon lens flare burst (matching reference photos)
 * - Polar Aurora Borealis (Act 3) and Moon overview (Act 5)
 * - 6 Cinematic orbital waypoints with smooth spring-damped interpolation
 * - Mobile-first responsive framing & dynamic FOV warp breathing
 */

import * as THREE from 'three';
import { EarthShader } from '../shaders/earthShaders.js';
import { CloudShader } from '../shaders/cloudShaders.js';
import { AtmosphereShader } from '../shaders/atmosphereShaders.js';
import { createSunFlareMesh } from '../shaders/sunBurstShader.js';
import { Starfield } from './Starfield.js';
import { AtmosphericParticles } from './AtmosphericParticles.js';

export class EarthEngine {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;
    this.aspect = this.width / this.height;

    // Progression state
    this.currentAct = 0;
    this.actProgress = 0; // 0.0 to 5.0
    this.targetProgress = 0;
    this.velocity = 0;

    // Interactive mouse / pointer parallax
    this.rawPointer = new THREE.Vector2(0, 0);
    this.smoothPointer = new THREE.Vector2(0, 0);

    // Interactive Inspect mode ('EARTH VIEW')
    this.isInspectMode = false;
    this.inspectRotation = new THREE.Vector2(0, 0);
    this.inspectTargetRotation = new THREE.Vector2(0, 0);
    this.inspectZoom = 1.0;
    this.inspectTargetZoom = 1.0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // Base camera FOV
    this.baseFov = this.aspect < 1.0 ? 46 : 40;
    this.currentFov = this.baseFov;

    // Clock
    this.clock = new THREE.Clock();

    // Setup Three.js Core
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.initStarfield();
    this.initEarth();
    this.initAtmosphericParticles();
    this.initSunFlare();
    this.initMoon();
    this.initAurora();
    this.initWaypoints();
    this.initInteractivity();

    // Animation Loop
    this.animate = this.animate.bind(this);
    this.rafId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020409);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(this.baseFov, this.aspect, 0.1, 2000);
    this.camera.position.set(0.0, 0.2, 5.8);
    this.cameraTarget = new THREE.Vector3(0.9, 0.0, 0.0);
    this.camera.lookAt(this.cameraTarget);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.24;
    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0x05070d, 0.18);
    this.scene.add(this.ambientLight);

    // Primary Sun Directional Light
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    this.sunLight.position.set(12.0, 4.5, -5.0);
    this.scene.add(this.sunLight);

    // Secondary subtle cosmic fill light (neutral deep space slate, no cyan cast)
    this.fillLight = new THREE.DirectionalLight(0x0c1018, 0.12);
    this.fillLight.position.set(-8.0, -4.0, 3.0);
    this.scene.add(this.fillLight);
  }

  initStarfield() {
    this.starfield = new Starfield();
    this.scene.add(this.starfield.group);
  }

  initEarth() {
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    // Base radius
    this.earthRadius = 3.5;

    // 1. Earth Surface Mesh
    const earthGeometry = new THREE.SphereGeometry(this.earthRadius, 96, 96);
    this.earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uDayTexture: { value: null },
        uNightTexture: { value: null },
        uSpecularMap: { value: null },
        uNormalMap: { value: null },
        uCloudTexture: { value: null },
        uSunDirection: { value: new THREE.Vector3(1.3, 0.55, -0.6).normalize() },
        uAtmosphereColor: { value: new THREE.Color(0x38bdf8) },
        uNightCityTint: { value: new THREE.Color(0xffb347) },
        uAmbientLight: { value: 0.045 },
        uNormalScale: { value: 0.95 }
      },
      vertexShader: EarthShader.vertexShader,
      fragmentShader: EarthShader.fragmentShader
    });
    this.earthMesh = new THREE.Mesh(earthGeometry, this.earthMaterial);
    this.earthGroup.add(this.earthMesh);

    // 2. Dedicated Photorealistic Cloud Shader Deck
    const cloudGeometry = new THREE.SphereGeometry(this.earthRadius * 1.008, 96, 96);
    this.cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uCloudTexture: { value: null },
        uSunDirection: { value: new THREE.Vector3(1.3, 0.55, -0.6).normalize() },
        uCloudColor: { value: new THREE.Color(0xffffff) },
        uSunsetCloudColor: { value: new THREE.Color('#ff8533') },
        uOpacity: { value: 0.66 }
      },
      vertexShader: CloudShader.vertexShader,
      fragmentShader: CloudShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    this.cloudMesh = new THREE.Mesh(cloudGeometry, this.cloudMaterial);
    this.earthGroup.add(this.cloudMesh);

    // 3. Rayleigh Atmosphere Rim Shell (Dual-gradient Apollo-grade electric-cyan & sunset limb)
    const atmosphereGeometry = new THREE.SphereGeometry(this.earthRadius * 1.022, 96, 96);
    this.atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSunDirection: { value: new THREE.Vector3(0.77, 0.63, -0.07).normalize() },
        uAtmosphereColor: { value: new THREE.Color(0x38bdf8) },
        uSunsetAtmosphereColor: { value: new THREE.Color(0xff7828) },
        uNightAtmosphereColor: { value: new THREE.Color(0x0c1b33) },
        uIntensity: { value: 1.65 },
        uPower: { value: 3.6 }
      },
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    });
    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, this.atmosphereMaterial);
    this.earthGroup.add(this.atmosphereMesh);

    // Set initial position based on viewport
    this.updateEarthFraming();
  }

  initAtmosphericParticles() {
    this.atmosphericParticles = new AtmosphericParticles(480);
    this.earthGroup.add(this.atmosphericParticles.group);
  }

  initSunFlare() {
    this.sunFlare = createSunFlareMesh();
    this.scene.add(this.sunFlare);
    this.sunFlareBasePos = new THREE.Vector3(14.0, 5.5, -6.0);
    this.sunFlare.position.copy(this.sunFlareBasePos);
  }

  initMoon() {
    this.moonGroup = new THREE.Group();
    const moonGeo = new THREE.SphereGeometry(0.95, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      roughness: 0.95,
      metalness: 0.05
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonGroup.add(this.moonMesh);
    this.moonGroup.position.set(-14.0, 5.0, -18.0);
    this.moonGroup.visible = false; // Turned visible in Act 5
    this.scene.add(this.moonGroup);
  }

  initAurora() {
    // Shimmering Aurora Borealis shell over Arctic region (Act 3)
    const auroraGeo = new THREE.SphereGeometry(this.earthRadius * 1.025, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.28);
    this.auroraMat = new THREE.MeshBasicMaterial({
      color: 0x22ff99,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.auroraMesh = new THREE.Mesh(auroraGeo, this.auroraMat);
    this.auroraMesh.rotation.x = -Math.PI / 2;
    this.earthGroup.add(this.auroraMesh);
  }

  updateEarthFraming() {
    if (this.aspect < 1.0) {
      // Mobile layout: Earth center lower-left, sweeping curve across right limb and upper arc matching reference photo
      this.earthGroup.position.set(-1.18, -0.22, 0.0);
      this.earthGroup.scale.set(0.79, 0.79, 0.79);
    } else {
      // Desktop layout: Earth center lower-left, majestic curve sweeping across center and right
      this.earthGroup.position.set(-0.75, -0.55, 0.0);
      this.earthGroup.scale.set(1.22, 1.22, 1.22);
    }
  }

  initWaypoints() {
    // 6 Cinematic Chapters matching user reference:
    // 01: ORIGIN     - "Everything begins somewhere."
    // 02: IDENTITY   - "The blue sanctuary of consciousness."
    // 03: VISION     - "Perspective shifts when borders dissolve."
    // 04: CREATION   - "A living tapestry of ocean, land, and atmosphere."
    // 05: EXPERIENCE - "The overview effect in real time."
    // 06: CONTACT    - "Connect with the living world."

    this.waypoints = [
      // 01: ORIGIN (Matches reference image: Europe, Mediterranean, and Africa with night city lights and sunrise on right limb)
      {
        cameraPos: new THREE.Vector3(0.0, 0.0, 7.5),
        targetPos: new THREE.Vector3(0.0, 0.0, 0.0),
        earthRot: new THREE.Vector3(0.28, -1.35, -0.34),
        sunDir: new THREE.Vector3(1.90, 0.72, -2.2).normalize(),
        sunFlarePos: new THREE.Vector3(3.8, 1.45, 0.15),
        flareIntensity: 1.0,
        moonVisible: false,
        auroraOpacity: 0.0,
        exposure: 1.24
      },
      // 02: IDENTITY (Pacific & Asian Archipelago Daylight with Shimmering Waters)
      {
        cameraPos: new THREE.Vector3(0.2, -0.25, 7.4),
        targetPos: new THREE.Vector3(0.3, -0.1, 0.0),
        earthRot: new THREE.Vector3(0.12, -2.3, -0.05),
        sunDir: new THREE.Vector3(1.0, 0.8, 0.85).normalize(),
        sunFlarePos: new THREE.Vector3(5.5, 4.5, -2.0),
        flareIntensity: 0.50,
        moonVisible: false,
        auroraOpacity: 0.0,
        exposure: 1.20
      },
      // 03: VISION (Eurasia & High Latitudes with Pure Atmospheric Halo)
      {
        cameraPos: new THREE.Vector3(0.0, 3.8, 7.2),
        targetPos: new THREE.Vector3(0.8, 0.5, 0.0),
        earthRot: new THREE.Vector3(0.85, -3.1, 0.1),
        sunDir: new THREE.Vector3(1.2, 0.6, 0.75).normalize(),
        sunFlarePos: new THREE.Vector3(5.2, 3.0, -2.0),
        flareIntensity: 0.45,
        moonVisible: false,
        auroraOpacity: 0.0,
        exposure: 1.22
      },
      // 04: CREATION (The Americas, Lush Amazon & Turquoise Caribbean Waters)
      {
        cameraPos: new THREE.Vector3(0.1, 0.1, 6.6),
        targetPos: new THREE.Vector3(1.0, 0.0, 0.0),
        earthRot: new THREE.Vector3(0.22, 0.55, 0.05),
        sunDir: new THREE.Vector3(1.1, 0.7, 0.85).normalize(),
        sunFlarePos: new THREE.Vector3(5.5, 3.5, -2.0),
        flareIntensity: 0.45,
        moonVisible: false,
        auroraOpacity: 0.0,
        exposure: 1.22
      },
      // 05: EXPERIENCE (The Pure Colorful Blue Marble in Deep Space)
      {
        cameraPos: new THREE.Vector3(-0.6, 0.0, 13.5),
        targetPos: new THREE.Vector3(0.0, 0.0, 0.0),
        earthRot: new THREE.Vector3(0.18, -0.65, 0.0),
        sunDir: new THREE.Vector3(0.85, 0.40, 1.05).normalize(),
        sunFlarePos: new THREE.Vector3(7.5, 3.8, -3.0),
        flareIntensity: 0.40,
        moonVisible: true,
        auroraOpacity: 0.0,
        exposure: 1.25
      },
      // 06: CONTACT (Night Network Web with Delicate Dawn Transition)
      {
        cameraPos: new THREE.Vector3(0.1, -0.2, 7.6),
        targetPos: new THREE.Vector3(0.8, 0.0, 0.0),
        earthRot: new THREE.Vector3(0.30, 2.1, 0.08),
        sunDir: new THREE.Vector3(-0.9, 0.4, 0.6).normalize(),
        sunFlarePos: new THREE.Vector3(-4.5, 2.5, -2.5),
        flareIntensity: 0.40,
        moonVisible: false,
        auroraOpacity: 0.0,
        exposure: 1.22
      }
    ];
  }

  async loadTextures(onProgress = () => {}) {
    const textureLoader = new THREE.TextureLoader();
    const base = import.meta.env.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const texturesToLoad = [
      { key: 'day', url: `${cleanBase}textures/earth_day.jpg` },
      { key: 'night', url: `${cleanBase}textures/earth_night.jpg` },
      { key: 'specular', url: `${cleanBase}textures/earth_specular.jpg` },
      { key: 'normal', url: `${cleanBase}textures/earth_normal.jpg` },
      { key: 'clouds', url: `${cleanBase}textures/earth_clouds.png` }
    ];

    let loadedCount = 0;
    const total = texturesToLoad.length;

    const loadSingle = ({ key, url }) => {
      return new Promise((resolve) => {
        textureLoader.load(
          url,
          (tex) => {
            tex.colorSpace = (key === 'day' || key === 'night' || key === 'clouds') 
              ? THREE.SRGBColorSpace 
              : THREE.NoColorSpace;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            loadedCount++;
            onProgress(loadedCount / total);
            resolve({ key, tex });
          },
          undefined,
          () => {
            console.warn(`Fallback procedural texture generated for ${key}`);
            const fallbackTex = this.createFallbackTexture(key);
            loadedCount++;
            onProgress(loadedCount / total);
            resolve({ key, tex: fallbackTex });
          }
        );
      });
    };

    const results = await Promise.all(texturesToLoad.map(loadSingle));
    const texMap = {};
    results.forEach(({ key, tex }) => {
      texMap[key] = tex;
    });

    // Bind textures to materials
    if (this.earthMaterial) {
      this.earthMaterial.uniforms.uDayTexture.value = texMap.day;
      this.earthMaterial.uniforms.uNightTexture.value = texMap.night;
      this.earthMaterial.uniforms.uSpecularMap.value = texMap.specular;
      this.earthMaterial.uniforms.uNormalMap.value = texMap.normal;
      this.earthMaterial.uniforms.uCloudTexture.value = texMap.clouds;
      this.earthMaterial.needsUpdate = true;
    }

    if (this.cloudMaterial && this.cloudMaterial.uniforms) {
      this.cloudMaterial.uniforms.uCloudTexture.value = texMap.clouds;
      this.cloudMaterial.needsUpdate = true;
    }
  }

  createFallbackTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (type === 'day') {
      const grad = ctx.createLinearGradient(0, 0, 1024, 512);
      grad.addColorStop(0, '#0c2340');
      grad.addColorStop(0.5, '#1e40af');
      grad.addColorStop(1, '#0c2340');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);
      // Green continents
      ctx.fillStyle = '#15803d';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, 30 + Math.random() * 60, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'night') {
      ctx.fillStyle = '#020409';
      ctx.fillRect(0, 0, 1024, 512);
      ctx.fillStyle = '#ffb347';
      for (let i = 0; i < 2000; i++) {
        ctx.fillRect(Math.random() * 1024, Math.random() * 512, 1.5, 1.5);
      }
    } else if (type === 'specular') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 512);
    } else if (type === 'normal') {
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(0, 0, 1024, 512);
    } else if (type === 'clouds') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 512);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 150; i++) {
        ctx.globalAlpha = 0.4 + Math.random() * 0.5;
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, 20 + Math.random() * 70, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  initInteractivity() {
    const dom = this.renderer.domElement;

    // Mouse drag for Free Orbit Mode
    dom.addEventListener('mousedown', (e) => {
      if (!this.isInspectMode) return;
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.isInspectMode) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.inspectTargetRotation.y += deltaX * 0.006;
      this.inspectTargetRotation.x += deltaY * 0.006;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch support for mobile free orbit
    dom.addEventListener('touchstart', (e) => {
      if (!this.isInspectMode || e.touches.length !== 1) return;
      this.isDragging = true;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (!this.isDragging || !this.isInspectMode || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.inspectTargetRotation.y += deltaX * 0.008;
      this.inspectTargetRotation.x += deltaY * 0.008;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    dom.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Wheel zoom in inspect mode
    window.addEventListener('wheel', (e) => {
      if (!this.isInspectMode) return;
      this.inspectTargetZoom = THREE.MathUtils.clamp(
        this.inspectTargetZoom + e.deltaY * 0.001,
        0.65,
        1.75
      );
    }, { passive: true });

    // Global pointer tracking for continuous luxury parallax depth
    window.addEventListener('pointermove', (e) => {
      this.rawPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.rawPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });
  }

  toggleInspectMode(forceState = null) {
    this.isInspectMode = forceState !== null ? forceState : !this.isInspectMode;
    if (!this.isInspectMode) {
      this.inspectTargetRotation.set(0, 0);
      this.inspectTargetZoom = 1.0;
    }
    return this.isInspectMode;
  }

  setActProgress(progress) {
    // progress: 0.0 to 5.0
    this.targetProgress = THREE.MathUtils.clamp(progress, 0, this.waypoints.length - 1);
  }

  setOnRender(callback) {
    this.onRenderCallback = callback;
  }

  onWindowResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.aspect = this.width / this.height;

    this.baseFov = this.aspect < 1.0 ? 46 : 40;
    this.camera.fov = this.baseFov;
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.updateEarthFraming();
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth exponential inertia damping for mouse pointer parallax
    this.smoothPointer.x += (this.rawPointer.x - this.smoothPointer.x) * 0.038;
    this.smoothPointer.y += (this.rawPointer.y - this.smoothPointer.y) * 0.038;

    // 2. Smoothly interpolate act progress with inertia
    const prevProgress = this.actProgress;
    this.actProgress += (this.targetProgress - this.actProgress) * 0.07;
    this.velocity = Math.abs(this.actProgress - prevProgress) / Math.max(delta, 0.001);

    // 3. Dynamic FOV Warp breathing
    const fovWarp = Math.min(this.velocity * 0.45, 7.0);
    this.currentFov = THREE.MathUtils.lerp(this.currentFov, this.baseFov + fovWarp, 0.08);
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();

    // 4. Stardust velocity streaking & interactive parallax
    if (this.starfield) {
      if (this.starfield.dustParticles) {
        const streakZ = 1.0 + Math.min(this.velocity * 0.15, 3.5);
        this.starfield.dustParticles.scale.z = streakZ;
      }
      this.starfield.update(delta * (1.0 + this.velocity * 0.1), this.smoothPointer);
    }

    // 5. Calculate Waypoint Interpolation
    const progress = this.actProgress;
    const index = Math.min(Math.floor(progress), this.waypoints.length - 2);
    const fraction = progress - index;

    // Cubic bezier ease for weightless transition
    const t = fraction * fraction * (3 - 2 * fraction);

    const wpA = this.waypoints[index];
    const wpB = this.waypoints[index + 1] || wpA;

    // Interpolate Camera Position and Target
    const targetCamPos = new THREE.Vector3().lerpVectors(wpA.cameraPos, wpB.cameraPos, t);
    const targetLookAt = new THREE.Vector3().lerpVectors(wpA.targetPos, wpB.targetPos, t);

    // Mobile viewport adjustment for camera target
    if (this.aspect < 1.0) {
      targetCamPos.set(0.0, 0.0, 7.5);
      targetLookAt.set(0.0, 0.0, 0.0);
    }

    // 6. Subtle weightless satellite orbital drift (multi-frequency harmonic Lissajous)
    const driftTime = elapsedTime * 0.12;
    const driftX = Math.sin(driftTime * 1.0) * 0.045 + Math.sin(driftTime * 2.4) * 0.018;
    const driftY = Math.cos(driftTime * 0.85) * 0.035 + Math.cos(driftTime * 1.8) * 0.012;
    const driftZ = Math.sin(driftTime * 0.65) * 0.025;

    // 7. Apply interactive luxury parallax depth to camera & target
    const parallaxFactor = this.isInspectMode ? 0.0 : 1.0;
    const camParallaxX = this.smoothPointer.x * 0.22 * parallaxFactor;
    const camParallaxY = this.smoothPointer.y * 0.16 * parallaxFactor;

    targetCamPos.x += camParallaxX + driftX;
    targetCamPos.y += camParallaxY + driftY;
    targetCamPos.z += driftZ;

    targetLookAt.x += (this.smoothPointer.x * 0.08 * parallaxFactor) + (driftX * 0.3);
    targetLookAt.y += (this.smoothPointer.y * 0.06 * parallaxFactor) + (driftY * 0.3);

    // Apply inspect mode orbit controls
    this.inspectRotation.lerp(this.inspectTargetRotation, 0.08);
    this.inspectZoom = THREE.MathUtils.lerp(this.inspectZoom, this.inspectTargetZoom, 0.08);

    if (this.isInspectMode) {
      targetCamPos.multiplyScalar(this.inspectZoom);
    }

    this.camera.position.lerp(targetCamPos, 0.12);
    this.cameraTarget.lerp(targetLookAt, 0.12);
    this.camera.lookAt(this.cameraTarget);

    // 8. Earth Rotation Interpolation & Serene Sidereal Spin
    const baseRot = new THREE.Vector3().lerpVectors(wpA.earthRot, wpB.earthRot, t);
    const slowEarthSpin = elapsedTime * 0.0022; // serene planetary sidereal drift

    this.earthMesh.rotation.x = baseRot.x + this.inspectRotation.x;
    this.earthMesh.rotation.y = baseRot.y + slowEarthSpin + this.inspectRotation.y;
    this.earthMesh.rotation.z = baseRot.z;

    // 9. Independent Atmospheric Cloud Circulation & Drift
    if (this.cloudMesh) {
      const cloudDifferentialSpin = elapsedTime * 0.0055; // differential wind flow
      this.cloudMesh.rotation.x = this.earthMesh.rotation.x + Math.sin(elapsedTime * 0.03) * 0.002;
      this.cloudMesh.rotation.y = baseRot.y + cloudDifferentialSpin + this.inspectRotation.y;
      this.cloudMesh.rotation.z = this.earthMesh.rotation.z;
    }

    // 10. Gradual Sunlight Precession, Twinkle & Shader Time Updates
    const sunDir = new THREE.Vector3().lerpVectors(wpA.sunDir, wpB.sunDir, t).normalize();
    const sunWiggleY = Math.sin(elapsedTime * 0.06) * 0.022;
    const liveSunDir = new THREE.Vector3(sunDir.x, sunDir.y + sunWiggleY, sunDir.z).normalize();

    if (this.earthMaterial && this.earthMaterial.uniforms) {
      this.earthMaterial.uniforms.uSunDirection.value.copy(liveSunDir);
      if (this.earthMaterial.uniforms.uTime) {
        this.earthMaterial.uniforms.uTime.value = elapsedTime;
      }
    }
    if (this.cloudMaterial && this.cloudMaterial.uniforms) {
      this.cloudMaterial.uniforms.uSunDirection.value.copy(liveSunDir);
      if (this.cloudMaterial.uniforms.uTime) {
        this.cloudMaterial.uniforms.uTime.value = elapsedTime;
      }
    }
    if (this.atmosphereMaterial && this.atmosphereMaterial.uniforms) {
      this.atmosphereMaterial.uniforms.uSunDirection.value.copy(liveSunDir);
      if (this.atmosphereMaterial.uniforms.uTime) {
        this.atmosphereMaterial.uniforms.uTime.value = elapsedTime;
      }
    }
    this.sunLight.position.copy(liveSunDir).multiplyScalar(20.0);

    // 11. Atmospheric / Ionospheric Particles ("AI Earth Style")
    if (this.atmosphericParticles) {
      this.atmosphericParticles.update(delta, elapsedTime, liveSunDir, this.smoothPointer);
    }

    // 12. Radiant Sunrise Starburst Flare (Pinned to Earth horizon limb with optical respiration)
    const effScale = this.earthGroup.scale.x;
    const effRadius = this.earthRadius * effScale;
    const sunAngle = Math.atan2(liveSunDir.y, liveSunDir.x);
    const limbX = this.earthGroup.position.x + Math.cos(sunAngle) * (effRadius * 1.002);
    const limbY = this.earthGroup.position.y + Math.sin(sunAngle) * (effRadius * 1.002);
    this.sunFlare.position.set(limbX, limbY, 0.05);

    // Delicate optical glass rotation and breathing pulse
    this.sunFlare.rotation.z = elapsedTime * 0.008;
    const flarePulse = 1.0 + Math.sin(elapsedTime * 0.38) * 0.035 + Math.cos(elapsedTime * 0.82) * 0.015;
    const flareScaleBase = (this.aspect < 1.0 ? 3.2 : 4.2) * flarePulse;
    this.sunFlare.scale.set(flareScaleBase, flareScaleBase, 1.0);

    const baseIntensity = THREE.MathUtils.lerp(wpA.flareIntensity, wpB.flareIntensity, t);
    this.sunFlare.material.opacity = baseIntensity;

    // 13. Moon visibility in Act 5
    if (this.moonGroup) {
      const showMoon = progress >= 3.6 && progress <= 4.6;
      this.moonGroup.visible = showMoon;
      if (showMoon) {
        this.moonGroup.rotation.y = elapsedTime * 0.05;
      }
    }

    // 14. Aurora Borealis shimmer in Act 3
    if (this.auroraMesh) {
      const targetAuroraOpacity = THREE.MathUtils.lerp(wpA.auroraOpacity, wpB.auroraOpacity, t);
      const shimmer = targetAuroraOpacity * (0.8 + Math.sin(elapsedTime * 2.0) * 0.2);
      this.auroraMat.opacity = shimmer;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);

    // Render callback for synchronized luxury UI micro-parallax
    if (this.onRenderCallback) {
      this.onRenderCallback(elapsedTime, this.smoothPointer);
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
  }
}
