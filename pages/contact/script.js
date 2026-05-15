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
      // Load data (with inline fallback for CSP)
      contactData = await loadContactData();
      if (!contactData) throw new Error('No contact data available');
      
      // Render sections
      renderGreeting();
      renderProfile();
      renderAvailability();
      renderContactMethods();
      renderSocialMini();
      
      // Setup interactions
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
    // Try fetch first
    try {
      const res = await fetch(CONFIG.jsonPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (fetchErr) {
      console.warn('⚠️ Fetch failed, checking inline fallback');
      // Fallback: inline script tag
      const inline = document.getElementById('contact-data-fallback');
      if (inline?.textContent) {
        return JSON.parse(inline.textContent);
      }
      // Last resort: hardcoded minimal data
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
        social: [{ id: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/saibhossain', icon: 'in', action: 'https://linkedin.com/in/saibhossain', color: '#0a66c2', category: 'social' }],
        academic: []
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
      <a href="${item.action}" target="_blank" rel="noopener" 
         class="contact-card" 
         data-category="${category}"
         data-id="${item.id}"
         ${item.copyable ? 'data-copyable="true"' : ''}
         data-value="${item.value || ''}"
         style="animation-delay: ${idx * 0.08}s"
         aria-label="${item.label}: ${item.value}">
        
        <div class="contact-icon" style="background: ${item.color ? `linear-gradient(135deg, ${item.color}, ${adjustColor(item.color, -20)})` : ''}">
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
    
    // Trigger entrance animation after render
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
    // Start after slight delay
    setTimeout(type, 500);
  }

  // ===== COPY TO CLIPBOARD =====
  function setupCopyTooltips() {
    document.querySelectorAll('[data-copyable="true"]').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent navigation for copyable items
        e.preventDefault();
        
        const value = card.dataset.value;
        const tooltip = card.querySelector('.copy-tooltip');
        
        if (!value || !navigator.clipboard) return;
        
        navigator.clipboard.writeText(value).then(() => {
          // Show tooltip
          if (tooltip) {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), CONFIG.copyTooltipDuration);
          }
          
          // Visual feedback
          card.style.borderColor = 'var(--accent-emerald)';
          setTimeout(() => {
            card.style.borderColor = '';
          }, 300);
        }).catch(err => {
          console.warn('Copy failed:', err);
          // Fallback: select text
          const temp = document.createElement('input');
          temp.value = value;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        });
      });
    });
  }

  // ===== FORM SUBMISSION =====
  function setupFormSubmission() {
    const form = document.getElementById('quick-message-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('.btn-send');
      const originalText = btn.innerHTML;
      
      // Loading state
      btn.disabled = true;
      btn.innerHTML = '<span>Sending...</span><span class="send-icon">⟳</span>';
      
      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // If Formspree endpoint exists, submit
        const endpoint = contactData?.quick_message?.submit_endpoint;
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Submission failed');
        }
        
        // Success feedback
        btn.innerHTML = '<span>✓ Sent!</span>';
        btn.style.background = 'var(--gradient-2)';
        
        // Reset form
        form.reset();
        
        // Revert button after delay
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
          
          // Group titles
          if (target.classList.contains('group-title')) {
            target.classList.add('is-visible');
          }
          
          // Contact cards (handled individually on render)
          
          // Form card
          if (target.classList.contains('form-card')) {
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
          }
          
          // Stop observing after trigger
          if (!target.dataset.persistent) {
            observer.unobserve(target);
          }
        }
      });
    }, { threshold: CONFIG.scrollThreshold });
    
    // Observe group titles
    document.querySelectorAll('.group-title').forEach(el => observer.observe(el));
    
    // Observe form card
    const formCard = document.querySelector('.form-card');
    if (formCard) observer.observe(formCard);
    
    // Initial trigger for hero elements
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
            <a href="mailto:saibhossain5@gmail.com" class="btn" style="background: var(--gradient-1); color: #fff; padding: 0.875rem 1.5rem; border-radius: 12px; text-decoration: none;">✉️ Email Me</a>
            <a href="https://linkedin.com/in/saibhossain" target="_blank" class="btn" style="background: rgba(255,255,255,0.15); color: #fff; padding: 0.875rem 1.5rem; border-radius: 12px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">LinkedIn</a>
            <a href="https://github.com/Saibhossain" target="_blank" class="btn" style="background: rgba(255,255,255,0.15); color: #fff; padding: 0.875rem 1.5rem; border-radius: 12px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">GitHub</a>
          </div>
          <p style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.7;">If issues persist, please check your internet connection or try refreshing the page.</p>
        </div>
      `;
    }
  }

  // ===== UTILS =====
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }
  
  // Adjust color brightness for gradient endpoints
  function adjustColor(hex, percent) {
    // Simple hex color adjustment
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

  // Expose for debugging
  window.ContactPage = { refresh: init, getData: () => contactData };

})();