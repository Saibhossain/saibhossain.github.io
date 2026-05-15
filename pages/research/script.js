/**
 * Research Page Logic
 * Fetches JSON, renders tables/papers, handles scroll dissipate & progress animations
 */
(function() {
  'use strict';

  const CONFIG = {
    jsonPath: '../../assets/data/research.json',
    scrollThreshold: 0.3, // Fraction of viewport to trigger dissipate
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

  async function init() {
    try {
      const res = await fetch(CONFIG.jsonPath);
      if (!res.ok) throw new Error('Failed to load research.json');
      const data = await res.json();
      
      renderStats(data.papers);
      renderOngoing(data.papers.ongoing);
      renderPublished(data.papers.conferences, 'conf-container', 'conf');
      renderPublished(data.papers.journals, 'journal-container', 'journal');
      
      setupScrollEffects();
      setupProgressAnimation();
    } catch (err) {
      console.error(err);
      document.getElementById('stats-tbody').innerHTML = '<tr><td colspan="4">Error loading research data.</td></tr>';
    }
  }

  function renderStats(papers) {
    const tbody = document.getElementById('stats-tbody');
    const confCount = papers.conferences.length;
    const aStarCount = papers.ongoing.filter(p => p.tier === 'A*').length + papers.conferences.filter(p => p.tier === 'A*').length;
    
    const journalCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    papers.journals.forEach(j => { if (journalCounts[j.tier] !== undefined) journalCounts[j.tier]++; });
    papers.ongoing.forEach(j => { if (journalCounts[j.tier] !== undefined) journalCounts[j.tier]++; });

    const totalJournals = papers.journals.length + papers.ongoing.filter(j => j.tier.startsWith('Q')).length;
    const journalTiersStr = Object.entries(journalCounts).filter(([_, v]) => v > 0).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None';

    const rows = [
      { cat: 'Conferences', total: confCount, tier: 'Core/Scopus', index: ['Scopus', 'IEEE Xplore'] },
      { cat: 'A* Conferences', total: aStarCount, tier: 'NeurIPS', index: ['DBLP', 'CORE'] },
      { cat: 'Journals', total: totalJournals, tier: journalTiersStr, index: ['Web of Science', 'Scopus'] }
    ];

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${r.cat}</strong></td>
        <td>${r.total}</td>
        <td>${r.tier}</td>
        <td><div class="index-badges">${r.index.map(i => `<span class="idx-badge">${i}</span>`).join('')}</div></td>
      </tr>
    `).join('');
  }

  function renderOngoing(ongoing) {
    const container = document.getElementById('ongoing-container');
    container.innerHTML = ongoing.map(p => {
      const stage = CONFIG.stages[p.status] || CONFIG.stages.writing_manuscript;
      return `
      <article class="ongoing-card">
        <div class="ongoing-header">
          <h3 class="ongoing-title">${p.title}</h3>
          <span class="venue-tag">${p.venue}</span>
        </div>
        <p class="ongoing-desc">${p.description}</p>
        ${p.funding ? `<p style="font-size:0.85rem; color:var(--accent-ongoing); margin-bottom:0.5rem;">💡 ${p.funding}</p>` : ''}
        <div class="progress-wrapper">
          <div class="progress-meta"><span>Progress</span><span>${stage.pct}%</span></div>
          <div class="progress-track">
            <div class="progress-fill" data-width="${stage.pct}"></div>
          </div>
          <div class="stage-labels">
            <span>Draft</span><span>Review</span><span>Online</span><span>Published</span>
          </div>
        </div>
      </article>
      `;
    }).join('');
  }

  function renderPublished(list, containerId, type) {
    const container = document.getElementById(containerId);
    if (!list || list.length === 0) return;
    container.innerHTML = list.map(p => `
      <article class="pub-card ${type}">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" class="pub-image" loading="lazy">` : ''}
        <div class="pub-header">
          <svg class="tick-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          <h3 class="pub-title"><a href="${p.link}" target="_blank" rel="noopener">${p.title}</a></h3>
        </div>
        <div class="pub-meta">
          <span>📍 ${p.venue}</span>
          <span>📅 ${p.year}</span>
        </div>
        <p class="pub-desc">${p.description}</p>
      </article>
    `).join('');
  }

  function setupScrollEffects() {
    const sections = document.querySelectorAll('.scroll-fade-top, .scroll-fade-middle, .scroll-fade-bottom');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
        window.requestAnimationFrame(() => {
            const vh = window.innerHeight;
            sections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const dist = Math.abs(center - vh / 2);
            const threshold = vh * 0.75; // Adjust sensitivity (0.7 = earlier fade, 0.9 = later)

            // Bidirectional toggle: only classes, NO inline styles
            if (dist > threshold) {
                sec.classList.add('dissipate');
                sec.classList.remove('fade-in-view');
            } else {
                sec.classList.remove('dissipate');
                sec.classList.add('fade-in-view');
            }
            });
            ticking = false;
        });
        ticking = true;
        }
    }, { passive: true });

    // Trigger initial state on load
    window.dispatchEvent(new Event('scroll'));
    }

  function setupProgressAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.dataset.width || '0';
          bar.style.width = `${width}%`;
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.progress-fill').forEach(el => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();