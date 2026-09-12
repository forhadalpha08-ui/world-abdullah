/**
 * Main Application Bootstrapper
 * ANTIGRAVITY // Earth Orbital Odyssey
 * Visual-First, Mobile-First Photorealistic Earth Experience
 */

import { EarthEngine } from './engine/EarthEngine.js';
import { WebGLFallback } from './engine/WebGLFallback.js';
import { ScrollController } from './controllers/ScrollController.js';
import { AudioController } from './controllers/AudioController.js';
import { EARTH_ACTS } from './config/sectionConfig.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.loader = document.getElementById('loader');
    this.loaderBarFill = document.getElementById('loader-bar-fill');
    this.loaderStatusText = document.getElementById('loader-status-text');
    this.loaderStatusPct = document.getElementById('loader-status-pct');

    this.engine = null;
    this.scrollController = null;
    this.audioController = null;
    this.isInspectMode = false;

    window.__app = this;
    this.init();
  }

  async init() {
    // 1. Check WebGL support
    if (!WebGLFallback.isSupported()) {
      console.warn('WebGL not supported. Initializing fallback.');
      this.engine = new WebGLFallback(this.container);
      this.finishLoading();
      this.initUI();
      return;
    }

    try {
      // 2. Initialize Dedicated 3D Earth Engine
      this.engine = new EarthEngine(this.container);

      // 3. Load high-resolution Earth textures with progress updates
      await this.engine.loadTextures((progress) => {
        const pct = Math.round(progress * 100);
        if (this.loaderBarFill) this.loaderBarFill.style.width = `${pct}%`;
        if (this.loaderStatusPct) this.loaderStatusPct.textContent = `${String(pct).padStart(2, '0')}%`;

        if (pct < 35) {
          if (this.loaderStatusText) this.loaderStatusText.textContent = 'SYNCHRONIZING ORBITAL EPHEMERIS...';
        } else if (pct < 75) {
          if (this.loaderStatusText) this.loaderStatusText.textContent = 'CALIBRATING RAYLEIGH SCATTERING...';
        } else {
          if (this.loaderStatusText) this.loaderStatusText.textContent = 'ORBIT LOCKED // EARTH READY';
        }
      });

      // 4. Initialize UI and Controllers
      this.initUI();

      // 5. Dismiss minimal loader
      setTimeout(() => {
        this.finishLoading();
      }, 400);

    } catch (err) {
      console.error('Failed to initialize Earth 3D scene:', err);
      this.engine = new WebGLFallback(this.container);
      this.finishLoading();
      this.initUI();
    }
  }

  initUI() {
    // Scroll Controller: connects scroll with 3D camera trajectory & act subtitles
    this.scrollController = new ScrollController(this.engine, (actData) => {
      // Act changed callback
    });

    // Web Audio Synthesizer
    this.audioController = new AudioController('btn-audio-toggle');

    // Wire 'EARTH VIEW' Free Orbit Inspection Button
    const btnEarthView = document.getElementById('btn-earth-view');
    const inspectIndicator = document.getElementById('inspect-mode-indicator');

    const toggleInspect = () => {
      if (!this.engine) return;
      this.isInspectMode = this.engine.toggleInspectMode();
      if (inspectIndicator) {
        inspectIndicator.style.display = this.isInspectMode ? 'flex' : 'none';
      }
      if (btnEarthView) {
        btnEarthView.classList.toggle('active', this.isInspectMode);
      }
      const orbitState = document.getElementById('orbit-state-text');
      if (orbitState) {
        orbitState.textContent = this.isInspectMode ? 'ACTIVE' : 'OFF';
      }
    };

    if (btnEarthView) {
      btnEarthView.addEventListener('click', toggleInspect);
    }

    // Keyboard 'O' shortcut for Free Orbit
    window.addEventListener('keydown', (e) => {
      if (e.key === 'o' || e.key === 'O') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          toggleInspect();
        }
      }
    });

    // Wire Hamburger Menu & Luxury Drawer
    const menuToggle = document.getElementById('menu-toggle');
    const drawerMenu = document.getElementById('drawer-menu');
    const drawerClose = document.getElementById('drawer-close');
    const drawerBackdrop = drawerMenu?.querySelector('.drawer-backdrop');

    const openDrawer = () => {
      if (drawerMenu) drawerMenu.classList.add('open');
    };

    const closeDrawer = () => {
      if (drawerMenu) drawerMenu.classList.remove('open');
    };

    if (menuToggle) menuToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // Drawer links navigation
    document.querySelectorAll('.drawer-link-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(index) && this.scrollController) {
          closeDrawer();
          this.scrollController.scrollToAct(index);
        }
      });
    });

    // Drawer tool buttons
    const drawerAudioToggle = document.getElementById('drawer-audio-toggle');
    if (drawerAudioToggle) {
      drawerAudioToggle.addEventListener('click', () => {
        const audioBtn = document.getElementById('btn-audio-toggle');
        if (audioBtn) audioBtn.click();
        const soundState = document.getElementById('sound-state-text');
        if (soundState && this.audioController) {
          soundState.textContent = this.audioController.isPlaying ? 'ON' : 'OFF';
        }
      });
    }

    const drawerOrbitToggle = document.getElementById('drawer-orbit-toggle');
    if (drawerOrbitToggle) {
      drawerOrbitToggle.addEventListener('click', () => {
        closeDrawer();
        toggleInspect();
      });
    }

    // Wire Explore Pill Buttons & Telemetry Modal
    this.initExploreModal();
  }

  initExploreModal() {
    const modal = document.getElementById('modal-explore');
    const modalClose = document.getElementById('modal-close');
    const modalActionBtn = document.getElementById('modal-action-btn');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');

    const modalTag = document.getElementById('modal-tag');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalMatrix = document.getElementById('modal-matrix');

    const closeModal = () => {
      if (modal) modal.classList.remove('open');
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalActionBtn) modalActionBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    document.querySelectorAll('.btn-pill-explore').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetKey = btn.getAttribute('data-target');
        const act = EARTH_ACTS.find((a) => a.key === targetKey) || EARTH_ACTS[0];

        if (modalTag) modalTag.textContent = `${act.index} // ${act.title} // SCIENTIFIC EPHEMERIS`;
        if (modalTitle) modalTitle.textContent = `${act.title} — ${act.tagline}`;
        if (modalDesc) modalDesc.textContent = act.narrative;

        if (modalMatrix) {
          modalMatrix.innerHTML = Object.entries(act.telemetry)
            .map(
              ([k, v]) => `
              <div class="m-stat">
                <span class="m-lbl">${k.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                <span class="m-val">${v}</span>
              </div>
            `
            )
            .join('');
        }

        if (modal) modal.classList.add('open');
      });
    });
  }

  finishLoading() {
    if (this.loader) {
      this.loader.classList.add('hidden');
      setTimeout(() => {
        this.loader.style.display = 'none';
      }, 800);
    }
  }
}

// Initialize Application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
