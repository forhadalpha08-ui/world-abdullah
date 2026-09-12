/**
 * TelemetryController
 * Manages live interplanetary HUD metrics:
 * Active celestial body, AU distance, orbital velocity, live UTC chronometer, and free inspection mode.
 */

export class TelemetryController {
  constructor(solarEngine) {
    this.engine = solarEngine;
    this.isInspecting = false;
    this.startTime = Date.now();

    // Cache DOM elements
    this.utcEl = document.getElementById('telemetry-utc');
    this.altEl = document.getElementById('telemetry-alt'); // AU Distance
    this.velEl = document.getElementById('telemetry-vel'); // Orbital Velocity
    this.phaseEl = document.getElementById('telemetry-phase'); // Celestial Body Name
    this.inspectBtn = document.getElementById('btn-inspect-orbit');
    this.inspectBadge = document.getElementById('inspect-mode-indicator');

    this.initControls();
  }

  initControls() {
    if (this.inspectBtn) {
      this.inspectBtn.addEventListener('click', () => this.toggleInspectMode());
    }

    // Keyboard shortcut 'O' for Orbit Free-look
    window.addEventListener('keydown', (e) => {
      if (e.key === 'o' || e.key === 'O') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          this.toggleInspectMode();
        }
      }
    });
  }

  toggleInspectMode() {
    this.isInspecting = !this.isInspecting;
    this.engine.setInspectMode(this.isInspecting);

    if (this.inspectBtn) {
      this.inspectBtn.classList.toggle('active', this.isInspecting);
    }

    if (this.inspectBadge) {
      this.inspectBadge.style.display = this.isInspecting ? 'flex' : 'none';
    }
  }

  setSectionData(data) {
    if (this.phaseEl && data.name) this.phaseEl.textContent = data.name;
    if (this.altEl && data.distance) this.altEl.textContent = data.distance;
    if (this.velEl && data.velocity) this.velEl.textContent = data.velocity;
  }

  update(scrollProgress = 0) {
    const now = new Date();

    // Live UTC Clock
    if (this.utcEl) {
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      this.utcEl.textContent = `${h}:${m}:${s} UTC`;
    }
  }
}
