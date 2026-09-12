/**
 * Cinematic ScrollController for Earth Odyssey
 * Drives smooth camera orbital transitions across the 6 narrative acts:
 * 01: ORIGIN -> 02: IDENTITY -> 03: VISION -> 04: CREATION -> 05: EXPERIENCE -> 06: CONTACT
 * Supports wheel, touch gestures (mobile-first), timeline clicks, and keyboard shortcuts.
 */

import { EARTH_ACTS, SECTION_KEYS } from '../config/sectionConfig.js';

export class ScrollController {
  constructor(earthEngine, onActChange = () => {}) {
    this.engine = earthEngine;
    this.onActChange = onActChange;

    this.acts = EARTH_ACTS;
    this.totalActs = this.acts.length; // 6
    this.keys = SECTION_KEYS;

    this.scrollProgress = 0; // 0.0 to 5.0
    this.targetProgress = 0;
    this.currentActIndex = 0;

    // Cache elements
    this.actElements = this.keys.map((key) => ({
      key,
      el: document.getElementById(`act-${key}`)
    }));

    this.timelineDots = document.querySelectorAll('.nav-dot-item');
    this.touchStartY = 0;
    this.isSwiping = false;

    this.setupListeners();
    this.onScroll();
    this.updateUI(0);
  }

  setupListeners() {
    if (this.engine && typeof this.engine.setOnRender === 'function') {
      this.engine.setOnRender((elapsedTime, smoothPointer) => {
        this.updateParallax(smoothPointer);
      });
    }

    // Window scroll listener
    window.addEventListener('scroll', () => {
      this.onScroll();
    }, { passive: true });

    // Touch swipe gestures for mobile-first fluid navigation
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchStartY = e.touches[0].clientY;
        this.isSwiping = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!this.isSwiping || e.changedTouches.length !== 1) return;
      this.isSwiping = false;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = this.touchStartY - touchEndY;

      // Sensitive swipe threshold
      if (Math.abs(diffY) > 45) {
        if (diffY > 0) {
          // Swipe up -> next act
          this.nextAct();
        } else {
          // Swipe down -> prev act
          this.prevAct();
        }
      }
    }, { passive: true });

    // Right-side vertical dot timeline click
    this.timelineDots.forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(index)) {
          this.scrollToAct(index);
        }
      });
    });

    // Keyboard navigation (1-6 for instant warp, Up/Down arrows, Space)
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'ArrowDown' || e.code === 'PageDown') {
        e.preventDefault();
        this.nextAct();
      } else if (e.code === 'ArrowUp' || e.code === 'PageUp') {
        e.preventDefault();
        this.prevAct();
      } else {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= 6) {
          this.scrollToAct(keyNum - 1);
        }
      }
    });

    window.addEventListener('resize', () => {
      this.onScroll();
    });
  }

  onScroll() {
    const spacer = document.querySelector('.scroll-track-spacer');
    const trackHeight = spacer ? spacer.offsetHeight : (document.documentElement.scrollHeight - window.innerHeight);
    if (trackHeight <= 0) return;

    const scrollY = window.scrollY;
    // Map scroll percentage across the 6-act spacer
    const progress = Math.max(0, Math.min(this.totalActs - 1, (scrollY / trackHeight) * (this.totalActs - 1)));
    this.scrollProgress = progress;

    // Update 3D engine target progress
    if (this.engine) {
      this.engine.setActProgress(this.scrollProgress);
    }

    // Determine active act index (nearest integer)
    const activeIndex = Math.min(this.totalActs - 1, Math.round(this.scrollProgress));
    if (activeIndex !== this.currentActIndex) {
      this.currentActIndex = activeIndex;
      this.updateUI(activeIndex);
      this.onActChange(this.acts[activeIndex]);
    }

    // Smooth opacity fading between subtitle cards based on fractional distance
    this.updateSubtitleFades(this.scrollProgress);

    // Fade out floating orbit controls when viewing deep scientific compendium
    const inDeepCompendium = spacer && scrollY > (trackHeight - window.innerHeight * 0.35);
    const bottomControls = document.querySelector('.bottom-controls');
    const rightNav = document.querySelector('.right-vertical-nav');
    if (bottomControls) {
      bottomControls.style.opacity = inDeepCompendium ? '0' : '1';
      bottomControls.style.pointerEvents = inDeepCompendium ? 'none' : 'auto';
      bottomControls.style.transition = 'opacity 0.35s ease';
    }
    if (rightNav) {
      rightNav.style.opacity = inDeepCompendium ? '0' : '1';
      rightNav.style.pointerEvents = inDeepCompendium ? 'none' : 'auto';
      rightNav.style.transition = 'opacity 0.35s ease';
    }
  }

  updateSubtitleFades(progress) {
    this.actElements.forEach(({ el }, idx) => {
      if (!el) return;
      const dist = Math.abs(progress - idx);
      // Fade in sharply within 0.45 distance
      const opacity = Math.max(0, 1.0 - dist * 2.2);
      el.style.opacity = opacity.toFixed(3);
      el.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
      
      // Slight vertical parallax glide
      const offset = (progress - idx) * 20;
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
  }

  updateParallax(smoothPointer) {
    if (!smoothPointer) return;
    const activeEl = this.actElements[this.currentActIndex]?.el;
    if (!activeEl) return;
    const inner = activeEl.querySelector('.act-inner');
    if (inner) {
      const tiltX = smoothPointer.y * -1.8;
      const tiltY = smoothPointer.x * 2.2;
      const shiftX = smoothPointer.x * 5.0;
      const shiftY = smoothPointer.y * 3.5;
      inner.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0)`;
    }
  }

  updateUI(activeIndex) {
    // Update right vertical dot navigation
    this.timelineDots.forEach((dot, idx) => {
      const isActive = idx === activeIndex;
      dot.classList.toggle('active', isActive);
      const dotCircle = dot.querySelector('.nav-dot-circle');
      if (dotCircle) {
        dotCircle.classList.toggle('active', isActive);
      }
    });
  }

  scrollToAct(index) {
    const spacer = document.querySelector('.scroll-track-spacer');
    const trackHeight = spacer ? spacer.offsetHeight : (document.documentElement.scrollHeight - window.innerHeight);
    const targetScroll = (index / (this.totalActs - 1)) * trackHeight;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }

  nextAct() {
    if (this.currentActIndex < this.totalActs - 1) {
      this.scrollToAct(this.currentActIndex + 1);
    }
  }

  prevAct() {
    if (this.currentActIndex > 0) {
      this.scrollToAct(this.currentActIndex - 1);
    }
  }
}
