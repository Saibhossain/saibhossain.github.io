/**
 * Contact Page — Interactive Logic
 * Loads contact.json, renders cards, handles copy, form, and scroll animations
 */
(function() {
  'use strict';

  const CONFIG = {
    jsonPath: '../../assets/data/contact.json',
    typingSpeed: 80, // ms per character for typewriter
    scrollThreshold: 0.2, // viewport fraction to trigger animations
    copyTooltipDuration: 2000 // ms to show "Copied!" tooltip
  };

  // State
  let contactData = null;
  let isInitialized = false;

  // ===== INIT =====
  async function init() {
    if (isInitialized) return;

    try {
      contactData = await loadContactData();
      if (!contactData) throw new Error('No contact data available');

      renderGreeting();
      renderProfile();
      renderAvailability();
      renderContactMethods();
      renderSocialMini();

      setupTypewriter();
      setupCopyTooltips();
      setupFormSubmission();
      setupScrollAnimations();

      isInitialized = true;
      console.log('✅ Contact page initialized');

    } catch (err) {
      console.error('❌ Contact page init failed:', err);
      showFallbackUI();
    }
  }

  // Load JSON with fallback
  async function loadContactData() {
    try {
      const res = await fetch(CONFIG.jsonPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (fetchErr) {
      console.warn('⚠️ Fetch failed, using hardcoded fallback');
      return getHardcodedFallback();
    }
  }

  function getHardcodedFallback() {
    return {
      greeting: "Let's Connect",
      subtitle: "I'm always open to research collaborations, technical discussions, or just a friendly chat about AI.",
      profile: {
        name: "MD Saib Hossain",
        role: "AI Researcher • Medical Imaging • Agentic AI",
        location: "Dhaka, Bangladesh",
        avatar: "../../assets/images/profile.jpg"
      },
      contact_methods: {
        primary: [{ id: 'email1', label: 'Primary Email', value: 'saibhossain5@gmail.com', icon: '✉️', action: 'mailto:saibhossain5@gmail.com', copyable: true, category: 'email' }],
        social: [
          { id: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/saibhossain', icon: 'in', action: 'https://www.linkedin.com/in/saib-hossain-182834229/', color: '#0a66c2', category: 'social' },
          { id: 'github', label: 'GitHub', value: 'github.com/Saibhossain', icon: '⌥', action: 'https://github.com/Saibhossain', color: '#333', category: 'social' }
        ],
        academic: [
          { id: 'scholar', label: 'Google Scholar', value: 'scholar.google.com/citations', icon: '🎓', action: 'https://scholar.google.com/citations?user=zH0QciUAAAAJ&hl=en', color: '#4285f4', category: 'academic' },
          { id: 'researchgate', label: 'ResearchGate', value: 'researchgate.net/profile/Saib-Hossain', icon: 'RG', action: 'https://www.researchgate.net/profile/Saib-Hossain?ev=hdr_xprf', color: '#00ccbb', category: 'academic' }
        ]
      },
      availability: { status: 'Open to collaborations', response_time: 'Usually replies within 24-48 hours' }
    };
  }

  // ===== RENDER FUNCTIONS =====
  function renderGreeting() {
    const el = document.getElementById('greeting-text');
    if (el && contactData?.greeting) {
      el.querySelector('.typewriter').dataset.text = contactData.greeting;
    }
  }

  function renderProfile() {
    if (!contactData?.profile) return;
    const { name, role, location, avatar } = contactData.profile;
    setText('profile-name', name);
    setText('profile-role', role);
    setText('profile-location', `📍 ${location}`);
    if (avatar) {
      const img = document.querySelector('.profile-avatar');
      if (img) img.src = avatar;
    }
  }

  function renderAvailability() {
    if (!contactData?.availability) return;
    const { status, response_time } = contactData.availability;
    setText('status-text', status);
    setText('response-time', response_time);
  }

  function renderContactMethods() {
    if (!contactData?.contact_methods) return;
    const { primary, social, academic } = contactData.contact_methods;
    renderGrid('primary-contacts', primary, 'email');
    renderGrid('social-contacts', social, 'social');
    renderGrid('academic-contacts', academic, 'academic');
  }

  function renderGrid(containerId, items, category) {
    const container = document.getElementById(containerId);
    if (!container || !items?.length) return;

    container.innerHTML = items.map((item, idx) => `
      <a href="${item.action}" target="${item.action.startsWith('http') ? '_blank' : '_self'}" rel="noopener"
         class="contact-card"
         data-category="${category}"
         data-id="${item.id}"
         ${item.copyable ? 'data-copyable="true"' : ''}
         data-value="${item.value || ''}"
         style="animation-delay: ${idx * 0.08}s"
         aria-label="${item.label}: ${item.value}">

        <div class="contact-icon" style="${item.color ? `background: linear-gradient(135deg, ${item.color}, ${adjustColor(item.color, -20)})` : ''}">
          ${item.icon}
        </div>

        <div class="contact-info">
          <div class="contact-label">${item.label}</div>
          <div class="contact-value">${item.value}</div>
        </div>

        <span class="contact-action">${item.copyable ? '📋' : '↗'}</span>

        ${item.copyable ? '<span class="copy-tooltip">Copied!</span>' : ''}
      </a>
    `).join('');

    setTimeout(() => {
      container.querySelectorAll('.contact-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('is-visible'), i * 100);
      });
    }, 100);
  }

  function renderSocialMini() {
    const container = document.getElementById('social-mini');
    if (!container || !contactData?.contact_methods?.social) return;

    const social = contactData.contact_methods.social.slice(0, 5);
    container.innerHTML = social.map(item => `
      <a href="${item.action}" target="_blank" rel="noopener"
         aria-label="${item.label}"
         style="background: ${item.color}20; border-color: ${item.color}40">
        ${item.icon}
      </a>
    `).join('');
  }

  // ===== TYPEWRITER EFFECT =====
  function setupTypewriter() {
    const el = document.querySelector('.typewriter');
    const text = el?.dataset.text || "Let's Connect";
    if (!el) return;

    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, CONFIG.typingSpeed + Math.random() * 50);
      }
    }
    setTimeout(type, 500);
  }

  // ===== COPY TO CLIPBOARD =====
  function setupCopyTooltips() {
    document.querySelectorAll('[data-copyable="true"]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();

        const value = card.dataset.value;
        const tooltip = card.querySelector('.copy-tooltip');

        if (!value) return;

        const doCopy = () => {
          if (tooltip) {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), CONFIG.copyTooltipDuration);
          }
          card.style.borderColor = 'var(--accent-emerald)';
          setTimeout(() => { card.style.borderColor = ''; }, 300);
        };

        if (navigator.clipboard) {
          navigator.clipboard.writeText(value).then(doCopy).catch(() => {
            legacyCopy(value);
            doCopy();
          });
        } else {
          legacyCopy(value);
          doCopy();
        }
      });
    });
  }

  function legacyCopy(value) {
    const temp = document.createElement('input');
    temp.value = value;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }

  // ===== FORM SUBMISSION =====
  function setupFormSubmission() {
    const form = document.getElementById('quick-message-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('.btn-send');
      const originalText = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = '<span>Sending...</span><span class="send-icon">⟳</span>';

      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        const endpoint = contactData?.quick_message?.submit_endpoint;
        if (endpoint && !endpoint.includes('your-form-id')) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Submission failed');
        }

        btn.innerHTML = '<span>✓ Sent!</span>';
        btn.style.background = 'var(--gradient-2)';
        form.reset();

        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 3000);

      } catch (err) {
        console.error('Form submit error:', err);
        btn.innerHTML = '<span>✗ Failed</span>';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 2500);
      }
    });
  }

  // ===== SCROLL ANIMATIONS =====
  function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;

          if (target.classList.contains('group-title')) {
            target.classList.add('is-visible');
          }

          if (target.classList.contains('form-card')) {
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
          }

          if (!target.dataset.persistent) {
            observer.unobserve(target);
          }
        }
      });
    }, { threshold: CONFIG.scrollThreshold });

    document.querySelectorAll('.group-title').forEach(el => observer.observe(el));

    const formCard = document.querySelector('.form-card');
    if (formCard) observer.observe(formCard);

    setTimeout(() => {
      document.querySelectorAll('.fade-in-up').forEach(el => {
        el.classList.add('is-visible');
      });
    }, 300);
  }

  // ===== FALLBACK UI =====
  function showFallbackUI() {
    const main = document.getElementById('main');
    if (main) {
      main.innerHTML = `
        <div class="container text-center" style="padding: 4rem 2rem; color: #fff;">
          <h2 style="font-size: 1.75rem; margin-bottom: 1rem;">🔗 Connect With Me</h2>
          <p style="margin-bottom: 2rem; opacity: 0.9;">Having trouble loading contact details? Try these direct links:</p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a href="mailto:saibhossain5@gmail.com" style="background: var(--gradient-1); color: #fff; padding: 0.875rem 1.5rem; border-radius: 12px; text-decoration: none;">✉️ Email Me</a>
            <a href="https://linkedin.com/in/saibhossain" target="_blank" style="background: rgba(255,255,255,0.15); color: #fff; padding: 0.875rem 1.5rem; border-radius: 12px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">LinkedIn</a>
            <a href="https://github.com/Saibhossain" target="_blank" style="background: rgba(255,255,255,0.15); color: #fff; padding: 0.875rem 1.5rem; border-radius: 12px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">GitHub</a>
          </div>
        </div>
      `;
    }
  }

  // ===== UTILS =====
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  // ===== INIT ON LOAD =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ContactPage = { refresh: init, getData: () => contactData };

})();