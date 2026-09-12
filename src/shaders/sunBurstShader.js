/**
 * sunBurstShader.js -> Radiant Horizon Sunrise Starburst
 * Recreates the photorealistic sunrise burst seen peaking over the Earth's limb
 * in the reference image, with:
 * - Brilliant white-hot nucleus
 * - Radiant optical diffraction spikes & multi-angle solar rays
 * - Warm golden-amber corona transitioning into deep atmospheric cyan halo
 */

import * as THREE from 'three';

export function createSunFlareTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const cx = 512;
  const cy = 512;

  ctx.clearRect(0, 0, 1024, 1024);

  // 1. Broad ethereal ambient halo
  const ambientGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 500);
  ambientGrad.addColorStop(0.0, 'rgba(255, 250, 230, 0.45)');
  ambientGrad.addColorStop(0.15, 'rgba(255, 210, 140, 0.25)');
  ambientGrad.addColorStop(0.35, 'rgba(240, 160, 70, 0.10)');
  ambientGrad.addColorStop(0.60, 'rgba(70, 170, 255, 0.04)');
  ambientGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = ambientGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 500, 0, Math.PI * 2);
  ctx.fill();

  // 2. Optical Diffraction Spikes & Solar Rays (matching orbital lens flare)
  const numRays = 48;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2 + (i % 2 === 0 ? 0.05 : -0.05);
    
    // Vary ray lengths: cardinal & sub-cardinal rays are longer
    let length = 200 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 180;
    let width = 1.2 + (Math.cos(i * 2.1) * 0.5 + 0.5) * 2.4;
    let alpha = 0.22 + (Math.sin(i * 5.3) * 0.5 + 0.5) * 0.35;

    // Cardinal rays (0, 90, 180, 270 deg) extra prominent
    if (i % 12 === 0) {
      length = 460;
      width = 3.5;
      alpha = 0.75;
    } else if (i % 6 === 0) {
      length = 360;
      width = 2.4;
      alpha = 0.55;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const rayGrad = ctx.createLinearGradient(0, 0, length, 0);
    rayGrad.addColorStop(0.0, `rgba(255, 255, 255, ${alpha})`);
    rayGrad.addColorStop(0.15, `rgba(255, 240, 190, ${alpha * 0.85})`);
    rayGrad.addColorStop(0.45, `rgba(255, 190, 110, ${alpha * 0.4})`);
    rayGrad.addColorStop(1.0, 'rgba(255, 140, 50, 0.0)');

    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(0, -width);
    ctx.lineTo(length, 0);
    ctx.lineTo(0, width);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // 3. Horizontal & diagonal anamorphic flare streaks (subtle cinematic flare)
  const drawStreak = (angleRad, length, width, alpha) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);
    const streakGrad = ctx.createLinearGradient(-length, 0, length, 0);
    streakGrad.addColorStop(0.0, 'rgba(255, 180, 80, 0.0)');
    streakGrad.addColorStop(0.35, `rgba(255, 220, 150, ${alpha * 0.35})`);
    streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
    streakGrad.addColorStop(0.65, `rgba(255, 220, 150, ${alpha * 0.35})`);
    streakGrad.addColorStop(1.0, 'rgba(255, 180, 80, 0.0)');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(-length, -width * 0.5, length * 2, width);
    ctx.restore();
  };

  // Primary horizontal flare
  drawStreak(0.08, 480, 4.0, 0.85);
  // Diagonal flare
  drawStreak(Math.PI * 0.28, 380, 2.5, 0.55);
  drawStreak(-Math.PI * 0.28, 380, 2.5, 0.55);

  // 4. Brilliant Warm Golden Corona
  const coronaGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
  coronaGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  coronaGrad.addColorStop(0.12, 'rgba(255, 248, 220, 0.95)');
  coronaGrad.addColorStop(0.32, 'rgba(255, 210, 130, 0.70)');
  coronaGrad.addColorStop(0.65, 'rgba(255, 150, 60, 0.28)');
  coronaGrad.addColorStop(1.0, 'rgba(255, 100, 30, 0.0)');
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();

  // 5. White-Hot Solar Nucleus
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
  coreGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  coreGrad.addColorStop(0.35, 'rgba(255, 255, 255, 1.0)');
  coreGrad.addColorStop(0.70, 'rgba(255, 250, 235, 0.92)');
  coreGrad.addColorStop(1.0, 'rgba(255, 230, 170, 0.0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 50, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createSunFlareMesh() {
  const texture = createSunFlareTexture();
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false // Ensures solar flare shines majestically on the horizon limb
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.6, 3.6, 1.0);
  sprite.renderOrder = 10;
  return sprite;
}
