/**
 * Professional Experience & Credentials Page Script
 * MD Saib Hossain Portfolio
 *
 * Synchronized with official CV (assets/cv/Md_Saib_Hossain.pdf):
 * - Computes real-time career experience span (years + months) and per-role tenure
 * - Renders formal chronological experience ledger, education & technical stack, and 13 verified credentials
 * - Implements accessible single-row filter controls and native <dialog> lightbox with light-dismiss fallback
 */

(function () {
  'use strict';

  const CONFIG = {
    dataPath: '../../assets/data/experience.json?v=4.0',
    // Baseline reference floor (Nov 2026) so "Present" roles never under-report if a client clock is behind
    minPresentDate: new Date(2026, 10, 1)
  };

  const MONTH_MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  const state = {
    data: null,
    activeSectionFilter: 'all-experience',
    activeCertFilter: 'all'
  };

  const els = {
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    hudTotalYears: document.getElementById('hud-total-years'),
    hudExactTenure: document.getElementById('hud-exact-tenure'),
    hudTenureSpan: document.getElementById('hud-tenure-span'),
    hudRolesCount: document.getElementById('hud-roles-count'),
    hudRolesBreakdown: document.getElementById('hud-roles-breakdown'),
    hudCertsCount: document.getElementById('hud-certs-count'),
    inlineTotalExp: document.getElementById('inline-total-exp'),
    filterBar: document.getElementById('filter-bar'),
    certSubfilters: document.getElementById('cert-subfilters'),
    resultsCount: document.getElementById('results-count'),
    sectionExperience: document.getElementById('section-experience'),
    sectionEduSkills: document.getElementById('section-education-skills'),
    sectionCertifications: document.getElementById('section-certifications'),
    timelineContainer: document.getElementById('timeline-container'),
    educationContainer: document.getElementById('education-container'),
    honorsContainer: document.getElementById('honors-container'),
    skillsMatrixContainer: document.getElementById('skills-matrix-container'),
    certificationsGrid: document.getElementById('certifications-grid'),
    certModal: document.getElementById('cert-modal'),
    modalCertImg: document.getElementById('modal-cert-img'),
    modalCertTitle: document.getElementById('modal-cert-title'),
    modalCertProvider: document.getElementById('modal-cert-provider'),
    modalCertTime: document.getElementById('modal-cert-time'),
    modalCertBadge: document.getElementById('modal-cert-badge'),
    modalCertLink: document.getElementById('modal-cert-link')
  };

  function getEffectiveNow() {
    const now = new Date();
    return now < CONFIG.minPresentDate ? CONFIG.minPresentDate : now;
  }

  function parseDateString(str) {
    if (!str) return getEffectiveNow();
    const clean = str.trim().toLowerCase();
    if (/present|ongoing|current/.test(clean)) return getEffectiveNow();

    const parts = clean.split(/[\s,–-]+/).filter(Boolean);
    if (parts.length >= 2) {
      const monthPrefix = parts[0].slice(0, 3);
      const m = MONTH_MAP[monthPrefix] !== undefined ? MONTH_MAP[monthPrefix] : 0;
      const y = parseInt(parts[1], 10);
      if (!isNaN(y)) return new Date(y, m, 1);
    } else if (parts.length === 1 && !isNaN(parseInt(parts[0], 10))) {
      return new Date(parseInt(parts[0], 10), 0, 1);
    }
    return getEffectiveNow();
  }

  /**
   * Inclusive month duration calculator (e.g., Nov 2025 – Mar 2026 = 5 mos; Nov 2025 – Nov 2026 = 1 yr 1 mo)
   */
  function calculateDuration(startStr, endStr) {
    if (!startStr) return { formatted: '', isOngoing: false, totalMonths: 0 };

    const start = parseDateString(startStr);
    const isOngoing = !endStr || /present|ongoing|current/i.test(endStr.trim());
    const end = isOngoing ? getEffectiveNow() : parseDateString(endStr);

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if (months <= 0) months = 1;

    const years = Math.floor(months / 12);
    const remMonths = months % 12;

    let formatted = '';
    if (years > 0 && remMonths > 0) {
      formatted = `${years} ${years === 1 ? 'yr' : 'yrs'} ${remMonths} ${remMonths === 1 ? 'mo' : 'mos'}`;
    } else if (years > 0) {
      formatted = `${years} ${years === 1 ? 'yr' : 'yrs'}`;
    } else {
      formatted = `${months} ${months === 1 ? 'mo' : 'mos'}`;
    }

    return { formatted, isOngoing, totalMonths: months };
  }

  /**
   * Computes net active career span from earliest professional role start to present
   */
  function calculateCareerSummary(timeline, careerStartFallback) {
    const now = getEffectiveNow();
    let earliest = careerStartFallback ? parseDateString(careerStartFallback) : now;

    (timeline || []).forEach(item => {
      if (item.start_date) {
        const d = parseDateString(item.start_date);
        if (d < earliest) earliest = d;
      }
    });

    let totalMonths = (now.getFullYear() - earliest.getFullYear()) * 12 + (now.getMonth() - earliest.getMonth()) + 1;
    if (totalMonths <= 0) totalMonths = 1;

    const years = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;

    const headlineYears = years >= 1 ? `${years}+ ${years === 1 ? 'Year' : 'Years'}` : `${totalMonths} Months`;
    const displayHeadline = years === 1 && remMonths > 0 ? '1+ Years' : headlineYears;

    let exactLabel = '';
    if (years > 0 && remMonths > 0) {
      exactLabel = `${years} Yr${years > 1 ? 's' : ''} ${remMonths} Mo${remMonths > 1 ? 's' : ''}`;
    } else if (years > 0) {
      exactLabel = `${years} Year${years > 1 ? 's' : ''}`;
    } else {
      exactLabel = `${totalMonths} Months`;
    }

    const startMonthName = earliest.toLocaleString('en-US', { month: 'short' });
    const startYear = earliest.getFullYear();

    return {
      headline: displayHeadline,
      exact: exactLabel,
      spanText: `Active Career Span · ${startMonthName} ${startYear} – Present`,
      inlineText: `${displayHeadline} (${exactLabel})`
    };
  }

  function updateSummaryMetrics() {
    if (!state.data) return;
    const timeline = state.data.timeline || [];
    const certs = state.data.certifications || [];

    const career = calculateCareerSummary(timeline, state.data.career_start);
    if (els.hudTotalYears) els.hudTotalYears.textContent = career.headline;
    if (els.hudExactTenure) els.hudExactTenure.textContent = career.exact;
    if (els.hudTenureSpan) els.hudTenureSpan.textContent = career.spanText;
    if (els.inlineTotalExp) els.inlineTotalExp.textContent = career.inlineText;

    const activeCount = timeline.filter(r => !r.end_date || /present|ongoing/i.test(r.end_date)).length;
    const engCount = timeline.filter(r => r.category === 'engineering').length;
    const resCount = timeline.filter(r => r.category === 'research').length;

    if (els.hudRolesCount) els.hudRolesCount.textContent = `${timeline.length} Roles`;
    if (els.hudRolesBreakdown) {
      els.hudRolesBreakdown.textContent = `${activeCount} Active · ${engCount} Engineering · ${resCount} Research`;
    }
    if (els.hudCertsCount) els.hudCertsCount.textContent = String(certs.length);

    const badgeAll = document.getElementById('badge-all');
    const badgeEng = document.getElementById('badge-eng');
    const badgeRes = document.getElementById('badge-res');
    const badgeCert = document.getElementById('badge-cert');
    if (badgeAll) badgeAll.textContent = String(timeline.length);
    if (badgeEng) badgeEng.textContent = String(engCount);
    if (badgeRes) badgeRes.textContent = String(resCount);
    if (badgeCert) badgeCert.textContent = String(certs.length);
  }

  function setupTopFilterBar() {
    if (!els.filterBar) return;

    els.filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const filterId = btn.dataset.filter;
      if (!filterId || filterId === state.activeSectionFilter) return;

      state.activeSectionFilter = filterId;

      els.filterBar.querySelectorAll('.filter-btn').forEach(b => {
        const selected = b === btn;
        b.classList.toggle('active', selected);
        b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      try {
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
      } catch (err) {
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }

      applyViewFilter();
    });
  }

  function setupCertSubfilters() {
    if (!els.certSubfilters) return;

    els.certSubfilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.cert-subbtn');
      if (!btn) return;
      const subFilter = btn.dataset.certFilter;
      if (!subFilter || subFilter === state.activeCertFilter) return;

      state.activeCertFilter = subFilter;

      els.certSubfilters.querySelectorAll('.cert-subbtn').forEach(b => {
        const selected = b === btn;
        b.classList.toggle('active', selected);
        b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      try {
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
      } catch (err) {
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }

      renderCertifications();
    });
  }

  function applyViewFilter() {
    const mode = state.activeSectionFilter;
    const career = calculateCareerSummary(state.data.timeline || [], state.data.career_start);

    if (mode === 'all-experience') {
      if (els.sectionExperience) els.sectionExperience.hidden = false;
      if (els.sectionEduSkills) els.sectionEduSkills.hidden = false;
      if (els.sectionCertifications) els.sectionCertifications.hidden = false;
      renderTimeline('all');
      if (els.resultsCount) {
        els.resultsCount.textContent = `Showing complete CV dossier (${(state.data.timeline || []).length} roles · ${career.headline} experience · ${(state.data.certifications || []).length} credentials)`;
      }
    } else if (mode === 'engineering') {
      if (els.sectionExperience) els.sectionExperience.hidden = false;
      if (els.sectionEduSkills) els.sectionEduSkills.hidden = true;
      if (els.sectionCertifications) els.sectionCertifications.hidden = true;
      const count = renderTimeline('engineering');
      if (els.resultsCount) {
        els.resultsCount.textContent = `Filtered: ${count} AI & Software Engineering positions`;
      }
    } else if (mode === 'research') {
      if (els.sectionExperience) els.sectionExperience.hidden = false;
      if (els.sectionEduSkills) els.sectionEduSkills.hidden = true;
      if (els.sectionCertifications) els.sectionCertifications.hidden = true;
      const count = renderTimeline('research');
      if (els.resultsCount) {
        els.resultsCount.textContent = `Filtered: ${count} Research & AI Safety positions`;
      }
    } else if (mode === 'certifications') {
      if (els.sectionExperience) els.sectionExperience.hidden = true;
      if (els.sectionEduSkills) els.sectionEduSkills.hidden = true;
      if (els.sectionCertifications) els.sectionCertifications.hidden = false;
      renderCertifications();
      if (els.resultsCount) {
        els.resultsCount.textContent = `Showing ${(state.data.certifications || []).length} verified certifications & credentials`;
      }
    } else if (mode === 'education-skills') {
      if (els.sectionExperience) els.sectionExperience.hidden = true;
      if (els.sectionEduSkills) els.sectionEduSkills.hidden = false;
      if (els.sectionCertifications) els.sectionCertifications.hidden = true;
      if (els.resultsCount) {
        els.resultsCount.textContent = 'Showing academic degree, technical stack matrix, and leadership record';
      }
    }
  }

  function renderTimeline(categoryFilter) {
    if (!els.timelineContainer || !state.data || !state.data.timeline) return 0;

    let items = state.data.timeline;
    if (categoryFilter === 'engineering' || categoryFilter === 'research') {
      items = items.filter(item => item.category === categoryFilter);
    }

    els.timelineContainer.innerHTML = items.map((item, idx) => {
      const duration = calculateDuration(item.start_date, item.end_date);
      const openByDefault = duration.isOngoing || idx === 0;

      const outcomesHtml = (item.achievements || []).length > 0
        ? `<ul class="role-outcomes">${item.achievements.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
        : '';

      const responsibilitiesHtml = (item.key_responsibilities || []).length > 0
        ? `
          <details class="role-details" ${openByDefault ? 'open' : ''}>
            <summary class="role-details-summary">
              <span>Key Responsibilities &amp; Technical Scope (${item.key_responsibilities.length})</span>
              <svg class="details-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </summary>
            <div class="role-details-body">
              <ul class="resp-list">
                ${item.key_responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          </details>
        `
        : '';

      const skillsHtml = (item.skills || []).map(skill =>
        `<span class="tech-pill">${escapeHtml(skill)}</span>`
      ).join('');

      const primaryLinkHtml = item.link
        ? `<a href="${item.link}" ${item.link.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="formal-inline-link">
             <span>${escapeHtml(item.link_label || 'View Details')}</span>
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7"></path><polyline points="7 7 17 7 17 17"></polyline></svg>
           </a>`
        : '';

      const secondaryLinkHtml = item.secondary_link
        ? `<a href="${item.secondary_link}" target="_blank" rel="noopener noreferrer" class="formal-inline-link">
             <span>${escapeHtml(item.secondary_link_label || 'Live Link')}</span>
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7"></path><polyline points="7 7 17 7 17 17"></polyline></svg>
           </a>`
        : '';

      return `
        <article class="ledger-item ${duration.isOngoing ? 'is-ongoing' : ''}" id="${escapeHtml(item.id || `role-${idx}`)}">
          <div class="ledger-meta-col">
            <span class="ledger-marker" aria-hidden="true"></span>
            <div class="ledger-dates">${escapeHtml(item.start_date)} — ${escapeHtml(item.end_date)}</div>
            <div class="ledger-duration-row">
              <span class="ledger-duration-pill">${escapeHtml(duration.formatted)}</span>
              ${duration.isOngoing ? '<span class="ledger-active-tag">Current</span>' : ''}
            </div>
            <div class="ledger-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHtml(item.location)}</span>
            </div>
          </div>

          <div class="ledger-card">
            <div class="ledger-card-header">
              <div class="role-heading-group">
                <h3 class="role-title">${escapeHtml(item.title)}</h3>
                <div class="company-name">${escapeHtml(item.company)}</div>
              </div>
              <div class="role-badges-group">
                <span class="role-track-badge">${escapeHtml(item.job_type)}</span>
              </div>
            </div>

            <p class="role-summary">${escapeHtml(item.description)}</p>
            ${outcomesHtml}
            ${responsibilitiesHtml}

            <div class="ledger-card-footer">
              <div class="skills-row">${skillsHtml}</div>
              ${(primaryLinkHtml || secondaryLinkHtml) ? `<div class="role-links-group">${primaryLinkHtml}${secondaryLinkHtml}</div>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    return items.length;
  }

  function renderEducationAndSkills() {
    if (!state.data) return;

    if (els.educationContainer && Array.isArray(state.data.education)) {
      els.educationContainer.innerHTML = state.data.education.map(edu => `
        <article class="edu-card">
          <div class="edu-header">
            <div>
              <h4 class="edu-degree">${escapeHtml(edu.degree)}</h4>
              <div class="edu-inst">${escapeHtml(edu.institution)} · ${escapeHtml(edu.location)}</div>
            </div>
            <div class="edu-badges">
              <span class="edu-period">${escapeHtml(edu.period)}</span>
              <span class="edu-cgpa">${escapeHtml(edu.metric)}</span>
            </div>
          </div>
          ${(edu.highlights || []).length > 0 ? `
            <ul class="edu-highlights">
              ${edu.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
            </ul>
          ` : ''}
        </article>
      `).join('');
    }

    if (els.honorsContainer && Array.isArray(state.data.honors_leadership)) {
      els.honorsContainer.innerHTML = state.data.honors_leadership.map(item => `
        <article class="honor-item">
          <div class="honor-top">
            <h4 class="honor-title">${escapeHtml(item.title)}</h4>
            <span class="honor-period">${escapeHtml(item.period)}</span>
          </div>
          <div class="honor-org">
            ${escapeHtml(item.organization)}
            ${item.url ? ` · <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="formal-inline-link">Verify ↗</a>` : ''}
          </div>
          <p class="honor-desc">${escapeHtml(item.description)}</p>
        </article>
      `).join('');
    }

    if (els.skillsMatrixContainer && Array.isArray(state.data.technical_skills)) {
      els.skillsMatrixContainer.innerHTML = state.data.technical_skills.map(group => `
        <div class="skill-domain-row">
          <div class="skill-domain-name">${escapeHtml(group.domain)}</div>
          <div class="skill-domain-items">
            ${(group.items || []).map(skill => `<span class="tech-pill">${escapeHtml(skill)}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }
  }

  function renderCertifications() {
    if (!els.certificationsGrid || !state.data || !Array.isArray(state.data.certifications)) return;

    const allCerts = state.data.certifications;
    const filtered = state.activeCertFilter === 'all'
      ? allCerts
      : allCerts.filter(c => c.category === state.activeCertFilter);

    const catMap = {
      'prof-cert': 'Professional',
      'prof-training': 'Enterprise Training',
      'learning-cert': 'Course / Skill'
    };

    els.certificationsGrid.innerHTML = filtered.map((cert, idx) => {
      const certId = cert.id || `cert-${idx}`;
      return `
        <article class="cert-card" id="${escapeHtml(certId)}">
          <button type="button" class="cert-image-btn" data-cert-id="${escapeHtml(certId)}" aria-label="Preview certificate for ${escapeHtml(cert.title)}">
            <img src="${cert.image}" alt="${escapeHtml(cert.title)}" class="cert-thumbnail" loading="lazy" decoding="async" />
            <span class="cert-zoom-hint">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Inspect</span>
            </span>
          </button>

          <div class="cert-body">
            <div class="cert-top-meta">
              <span class="cert-issuer">${escapeHtml(cert.provider)}</span>
              <span class="cert-cat-tag">${escapeHtml(catMap[cert.category] || 'Credential')}</span>
            </div>
            <h3 class="cert-title">${escapeHtml(cert.title)}</h3>
            <p class="cert-desc">${escapeHtml(cert.description)}</p>

            <div class="cert-footer">
              <span class="cert-id-code">${cert.credential_id ? `ID: ${escapeHtml(cert.credential_id)}` : escapeHtml(cert.time)}</span>
              <a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="formal-inline-link">
                <span>Verify Credential</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7"></path><polyline points="7 7 17 7 17 17"></polyline></svg>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function setupCertLightbox() {
    if (!els.certModal) return;

    if (els.certificationsGrid) {
      els.certificationsGrid.addEventListener('click', (e) => {
        const trigger = e.target.closest('.cert-image-btn');
        if (!trigger || !state.data) return;
        const certId = trigger.dataset.certId;
        const cert = (state.data.certifications || []).find(c => c.id === certId);
        if (!cert) return;

        if (els.modalCertImg) {
          els.modalCertImg.src = cert.image;
          els.modalCertImg.alt = `${cert.title} — ${cert.provider}`;
        }
        if (els.modalCertTitle) els.modalCertTitle.textContent = cert.title;
        if (els.modalCertProvider) els.modalCertProvider.textContent = cert.provider;
        if (els.modalCertTime) {
          els.modalCertTime.textContent = cert.credential_id ? `${cert.time} · ID: ${cert.credential_id}` : cert.time;
        }
        if (els.modalCertLink) els.modalCertLink.href = cert.url;
        if (els.modalCertBadge) els.modalCertBadge.textContent = cert.time || 'Verified Credential';

        els.certModal.showModal();
      });
    }

    // Fallback for browsers without declarative <dialog closedby="any"> support (e.g. Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      els.certModal.addEventListener('click', (event) => {
        if (event.target !== els.certModal) return;
        const rect = els.certModal.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        els.certModal.close();
      });
    }
  }

  /**
   * Progressive enhancement fallback for horizontal scroll edge hints where animation-timeline: scroll() is unsupported
   */
  function setupScrollerFallbacks() {
    if (typeof CSS === 'undefined' || CSS.supports('animation-timeline', 'scroll()') || !('IntersectionObserver' in window)) {
      return;
    }
    document.querySelectorAll('.scroller').forEach(scroller => {
      const first = scroller.firstElementChild;
      const last = scroller.lastElementChild;
      if (!first || !last) return;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, intersectionRatio }) => {
          scroller.classList.toggle(target === first ? 'more-start' : 'more-end', intersectionRatio < 1);
        });
      }, { root: scroller, threshold: 1, rootMargin: '1px' });
      observer.observe(first);
      observer.observe(last);
    });
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function init() {
    try {
      const res = await fetch(CONFIG.dataPath);
      if (!res.ok) throw new Error('Failed to load experience.json: ' + res.status);
      state.data = await res.json();

      if (els.pageTitle && state.data.page_title) {
        els.pageTitle.textContent = state.data.page_title;
      }
      if (els.pageSubtitle && state.data.page_subtitle) {
        els.pageSubtitle.textContent = state.data.page_subtitle;
      }

      updateSummaryMetrics();
      setupTopFilterBar();
      setupCertSubfilters();
      setupCertLightbox();
      renderEducationAndSkills();
      renderCertifications();
      applyViewFilter();
      setupScrollerFallbacks();
    } catch (err) {
      console.error('Experience initialization error:', err);
      if (els.resultsCount) {
        els.resultsCount.textContent = 'Unable to load experience dossier.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();