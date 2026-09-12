/**
 * AudioController
 * Procedural deep-space atmospheric sound generator using Web Audio API.
 * Synthesizes ambient orbital drone and cosmic frequency bed with zero external audio assets.
 * Automatically engages on user gesture and toggles cleanly with zero cross icons.
 */

export class AudioController {
  constructor(toggleButtonId = 'btn-audio-toggle') {
    this.button = document.getElementById(toggleButtonId);
    this.ctx = null;
    this.isPlaying = true; // Sound enabled by default
    this.masterGain = null;

    if (this.button) {
      this.button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleAudio();
      });
    }

    // Auto-engage sound on first user gesture (click, scroll, key, touch)
    this.setupGestureUnlock();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    try {
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Deep Sub Drone (55Hz / A1 fundamental)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // 2. Harmonic Sine (110.25Hz slightly detuned for binaural beating)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110.25, this.ctx.currentTime);

      // 3. Velvety Upper Harmonic (220.5Hz subtle air warmth)
      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(220.5, this.ctx.currentTime);

      const osc3Gain = this.ctx.createGain();
      osc3Gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      osc3.connect(osc3Gain);

      // Low-pass filter for velvety space warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Subtle slow LFO for breathing planetary ambiance
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(32, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.20, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3Gain.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      osc3.start();
      lfo.start();

      return true;
    } catch (err) {
      console.warn('AudioContext initialization error:', err);
      return false;
    }
  }

  setupGestureUnlock() {
    const unlock = async () => {
      if (this.isPlaying) {
        this.startSound();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('wheel', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('wheel', unlock, { passive: true });
  }

  async startSound() {
    if (!this.ctx) {
      const ok = this.initAudioContext();
      if (!ok) return;
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        // user interaction pending
      }
    }

    this.isPlaying = true;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.linearRampToValueAtTime(0.35, now + 1.2);
    }

    if (this.button) {
      this.button.classList.add('active');
      this.button.setAttribute('aria-label', 'Mute Orbital Audio');
    }

    const soundState = document.getElementById('sound-state-text');
    if (soundState) soundState.textContent = 'ON';
    const drawerToggle = document.getElementById('drawer-audio-toggle');
    if (drawerToggle) drawerToggle.classList.add('active');
  }

  muteSound() {
    this.isPlaying = false;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }

    if (this.button) {
      this.button.classList.remove('active');
      this.button.setAttribute('aria-label', 'Unmute Orbital Audio');
    }

    const soundState = document.getElementById('sound-state-text');
    if (soundState) soundState.textContent = 'OFF';
    const drawerToggle = document.getElementById('drawer-audio-toggle');
    if (drawerToggle) drawerToggle.classList.remove('active');
  }

  toggleAudio() {
    if (this.isPlaying) {
      this.muteSound();
    } else {
      this.startSound();
    }
  }
}
