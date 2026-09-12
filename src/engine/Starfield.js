/**
 * Subtle Deep-Space Starfield Engine
 * Soft circular celestial pinpricks distributed in distant deep space.
 * Features realistic luminance variations, subtle cosmic drift, and camera parallax.
 */

import * as THREE from 'three';

export class Starfield {
  constructor(count = 2000) {
    this.count = count;
    this.group = new THREE.Group();
    this.group.name = 'Starfield';

    this.init();
  }

  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(225, 238, 255, 0.8)');
    gradient.addColorStop(0.55, 'rgba(160, 200, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
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

    // Realistic star colors (subtle pale blue, white, faint gold)
    const colorWhite = new THREE.Color('#ffffff');
    const colorIceBlue = new THREE.Color('#bae6fd');
    const colorWarmAmber = new THREE.Color('#fed7aa');

    for (let i = 0; i < this.count; i++) {
      // Distribute in deep space
      const radius = 120 + Math.random() * 300;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const rand = Math.random();
      let starColor;
      if (rand > 0.85) {
        starColor = colorWarmAmber;
      } else if (rand > 0.50) {
        starColor = colorIceBlue;
      } else {
        starColor = colorWhite;
      }

      // Vary brightness
      const brightness = 0.35 + Math.pow(Math.random(), 2.0) * 0.65;
      colors[i * 3] = starColor.r * brightness;
      colors[i * 3 + 1] = starColor.g * brightness;
      colors[i * 3 + 2] = starColor.b * brightness;

      sizes[i] = 1.6 + Math.random() * 2.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.particleTexture = this.createStarTexture();

    const material = new THREE.PointsMaterial({
      size: 2.2,
      map: this.particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false
    });

    this.points = new THREE.Points(geometry, material);
    this.group.add(this.points);
  }

  setIntensity(val) {
    if (this.points && this.points.material) {
      this.points.material.opacity = 0.9 * val;
    }
  }

  update(deltaTime, mouseOffset = { x: 0, y: 0 }) {
    // Ultra-slow cosmic drift
    this.group.rotation.y += deltaTime * 0.0012;
    this.group.rotation.x += deltaTime * 0.0005;

    // Subtle parallax reaction
    this.group.position.x += (mouseOffset.x * 0.05 - this.group.position.x) * 0.04;
    this.group.position.y += (mouseOffset.y * 0.05 - this.group.position.y) * 0.04;
  }
}
