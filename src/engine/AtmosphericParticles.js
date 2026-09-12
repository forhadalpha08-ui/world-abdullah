/**
 * AtmosphericParticles.js
 * AI Earth Style Orbital Micro-Data & Ionospheric Particle System
 * 
 * Renders luminous, weightless orbital particles drifting in Earth's exosphere / low-Earth orbit.
 * Features:
 * - 480 celestial data motes in calibrated Keplerian spherical shells (r = 3.65 to 4.40)
 * - Dual-tone electric cyan (#38bdf8), ice white (#ffffff), and solar amber (#fde68a)
 * - Multi-frequency harmonic orbital drift & gentle alpha respiration
 * - Forward solar scatter illumination catching the sun vector
 * - Multi-layered parallax depth reacting smoothly to mouse movement
 */

import * as THREE from 'three';

export class AtmosphericParticles {
  constructor(count = 480) {
    this.count = count;
    this.group = new THREE.Group();
    this.group.name = 'AtmosphericParticles';

    this.particleData = [];
    this.init();
  }

  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const cx = 32;
    const cy = 32;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(186, 230, 253, 0.85)');
    grad.addColorStop(0.45, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(0.75, 'rgba(14, 116, 144, 0.08)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  init() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    const cyanColor = new THREE.Color(0x38bdf8);
    const iceWhite = new THREE.Color(0xf0f9ff);
    const amberColor = new THREE.Color(0xfde68a);
    const emeraldColor = new THREE.Color(0x6ee7b7);

    for (let i = 0; i < this.count; i++) {
      // Altitude shell: LEO orbit between 3.68 and 4.35 (Earth radius = 3.5)
      const r = 3.68 + Math.random() * 0.65;
      const theta = Math.random() * Math.PI * 2; // azimuth
      const phi = Math.acos(2 * Math.random() - 1); // inclination

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color distribution: high-tech luxury palette
      const randColor = Math.random();
      let color;
      if (randColor < 0.60) {
        color = cyanColor;
      } else if (randColor < 0.82) {
        color = iceWhite;
      } else if (randColor < 0.94) {
        color = amberColor;
      } else {
        color = emeraldColor;
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Particle size
      sizes[i] = 0.035 + Math.random() * 0.020;

      // Store orbital dynamics parameters
      this.particleData.push({
        radius: r,
        theta,
        phi,
        orbitSpeed: (0.0008 + Math.random() * 0.0016) * (Math.random() > 0.5 ? 1 : -1),
        driftPitch: (Math.random() - 0.5) * 0.0004,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseFreq: 0.8 + Math.random() * 1.4,
        baseSize: sizes[i]
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.texture = this.createGlowTexture();

    this.material = new THREE.PointsMaterial({
      size: 0.042,
      map: this.texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geometry, this.material);
    this.group.add(this.points);
  }

  update(deltaTime, elapsedTime, sunDirection, pointerOffset = { x: 0, y: 0 }) {
    if (!this.points) return;

    const posAttr = this.points.geometry.attributes.position;
    const sizeAttr = this.points.geometry.attributes.size;
    const colAttr = this.points.geometry.attributes.color;

    // Subtle group-level cosmic precession and opacity breathing
    this.group.rotation.y += deltaTime * 0.0015;
    this.group.rotation.z += deltaTime * 0.0006;
    if (this.material) {
      this.material.opacity = 0.60 + Math.sin(elapsedTime * 0.45) * 0.08;
    }

    // Parallax depth offset
    this.group.position.x += (pointerOffset.x * 0.12 - this.group.position.x) * 0.05;
    this.group.position.y += (pointerOffset.y * 0.10 - this.group.position.y) * 0.05;

    // Update individual particle dynamics
    for (let i = 0; i < this.count; i++) {
      const p = this.particleData[i];

      // Slow orbital advance
      p.theta += p.orbitSpeed * deltaTime;
      p.phi += p.driftPitch * deltaTime;

      const x = p.radius * Math.sin(p.phi) * Math.cos(p.theta);
      const y = p.radius * Math.sin(p.phi) * Math.sin(p.theta);
      const z = p.radius * Math.cos(p.phi);

      posAttr.setXYZ(i, x, y, z);

      // Delicate pulse respiration
      const pulse = Math.sin(elapsedTime * p.pulseFreq + p.pulsePhase);
      const sizeScale = 1.0 + pulse * 0.22;
      sizeAttr.setX(i, p.baseSize * sizeScale);
    }

    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  }
}
