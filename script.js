/**
 * Karel Kornelius — Portfolio
 * script.js — Vanilla JavaScript
 *
 * Features:
 *  1. Mobile hamburger menu toggle
 *  2. Smooth scroll for anchor links
 *  3. Active nav-link highlight based on scroll position
 *  4. Header shadow on scroll
 *  5. Contact form validation & feedback
 *  6. Scroll-reveal for section cards (IntersectionObserver)
 */

(function () {
  'use strict';

  /* ── Helpers ────────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── 1. Hamburger Menu Toggle ───────────────────────────── */
  const hamburger = qs('#hamburger');
  const mainNav   = qs('#main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a nav link is clicked (mobile)
    qsa('.nav-link', mainNav).forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── 2. Smooth Scroll ───────────────────────────────────── */
  // CSS scroll-behavior handles this for modern browsers.
  // This adds offset compensation for the fixed header height.
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72',
    10
  );

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#' || targetId === '#hero') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = qs(targetId);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ── 3. Active Nav Link on Scroll ──────────────────────── */
  const sections  = qsa('section[id], div[id="about"]');
  const navLinks  = qsa('.nav-link');

  // Map nav link href to section element
  const sectionMap = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const sec = qs(href);
    if (sec) sectionMap.set(link, sec);
  });

  function updateActiveNav() {
    const scrollY = window.scrollY + NAV_HEIGHT + 40;

    let currentLink = null;
    sectionMap.forEach((sec, link) => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentLink = link;
      }
    });

    navLinks.forEach(l => l.classList.remove('active'));
    if (currentLink) currentLink.classList.add('active');
  }

  /* ── 4. Header Shadow on Scroll ────────────────────────── */
  const siteHeader = qs('#site-header');

  function handleScroll() {
    if (!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    updateActiveNav();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run once on load

  /* ── 5. Contact Form — Tab Switch + Email / WhatsApp ───── */

  // Tab switcher
  const channelBtns = qsa('.channel-btn');
  channelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // Update buttons
      channelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels
      qsa('.tab-panel').forEach(p => p.classList.remove('active'));
      qs('#form-' + tab).classList.add('active');
    });
  });

  // Email form — opens Gmail compose
  const formEmail     = qs('#form-email');
  const feedbackEmail = qs('#feedback-email');

  if (formEmail) {
    formEmail.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = formEmail.elements['name'].value.trim();
      const subject = formEmail.elements['subject'].value.trim();
      const message = formEmail.elements['message'].value.trim();

      const body = name ? `Halo Karel,\n\nSaya ${name}.\n\n${message}` : message;

      // Gmail compose URL — langsung buka Gmail di browser
      const gmailUrl = `https://mail.google.com/mail/?view=cm`
                     + `&to=${encodeURIComponent('karelkarelkornelius@gmail.com')}`
                     + `&su=${encodeURIComponent(subject)}`
                     + `&body=${encodeURIComponent(body)}`;

      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      setFeedback(feedbackEmail, 'Gmail dibuka di tab baru…', 'success');
      formEmail.reset();
    });
  }

  // WhatsApp form — opens wa.me
  const formWa     = qs('#form-wa');
  const feedbackWa = qs('#feedback-wa');

  if (formWa) {
    formWa.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = formWa.elements['name'].value.trim();
      const message = formWa.elements['message'].value.trim();

      const waText = name ? `Halo Karel, saya ${name}.\n\n${message}` : message;
      const waUrl  = `https://wa.me/6281382958012?text=${encodeURIComponent(waText)}`;

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setFeedback(feedbackWa, 'Membuka WhatsApp…', 'success');
      formWa.reset();
    });
  }

  function setFeedback(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className   = 'form-note ' + type;
  }

  /* ── 6. Scroll Reveal (IntersectionObserver) ────────────── */
  const revealTargets = qsa(
    '.project-card, .card, .card-org, .metric, .skill-group, .exp-highlight-card, .contact-info-item, .mini-project-banner'
  );

  // Set initial hidden state via JS so CSS-only browsers still work
  revealTargets.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(18px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ── 7. Stagger delay for grid children ─────────────────── */
  const staggerGroups = qsa('.projects-grid, .org-grid, .metrics-strip, .skills-grid');

  staggerGroups.forEach(group => {
    const children = Array.from(group.children);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 70}ms`;
    });
  });

})();

/* ── 8. Gallery Modal (Projects) ─────────────────────────── */
(function () {

  // Data foto per project
  const galleries = {
    simas: {
      title: 'SIMAS — Website Inventory (Screenshots)',
      images: [
        { src: 'images/simas/Screenshot (546).png', alt: 'SIMAS Dashboard' },
        { src: 'images/simas/Screenshot (547).png', alt: 'SIMAS Halaman 2' },
        { src: 'images/simas/Screenshot (548).png', alt: 'SIMAS Halaman 3' },
        { src: 'images/simas/Screenshot (549).png', alt: 'SIMAS Halaman 4' },
        { src: 'images/simas/Screenshot (550).png', alt: 'SIMAS Halaman 5' },
        { src: 'images/simas/Screenshot (551).png', alt: 'SIMAS Halaman 6' },
        { src: 'images/simas/Screenshot (552).png', alt: 'SIMAS Halaman 7' },
        { src: 'images/simas/Screenshot (553).png', alt: 'SIMAS Halaman 8' },
        { src: 'images/simas/Screenshot (554).png', alt: 'SIMAS Halaman 9' },
        { src: 'images/simas/Screenshot (555).png', alt: 'SIMAS Halaman 10' },
        { src: 'images/simas/Screenshot (556).png', alt: 'SIMAS Halaman 11' },
        { src: 'images/simas/Screenshot (557).png', alt: 'SIMAS Halaman 12' },
      ]
    },
    company: {
      title: 'Company Profile Website (Screenshots)',
      images: [
        { src: 'images/company/Screenshot (538).png', alt: 'Company Profile Halaman 1' },
        { src: 'images/company/Screenshot (539).png', alt: 'Company Profile Halaman 2' },
        { src: 'images/company/Screenshot (540).png', alt: 'Company Profile Halaman 3' },
        { src: 'images/company/Screenshot (541).png', alt: 'Company Profile Halaman 4' },
        { src: 'images/company/Screenshot (542).png', alt: 'Company Profile Halaman 5' },
        { src: 'images/company/Screenshot (543).png', alt: 'Company Profile Halaman 6' },
        { src: 'images/company/Screenshot (544).png', alt: 'Company Profile Halaman 7' },
      ]
    }
  };

  const modal      = document.getElementById('gallery-modal');
  const backdrop   = document.getElementById('gallery-backdrop');
  const closeBtn   = document.getElementById('gallery-close-btn');
  const grid       = document.getElementById('gallery-grid');
  const modalTitle = document.getElementById('gallery-modal-title');

  if (!modal) return;

  // Lightbox element (created once)
  const lightbox = document.createElement('div');
  lightbox.className = 'gallery-lightbox';
  lightbox.setAttribute('hidden', '');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Preview gambar');

  const lbImg = document.createElement('img');
  lbImg.alt = '';
  lightbox.appendChild(lbImg);
  document.body.appendChild(lightbox);

  // Open modal
  function openGallery(key) {
    const data = galleries[key];
    if (!data) return;

    modalTitle.textContent = data.title;
    grid.innerHTML = '';

    data.images.forEach(({ src, alt }) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.loading = 'lazy';
      img.addEventListener('click', () => openLightbox(src, alt));
      grid.appendChild(img);
    });

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  // Close modal
  function closeGallery() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    grid.innerHTML = '';
  }

  // Lightbox
  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lightbox.removeAttribute('hidden');
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    lbImg.src = '';
  }

  // Event bindings
  document.getElementById('simas-gallery-btn').addEventListener('click', () => openGallery('simas'));
  document.getElementById('company-gallery-btn').addEventListener('click', () => openGallery('company'));

  closeBtn.addEventListener('click', closeGallery);
  backdrop.addEventListener('click', closeGallery);

  lightbox.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!lightbox.hasAttribute('hidden')) { closeLightbox(); return; }
      if (!modal.hasAttribute('hidden')) { closeGallery(); }
    }
  });

})();
