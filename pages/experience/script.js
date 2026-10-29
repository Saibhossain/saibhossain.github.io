/**
 * Experience & Certification Page Script
 * MD Saib Hossain Portfolio
 *
 * Handles dynamic filtering across 5 categories:
 * 1. All Experience (Work & research experience only; no certs/training)
 * 2. Eng. & Dev (Engineering and development roles)
 * 3. Prof. Certificate (Industry professional certifications)
 * 4. Prof. Training (Verified professional training credentials)
 * 5. Learning Certificate (Course & specialization certificates)
 *
 * Features:
 * - Real-time working duration calculator (today month/year - starting month/year)
 * - "See More / See Less" expandable description toggles
 * - High-resolution vector certificate image lightbox modal
 * - Mobile-responsive layout switching between timeline and certificate grid
 */

(function () {
  'use strict';

  const CONFIG = {
    dataPath: '../../assets/data/experience.json?v=' + Date.now(),
    defaultFilter: 'all-experience'
  };

  const state = {
    data: null,
    activeFilter: CONFIG.defaultFilter,
    expandedItems: new Set()
  };

  const els = {
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    filterBar: document.getElementById('filter-bar'),
    resultsCount: document.getElementById('results-count'),
    timelineWrapper: document.getElementById('timeline-wrapper'),
    timelineContainer: document.getElementById('timeline-container'),
    certificationsWrapper: document.getElementById('certifications-wrapper'),
    certificationsGrid: document.getElementById('certifications-grid'),
    certModal: document.getElementById('cert-modal'),
    modalCertImg: document.getElementById('modal-cert-img'),
    modalCertTitle: document.getElementById('modal-cert-title'),
    modalCertProvider: document.getElementById('modal-cert-provider'),
    modalCertTime: document.getElementById('modal-cert-time'),
    modalCertBadge: document.getElementById('modal-cert-badge'),
    modalCertLink: document.getElementById('modal-cert-link'),
    modalCertClose: document.getElementById('modal-cert-close')
  };

  /**
   * Month Lookup Table for Date Parsing
   */
  const MONTH_MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  /**
   * Real-Time Duration Calculator
   * Calculates exact years and months elapsed between start date and end date (or current date if Present/Ongoing)
   */
  function calculateDuration(startStr, endStr) {
    if (!startStr) return { formatted: '', isOngoing: false, totalMonths: 0 };

    const start = parseDateString(startStr);
    const isOngoing = !endStr || /present|ongoing|current/i.test(endStr.trim());
    const end = isOngoing ? new Date() : parseDateString(endStr);

    // Inclusive calculation: November 2025 to March 2026 = 5 months
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

    return {
      formatted: formatted,
      isOngoing: isOngoing,
      totalMonths: months
    };
  }

  function parseDateString(str) {
    if (!str) return new Date();
    const clean = str.trim().toLowerCase();
    if (clean === 'present' || clean === 'ongoing') return new Date();

    const parts = clean.split(/[\s,–-]+/).filter(Boolean);
    if (parts.length >= 2) {
      const monthPrefix = parts[0].slice(0, 3);
      const m = MONTH_MAP[monthPrefix] !== undefined ? MONTH_MAP[monthPrefix] : 0;
      const y = parseInt(parts[1], 10);
      if (!isNaN(y)) return new Date(y, m, 1);
    } else if (parts.length === 1 && !isNaN(parseInt(parts[0], 10))) {
      return new Date(parseInt(parts[0], 10), 0, 1);
    }
    return new Date();
  }

  /**
   * Calculate Cumulative & Total Real-Time Job Experience
   * (today month/year - starting month/year)
   */
  function calculateTotalCareerExperience(timeline) {
    if (!timeline || timeline.length === 0) return '1+ Yrs';

    let earliestDate = new Date();
    timeline.forEach(item => {
      if (item.start_date) {
        const d = parseDateString(item.start_date);
        if (d < earliestDate) earliestDate = d;
      }
    });

    const now = new Date();
    let totalMonths = (now.getFullYear() - earliestDate.getFullYear()) * 12 + (now.getMonth() - earliestDate.getMonth()) + 1;
    if (totalMonths <= 0) totalMonths = 1;

    const years = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;

    if (years > 0 && remMonths > 0) {
      return `${years} yr ${remMonths} mo`;
    } else if (years > 0) {
      return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    } else {
      return `${totalMonths} Months`;
    }
  }

  /**
   * Update Quick Stats HUD with Real-Time Values
   */
  function updateHudStats() {
    if (!state.data) return;

    // 1. Total Job Experience (real-time from earliest date to today)
    const hudTotalExp = document.getElementById('hud-total-exp');
    if (hudTotalExp && state.data.timeline) {
      hudTotalExp.textContent = calculateTotalCareerExperience(state.data.timeline);
    }

    // 2. Total Career Roles Count
    const hudRolesCount = document.getElementById('hud-roles-count');
    if (hudRolesCount && state.data.timeline) {
      hudRolesCount.textContent = state.data.timeline.length;
    }

    // 3. Total Professional Certifications
    const hudProfCerts = document.getElementById('hud-prof-certs-count');
    if (hudProfCerts && state.data.certifications) {
      const count = state.data.certifications.filter(c => c.category === 'prof-cert').length;
      hudProfCerts.textContent = count;
    }

    // 4. Total Professional Trainings
    const hudProfTrainings = document.getElementById('hud-prof-trainings-count');
    if (hudProfTrainings && state.data.certifications) {
      const count = state.data.certifications.filter(c => c.category === 'prof-training').length;
      hudProfTrainings.textContent = count;
    }
  }

  /**
   * Initialize Experience & Certification View
   */
  async function init() {
    try {
      const res = await fetch(CONFIG.dataPath);
      if (!res.ok) throw new Error('Failed to load experience.json: ' + res.status);
      state.data = await res.json();

      if (els.pageTitle && state.data.page_title) {
        els.pageTitle.textContent = state.data.page_title;
        els.pageTitle.classList.remove('loading-pulse');
      }
      if (els.pageSubtitle && state.data.page_subtitle) {
        els.pageSubtitle.textContent = state.data.page_subtitle;
        els.pageSubtitle.classList.remove('loading-pulse');
      }

      setupFilterBar();
      updateHudStats();
      setupCertLightbox();
      renderCurrentView();

    } catch (err) {
      console.error('Initialization Error:', err);
      if (els.resultsCount) {
        els.resultsCount.textContent = 'Unable to load experience and certification data.';
      }
      if (els.timelineContainer) {
        els.timelineContainer.innerHTML = `
          <div class="glass-card text-center" style="padding: 2.5rem; color: #ef4444;">
            <h3>Error Loading Data</h3>
            <p>${escapeHtml(err.message)}</p>
          </div>
        `;
      }
    }
  }

  /**
   * Set Up Filter Bar Navigation
   */
  function setupFilterBar() {
    if (!els.filterBar || !state.data || !state.data.categories) return;

    // Calculate item counts per category for badge indicators
    const countMap = {};
    if (Array.isArray(state.data.timeline)) {
      countMap['all-experience'] = state.data.timeline.length;
      countMap['engineering'] = state.data.timeline.filter(t => t.category === 'engineering').length;
    }
    if (Array.isArray(state.data.certifications)) {
      countMap['prof-cert'] = state.data.certifications.filter(c => c.category === 'prof-cert').length;
      countMap['prof-training'] = state.data.certifications.filter(c => c.category === 'prof-training').length;
      countMap['learning-cert'] = state.data.certifications.filter(c => c.category === 'learning-cert').length;
    }

    els.filterBar.innerHTML = state.data.categories.map(cat => {
      const isActive = cat.id === state.activeFilter;
      const count = countMap[cat.id];
      const badgeHtml = count !== undefined ? `<span class="tab-badge">${count}</span>` : '';
      return `
        <button type="button" class="filter-btn ${isActive ? 'active' : ''}" data-filter="${cat.id}" role="tab" aria-selected="${isActive}">
          <span>${escapeHtml(cat.label)}</span>
          ${badgeHtml}
        </button>
      `;
    }).join('');

    // Robust event delegation using closest() so clicking text span or button always triggers tab switch
    els.filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const filterId = btn.dataset.filter;
      if (!filterId || filterId === state.activeFilter) return;

      state.activeFilter = filterId;

      els.filterBar.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Smoothly center the clicked tab into view on mobile devices
      try {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch (err) {}

      renderCurrentView();
    });
  }

  /**
   * Render either Experience Timeline or Certifications Grid based on active tab
   */
  function renderCurrentView() {
    const isTimelineMode = state.activeFilter === 'all-experience' || state.activeFilter === 'engineering';

    if (isTimelineMode) {
      if (els.timelineWrapper) els.timelineWrapper.style.display = 'block';
      if (els.certificationsWrapper) els.certificationsWrapper.style.display = 'none';
      renderTimeline();
    } else {
      if (els.timelineWrapper) els.timelineWrapper.style.display = 'none';
      if (els.certificationsWrapper) els.certificationsWrapper.style.display = 'block';
      renderCertifications();
    }
  }

  /**
   * Render Experience Timeline Items
   */
  function renderTimeline() {
    if (!els.timelineContainer || !state.data || !state.data.timeline) return;

    let items = state.data.timeline;
    if (state.activeFilter === 'engineering') {
      items = items.filter(item => item.category === 'engineering');
    }

    if (els.resultsCount) {
      const label = state.activeFilter === 'engineering' ? 'Engineering & Development' : 'All Professional & Research Experience';
      els.resultsCount.textContent = `Showing ${items.length} ${label} ${items.length === 1 ? 'position' : 'positions'}`;
    }

    if (items.length === 0) {
      els.timelineContainer.innerHTML = `
        <div class="glass-card text-center" style="padding: 3rem;">
          <p class="text-muted">No experience entries found in this category.</p>
        </div>
      `;
      return;
    }

    els.timelineContainer.innerHTML = items.map((item, index) => {
      const duration = calculateDuration(item.start_date, item.end_date);
      const isExpanded = state.expandedItems.has(item.id || item.title);
      const itemId = item.id || `exp-item-${index}`;

      const skillsHtml = (item.skills || []).map(skill => {
        const color = (state.data.skills_legend && state.data.skills_legend[skill]) || 'var(--primary)';
        return `<span class="skill-tag" style="--skill-border: ${color}">${escapeHtml(skill)}</span>`;
      }).join('');

      const responsibilitiesHtml = (item.key_responsibilities || []).length > 0
        ? `
          <div class="responsibilities-section">
            <h5 class="section-subheading">Key Responsibilities</h5>
            <ul class="resp-list">
              ${item.key_responsibilities.map(resp => `<li class="resp-item">${escapeHtml(resp)}</li>`).join('')}
            </ul>
          </div>
        ` : '';

      const achievementsHtml = (item.achievements || []).length > 0
        ? `
          <div class="achievements-section">
            <h5 class="section-subheading" style="color: #60a5fa;">Key Accomplishments &amp; Milestones</h5>
            <ul class="achievements-list">
              ${item.achievements.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}
            </ul>
          </div>
        ` : '';

      const nodeIcon = item.category === 'engineering' ? '💻' : (item.job_type && item.job_type.includes('Competition') ? '🏆' : '🔬');

      return `
        <div class="timeline-item fade-in-up" id="${itemId}">
          <!-- Timeline Node Point -->
          <div class="timeline-node" title="${escapeHtml(item.job_type || item.title)}">
            <div class="node-glow"></div>
            <span class="node-icon">${nodeIcon}</span>
          </div>

          <!-- Date & Real-time Duration Column -->
          <div class="timeline-date-col">
            <div class="date-badge">${escapeHtml(item.start_date)} — ${escapeHtml(item.end_date)}</div>
            <div class="duration-tag ${duration.isOngoing ? 'ongoing-duration' : ''}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${duration.formatted}</span>
              ${duration.isOngoing ? '<span class="live-dot" title="Active Ongoing Role"></span>' : ''}
            </div>
          </div>

          <!-- Content Card Column -->
          <div class="timeline-card-col">
            <article class="card glass-card exp-card ${isExpanded ? 'is-expanded' : ''}">
              <div class="card-header">
                <div class="role-group">
                  <h3 class="role-title">${escapeHtml(item.title)}</h3>
                  <h4 class="company-name gradient-text">${escapeHtml(item.company)}</h4>
                </div>
                <div class="meta-pills">
                  <span class="location-badge">📍 ${escapeHtml(item.location)}</span>
                  <span class="job-type-badge">${escapeHtml(item.job_type)}</span>
                </div>
              </div>

              <!-- Collapsible / Expandable Description Body -->
              <div class="exp-desc-wrapper">
                <p class="description-text ${isExpanded ? 'full-view' : 'clamped-view'}">${escapeHtml(item.description)}</p>
                
                <div class="details-drawer ${isExpanded ? 'open' : ''}" id="drawer-${itemId}">
                  ${responsibilitiesHtml}
                  ${achievementsHtml}
                </div>

                <div class="card-actions-bar">
                  <button type="button" class="btn-toggle-more see-more-btn" data-target="${itemId}" aria-expanded="${isExpanded}">
                    <span>${isExpanded ? 'See Less' : 'See More & Full Details'}</span>
                    <svg class="toggle-icon ${isExpanded ? 'rotated' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>

                  ${item.link ? `
                    <a href="${item.link}" ${item.link.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="card-link-btn">
                      <span>${item.link.includes('research') ? 'View Publications' : 'View Project'}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                  ` : ''}
                </div>
              </div>

              <!-- Skill Tags Container -->
              <div class="skills-container">
                ${skillsHtml}
              </div>
            </article>
          </div>
        </div>
      `;
    }).join('');

    // Attach "See More / See Less" Event Listeners
    setupSeeMoreListeners();
  }

  /**
   * Render Certifications & Training Grid
   */
  function renderCertifications() {
    if (!els.certificationsGrid || !state.data || !state.data.certifications) return;

    const certs = state.data.certifications.filter(c => c.category === state.activeFilter);

    if (els.resultsCount) {
      let categoryTitle = 'Certificates';
      if (state.activeFilter === 'prof-cert') categoryTitle = 'Professional Certifications';
      else if (state.activeFilter === 'prof-training') categoryTitle = 'Professional Trainings';
      else if (state.activeFilter === 'learning-cert') categoryTitle = 'Learning Certificates';

      els.resultsCount.textContent = `Showing ${certs.length} ${categoryTitle}`;
    }

    if (certs.length === 0) {
      els.certificationsGrid.innerHTML = `
        <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 3rem;">
          <p class="text-muted">No certifications found in this category.</p>
        </div>
      `;
      return;
    }

    els.certificationsGrid.innerHTML = certs.map((cert, index) => {
      const certId = cert.id || `cert-${index}`;
      const isExpanded = state.expandedItems.has(certId);

      const categoryLabel = cert.category === 'prof-cert' ? 'Professional Certificate' :
        (cert.category === 'prof-training' ? 'Professional Training' : 'Learning Certificate');

      const skillsHtml = (cert.skills || []).map(skill => {
        const color = (state.data.skills_legend && state.data.skills_legend[skill]) || 'var(--primary)';
        return `<span class="skill-tag" style="--skill-border: ${color}">${escapeHtml(skill)}</span>`;
      }).join('');

      return `
        <article class="cert-card glass-card fade-in-up" id="${certId}">
          <!-- Top Issuer & Type Header -->
          <div class="cert-header">
            <span class="cert-provider-badge">${escapeHtml(cert.provider)}</span>
            <span class="cert-type-pill ${cert.category}">${escapeHtml(categoryLabel)}</span>
          </div>

          <!-- Certificate Image Preview (Click to Zoom Lightbox) -->
          <div class="cert-image-frame" data-cert-id="${certId}" role="button" tabindex="0" aria-label="Zoom certificate image">
            <img src="${cert.image}" alt="${escapeHtml(cert.title)}" class="cert-thumbnail" loading="eager" decoding="async" />
            <div class="cert-zoom-overlay">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <span>Click to Enlarge</span>
            </div>
          </div>

          <!-- Certificate Info & Details -->
          <div class="cert-body">
            <h3 class="cert-title">${escapeHtml(cert.title)}</h3>
            
            <div class="cert-meta-row">
              <span class="cert-time-tag">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${escapeHtml(cert.time)}
              </span>
              ${cert.credential_id ? `
                <span class="cert-id-tag">ID: ${escapeHtml(cert.credential_id.slice(0, 16))}</span>
              ` : ''}
            </div>

            <p class="cert-description ${isExpanded ? 'full-view' : 'clamped-view'}">${escapeHtml(cert.description)}</p>
            
            ${cert.description.length > 140 ? `
              <button type="button" class="btn-cert-more see-more-btn" data-target="${certId}" aria-expanded="${isExpanded}">
                <span>${isExpanded ? 'See Less' : 'See More'}</span>
              </button>
            ` : ''}

            <!-- Skills Acquired -->
            <div class="skills-container" style="margin-top: 1rem;">
              ${skillsHtml}
            </div>

            <!-- Direct External Verification Link -->
            <div class="cert-footer">
              <a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm cert-verify-action">
                <span>Verify Credential</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach Lightbox triggers and See More buttons
    setupCertCardListeners();
  }

  /**
   * Set Up "See More / See Less" Expanders
   */
  function setupSeeMoreListeners() {
    document.querySelectorAll('.see-more-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.target;
        const isCurrentlyExpanded = state.expandedItems.has(targetId);

        if (isCurrentlyExpanded) {
          state.expandedItems.delete(targetId);
        } else {
          state.expandedItems.add(targetId);
        }

        // Re-render current view smoothly
        renderCurrentView();
      });
    });
  }

  /**
   * Set Up Certificate Card Interactions (Image Zoom Modal + See More)
   */
  function setupCertCardListeners() {
    setupSeeMoreListeners();

    // Zoom Image click
    document.querySelectorAll('.cert-image-frame').forEach(frame => {
      const openModal = () => {
        const certId = frame.dataset.certId;
        const cert = (state.data.certifications || []).find(c => (c.id || '') === certId);
        if (!cert) return;

        openCertLightbox(cert);
      };

      frame.addEventListener('click', openModal);
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal();
        }
      });
    });
  }

  /**
   * Lightbox Modal Event Handlers
   */
  function setupCertLightbox() {
    if (!els.certModal) return;

    if (els.modalCertClose) {
      els.modalCertClose.addEventListener('click', () => {
        els.certModal.close();
      });
    }

    els.certModal.addEventListener('click', (e) => {
      const rect = els.certModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        els.certModal.close();
      }
    });
  }

  function openCertLightbox(cert) {
    if (!els.certModal) return;

    if (els.modalCertImg) els.modalCertImg.src = cert.image;
    if (els.modalCertTitle) els.modalCertTitle.textContent = cert.title;
    if (els.modalCertProvider) els.modalCertProvider.textContent = cert.provider;
    if (els.modalCertTime) els.modalCertTime.textContent = cert.time;
    if (els.modalCertLink) els.modalCertLink.href = cert.url;

    if (els.modalCertBadge) {
      els.modalCertBadge.textContent = cert.category === 'prof-cert' ? 'Professional Certificate' :
        (cert.category === 'prof-training' ? 'Professional Training' : 'Learning Certificate');
    }

    els.certModal.showModal();
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

  // Execute on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();