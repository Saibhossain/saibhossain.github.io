/**
 * Research & Publications Page Script (Clean & Mobile-Optimized)
 * MD Saib Hossain Portfolio
 */

(function () {
  'use strict';

  const CONFIG = {
    jsonPath: '../../assets/data/research.json?v=4.2',
    statusMeta: {
      published: { label: 'Published', pillClass: 'status-published' },
      accepted: { label: 'Accepted', pillClass: 'status-published' },
      under_review: { label: 'Under Review', pillClass: 'status-review' },
      submitted: { label: 'Submitted', pillClass: 'status-submitted' },
      writing_manuscript: { label: 'In Preparation', pillClass: 'status-review' }
    }
  };

  const state = {
    data: null,
    activeCategory: 'all',
    searchQuery: '',
    currentGallery: [],
    currentGalleryIndex: 0
  };

  const els = {
    statsTbody: document.getElementById('stats-tbody'),
    papersDirectoryTbody: document.getElementById('papers-directory-tbody'),
    tableCountPill: document.getElementById('table-count-pill'),
    categoryTabs: document.getElementById('category-tabs'),
    searchInput: document.getElementById('research-search'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    resultsCount: document.getElementById('results-count'),
    journalsSection: document.getElementById('journals-section'),
    journalsContainer: document.getElementById('journals-container'),
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
    modalPrevBtn: document.getElementById('modal-prev-btn'),
    modalNextBtn: document.getElementById('modal-next-btn'),
    bibtexToast: document.getElementById('bibtex-toast')
  };

  let toastTimer = null;

  async function init() {
    try {
      const res = await fetch(CONFIG.jsonPath);
      if (!res.ok) throw new Error('Failed to load research.json: ' + res.status);
      state.data = await res.json();

      renderStatsTable(state.data.papers || {});
      setupCategoryTabs();
      setupSearch();
      setupLightboxModal();
      renderAll();
    } catch (err) {
      console.error('Research initialization error:', err);
      if (els.resultsCount) els.resultsCount.textContent = 'Unable to load publications.';
    }
  }

  function renderStatsTable(papers) {
    if (!els.statsTbody) return;
    const confs = papers.conferences || [];
    const journals = papers.journals || [];
    const ongoing = papers.ongoing || [];

    const rows = [
      { track: 'Conference Proceedings', total: confs.length, tier: 'IEEE ICCIT 2025', status: 'Published', cls: 'status-published', index: 'Scopus, IEEE Xplore' },
      { track: 'Journal Manuscripts', total: journals.length, tier: 'Q1 Track', status: 'Submitted', cls: 'status-submitted', index: 'Web of Science, Scopus' },
      { track: 'A* Conference Pipeline', total: ongoing.length, tier: 'NeurIPS Track', status: 'Under Review', cls: 'status-review', index: 'CORE A*, DBLP' }
    ];

    els.statsTbody.innerHTML = rows.map(r => `
      <tr>
        <th scope="row">${escapeHTML(r.track)}</th>
        <td><span class="stat-num">${r.total}</span></td>
        <td><span class="table-muted">${escapeHTML(r.tier)}</span></td>
        <td><span class="status-pill ${r.cls}">${escapeHTML(r.status)}</span></td>
        <td><span class="table-muted">${escapeHTML(r.index)}</span></td>
      </tr>
    `).join('');
  }

  function getAllItems() {
    const p = (state.data && state.data.papers) || {};
    return [
      ...(p.journals || []).map(i => ({ ...i, _section: 'journal' })),
      ...(p.conferences || []).map(i => ({ ...i, _section: 'conference' })),
      ...(p.ongoing || []).map(i => ({ ...i, _section: 'ongoing' })),
      ...(p.special_publications || []).map(i => ({ ...i, _section: 'special' }))
    ];
  }

  function setupCategoryTabs() {
    if (!els.categoryTabs || !state.data) return;
    const categories = state.data.categories || [];
    const allItems = getAllItems();

    const countMap = { all: allItems.length };
    categories.forEach(c => { if (c.id !== 'all') countMap[c.id] = 0; });
    allItems.forEach(item => {
      if (item.category && countMap[item.category] !== undefined) countMap[item.category]++;
    });

    els.categoryTabs.innerHTML = categories.map(cat => {
      const active = cat.id === state.activeCategory;
      return `
        <button type="button" class="category-tab-btn ${active ? 'active' : ''}" data-cat="${escapeHTML(cat.id)}" aria-pressed="${active}">
          <span>${escapeHTML(cat.label)}</span>
          <span class="tab-count">${countMap[cat.id] || 0}</span>
        </button>
      `;
    }).join('');

    els.categoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-tab-btn');
      if (!btn) return;
      const cat = btn.dataset.cat;
      if (!cat || cat === state.activeCategory) return;

      state.activeCategory = cat;
      els.categoryTabs.querySelectorAll('.category-tab-btn').forEach(b => {
        const sel = b.dataset.cat === cat;
        b.classList.toggle('active', sel);
        b.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });

      try {
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
      } catch (err) {
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      renderAll();
    });
  }

  function setupSearch() {
    if (!els.searchInput) return;

    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      if (els.clearSearchBtn) els.clearSearchBtn.hidden = !state.searchQuery;
      renderAll();
    });

    if (els.clearSearchBtn) {
      els.clearSearchBtn.addEventListener('click', () => {
        els.searchInput.value = '';
        state.searchQuery = '';
        els.clearSearchBtn.hidden = true;
        els.searchInput.focus();
        renderAll();
      });
    }
  }

  function matchesFilter(item) {
    if (state.activeCategory !== 'all' && item.category !== state.activeCategory) return false;
    if (!state.searchQuery) return true;

    const q = state.searchQuery;
    const text = [
      item.title, item.authors, item.venue, item.publisher,
      item.doi, item.status, item.tier, item.description
    ].filter(Boolean).join(' ').toLowerCase();
    return text.includes(q);
  }

  function renderAll() {
    if (!state.data || !state.data.papers) return;

    const journals = (state.data.papers.journals || []).filter(matchesFilter);
    const confs = (state.data.papers.conferences || []).filter(matchesFilter);
    const ongoing = (state.data.papers.ongoing || []).filter(matchesFilter);
    const specials = (state.data.papers.special_publications || []).filter(matchesFilter);

    const researchPapersFiltered = [
      ...journals.map(i => ({ ...i, _section: 'journal' })),
      ...confs.map(i => ({ ...i, _section: 'conference' })),
      ...ongoing.map(i => ({ ...i, _section: 'ongoing' }))
    ];

    const allFiltered = [
      ...researchPapersFiltered,
      ...specials.map(i => ({ ...i, _section: 'special' }))
    ];

    renderMinimalCards(journals, els.journalsSection, els.journalsContainer, 'journal');
    renderConferences(confs);
    renderMinimalCards(ongoing, els.ongoingSection, els.ongoingContainer, 'ongoing');
    renderSpecial(specials);
    renderDirectoryTable(researchPapersFiltered);

    if (els.resultsCount) {
      els.resultsCount.textContent = allFiltered.length === 0
        ? `No publications found matching "${state.searchQuery}".`
        : `${allFiltered.length} publication${allFiltered.length === 1 ? '' : 's'} shown`;
    }
  }

  function renderMinimalCards(items, sectionEl, containerEl, prefix) {
    if (!sectionEl || !containerEl) return;
    if (items.length === 0) {
      sectionEl.hidden = true;
      return;
    }
    sectionEl.hidden = false;

    containerEl.innerHTML = items.map(item => {
      const status = CONFIG.statusMeta[item.status] || { label: 'Submitted', pillClass: 'status-submitted' };
      return `
        <article class="minimal-card" id="${prefix}-${escapeHTML(item.id)}">
          <div class="minimal-card-top">
            <span class="venue-label">${escapeHTML(item.venue)}${item.tier ? ` · ${escapeHTML(item.tier)}` : ''}</span>
            <span class="status-pill ${status.pillClass}">${escapeHTML(status.label)}</span>
          </div>
          <h3 class="minimal-card-title">${escapeHTML(item.title)}</h3>
          <p class="minimal-card-desc">${escapeHTML(item.description)}</p>
          ${item.funding ? `<div class="minimal-card-foot"><span>${escapeHTML(item.funding)}</span><span>${escapeHTML(String(item.year || '2026'))}</span></div>` : ''}
        </article>
      `;
    }).join('');
  }

  function renderConferences(papers) {
    if (!els.confSection || !els.confContainer) return;
    if (papers.length === 0) {
      els.confSection.hidden = true;
      return;
    }
    els.confSection.hidden = false;

    els.confContainer.innerHTML = papers.map(p => {
      const gallery = p.gallery || [];
      const metricsHtml = (p.metrics || []).length > 0
        ? `<div class="conf-metrics">
            ${p.metrics.map(m => `
              <div class="conf-metric">
                <span class="conf-metric-label">${escapeHTML(m.label)}</span>
                <span class="conf-metric-val">${escapeHTML(m.value)}</span>
              </div>
            `).join('')}
          </div>`
        : '';

      const thumbsHtml = gallery.length > 0
        ? `<div class="conf-thumbs" aria-label="Paper figures and result tables">
            ${gallery.map((g, idx) => {
          const shortTag = g.title.split(':')[0];
          const isTable = /^table/i.test(shortTag.trim());
          return `
                <button type="button" class="thumb-btn open-lightbox-trigger ${isTable ? 'is-table' : ''}" data-paper-id="${escapeHTML(p.id)}" data-fig-index="${idx}" title="${escapeHTML(g.title)}">
                  <img src="${g.src}" alt="${escapeHTML(g.title)}" loading="lazy" decoding="async" />
                  <span class="thumb-tag">${escapeHTML(shortTag)}</span>
                </button>
              `;
        }).join('')}
          </div>`
        : '';

      return `
        <article class="conf-card" id="paper-${escapeHTML(p.id)}">
          <div class="conf-meta-row">
            <div class="conf-meta-tags">
              <span class="status-pill status-published">${escapeHTML(p.venue)}</span>
              ${p.pages ? `<span class="venue-label">pp. ${escapeHTML(p.pages)}</span>` : ''}
            </div>
            <span class="venue-label">${escapeHTML((p.index || []).join(' · '))}</span>
          </div>

          <h3 class="conf-title">
            <a href="${p.link}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.title)}</a>
          </h3>

          <div class="conf-authors">${highlightAuthor(p.authors || '')}</div>

          ${metricsHtml}

          ${p.image ? `
            <div class="conf-visual-row">
              <button type="button" class="conf-primary-fig open-lightbox-trigger" data-paper-id="${escapeHTML(p.id)}" data-fig-index="0" aria-label="Inspect figures and tables for ${escapeHTML(p.title)}">
                <img src="${p.image}" alt="${escapeHTML(p.title)} primary figure" loading="lazy" decoding="async" />
              </button>
              ${thumbsHtml}
            </div>
          ` : ''}

          <div class="conf-actions">
            <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="btn-clean btn-clean-primary">IEEE Xplore ↗</a>
            ${gallery.length > 0 ? `<button type="button" class="btn-clean btn-clean-ghost open-lightbox-trigger" data-paper-id="${escapeHTML(p.id)}" data-fig-index="1">Figures &amp; Tables (${gallery.length})</button>` : ''}
            ${p.bibtex ? `<button type="button" class="btn-clean btn-clean-ghost copy-bibtex-btn" data-paper-id="${escapeHTML(p.id)}">Copy BibTeX</button>` : ''}
          </div>

          <details class="conf-details">
            <summary>Abstract &amp; BibTeX Citation</summary>
            <div class="conf-details-body">
              <p class="conf-abstract">${escapeHTML(p.description)}</p>
              ${p.bibtex ? `<pre class="bibtex-pre"><code>${escapeHTML(p.bibtex)}</code></pre>` : ''}
            </div>
          </details>
        </article>
      `;
    }).join('');
  }

  function renderSpecial(specials) {
    if (!els.specialSection || !els.specialContainer) return;
    if (specials.length === 0) {
      els.specialSection.hidden = true;
      return;
    }
    els.specialSection.hidden = false;

    els.specialContainer.innerHTML = specials.map(s => `
      <article class="minimal-card" id="special-${escapeHTML(s.id)}">
        <div class="minimal-card-top">
          <span class="venue-label">${escapeHTML(s.venue || s.badge)}</span>
          <span class="status-pill status-published">${escapeHTML(String(s.year || '2026'))}</span>
        </div>
        <h3 class="minimal-card-title">${escapeHTML(s.title)}</h3>
        <p class="minimal-card-desc">${escapeHTML(s.description)}</p>
        <div class="minimal-card-foot">
          <span>${escapeHTML(s.publisher)}</span>
          <a href="${s.link}" target="_blank" rel="noopener noreferrer" class="table-action">Read PDF ↗</a>
        </div>
      </article>
    `).join('');
  }

  function renderDirectoryTable(items) {
    if (!els.papersDirectoryTbody) return;
    if (els.tableCountPill) els.tableCountPill.textContent = `${items.length} Paper${items.length === 1 ? '' : 's'}`;

    if (items.length === 0) {
      els.papersDirectoryTbody.innerHTML = '<tr><td colspan="5">No matching publications.</td></tr>';
      return;
    }

    els.papersDirectoryTbody.innerHTML = items.map(item => {
      let anchor = `#paper-${item.id}`;
      if (item._section === 'journal') anchor = `#journal-${item.id}`;
      else if (item._section === 'ongoing') anchor = `#ongoing-${item.id}`;
      else if (item._section === 'special') anchor = `#special-${item.id}`;

      const status = CONFIG.statusMeta[item.status] || { label: 'Published', pillClass: 'status-published' };
      const isExt = Boolean(item.link && item.link.startsWith('http'));

      return `
        <tr>
          <th scope="row"><a href="${anchor}" class="table-title-link">${escapeHTML(item.title)}</a></th>
          <td><span class="table-muted">${escapeHTML(item.venue || item.publisher || '')}</span></td>
          <td><span class="table-muted">${escapeHTML(String(item.year || '2026'))}</span></td>
          <td><span class="status-pill ${status.pillClass}">${escapeHTML(status.label)}</span></td>
          <td><a href="${isExt ? item.link : anchor}" ${isExt ? 'target="_blank" rel="noopener noreferrer"' : ''} class="table-action">${isExt ? 'Open ↗' : 'View ↑'}</a></td>
        </tr>
      `;
    }).join('');
  }

  function setupLightboxModal() {
    if (!els.figureModal) return;

    if (els.confContainer) {
      els.confContainer.addEventListener('click', (e) => {
        const lbBtn = e.target.closest('.open-lightbox-trigger');
        if (lbBtn) {
          openLightbox(lbBtn.dataset.paperId, parseInt(lbBtn.dataset.figIndex, 10) || 0);
          return;
        }
        const bibBtn = e.target.closest('.copy-bibtex-btn');
        if (bibBtn && state.data) {
          const paper = (state.data.papers.conferences || []).find(p => p.id === bibBtn.dataset.paperId);
          if (paper && paper.bibtex) copyToClipboard(paper.bibtex);
        }
      });
    }

    if (els.modalPrevBtn) els.modalPrevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (els.modalNextBtn) els.modalNextBtn.addEventListener('click', () => navigateLightbox(1));

    window.addEventListener('keydown', (e) => {
      if (!els.figureModal.open) return;
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      else if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      els.figureModal.addEventListener('click', (event) => {
        if (event.target !== els.figureModal) return;
        const r = els.figureModal.getBoundingClientRect();
        if (r.top <= event.clientY && event.clientY <= r.top + r.height && r.left <= event.clientX && event.clientX <= r.left + r.width) return;
        els.figureModal.close();
      });
    }
  }

  function openLightbox(paperId, figIndex) {
    if (!els.figureModal || !state.data) return;
    const paper = (state.data.papers.conferences || []).find(p => p.id === paperId);
    if (!paper || !paper.gallery || paper.gallery.length === 0) return;
    state.currentGallery = paper.gallery;
    state.currentGalleryIndex = Math.max(0, Math.min(figIndex, paper.gallery.length - 1));
    updateModalContent();
    els.figureModal.showModal();
  }

  function navigateLightbox(delta) {
    if (!state.currentGallery.length) return;
    state.currentGalleryIndex = (state.currentGalleryIndex + delta + state.currentGallery.length) % state.currentGallery.length;
    updateModalContent();
  }

  function updateModalContent() {
    const item = state.currentGallery[state.currentGalleryIndex];
    if (!item) return;
    if (els.modalFigImg) { els.modalFigImg.src = item.src; els.modalFigImg.alt = item.title; }
    if (els.modalFigTitle) els.modalFigTitle.textContent = item.title;
    if (els.modalFigCaption) els.modalFigCaption.textContent = item.caption;
    if (els.modalFigCounter) els.modalFigCounter.textContent = `Visual ${state.currentGalleryIndex + 1} of ${state.currentGallery.length}`;
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      if (els.bibtexToast) {
        els.bibtexToast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => els.bibtexToast.classList.remove('show'), 2600);
      }
    } catch (e) { }
  }

  function highlightAuthor(str) {
    return escapeHTML(str).replace(/Md Saib Hossain/gi, '<strong>Md Saib Hossain</strong>');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
