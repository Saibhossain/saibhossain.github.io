/**
 * Research Page Logic & Dynamic Interactive Renderer
 * MD Saib Hossain Portfolio
 *
 * Dynamically renders research publications, metrics HUD, interactive thumbnail galleries,
 * native dialog lightbox, category filters, and live search from assets/data/research.json.
 */

(function () {
  'use strict';

  const CONFIG = {
    jsonPath: '../../assets/data/research.json?v=' + Date.now(),
    stages: {
      writing_manuscript: { label: 'Writing Manuscript', pct: 25 },
      submitted: { label: 'Submitted', pct: 40 },
      under_review: { label: 'Under Review', pct: 60 },
      review_submitted: { label: 'Review Submitted', pct: 75 },
      accepted: { label: 'Accepted', pct: 90 },
      waiting_online: { label: 'Waiting Online', pct: 95 },
      published: { label: 'Published', pct: 100 }
    }
  };

  // State Management
  const state = {
    data: null,
    activeCategory: 'all',
    searchQuery: '',
    currentGallery: [],
    currentGalleryIndex: 0,
    currentPaperTitle: ''
  };

  // DOM Elements
  const els = {
    statsTbody: document.getElementById('stats-tbody'),
    papersTableSection: document.getElementById('papers-table-section'),
    papersDirectoryTbody: document.getElementById('papers-directory-tbody'),
    tableCountPill: document.getElementById('table-count-pill'),
    categoryTabs: document.getElementById('category-tabs'),
    searchInput: document.getElementById('research-search'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    resultsCount: document.getElementById('results-count'),
    confSection: document.getElementById('conferences-section'),
    confContainer: document.getElementById('conf-container'),
    ongoingSection: document.getElementById('ongoing-section'),
    ongoingContainer: document.getElementById('ongoing-container'),
    specialSection: document.getElementById('special-section'),
    specialContainer: document.getElementById('special-container'),
    figureModal: document.getElementById('figure-modal'),
    modalFigImg: document.getElementById('modal-fig-img'),
    modalFigTitle: document.getElementById('modal-fig-title'),
    modalFigCaption: document.getElementById('modal-fig-caption'),
    modalFigCounter: document.getElementById('modal-fig-counter'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalPrevBtn: document.getElementById('modal-prev-btn'),
    modalNextBtn: document.getElementById('modal-next-btn'),
    bibtexToast: document.getElementById('bibtex-toast')
  };

  // Toast timer reference
  let toastTimer = null;

  async function init() {
    try {
      const res = await fetch(CONFIG.jsonPath);
      if (!res.ok) throw new Error('Failed to load research.json: ' + res.status);
      state.data = await res.json();

      renderStats(state.data.papers);
      setupCategoryTabs();
      setupSearch();
      setupLightboxModal();
      renderAll();
    } catch (err) {
      console.error('Research Page Initialization Error:', err);
      if (els.resultsCount) {
        els.resultsCount.textContent = 'Unable to load research data. Please check connection.';
      }
      if (els.statsTbody) {
        els.statsTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Error loading research statistics.</td></tr>';
      }
    }
  }

  /**
   * Renders Research Output & Impact Statistics Table
   */
  function renderStats(papers) {
    if (!els.statsTbody || !papers) return;
    const confCount = (papers.conferences || []).length;
    const aStarCount = (papers.ongoing || []).filter(p => p.tier === 'A*' || (p.venue && p.venue.includes('NeurIPS'))).length + 
                       (papers.conferences || []).filter(p => p.tier === 'A*').length;
    
    const journalCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    (papers.journals || []).forEach(j => { if (journalCounts[j.tier] !== undefined) journalCounts[j.tier]++; });
    (papers.ongoing || []).forEach(j => { if (journalCounts[j.tier] !== undefined) journalCounts[j.tier]++; });

    const totalJournals = (papers.journals || []).length + (papers.ongoing || []).filter(j => j.tier && j.tier.startsWith('Q')).length;
    const journalTiersStr = Object.entries(journalCounts).filter(([_, v]) => v > 0).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Q1: 1';

    const rows = [
      { cat: 'Conferences', total: confCount, tier: 'Core/Scopus', index: ['Scopus', 'IEEE Xplore'] },
      { cat: 'A* Conferences', total: aStarCount || 1, tier: 'NeurIPS', index: ['DBLP', 'CORE'] },
      { cat: 'Journals', total: totalJournals || 1, tier: journalTiersStr, index: ['Web of Science', 'Scopus'] }
    ];

    els.statsTbody.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${escapeHTML(r.cat)}</strong></td>
        <td><span class="stat-count-pill">${r.total}</span></td>
        <td><span class="stat-tier-tag">${escapeHTML(r.tier)}</span></td>
        <td><div class="index-badges">${r.index.map(i => `<span class="idx-badge">${escapeHTML(i)}</span>`).join('')}</div></td>
      </tr>
    `).join('');
  }

  /**
   * Builds category filter tabs with dynamic counts
   */
  function setupCategoryTabs() {
    if (!els.categoryTabs) return;

    const categories = (state.data && state.data.categories) || [
      { id: 'all', label: 'All Research' },
      { id: 'medical-imaging', label: 'Medical AI & Radiomics' },
      { id: 'assistive-ai', label: 'Multimodal & Assistive AI' },
      { id: 'geospatial', label: 'Geospatial & Climate AI' },
      { id: 'ai-safety', label: 'Agentic AI & Security' }
    ];
    const papers = (state.data && state.data.papers) || {};

    // Calculate count per category
    const countMap = { all: 0 };
    categories.forEach(c => { countMap[c.id] = 0; });

    const allItems = [
      ...(papers.conferences || []),
      ...(papers.ongoing || []),
      ...(papers.special_publications || [])
    ];

    countMap.all = allItems.length;

    allItems.forEach(item => {
      if (item.category && countMap[item.category] !== undefined) {
        countMap[item.category]++;
      }
    });

    els.categoryTabs.innerHTML = categories.map(cat => `
      <button type="button" class="category-tab-btn ${cat.id === state.activeCategory ? 'active' : ''}" data-cat="${cat.id}">
        <span>${escapeHTML(cat.label)}</span>
        <span class="tab-badge">${countMap[cat.id] || 0}</span>
      </button>
    `).join('');

    els.categoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-tab-btn');
      if (!btn) return;
      const cat = btn.dataset.cat;
      if (cat === state.activeCategory) return;

      state.activeCategory = cat;

      els.categoryTabs.querySelectorAll('.category-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === cat);
      });

      renderAll();
    });
  }

  /**
   * Search input events
   */
  function setupSearch() {
    if (!els.searchInput) return;

    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      if (els.clearSearchBtn) {
        els.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      }
      renderAll();
    });

    if (els.clearSearchBtn) {
      els.clearSearchBtn.addEventListener('click', () => {
        els.searchInput.value = '';
        state.searchQuery = '';
        els.clearSearchBtn.style.display = 'none';
        els.searchInput.focus();
        renderAll();
      });
    }
  }

  /**
   * Check if an item matches the active category and search query
   */
  function matchesFilter(item) {
    if (state.activeCategory !== 'all' && item.category !== state.activeCategory) {
      return false;
    }

    if (!state.searchQuery) return true;

    const q = state.searchQuery;
    const title = (item.title || '').toLowerCase();
    const authors = (item.authors || '').toLowerCase();
    const venue = (item.venue || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const publisher = (item.publisher || '').toLowerCase();
    const metricsStr = (item.metrics || []).map(m => `${m.label} ${m.value} ${m.delta}`).join(' ').toLowerCase();

    return title.includes(q) ||
           authors.includes(q) ||
           venue.includes(q) ||
           desc.includes(q) ||
           publisher.includes(q) ||
           metricsStr.includes(q);
  }

  /**
   * Main Render Pipeline
   */
  function renderAll() {
    if (!state.data || !state.data.papers) return;

    const confs = (state.data.papers.conferences || []).filter(matchesFilter);
    const ongoings = (state.data.papers.ongoing || []).filter(matchesFilter);
    const specials = (state.data.papers.special_publications || []).filter(matchesFilter);

    renderPapersDirectory([...confs, ...ongoings, ...specials]);
    renderConferences(confs);
    renderOngoing(ongoings);
    renderSpecial(specials);

    // Update Result Counter
    const totalMatching = confs.length + ongoings.length + specials.length;
    const categories = (state.data && state.data.categories) || [
      { id: 'all', label: 'All Research' },
      { id: 'medical-imaging', label: 'Medical AI & Radiomics' },
      { id: 'assistive-ai', label: 'Multimodal & Assistive AI' },
      { id: 'geospatial', label: 'Geospatial & Climate AI' },
      { id: 'ai-safety', label: 'Agentic AI & Security' }
    ];
    const catObj = categories.find(c => c.id === state.activeCategory);
    const catLabel = catObj ? catObj.label : 'All Research';

    if (els.resultsCount) {
      if (totalMatching === 0) {
        els.resultsCount.textContent = `No publications found matching "${state.searchQuery}" in ${catLabel}.`;
      } else {
        els.resultsCount.textContent = `Showing ${totalMatching} publication${totalMatching === 1 ? '' : 's'} in ${catLabel}${state.searchQuery ? ` matching "${state.searchQuery}"` : ''}.`;
      }
    }
  }

  /**
   * Render Tabular Directory of All Publications
   */
  function renderPapersDirectory(items) {
    if (!els.papersDirectoryTbody) return;

    if (items.length === 0) {
      els.papersDirectoryTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:1.5rem;">No publications match the current filter.</td></tr>';
      if (els.tableCountPill) els.tableCountPill.textContent = '0 Papers';
      return;
    }

    if (els.tableCountPill) {
      els.tableCountPill.textContent = `${items.length} Publication${items.length === 1 ? '' : 's'}`;
    }

    els.papersDirectoryTbody.innerHTML = items.map(item => {
      const isConf = Boolean(item.metrics || (item.venue && item.venue.includes('ICCIT')));
      const targetAnchor = isConf ? `#paper-${item.id}` : (item.status ? `#ongoing-${item.id}` : `#special-${item.id}`);
      const linkHref = item.link || targetAnchor;
      const isExternal = Boolean(item.link && item.link.startsWith('http'));
      const badgeText = item.status ? `Ongoing (${item.status.replace('_', ' ')})` : (item.badge || (item.index ? item.index.join(', ') : 'Peer-Reviewed'));
      const badgeClass = item.status ? 'badge-ongoing' : (isConf ? 'badge-conf' : 'badge-special');

      return `
        <tr>
          <td>
            <a href="${targetAnchor}" class="table-paper-title-link">
              <strong>${escapeHTML(item.title)}</strong>
            </a>
          </td>
          <td><span class="table-venue-text">${escapeHTML(item.venue || item.publisher || 'Academic')}</span></td>
          <td><span class="table-year-text">${item.year || '2026'}</span></td>
          <td><span class="directory-status-badge ${badgeClass}">${escapeHTML(badgeText)}</span></td>
          <td>
            <a href="${linkHref}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="table-action-link" title="Open ${escapeHTML(item.title)}">
              <span>${isExternal ? 'Paper ↗' : 'View ↓'}</span>
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Render Published Conference Papers
   */
  function renderConferences(papers) {
    if (!els.confContainer) return;

    if (papers.length === 0) {
      els.confSection.style.display = state.searchQuery || state.activeCategory !== 'all' ? 'none' : 'block';
      els.confContainer.innerHTML = '<p class="text-muted" style="text-align:center; padding:2rem;">No peer-reviewed conference publications match this filter.</p>';
      return;
    }

    els.confSection.style.display = 'block';

    els.confContainer.innerHTML = papers.map(p => {
      const catClass = `cat-${p.category || 'medical-imaging'}`;
      const catObj = (state.data.categories || []).find(c => c.id === p.category);
      const catLabel = catObj ? catObj.label : p.category;

      // Author highlights
      const formattedAuthors = highlightAuthor(p.authors || '');

      // Metrics HUD
      const metricsHTML = (p.metrics && p.metrics.length > 0)
        ? `<div class="metrics-hud" aria-label="Quantitative Empirical Metrics">
            ${p.metrics.map(m => `
              <div class="metric-item">
                <span class="metric-label">${escapeHTML(m.label)}</span>
                <div class="metric-value-wrap">
                  <span class="metric-value">${escapeHTML(m.value)}</span>
                  ${m.delta ? `<span class="metric-delta">${escapeHTML(m.delta)}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>`
        : '';

      // Gallery Thumbnails
      const gallery = p.gallery || [];
      const galleryHTML = gallery.length > 0
        ? `<div class="gallery-strip" aria-label="Paper Figures and Result Tables">
            ${gallery.map((g, idx) => `
              <button type="button" class="gallery-thumb-btn" data-paper-id="${p.id}" data-fig-index="${idx}" title="${escapeHTML(g.title)}">
                <img src="${g.src}" alt="${escapeHTML(g.title)}" loading="lazy">
                <span class="thumb-title-hint">${escapeHTML(g.title.split(':')[0])}</span>
              </button>
            `).join('')}
          </div>`
        : '';

      // Featured Image
      const featuredImgHTML = p.image
        ? `<div class="featured-visual-box" data-paper-id="${p.id}" data-fig-index="0" role="button" tabindex="0" aria-label="Inspect ${escapeHTML(p.title)} visual data">
            <img src="${p.image}" alt="${escapeHTML(p.title)}" class="featured-visual-img" loading="lazy">
            <div class="visual-hover-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <span>Click to Inspect High-Res Visual</span>
            </div>
          </div>`
        : '';

      return `
        <article class="paper-card" id="paper-${p.id}">
          <div class="paper-meta-top">
            <div class="badge-cluster">
              <span class="venue-pill">${escapeHTML(p.venue)}</span>
              <span class="cat-pill ${catClass}">${escapeHTML(catLabel)}</span>
              <span class="index-chip">${p.year}</span>
            </div>
            <div class="indexing-tags">
              ${(p.index || []).map(idx => `<span class="index-chip">${escapeHTML(idx)}</span>`).join('')}
            </div>
          </div>

          <h3 class="paper-title">
            <a href="${p.link}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.title)}</a>
          </h3>

          <div class="paper-authors">
            ${formattedAuthors}
          </div>

          ${metricsHTML}

          <p class="paper-narrative">
            ${escapeHTML(p.description)}
          </p>

          <div class="paper-visuals">
            ${featuredImgHTML}
            ${galleryHTML}
          </div>

          <div class="paper-actions">
            <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="paper-btn btn-primary-ieee">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>Read on IEEE Xplore</span>
            </a>
            ${gallery.length > 0 ? `
              <button type="button" class="paper-btn btn-outline-gallery open-gallery-btn" data-paper-id="${p.id}" data-fig-index="0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Inspect Figures &amp; Tables (${gallery.length})</span>
              </button>
            ` : ''}
            ${p.bibtex ? `
              <button type="button" class="paper-btn btn-bibtex copy-bibtex-btn" data-paper-id="${p.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy BibTeX</span>
              </button>
            ` : ''}
          </div>

          ${p.bibtex ? `
            <details class="paper-bibtex-details">
              <summary class="bibtex-summary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>BibTeX Citation</span>
              </summary>
              <pre class="bibtex-pre"><code class="language-bibtex">${escapeHTML(p.bibtex)}</code></pre>
            </details>
          ` : ''}
        </article>
      `;
    }).join('');

    // Attach Gallery & BibTeX Listeners
    setupPaperEventListeners();
  }

  /**
   * Render Ongoing Research & Preprints
   */
  function renderOngoing(ongoing) {
    if (!els.ongoingContainer) return;

    if (ongoing.length === 0) {
      els.ongoingSection.style.display = 'none';
      return;
    }

    els.ongoingSection.style.display = 'block';

    els.ongoingContainer.innerHTML = ongoing.map(p => {
      const stage = CONFIG.stages[p.status] || { label: 'In Progress', pct: p.progress_stage || 30 };
      const pct = p.progress_stage || stage.pct;

      return `
        <article class="ongoing-paper-card" id="ongoing-${p.id}">
          <div class="ongoing-badge-row">
            <span class="venue-pill">${escapeHTML(p.venue)}</span>
            <span class="tier-badge">${escapeHTML(p.tier || 'Preprint')}</span>
          </div>

          <h3 class="ongoing-paper-title">${escapeHTML(p.title)}</h3>

          <p class="ongoing-paper-desc">${escapeHTML(p.description)}</p>

          ${p.funding ? `
            <div class="funding-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>${escapeHTML(p.funding)}</span>
            </div>
          ` : ''}

          <div class="progress-hud-box">
            <div class="progress-header">
              <span>Status: <strong>${escapeHTML(stage.label)}</strong></span>
              <span>${pct}%</span>
            </div>
            <div class="progress-track-bar">
              <div class="progress-fill-bar" style="width: ${pct}%"></div>
            </div>
            <div class="stage-step-labels">
              <span>Draft</span>
              <span>Submitted</span>
              <span>Review</span>
              <span>Accepted</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Render Special Publications, Monograph & Medical Physics
   */
  function renderSpecial(specials) {
    if (!els.specialContainer) return;

    if (specials.length === 0) {
      els.specialSection.style.display = 'none';
      return;
    }

    els.specialSection.style.display = 'block';

    els.specialContainer.innerHTML = specials.map(s => `
      <article class="special-card" id="special-${s.id}">
        <div class="special-badge-row">
          <span class="special-badge">${escapeHTML(s.badge || s.type)}</span>
          <span class="special-year">${s.year}</span>
        </div>

        <h3 class="special-title">${escapeHTML(s.title)}</h3>
        <span class="special-publisher">${escapeHTML(s.publisher)}</span>

        <p class="special-desc">${escapeHTML(s.description)}</p>

        <div class="special-action">
          <a href="${s.link}" target="_blank" rel="noopener noreferrer" class="special-link-btn">
            <span>Read Publication</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          </a>
        </div>
      </article>
    `).join('');
  }

  /**
   * Attach card interaction events (thumbnails, lightbox, BibTeX)
   */
  function setupPaperEventListeners() {
    // Featured Visual Click
    document.querySelectorAll('.featured-visual-box').forEach(box => {
      box.addEventListener('click', () => {
        const paperId = box.dataset.paperId;
        const figIdx = parseInt(box.dataset.figIndex, 10) || 0;
        openLightbox(paperId, figIdx);
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const paperId = box.dataset.paperId;
          const figIdx = parseInt(box.dataset.figIndex, 10) || 0;
          openLightbox(paperId, figIdx);
        }
      });
    });

    // Gallery Thumbnails Click
    document.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const paperId = btn.dataset.paperId;
        const figIdx = parseInt(btn.dataset.figIndex, 10) || 0;
        openLightbox(paperId, figIdx);
      });
    });

    // Explore Figures Button Click
    document.querySelectorAll('.open-gallery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const paperId = btn.dataset.paperId;
        openLightbox(paperId, 0);
      });
    });

    // Copy BibTeX Button Click
    document.querySelectorAll('.copy-bibtex-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const paperId = btn.dataset.paperId;
        const paper = (state.data.papers.conferences || []).find(p => p.id === paperId);
        if (paper && paper.bibtex) {
          copyToClipboard(paper.bibtex);
        }
      });
    });
  }

  /**
   * Lightbox Modal Functions (<dialog>)
   */
  function setupLightboxModal() {
    if (!els.figureModal) return;

    // Close button
    if (els.modalCloseBtn) {
      els.modalCloseBtn.addEventListener('click', () => {
        closeLightbox();
      });
    }

    // Prev / Next Buttons
    if (els.modalPrevBtn) {
      els.modalPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
      });
    }

    if (els.modalNextBtn) {
      els.modalNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
      });
    }

    // Light dismiss: click outside modal-inner closes dialog
    els.figureModal.addEventListener('click', (e) => {
      const inner = els.figureModal.querySelector('.modal-inner');
      if (inner && !inner.contains(e.target)) {
        closeLightbox();
      }
    });

    // Keyboard navigation inside open modal
    window.addEventListener('keydown', (e) => {
      if (!els.figureModal.open) return;
      if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      }
    });
  }

  function openLightbox(paperId, figIndex) {
    if (!els.figureModal || !state.data) return;

    const paper = (state.data.papers.conferences || []).find(p => p.id === paperId);
    if (!paper || !paper.gallery || paper.gallery.length === 0) return;

    state.currentGallery = paper.gallery;
    state.currentGalleryIndex = Math.max(0, Math.min(figIndex, paper.gallery.length - 1));
    state.currentPaperTitle = paper.title;

    updateModalContent();

    try {
      if (typeof els.figureModal.showModal === 'function') {
        els.figureModal.showModal();
      } else {
        els.figureModal.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.warn('Dialog showModal error:', err);
    }
  }

  function closeLightbox() {
    if (!els.figureModal) return;
    try {
      if (typeof els.figureModal.close === 'function') {
        els.figureModal.close();
      } else {
        els.figureModal.removeAttribute('open');
      }
    } catch (err) {
      els.figureModal.removeAttribute('open');
    }
    document.body.style.overflow = '';
  }

  function navigateLightbox(delta) {
    if (!state.currentGallery || state.currentGallery.length === 0) return;
    const len = state.currentGallery.length;
    state.currentGalleryIndex = (state.currentGalleryIndex + delta + len) % len;
    updateModalContent();
  }

  function updateModalContent() {
    const item = state.currentGallery[state.currentGalleryIndex];
    if (!item) return;

    if (els.modalFigImg) {
      els.modalFigImg.src = item.src;
      els.modalFigImg.alt = item.title;
    }
    if (els.modalFigTitle) {
      els.modalFigTitle.textContent = item.title;
    }
    if (els.modalFigCaption) {
      els.modalFigCaption.textContent = item.caption;
    }
    if (els.modalFigCounter) {
      els.modalFigCounter.textContent = `Figure ${state.currentGalleryIndex + 1} of ${state.currentGallery.length}`;
    }
  }

  /**
   * BibTeX Copy Helper with Toast Notification
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('BibTeX citation copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Failed to copy. Please manually copy citation.');
    }
  }

  function showToast(msg) {
    if (!els.bibtexToast) return;
    const span = els.bibtexToast.querySelector('span');
    if (span) span.textContent = msg;

    els.bibtexToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.bibtexToast.classList.remove('show');
    }, 3200);
  }

  /**
   * Helper to highlight MD Saib Hossain in authors string
   */
  function highlightAuthor(authorsStr) {
    if (!authorsStr) return '';
    const safeStr = escapeHTML(authorsStr);
    return safeStr.replace(/Md Saib Hossain/gi, '<strong>Md Saib Hossain</strong>');
  }

  /**
   * HTML escape utility
   */
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();