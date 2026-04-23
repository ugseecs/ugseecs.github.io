/* ═══════════════════════════════════════════
   PORTFOLIO ENGINE v2 — Scroll-Morphing SPA
   ═══════════════════════════════════════════ */
(function () {
  'use strict';

  let DATA = null;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ── SVG Icon Map ──
  const ICONS = {
    github: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    email: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    // Project icons
    'logic-gate': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h4c5 0 8 3 8 6s-3 6-8 6H4z"/><line x1="16" y1="12" x2="22" y2="12"/><line x1="1" y1="8" x2="4" y2="8"/><line x1="1" y1="16" x2="4" y2="16"/></svg>',
    'gamepad': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="4"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="4" y1="12" x2="8" y2="12"/><circle cx="16" cy="10" r="0.8" fill="currentColor"/><circle cx="18" cy="12" r="0.8" fill="currentColor"/></svg>',
  };

  // ══════════════════════════════════════════
  //  CURSOR GLOW
  // ══════════════════════════════════════════
  function initCursorGlow() {
    const glow = $('#cursor-glow');
    let active = false;
    document.addEventListener('mousemove', (e) => {
      if (!active) { glow.classList.add('cursor-glow--visible'); active = true; }
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  // ══════════════════════════════════════════
  //  NAME SCROLL MORPH
  // ══════════════════════════════════════════
  function initNameMorph() {
    const chars = $$('.name-char');
    const section = $('#s-name');
    const hint = $('#scroll-hint');
    const topbar = $('#topbar');
    const total = chars.length;

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.6)));

      chars.forEach((ch, i) => {
        const charStart = (i / total) * 0.5;
        const charProgress = Math.max(0, Math.min(1, (progress - charStart) / 0.35));

        if (charProgress > 0) {
          ch.classList.add('morph');
          const tx = (Math.random() - 0.5) * 60 * charProgress;
          const ty = -40 * charProgress;
          const rot = (Math.random() - 0.5) * 20 * charProgress;
          ch.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${1 - charProgress * 0.3})`;
          ch.style.opacity = 1 - charProgress;
          ch.style.filter = `blur(${charProgress * 14}px)`;
        } else {
          ch.classList.remove('morph');
          ch.style.transform = '';
          ch.style.opacity = '';
          ch.style.filter = '';
        }
      });

      // Hide scroll hint
      if (progress > 0.05) hint.classList.add('hidden');
      else hint.classList.remove('hidden');

      // Show/hide topbar when name fully morphed
      if (progress > 0.7) topbar.classList.add('topbar--visible');
      else topbar.classList.remove('topbar--visible');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ══════════════════════════════════════════
  //  INTERSECTION OBSERVERS
  // ══════════════════════════════════════════
  function initRevealObservers() {
    // Identity section
    const identityObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.3 });
    const inner = $('.identity__inner');
    if (inner) identityObs.observe(inner);

    // Project rows
    const rowObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          rowObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    $$('.project-row').forEach((r, i) => {
      r.style.transitionDelay = `${i * 0.08}s`;
      r.style.transitionDuration = '0.7s';
      r.style.transitionProperty = 'opacity, transform';
      r.style.transitionTimingFunction = 'cubic-bezier(.16,1,.3,1)';
      rowObs.observe(r);
    });
  }

  // ══════════════════════════════════════════
  //  BLOCK RENDERER
  // ══════════════════════════════════════════
  function parseBold(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function renderBlocks(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    return blocks.map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<div class="block block--paragraph">${parseBold(block.text)}</div>`;
        case 'highlight_quote':
          return `<blockquote class="block block--quote">${parseBold(block.text)}</blockquote>`;
        case 'feature_list':
          return `<div class="block block--features">
            <h3 class="block__heading">${block.heading}</h3>
            ${block.items.map((item) => `<div class="feature-item">${parseBold(item)}</div>`).join('')}
          </div>`;
        case 'tech_spec_grid':
          return `<div class="block block--specs">
            <h3 class="block__heading">${block.heading}</h3>
            <div class="spec-grid">
              ${block.specs.map((s) => `<div class="spec-item">${parseBold(s)}</div>`).join('')}
            </div>
          </div>`;
        case 'grid_cards':
          return `<div class="block block--grid-cards">
            <h3 class="block__heading">${block.heading}</h3>
            <div class="grid-cards">
              ${block.cards.map((c) => `<div class="grid-card">
                <div class="grid-card__title">${c.title}</div>
                <div class="grid-card__text">${parseBold(c.text)}</div>
              </div>`).join('')}
            </div>
          </div>`;
        default:
          return '';
      }
    }).join('');
  }

  // ══════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════
  function renderIdentity(profile) {
    $('#identity-tagline').textContent = profile.tagline;
    $('#identity-timeline').textContent = profile.timeline;

    const socialsEl = $('#identity-socials');
    if (profile.socials) {
      // Connect section grid cards
      const connectHTML = profile.socials.map((s) => {
        const handle = s.url.split('/').pop().replace('mailto:', '');
        return `<a href="${s.url}" class="social-card" target="_blank" rel="noopener" aria-label="${s.platform}">
          ${ICONS[s.icon] || ''}
          <div>
            <div class="social-card__name">${s.platform}</div>
            <div class="social-card__handle">${s.platform === 'Email' ? handle : '@' + handle}</div>
          </div>
        </a>`;
      }).join('');
      if (socialsEl) socialsEl.innerHTML = connectHTML;

      // Topbar circular links
      const topbarHTML = profile.socials.map((s) =>
        `<a href="${s.url}" class="social-link" target="_blank" rel="noopener" aria-label="${s.platform}" title="${s.platform}">${ICONS[s.icon] || ''}</a>`
      ).join('');
      const tbSocials = $('#topbar-socials');
      if (tbSocials) tbSocials.innerHTML = topbarHTML;
    }
  }

  // ══════════════════════════════════════════
  //  3D TILT ON PROJECT ROWS
  // ══════════════════════════════════════════
  function initTiltCards() {
    $$('.project-row').forEach((row) => {
      row.addEventListener('mousemove', (e) => {
        const rect = row.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;  // subtle tilt
        const rotateY = ((x - centerX) / centerX) * 6;
        row.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
      });
      row.addEventListener('mouseleave', () => {
        row.style.transform = '';
        row.style.transition = 'transform 0.5s cubic-bezier(.16,1,.3,1)';
        setTimeout(() => { row.style.transition = ''; }, 500);
      });
    });
  }

  function renderProjects(projects) {
    const list = $('#projects-list');
    list.innerHTML = projects.map((p, i) => `
      <div class="project-row" data-id="${p.id}" tabindex="0">
        <div class="project-row__left">
          <span class="project-row__index">0${i + 1}</span>
          <span class="project-row__icon">${ICONS[p.icon] || ''}</span>
          <span class="project-row__title">${p.title}</span>
        </div>
        <div class="project-row__right">
          <span class="project-row__desc">${p.short_desc}</span>
          <span class="project-row__arrow">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 13L13 5M13 5H7M13 5V11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </div>
      </div>
    `).join('');

    $$('.project-row').forEach((row) => {
      row.addEventListener('click', () => openModal(row.dataset.id));
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(row.dataset.id); }
      });
    });
  }

  // ══════════════════════════════════════════
  //  PROJECT PAGE OVERLAY
  // ══════════════════════════════════════════
  function openModal(id) {
    const project = DATA.projects.find((p) => p.id === id);
    if (!project) return;

    $('#pp-title').innerHTML = `${ICONS[project.icon] ? '<span class="modal__icon">' + ICONS[project.icon] + '</span>' : ''}${project.title}`;
    $('#pp-desc').textContent = project.short_desc;
    $('#pp-link').href = project.link;
    $('#pp-tags').innerHTML = project.tags.map((t) => `<span class="tag">${t}</span>`).join('');
    $('#pp-body').innerHTML = renderBlocks(project.content_blocks);

    const overlay = $('#project-page');
    overlay.classList.add('project-page--active');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
    $('#project-page-back').focus();
  }

  function closeModal() {
    $('#project-page').classList.remove('project-page--active');
    document.body.style.overflow = '';
  }

  function bindModal() {
    $('#project-page-back').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  // ══════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════
  async function init() {
    try {
      const res = await fetch('data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      DATA = await res.json();

      renderIdentity(DATA.profile);
      renderProjects(DATA.projects);
      bindModal();
      initCursorGlow();
      initNameMorph();
      initRevealObservers();
      initTiltCards();

      console.log('[Portfolio] Ready.');
    } catch (err) {
      console.error('[Portfolio] Load failed:', err);
      document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#ff5252;text-align:center;padding:2rem"><div><h1 style="font-size:2rem;margin-bottom:1rem">// ERROR</h1><p>Failed to load data.json</p><p style="color:#555;margin-top:.5rem">${err.message}</p></div></div>`;
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
