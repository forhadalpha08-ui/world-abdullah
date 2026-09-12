/**
 * WebGL Graceful Fallback Engine
 * Mounts a layered CSS/Canvas cinematic Earth backdrop if WebGL is not supported.
 */

export class WebGLFallback {
  constructor(container) {
    this.container = container;
    this.initFallback();
  }

  static isSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  initFallback() {
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'webgl-fallback-container';
    wrapper.innerHTML = `
      <div class="fallback-stars"></div>
      <div class="fallback-halo"></div>
      <div class="fallback-earth-wrapper">
        <div class="fallback-earth"></div>
        <div class="fallback-shadow"></div>
      </div>
    `;
    this.container.appendChild(wrapper);

    // Scroll listener for fallback parallax
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const earthWrapper = wrapper.querySelector('.fallback-earth-wrapper');
      if (earthWrapper) {
        earthWrapper.style.transform = `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.02}deg)`;
      }
    }, { passive: true });
  }

  applyStateTargets() {
    // No-op for interface parity with EarthEngine
  }

  render() {
    // No-op for fallback
  }

  setInspectMode() {}
}
