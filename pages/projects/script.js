/**
 * Projects Page Script & Interactive Renderer
 * MD Saib Hossain Portfolio | pages/projects/script.js
 *
 * Dark Glassmorphism, live search, domain category filters,
 * 3D card perspective tilt, and clipboard clone commands.
 */

(function () {
  'use strict';

  // Resilient fallback dataset for offline and file:// protocol
  const FALLBACK_PROJECTS = [
    {
      "id": "memoryos",
      "title": "MemoryOS — Local LLM Memory Sandbox",
      "description": "A fully local, multi-user educational sandbox application designed to demonstrate and explore modern LLM memory design patterns using LangGraph checkpointers, PostgresStore persistence, and dynamic Ollama execution.",
      "url": "https://github.com/Saibhossain/MemoryOS.git",
      "image": "../../assets/images/Project_img/memoryos.webp",
      "tags": ["LangGraph", "Ollama", "PostgreSQL", "Streamlit", "Agentic AI"],
      "category": "agentic",
      "metrics": { "context": "8,192 Tok", "latency": "14.2 ms", "deployment": "Local On-Prem" },
      "highlights": [
        "Short-term and long-term memory persistence using PostgresStore checkpointers",
        "Dynamic sliding-window context summarization to bypass LLM context limits",
        "Secure multi-user chat isolation with interactive UI and monitoring telemetry"
      ]
    },
    {
      "id": "scholaragent",
      "title": "ScholarAgent — AI Scholarship Advisor",
      "description": "Autonomous multi-agent AI system for international scholarship discovery, academic profile evaluation, strategic timeline roadmap generation, and automated Statement of Purpose (SOP) drafting.",
      "url": "https://github.com/Saibhossain/ScholarAgent.git",
      "image": "../../assets/images/Project_img/scholaragent.webp",
      "tags": ["CrewAI", "Agentic AI", "Ollama", "Streamlit", "Tavily API"],
      "category": "agentic",
      "metrics": { "matchRate": "98.4%", "agents": "4 Coordinated", "model": "Gemma 3 Local" },
      "highlights": [
        "Four-agent specialized workflow: Discovery, Profile Matcher, Roadmap Planner, and SOP Drafter",
        "Local LLM orchestration via Ollama eliminating sensitive student data cloud transfer",
        "Real-time CrewAI telemetry, task observability, and PDF export formatting"
      ]
    },
    {
      "id": "interview-agent",
      "title": "Agentic AI Technical Interviewer",
      "description": "Stateful autonomous AI interviewer that parses candidate resumes, routes intent dynamically, and conducts multi-turn interactive technical coding evaluations with structured rubric scoring.",
      "url": "https://github.com/Saibhossain/Interview-agent.git",
      "image": "../../assets/images/Project_img/interview_agent.webp",
      "tags": ["LangGraph", "Agentic AI", "Streamlit", "State Machine"],
      "category": "agentic",
      "metrics": { "accuracy": "96.2%", "evalDimensions": "4 Rubrics", "engine": "LangGraph Loop" },
      "highlights": [
        "Robust state machine preserving conversational loops, follow-up challenges, and hint delivery",
        "Hybrid LLM orchestration supporting both cloud (Gemini 2.5) and local (Ollama) inference",
        "Structured JSON output validation for skill metrics, code quality, and final assessment"
      ]
    },
    {
      "id": "medassist-iphone",
      "title": "MedAssist-LLM-iPhone (Offline Medical QA)",
      "description": "Fine-tuned Qwen2.5-0.5B-Instruct on medical clinical QA datasets with LoRA, quantized to GGUF format for 100% offline, privacy-preserving on-device inference on iPhone with zero cloud latency.",
      "url": "https://github.com/Saibhossain/MedAssist-LLM-iPhone.git",
      "image": "../../assets/images/Project_img/medassist_iphone.webp",
      "tags": ["LoRA Fine-Tuning", "GGUF", "Mobile AI", "Privacy-Preserving", "llama.cpp"],
      "category": "medical",
      "metrics": { "ramFootprint": "340 MB", "latency": "18.4 ms", "accuracy": "88.7% USMLE" },
      "highlights": [
        "100% offline on-device LLM inference without cloud dependency or network connection",
        "Unsloth + Hugging Face Transformers pipeline for parameter-efficient LoRA tuning",
        "Optimized 4-bit quantization (Q4_K_M) delivering 28.4 tokens/sec on mobile Neural Engines"
      ]
    },
    {
      "id": "eye-of-llm",
      "title": "Real-Time Vision + LLM Agent (LLM with Eyes)",
      "description": "Autonomous multimodal computer vision system combining real-time YOLO11 object detection with Gemini 2.5 Flash for high-level contextual reasoning and auditory narration of visual environments.",
      "url": "https://github.com/Saibhossain/Eye-of-LLM.git",
      "image": "../../assets/images/Project_img/eye_of_llm.webp",
      "tags": ["Computer Vision", "YOLO11", "Gemini Flash", "Real-Time Stream", "Multimodal AI"],
      "category": "cv",
      "metrics": { "fps": "60 FPS Stream", "mAP": "0.550 mAP@50", "synthesis": "Sub-Second" },
      "highlights": [
        "Live camera feed processing with spatial bounding box slicing at 60 FPS",
        "High-frequency image patching to Gemini 2.5 Flash for scene description and hazard alerts",
        "Modular pipeline architected for smart assistive glasses and robotic inspection"
      ]
    },
    {
      "id": "face-generation",
      "title": "Synthetic Face Dataset Generation (GANs + Diffusion)",
      "description": "Hybrid generative pipeline contrasting StyleGAN2-ADA and Stable Diffusion XL (SDXL) with LoRA to study dataset scale and demographic bias mitigation in small-sample visual foundation models.",
      "url": "https://github.com/Saibhossain/face-generation-model.git",
      "image": "../../assets/images/Project_img/face_generation.webp",
      "tags": ["StyleGAN2-ADA", "SDXL", "LoRA", "Data Engineering", "Small-Data Learning"],
      "category": "generative",
      "metrics": { "fid": "7.82 FID Score", "resolution": "1024x1024", "adaAugment": "p=0.68" },
      "highlights": [
        "Adaptive Discriminator Augmentation (ADA) preventing discriminator overfitting on small datasets",
        "Identity-preserving generation with controlled pose, lighting, and demographic diversity",
        "Quantitative generative consistency benchmark across FID, IS, and perceptual diversity"
      ]
    },
    {
      "id": "langgraph-mcp",
      "title": "LangGraph MCP Agent + XAMPP MySQL Integration",
      "description": "Modular Model Context Protocol (MCP) server powered by LangGraph with FastAPI backend and MySQL integration for automated SQL query generation, telemetry, and intelligent document indexing.",
      "url": "https://github.com/Saibhossain/multi-agent-ai.git",
      "image": "../../assets/images/Project_img/langgraph_mcp.webp",
      "tags": ["LangGraph", "MCP Protocol", "FastAPI", "MySQL", "Multi-Agent"],
      "category": "agentic",
      "metrics": { "throughput": "420 Req/sec", "dbEngine": "MySQL / XAMPP", "protocol": "Anthropic MCP" },
      "highlights": [
        "Standardized MCP server architecture for seamless agent tool-calling integration",
        "FastAPI asynchronous endpoints executing validated database transactions",
        "Document ingestion pipeline with metadata indexing and semantic search integration"
      ]
    },
    {
      "id": "bangla-sign",
      "title": "Bangla Sign Language Translator",
      "description": "Real-time assistive computer vision system tracking 21 3D hand landmarks via MediaPipe and classifying gestures with CNNs to translate Bangla sign language alphabets into spoken audio.",
      "url": "https://github.com/Saibhossain/bangla-sign-language-assistant.git",
      "image": "../../assets/images/Project_img/bangla_sign.webp",
      "tags": ["Computer Vision", "MediaPipe", "CNN", "Edge AI", "Accessibility"],
      "category": "cv",
      "metrics": { "accuracy": "98.7% Accuracy", "latency": "12.4 ms", "lexicon": "46 BDSL Symbols" },
      "highlights": [
        "Real-time 21-point hand landmark coordinate normalization across diverse lighting",
        "Custom CNN architecture classifying Bangla characters with 98.7% validation accuracy",
        "Integrated Bengali text-to-speech engine deployable on Raspberry Pi and edge hardware"
      ]
    },
    {
      "id": "googler-agent",
      "title": "Googler Search Agent",
      "description": "Autonomous AI research agent executing multi-turn web search loops, extracting relevant evidence, deduplicating findings, and synthesizing concise executive summaries using local LLMs.",
      "url": "https://github.com/Saibhossain/Googler-Search-Agent.git",
      "image": "../../assets/images/Project_img/googler_agent.webp",
      "tags": ["Agentic AI", "Local LLMs", "Ollama", "Information Retrieval", "LangGraph"],
      "category": "eng",
      "metrics": { "offlineCapable": "100% Local LLM", "searchEngine": "Parallel SERP", "citations": "Automatic Footnotes" },
      "highlights": [
        "Autonomous query refinement breaking complex research questions into parallel search facets",
        "On-premise synthesis via Ollama + LangGraph preventing cloud telemetry leakage",
        "Automatic citation indexing and structured Markdown briefing compilation"
      ]
    },
    {
      "id": "dynamic-llm-selector",
      "title": "Prompt-Based Dynamic LLM Selector",
      "description": "Intelligent routing gate analyzing incoming prompt complexity, token length, and reasoning depth to dynamically dispatch requests to the optimal local LLM (Gemma 3 vs DeepSeek-R1).",
      "url": "https://github.com/Saibhossain/prompt-based-dynamic-llm-selector.git",
      "image": "../../assets/images/Project_img/dynamic_llm_selector.webp",
      "tags": ["LLM Routing", "Prompt Engineering", "Cost Optimization", "Local Inference"],
      "category": "LLM",
      "metrics": { "costSavings": "68.4% Efficiency", "models": "Gemma 3 & DeepSeek-R1", "routingLatency": "2.8 ms" },
      "highlights": [
        "Dynamic heuristic & semantic prompt complexity classification engine",
        "Compute-aware routing steering simple queries to 4B/8B models and deep logic to 70B clusters",
        "Ollama cluster load-balancing minimizing GPU memory thrashing"
      ]
    },
    {
      "id": "deeplearning-pytorch",
      "title": "DeepLearning with PyTorch",
      "description": "Foundational convolutional neural network implementations, automated hyperparameter optimization loops, and custom dataset training pipelines on benchmark visual recognition tasks.",
      "url": "https://github.com/Saibhossain/DeepLearning-with-PyTorch.git",
      "image": "../../assets/images/Project_img/deeplearning_pytorch.webp",
      "tags": ["PyTorch", "CNN", "Computer Vision", "Model Training"],
      "category": "generative",
      "metrics": { "accuracy": "99.24% Benchmark", "framework": "PyTorch 2.5", "loss": "0.024 Converged" },
      "highlights": [
        "Production neural network training loops with mixed-precision (AMP) and gradient clipping",
        "Hyperparameter optimization experiments tracked via Weights & Biases telemetry",
        "Modular data transformation pipelines with albumentations and test-time augmentation"
      ]
    },
    {
      "id": "plagiarism-detection",
      "title": "AI-Based Plagiarism Detection",
      "description": "Privacy-preserving academic text analysis engine measuring token perplexity, burstiness distributions, and statistical entropy to reliably distinguish AI-generated essays from human writing.",
      "url": "https://github.com/Saibhossain/AI-based-plagiarism-detection.git",
      "image": "../../assets/images/Project_img/plagiarism_detection.webp",
      "tags": ["NLP", "Text Classification", "Privacy-Preserving", "AI Safety"],
      "category": "eng",
      "metrics": { "detectionAcc": "94.8% Detection", "privacy": "Zero Cloud Upload", "metricsEvaluated": "Perplexity & Burstiness" },
      "highlights": [
        "On-device natural language analysis ensuring full privacy of sensitive academic manuscripts",
        "Token-level statistical entropy scoring highlighting specific suspicious synthetic phrases",
        "Lightweight Python execution engine suitable for deployment on campus intranet servers"
      ]
    },
    {
      "id": "study-chatbot",
      "title": "AI-Powered Study Assistant Chatbot",
      "description": "Conversational learning assistant leveraging a fine-tuned GPT-2 model with FastAPI streaming endpoints and a responsive interface for student conceptual Q&A and interactive revision.",
      "url": "https://github.com/Saibhossain/AI_ChatBotUsingGPT-2.git",
      "image": "../../assets/images/Project_img/study_chatbot.webp",
      "tags": ["GPT-2", "FastAPI", "Full-Stack", "WebSockets", "Educational AI"],
      "category": "eng",
      "metrics": { "latency": "18.5 ms/tok", "architecture": "FastAPI + WebSocket", "params": "124M Parameters" },
      "highlights": [
        "FastAPI asynchronous streaming WebSocket backend delivering instant token-by-token replies",
        "Fine-tuning pipeline tailored for computer science and mathematics pedagogical explanations",
        "Interactive topic quiz and flashcard generation modules for active recall study sessions"
      ]
    }
  ];

  const CONFIG = {
    jsonPaths: [
      '../../assets/data/projects.json?v=' + Date.now(),
      './assets/data/projects.json?v=' + Date.now(),
      'assets/data/projects.json?v=' + Date.now(),
      '/assets/data/projects.json?v=' + Date.now()
    ],
    categories: [
      { id: 'all', label: 'All Projects' },
      { id: 'agentic', label: 'Agentic AI' },
      { id: 'medical', label: 'Medical AI' },
      { id: 'cv', label: 'Computer Vision' },
      { id: 'generative', label: 'Generative AI' },
      { id: 'LLM', label: 'LLM & Routing' },
      { id: 'eng', label: 'Software & Tools' }
    ]
  };

  const state = {
    projects: [],
    activeCategory: 'all',
    searchQuery: ''
  };

  const els = {
    container: document.getElementById('projects-container'),
    filters: document.getElementById('filter-bar'),
    searchInput: document.getElementById('project-search'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    resultsCount: document.getElementById('results-count'),
    toast: document.getElementById('clone-toast'),
    toastMessage: document.getElementById('toast-message'),
    statTotalProjects: document.getElementById('hud-total-projects')
  };

  let toastTimer = null;

  async function init() {
    let loadedData = null;
    try {
      loadedData = await fetchProjectsData();
    } catch (e) {
      console.warn('Network fetch failed, falling back to embedded dataset', e);
    }

    if (loadedData && Array.isArray(loadedData.items) && loadedData.items.length > 0) {
      state.projects = loadedData.items;
    } else if (Array.isArray(loadedData) && loadedData.length > 0) {
      state.projects = loadedData;
    } else {
      state.projects = FALLBACK_PROJECTS;
    }

    if (els.statTotalProjects) {
      els.statTotalProjects.textContent = state.projects.length;
    }

    setupCategoryTabs();
    setupSearch();
    renderProjects();
    setupCloneButtons();
  }

  async function fetchProjectsData() {
    for (const path of CONFIG.jsonPaths) {
      try {
        const res = await fetch(path);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return null;
  }

  function normalizeCategory(cat) {
    if (!cat) return 'eng';
    if (cat === 'chatbot') return 'eng';
    return cat;
  }

  function setupCategoryTabs() {
    if (!els.filters) return;

    const countMap = { all: state.projects.length };
    CONFIG.categories.forEach(c => { if (c.id !== 'all') countMap[c.id] = 0; });

    state.projects.forEach(p => {
      const cat = normalizeCategory(p.category);
      if (countMap[cat] !== undefined) {
        countMap[cat]++;
      }
    });

    els.filters.innerHTML = CONFIG.categories.map(cat => `
      <button type="button" class="filter-btn ${cat.id === state.activeCategory ? 'active' : ''}" data-cat="${cat.id}">
        <span>${escapeHtml(cat.label)}</span>
        <span class="tab-badge">${countMap[cat.id] || 0}</span>
      </button>
    `).join('');

    els.filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const cat = btn.dataset.cat;
      if (cat === state.activeCategory) return;

      state.activeCategory = cat;

      els.filters.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === cat);
      });

      // Smoothly center the clicked tab into view on mobile devices
      try {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch (err) {}

      renderProjects();
    });
  }

  function setupSearch() {
    if (!els.searchInput) return;

    els.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      if (els.clearSearchBtn) {
        els.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      }
      renderProjects();
    });

    if (els.clearSearchBtn) {
      els.clearSearchBtn.addEventListener('click', () => {
        els.searchInput.value = '';
        state.searchQuery = '';
        els.clearSearchBtn.style.display = 'none';
        els.searchInput.focus();
        renderProjects();
      });
    }
  }

  function matchesFilter(p) {
    const pCat = normalizeCategory(p.category);
    if (state.activeCategory !== 'all' && pCat !== state.activeCategory) {
      return false;
    }

    if (!state.searchQuery) return true;

    const q = state.searchQuery;
    const title = (p.title || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const tags = (p.tags || []).join(' ').toLowerCase();
    const highlights = (p.highlights || []).join(' ').toLowerCase();

    return title.includes(q) || desc.includes(q) || tags.includes(q) || highlights.includes(q);
  }

  function renderProjects() {
    if (!els.container) return;

    const filtered = state.projects.filter(matchesFilter);

    // Update Result Counter
    const activeCatObj = CONFIG.categories.find(c => c.id === state.activeCategory);
    const catLabel = activeCatObj ? activeCatObj.label : 'All Projects';

    if (els.resultsCount) {
      if (filtered.length === 0) {
        els.resultsCount.textContent = `No projects found matching "${state.searchQuery}" in ${catLabel}.`;
      } else {
        els.resultsCount.textContent = `Showing ${filtered.length} of ${state.projects.length} projects (${catLabel}${state.searchQuery ? `, matching "${state.searchQuery}"` : ''})`;
      }
    }

    if (filtered.length === 0) {
      els.container.innerHTML = `
        <div class="glass-card" style="text-align:center;padding:3.5rem 2rem;grid-column:1/-1;">
          <p style="color:var(--text);font-size:1.15rem;margin-bottom:0.75rem;">🔍 No matching projects found</p>
          <p class="text-muted" style="font-size:0.9rem;">Try selecting another domain filter tab or clearing search keywords.</p>
        </div>
      `;
      return;
    }

    els.container.innerHTML = filtered.map((p, idx) => {
      const pCat = normalizeCategory(p.category);
      const catObj = CONFIG.categories.find(c => c.id === pCat) || { label: pCat.toUpperCase() };

      // Image Path Handling
      let imageSrc = p.image || '';
      if (imageSrc.startsWith('/assets')) {
        imageSrc = '../../' + imageSrc.slice(1);
      }

      // Highlights List HTML
      const highlightsHtml = (p.highlights && p.highlights.length > 0)
        ? `<ul class="highlights-list">
            ${p.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>`
        : '';

      // Metrics Chips HTML
      let metricsHtml = '';
      if (p.metrics) {
        const entries = Object.entries(p.metrics).slice(0, 3);
        if (entries.length > 0) {
          metricsHtml = `
            <div class="project-metrics-row" aria-label="Key Performance Metrics">
              ${entries.map(([k, v]) => `
                <div class="metric-chip">
                  <span class="metric-label">${escapeHtml(formatMetricKey(k))}:</span>
                  <span>${escapeHtml(v)}</span>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

      // Tags HTML
      const tagsHtml = (p.tags && p.tags.length > 0)
        ? `<div class="project-tags" aria-label="Technologies used">
            ${p.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>`
        : '';

      return `
        <article class="project-card glass-card project-${pCat} fade-in-up" data-project-id="${p.id || idx}" style="animation-delay: ${(idx % 6) * 0.08}s;">
          <div class="card-accent-bar"></div>

          <div class="project-thumb-wrap">
            <span class="thumb-badge">${escapeHtml(catObj.label)}</span>
            <img src="${imageSrc}" alt="${escapeHtml(p.title)} Preview" class="project-thumb" loading="lazy" onerror="this.src='../../assets/images/icon-192x192.png';this.style.objectFit='contain';this.style.padding='2rem';" />
          </div>

          <div class="project-card-body">
            <h3 class="project-title">
              <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="project-title-link">${escapeHtml(p.title)}</a>
            </h3>

            <p class="project-desc">${escapeHtml(p.description)}</p>

            ${metricsHtml}
            ${highlightsHtml}
            ${tagsHtml}

            <div class="project-card-footer">
              <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>View on GitHub ↗</span>
              </a>
              <button type="button" class="btn btn-outline btn-sm btn-copy-clone" data-url="${p.url || ''}" title="Copy git clone command">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Clone</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    setup3DTilt();
  }

  function formatMetricKey(key) {
    if (key === 'fps') return 'Throughput';
    if (key === 'mAP') return 'mAP@50';
    if (key === 'fid') return 'FID';
    if (key === 'ramFootprint') return 'RAM';
    if (key === 'costSavings') return 'Savings';
    if (key === 'detectionAcc') return 'Accuracy';
    if (key === 'dbEngine') return 'DB';
    return key.replace(/([A-Z])/g, ' $1').trim();
  }

  function setup3DTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = -((y - centerY) / centerY) * 5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  function setupCloneButtons() {
    if (!els.container) return;

    els.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-copy-clone');
      if (!btn) return;
      const url = btn.dataset.url;
      if (!url) return;

      const cloneCmd = `git clone ${url}`;
      copyToClipboard(cloneCmd, 'Repository clone command copied to clipboard!');
    });
  }

  async function copyToClipboard(text, message) {
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
      showToast(message || 'Copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Manual copy needed: ' + text);
    }
  }

  function showToast(msg) {
    if (!els.toast) return;
    if (els.toastMessage) els.toastMessage.textContent = msg;

    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('show');
    }, 2800);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
