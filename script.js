/* ============================================================
   SnapTask — script.js  (v1.0.0 — production)
   ============================================================

   Modules
   ────────
   1. Sticky Navigation     – .scrolled class on <header>
   2. Mobile Navigation     – hamburger ↔ menu toggle + focus trap
   3. FAQ Accordion         – smooth animated expand / collapse
   4. Scroll Reveal         – IntersectionObserver fade-in
   5. Smooth Anchor Scroll  – intercept # links
   6. Keyboard Accessibility – Escape / Tab / focus management
   ============================================================ */

'use strict';

/* ─── Bootstrap ─────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /** Convenience: query with null-safe guard */
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Detect reduced-motion preference once */
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // ── 1. STICKY NAVIGATION ───────────────────────────────────────────────
  //
  // Adds `.scrolled` to the <header> once the user scrolls past 10 px.
  // Passive listener so scrolling is never blocked by JS.
  // ──────────────────────────────────────────────────────────────────────
  const initStickyNav = () => {
    const header = qs('#site-header');
    if (!header) return;

    const THRESHOLD = 10;

    const update = () => {
      header.classList.toggle('scrolled', window.scrollY > THRESHOLD);
    };

    window.addEventListener('scroll', update, { passive: true });
    update(); // handle mid-page load
  };


  // ── 2. MOBILE NAVIGATION ──────────────────────────────────────────────
  //
  // Hamburger toggles the mobile menu.
  // Focus is trapped inside the menu while it is open.
  // Escape returns focus to the burger button.
  // ──────────────────────────────────────────────────────────────────────
  const initMobileNav = () => {
    const burger = qs('#nav-burger');
    const menu   = qs('#mobile-menu');
    if (!burger || !menu) return null;

    /** All keyboard-focusable elements inside the open menu */
    const focusable = () =>
      qsa('a[href], button:not([disabled])', menu).filter(
        el => !el.closest('[hidden]')
      );

    const openMenu = () => {
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close navigation menu');
      const first = focusable()[0];
      if (first) first.focus();
    };

    const closeMenu = () => {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open navigation menu');
    };

    burger.addEventListener('click', () => {
      menu.hidden ? openMenu() : closeMenu();
    });

    // Close on any link inside the menu
    qsa('a', menu).forEach(link => link.addEventListener('click', closeMenu));

    // Tab-key focus trap inside open menu
    menu.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last  = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Auto-close when viewport widens past mobile breakpoint
    const mq = window.matchMedia('(min-width: 641px)');
    mq.addEventListener('change', e => { if (e.matches && !menu.hidden) closeMenu(); });

    return { openMenu, closeMenu, burger };
  };


  // ── 3. FAQ ACCORDION ──────────────────────────────────────────────────
  //
  // One item open at a time; smooth height animation via explicit
  // scrollHeight measurement + forced reflow.
  // `prefersReducedMotion` skips the animation entirely.
  // ──────────────────────────────────────────────────────────────────────
  const initFAQ = () => {
    const questions = qsa('.faq-item__question');
    if (!questions.length) return;

    /** Animate panel open: 0 → scrollHeight */
    const openPanel = panel => {
      panel.dataset.state = 'opening';
      panel.removeAttribute('hidden');

      if (prefersReducedMotion) {
        delete panel.dataset.state;
        return;
      }

      const targetH = panel.scrollHeight;
      panel.style.overflow   = 'hidden';
      panel.style.height     = '0px';

      // Force reflow so the browser registers height:0 before transition
      void panel.getBoundingClientRect();

      panel.style.transition = 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      panel.style.height     = `${targetH}px`;

      panel.addEventListener('transitionend', () => {
        if (panel.dataset.state !== 'opening') return;
        panel.style.height = panel.style.overflow = panel.style.transition = '';
        delete panel.dataset.state;
      }, { once: true });
    };

    /** Animate panel closed: scrollHeight → 0, then hide */
    const closePanel = panel => {
      panel.dataset.state = 'closing';

      if (prefersReducedMotion) {
        panel.setAttribute('hidden', '');
        delete panel.dataset.state;
        return;
      }

      panel.style.height   = `${panel.scrollHeight}px`;
      panel.style.overflow = 'hidden';

      void panel.getBoundingClientRect();

      panel.style.transition = 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      panel.style.height     = '0px';

      panel.addEventListener('transitionend', () => {
        if (panel.dataset.state !== 'closing') return;
        panel.setAttribute('hidden', '');
        panel.style.height = panel.style.overflow = panel.style.transition = '';
        delete panel.dataset.state;
      }, { once: true });
    };

    questions.forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen  = btn.getAttribute('aria-expanded') === 'true';
        const panelId = btn.getAttribute('aria-controls');
        if (!panelId) return;
        const panel = qs(`#${panelId}`);
        if (!panel) return;

        // Close all other open items
        questions.forEach(other => {
          if (other === btn) return;
          if (other.getAttribute('aria-expanded') !== 'true') return;
          other.setAttribute('aria-expanded', 'false');
          const otherId = other.getAttribute('aria-controls');
          if (!otherId) return;
          const otherPanel = qs(`#${otherId}`);
          if (otherPanel && !otherPanel.hidden) closePanel(otherPanel);
        });

        // Toggle clicked item
        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          closePanel(panel);
        } else {
          btn.setAttribute('aria-expanded', 'true');
          openPanel(panel);
        }
      });
    });
  };


  // ── 4. SCROLL REVEAL ──────────────────────────────────────────────────
  //
  // Adds `.reveal` to key elements then triggers `.visible` via
  // IntersectionObserver. Hero children excluded (own CSS entrance anim).
  // ──────────────────────────────────────────────────────────────────────
  const initScrollReveal = () => {
    if (!('IntersectionObserver' in window)) return;
    if (prefersReducedMotion) return; // honour user preference

    const SELECTORS = [
      '.section-header',
      '.feature-card',
      '.step',
      '.privacy-card',
      '.faq-item',
      '.cta-card',
    ];

    SELECTORS.forEach(sel =>
      qsa(sel).forEach(el => {
        if (!el.closest('.hero')) el.classList.add('reveal');
      })
    );

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    qsa('.reveal').forEach(el => observer.observe(el));
  };


  // ── 5. SMOOTH ANCHOR SCROLLING ────────────────────────────────────────
  //
  // Intercepts # links, scrolls to target, updates URL, shifts focus.
  // `scroll-padding-top` in CSS handles the fixed nav offset.
  // ──────────────────────────────────────────────────────────────────────
  const initSmoothScroll = () => {
    qsa('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;

        const target = qs(hash);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (history.pushState) history.pushState(null, '', hash);

        // Make section focusable for screen readers
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  };


  // ── 6. KEYBOARD ACCESSIBILITY ─────────────────────────────────────────
  //
  // Global keydown handler:
  //   Escape → close mobile menu, return focus to burger
  // ──────────────────────────────────────────────────────────────────────
  const initKeyboard = nav => {
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!nav) return;
      const menu = qs('#mobile-menu');
      if (menu && !menu.hidden) {
        nav.closeMenu();
        nav.burger.focus();
      }
    });
  };


  // ── BOOTSTRAP ──────────────────────────────────────────────────────────
  initStickyNav();
  const mobileNav = initMobileNav();
  initFAQ();
  initScrollReveal();
  initSmoothScroll();
  initKeyboard(mobileNav);

}); // ── end DOMContentLoaded
