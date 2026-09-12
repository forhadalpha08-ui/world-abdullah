/**
 * Mobile Navigation Drawer Controller
 * Handles dedicated mobile menu toggle, smooth transitions, link navigation,
 * and accessibility focus trapping.
 */

export class MobileNavController {
  constructor() {
    this.hamburgerBtn = document.getElementById('mobile-menu-toggle');
    this.closeBtn = document.getElementById('mobile-menu-close');
    this.drawer = document.getElementById('mobile-nav-drawer');
    this.navLinks = document.querySelectorAll('.mobile-nav-link');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (this.hamburgerBtn) {
      this.hamburgerBtn.addEventListener('click', () => this.toggleMenu());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeMenu());
    }

    this.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          this.closeMenu();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Mobile quick action triggers
    const mobileInspect = document.getElementById('btn-mobile-inspect');
    const desktopInspect = document.getElementById('btn-inspect-orbit');
    if (mobileInspect && desktopInspect) {
      mobileInspect.addEventListener('click', () => {
        this.closeMenu();
        desktopInspect.click();
      });
    }

    const mobileAudio = document.getElementById('btn-mobile-audio');
    const desktopAudio = document.getElementById('btn-audio-toggle');
    if (mobileAudio && desktopAudio) {
      mobileAudio.addEventListener('click', () => {
        desktopAudio.click();
        const isActive = desktopAudio.classList.contains('active');
        mobileAudio.classList.toggle('active', isActive);
        const txt = document.getElementById('mobile-audio-text');
        if (txt) txt.textContent = isActive ? 'ORBITAL AUDIO: ON' : 'ORBITAL AUDIO: OFF';
      });
    }

    // Close on ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isOpen = true;
    if (this.drawer) {
      this.drawer.classList.add('active');
      this.drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    if (this.hamburgerBtn) {
      this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
  }

  closeMenu() {
    this.isOpen = false;
    if (this.drawer) {
      this.drawer.classList.remove('active');
      this.drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    if (this.hamburgerBtn) {
      this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  }
}
