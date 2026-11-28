/**
 * SAIB-BOT — Lightweight 3D Cartoon Robot Portfolio Companion
 * Zero external LLM APIs, zero paid backends, 100% client-side.
 * Features:
 * - Volumetric 3D robot character modeled on assets/images/robot face.avif
 * - Verified offline Q&A retriever covering all 8 pages, papers, projects, roles, skills
 * - Native browser TTS (window.speechSynthesis) with live LED mouth lip-sync
 * - Physical page section roaming + cross-page guided tour (sessionStorage)
 * - 8 funny tap stunts + accessible keyboard/pointer drag + pause control
 */
(function (globalScope) {
  'use strict';

  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  // ===== 1. PORTFOLIO PAGES & TOUR SEQUENCE =====
  const PAGES = [
    {
      id: 'home',
      label: 'Home',
      path: 'index.html',
      tourSummary: 'Welcome to MD Saib Hossain’s portfolio! Saib is an AI Engineer and ML Researcher building clinical healthcare AI and secure multi-agent systems.',
      followUp: 'I can explain his mission, featured IEEE ICCIT 2025 papers, or fly with you to another page!'
    },
    {
      id: 'about',
      label: 'About',
      path: 'pages/about/index.html',
      tourSummary: 'This is the About page—covering Saib’s engineering philosophy, his 3 core aims, awards like the Kaggle Silver Medal, and featured AFOMP & SCMPCR articles.',
      followUp: 'Ask me about his biography, AFOMP Pulse article, or his AI for Children book!'
    },
    {
      id: 'experience',
      label: 'Experience',
      path: 'pages/experience/index.html',
      tourSummary: 'This is the Experience page—showcasing 1+ years of hands-on AI & research roles across UIU IAR, SCMPCR, ELITE Research Lab, FireAI, Fluvo Soft, and Ruach Tech, plus 13 verified certifications.',
      followUp: 'Ask me about any role, his B.Sc. in CSE at UIU, or his LangChain and IBM credentials.'
    },
    {
      id: 'projects',
      label: 'Projects',
      path: 'pages/projects/index.html',
      tourSummary: 'Welcome to the Projects lab! Here are 13 open-source AI systems spanning LangGraph agents, offline iPhone medical LLMs, YOLO11 vision agents, and GAN/SDXL synthesis.',
      followUp: 'Try asking about MedAssist-LLM-iPhone, MemoryOS, ScholarAgent, or Eye-of-LLM!'
    },
    {
      id: 'research',
      label: 'Research',
      path: 'pages/research/index.html',
      tourSummary: 'This is the Research & Publications page—featuring 3 published first-author IEEE ICCIT 2025 papers, 2 submitted Q1 oncology journals (MSurvPred & COAST), and 1 NeurIPS-track AI security manuscript under review.',
      followUp: 'Ask me for DOIs, metrics, COAST, MSurvPred, or prompt injection defense details!'
    },
    {
      id: 'startup',
      label: 'Startup',
      path: 'pages/startup/index.html',
      tourSummary: 'Welcome to Praxic Intelligence—Saib’s AI startup venture building enterprise multi-agent frameworks secured by prompt firewalls and cryptographic provenance.',
      followUp: 'Ask me how Praxic Intelligence protects LLM agents or its current roadmap!'
    },
    {
      id: 'volunteering',
      label: 'Volunteering',
      path: 'pages/volunteering/index.html',
      tourSummary: 'This is the Volunteering & Social Impact page—highlighting Saib’s work with Alo Bhubon Trust on rural cancer screening and his child rights leadership with NCTF.',
      followUp: 'Ask me about the Naogaon cancer screening camps or NCTF child protection work!'
    },
    {
      id: 'contact',
      label: 'Contact',
      path: 'pages/contact/index.html',
      tourSummary: 'You are on the Contact page! Here you can reach Saib directly by email, phone, LinkedIn, GitHub, Google Scholar, or ORCID.',
      followUp: 'Ask me for Saib’s email, CV download, or academic profiles!'
    }
  ];

  // ===== 2. VERIFIED PORTFOLIO KNOWLEDGE BASE (ZERO-API OFFLINE RETRIEVER) =====
  const KNOWLEDGE = [
    {
      id: 'identity',
      title: 'Who is MD Saib Hossain?',
      pageId: 'about',
      keywords: ['saib', 'hossain', 'who', 'bio', 'biography', 'about', 'background', 'education', 'degree', 'uiu', 'cgpa', 'mission', 'philosophy', 'aims', 'location', 'dhaka'],
      answer: 'MD Saib Hossain is an AI Engineer and ML Researcher in Dhaka, Bangladesh (B.Sc. in CSE at United International University, 2022–2026, CGPA 3.38/4.00). He serves as a Research Assistant at UIU Institute of Advanced Research (IAR) and Full-Stack AI Engineer at SCMPCR. His mission focuses on Clinical Deployability, Stateful Agent Security, and Edge AI Democratization.',
      links: [
        { label: 'About Page', pageId: 'about' },
        { label: 'Download CV (PDF)', asset: 'assets/cv/Md_Saib_Hossain.pdf' }
      ]
    },
    {
      id: 'experience-overview',
      title: 'Experience & Career Summary',
      pageId: 'experience',
      keywords: ['experience', 'work', 'job', 'career', 'years', 'internship', 'intern', 'timeline', 'roles', 'resume', 'cv', 'history'],
      answer: 'Saib has 1+ years of experience (since Nov 2025) across 6 roles: (1) Research Assistant at IAR, UIU (Nov 2025–Present), (2) Full-Stack AI Engineer at SCMPCR (Oct 2026–Present), (3) Research Intern at ELITE Research Lab LLC, USA (Jun–Oct 2026), (4) AI Engineer at FireAI / Betopia Group (Apr–May 2026), (5) ML Engineer Intern at Fluvo Soft (Nov 2025–Mar 2026), and (6) Volunteer Research Assistant at Ruach Tech, London (Jan–Mar 2026).',
      links: [
        { label: 'Experience Page', pageId: 'experience' },
        { label: 'Open CV PDF', asset: 'assets/cv/Md_Saib_Hossain.pdf' }
      ]
    },
    {
      id: 'role-iar-scmpcr',
      title: 'Current Roles: UIU IAR & SCMPCR',
      pageId: 'experience',
      keywords: ['iar', 'uiu', 'research assistant', 'scmpcr', 'fullstack', 'full-stack', 'aws', 'exam', 'certification platform', 'lung cancer triage'],
      answer: 'Currently, Saib leads funded healthcare & agentic AI projects as a Research Assistant at UIU IAR (deploying an AI Lung Cancer Screening & Clinical Triage platform) and builds SCMPCR’s AWS-hosted digital examination and automated certification system serving 50+ active users.',
      links: [{ label: 'View Experience', pageId: 'experience' }]
    },
    {
      id: 'research-overview',
      title: 'Research & Publications Summary',
      pageId: 'research',
      keywords: ['research', 'paper', 'papers', 'publication', 'publications', 'journal', 'conference', 'ieee', 'iccit', 'q1', 'submitted', 'scholar', 'orcid', 'doi'],
      answer: 'Saib has 6 research papers: 3 published first-author IEEE ICCIT 2025 conference papers (Fracture Unification, BanglaSign-Tutor, Urban Sustainability), 2 submitted Q1 oncology journal manuscripts (MSurvPred and COAST), and 1 NeurIPS-track AI security paper under review on cryptographic prompt-injection defense.',
      links: [{ label: 'Research Page', pageId: 'research' }]
    },
    {
      id: 'paper-msurvpred',
      title: 'MSurvPred (Q1 Journal · Submitted)',
      pageId: 'research',
      keywords: ['msurvpred', 'esophageal', 'squamous', 'escc', 'survival', 'multimodal', 'oncology', 'q1', 'cancer', 'submitted'],
      answer: 'MSurvPred ("MSurvPred: A Multimodal Deep Learning Framework for Personalized Survival Prediction in Esophageal Squamous Cell Carcinoma") is a Q1 medical imaging/oncology journal manuscript currently Submitted. It fuses cross-modal diagnostic imaging representations and clinical covariates for personalized ESCC prognosis.',
      links: [{ label: 'View on Research Page', pageId: 'research', hash: '#journal-msurvpred-escc' }]
    },
    {
      id: 'paper-coast',
      title: 'COAST (Q1 Journal · Submitted)',
      pageId: 'research',
      keywords: ['coast', 'clinical oncology', 'survival translation', 'radiomics', 'ct', 'cox', 'monte carlo', 'uncertainty', 'q1', 'submitted', 'grant'],
      answer: 'COAST ("Clinical Oncology Architecture for Survival Translation with Reliable Deep Feature Prediction") is a UIU IAR grant-funded Q1 journal manuscript marked Submitted. It combines 3D CT radiomics, pathology biomarkers, Cox Proportional Hazards, and Monte Carlo uncertainty estimation.',
      links: [{ label: 'View COAST on Research Page', pageId: 'research', hash: '#journal-coast-clinical-oncology' }]
    },
    {
      id: 'paper-fracture',
      title: 'Fracture Domain Unification (IEEE ICCIT 2025)',
      pageId: 'research',
      keywords: ['fracture', 'pediatric', 'adult', 'x-ray', 'xray', 'fracatlas', 'grazpedwri', 'yolov11', 'deeplabv3', 'resnet', 'segmentation', 'growth plate', '11491681'],
      answer: '"Unifying Adult and Pediatric Domains: Multi-Dataset Deep Learning for Fracture Classification, Detection, and Segmentation" (IEEE ICCIT 2025, pp. 5674–5679, DOI: 10.1109/ICCIT68322.2025.11491681) harmonizes FracAtlas & GRAZPEDWRI-DX to eliminate pediatric growth-plate false positives, hitting 0.930 ROC-AUC, 0.824 F1, 0.550 mAP@0.5 (YOLOv11), and 0.512 mask mAP (DeepLabV3).',
      links: [
        { label: 'Research Details', pageId: 'research', hash: '#paper-fracture-unification' },
        { label: 'IEEE Xplore ↗', href: 'https://ieeexplore.ieee.org/document/11491681' }
      ]
    },
    {
      id: 'paper-banglasign',
      title: 'BanglaSign-Tutor (IEEE ICCIT 2025)',
      pageId: 'research',
      keywords: ['banglasign', 'bangla sign', 'sign language', 'bdsl', 'bdsl47', 'haptic', 'raspberry pi', 'gemma', 'ollama', 'deaf', '11491587'],
      answer: '"BanglaSign-Tutor: An Interactive Bangla Sign Language Learning System via Finger-Guided Feedback" (IEEE ICCIT 2025, pp. 652–657, DOI: 10.1109/ICCIT68322.2025.11491587) uses BDSL47 (98.20% alphabet, 99.50% numeral accuracy), Raspberry Pi 4 haptic pulses, and Gemma 3 (4B via Ollama) to cut sign learning latency by 56.43%.',
      links: [
        { label: 'Research Details', pageId: 'research', hash: '#paper-banglasign-tutor' },
        { label: 'IEEE Xplore ↗', href: 'https://ieeexplore.ieee.org/document/11491587' }
      ]
    },
    {
      id: 'paper-urban',
      title: 'Urban Sustainability in Bangladesh (IEEE ICCIT 2025)',
      pageId: 'research',
      keywords: ['urban', 'sustainability', 'satellite', 'lulc', 'pollution', 'earth engine', 'gee', 'sentinel', 'dhaka', 'khulna', 'rajshahi', 'random forest', 'so2', '11490302'],
      answer: '"Urban Sustainability in Bangladesh: Satellite-Based Analysis of Land Use and Air Pollution Trends in Major Bangladeshi Cities" (IEEE ICCIT 2025, pp. 1894–1899, DOI: 10.1109/ICCIT68322.2025.11490302) analyzes Sentinel-2/5P imagery (2019–2025) across Dhaka, Khulna & Rajshahi (>99% Random Forest accuracy), uncovering +50% Dhaka urban sprawl and -35.2% Khulna wetland loss.',
      links: [
        { label: 'Research Details', pageId: 'research', hash: '#paper-urban-sustainability' },
        { label: 'IEEE Xplore ↗', href: 'https://ieeexplore.ieee.org/document/11490302' }
      ]
    },
    {
      id: 'paper-prompt-injection',
      title: 'Cryptographic Provenance for Agent Security (NeurIPS Track)',
      pageId: 'research',
      keywords: ['prompt injection', 'authorization', 'cryptographic', 'provenance', 'neurips', 'agent security', 'ai safety', 'security', 'guardrail'],
      answer: '"Prompt Injection is an Authorization Problem: Cryptographic Provenance for Secure Agentic Workflows" (NeurIPS track, Under Review) introduces a zero-trust cryptographic provenance framework binding LLM capability tokens to execution contexts so untrusted inputs cannot hijack multi-agent tools.',
      links: [{ label: 'View Under Review', pageId: 'research', hash: '#ongoing-section' }]
    },
    {
      id: 'articles-blog',
      title: 'Medical Physics Articles, Blogs & Book',
      pageId: 'about',
      keywords: ['afomp', 'pulse', 'blog', 'article', 'articles', 'ncd', 'medium', 'quantum', 'children', 'book', 'medical physics', 'alphafold', 'med-gemini'],
      answer: 'Saib writes invited technical articles and educational work, including "AI-Powered Breakthroughs in Early Cancer & NCD Detection" in AFOMP Pulse (Sept 2026, pp. 32–35), "Beyond the Algorithm: Role of AI Researchers in Medical Physics" (SCMPCR, Feb 2026), Medium essays, and an educational book project called "AI for Children".',
      links: [
        { label: 'About & Blog Posts', pageId: 'about' },
        { label: 'AFOMP PDF ↗', href: 'https://afomp.org/wp-content/uploads/2026/09/AFOMP-Pulse-Booklet-Sept2026-Final.pdf#page=32' }
      ]
    },
    {
      id: 'projects-overview',
      title: '13 Open-Source AI Projects',
      pageId: 'projects',
      keywords: ['project', 'projects', 'github', 'repo', 'repositories', 'code', 'open source', 'portfolio', 'built'],
      answer: 'Saib has built 13 featured AI & software projects: MemoryOS, ScholarAgent, Agentic AI Technical Interviewer, MedAssist-LLM-iPhone, Eye-of-LLM, Synthetic Face Dataset Generation (StyleGAN2-ADA + SDXL), LangGraph MCP + MySQL, Bangla Sign Language Translator, Googler Search Agent, Prompt-Based Dynamic LLM Selector, DeepLearning with PyTorch, AI-Based Plagiarism Detection, and an AI Study Assistant Chatbot (GPT-2).',
      links: [{ label: 'Explore All 13 Projects', pageId: 'projects' }]
    },
    {
      id: 'project-medassist',
      title: 'MedAssist-LLM-iPhone (Offline Edge AI)',
      pageId: 'projects',
      keywords: ['medassist', 'iphone', 'offline', 'edge', 'mobile', 'gguf', 'qwen', 'qwen2.5', 'lora', 'unsloth', 'llama.cpp', 'usmle', 'quantize'],
      answer: 'MedAssist-LLM-iPhone fine-tunes Qwen2.5-0.5B-Instruct on clinical QA with LoRA + Unsloth and quantizes it to GGUF (Q4_K_M, 340 MB RAM footprint) via llama.cpp—running 100% offline on iPhone at 28.4 tokens/sec and 88.7% USMLE accuracy!',
      links: [{ label: 'Projects Page', pageId: 'projects' }]
    },
    {
      id: 'project-agents',
      title: 'Agentic AI Projects: MemoryOS, ScholarAgent & Interviewer',
      pageId: 'projects',
      keywords: ['memoryos', 'scholaragent', 'interviewer', 'langgraph', 'crewai', 'mcp', 'postgres', 'ollama', 'rag', 'self-rag', 'googler', 'dynamic llm', 'router'],
      answer: 'Saib’s agentic ecosystem includes MemoryOS (LangGraph PostgresStore persistent memory), ScholarAgent (4-agent CrewAI scholarship advisor), Agentic Technical Interviewer (96.2% scoring accuracy), LangGraph MCP Server + MySQL (420 req/s), Googler Search Agent, and a Prompt-Based Dynamic LLM Selector routing between Gemma 3 & DeepSeek-R1.',
      links: [{ label: 'See Agentic Projects', pageId: 'projects' }]
    },
    {
      id: 'project-vision',
      title: 'Computer Vision & Generative Projects',
      pageId: 'projects',
      keywords: ['eye-of-llm', 'eye of llm', 'yolo', 'yolo11', 'stylegan', 'stylegan2', 'sdxl', 'diffusion', 'face generation', 'pytorch', 'plagiarism', 'gpt-2'],
      answer: 'Saib’s vision and generative projects include Eye-of-LLM (60 FPS YOLO11 + Gemini 2.5 Flash narrator), Synthetic Face Dataset Generation (StyleGAN2-ADA + SDXL LoRA, 7.82 FID), Bangla Sign Language Translator (98.7% MediaPipe CNN), DeepLearning with PyTorch (99.24%), AI Plagiarism Detection (94.8%), and a FastAPI GPT-2 Study Chatbot.',
      links: [{ label: 'View Vision Projects', pageId: 'projects' }]
    },
    {
      id: 'startup-praxic',
      title: 'Praxic Intelligence (Startup)',
      pageId: 'startup',
      keywords: ['startup', 'praxic', 'intelligence', 'company', 'venture', 'founder', 'enterprise', 'firewall'],
      answer: 'Praxic Intelligence is Saib’s startup building production-grade, secure multi-agent enterprise frameworks. Its 3 core pillars are Prompt Firewalls (defense at context retrieval), Cryptographic Provenance (runtime authorization), and Autonomous Workflows—currently 65% through the Core Framework Design Phase.',
      links: [{ label: 'Startup Page', pageId: 'startup' }]
    },
    {
      id: 'volunteering-awards',
      title: 'Volunteering, Rural Healthcare & Honors',
      pageId: 'volunteering',
      keywords: ['volunteer', 'volunteering', 'alo', 'bhubon', 'trust', 'cancer screening', 'naogaon', 'nctf', 'children', 'kaggle', 'silver medal', 'mars rover', 'rover', 'umrt', 'award'],
      answer: 'Saib serves as Technical Expert Representative for Alo Bhubon Trust (deploying rural cervical/breast cancer screening camps in Naogaon), won 1st Runner-up (Silver Medal, Top 2%) & Best Abstract Award in Kaggle Spatial Biology, built navigation software on the UIU Mars Rover Team (UMRT), and led Satkhira NCTF child-rights advocacy (2014–2017).',
      links: [{ label: 'Volunteering Page', pageId: 'volunteering' }]
    },
    {
      id: 'skills-certs',
      title: 'Technical Stack & 13 Certifications',
      pageId: 'experience',
      keywords: ['skill', 'skills', 'tech', 'stack', 'python', 'pytorch', 'fastapi', 'docker', 'sql', 'cert', 'certificate', 'certifications', 'ibm', 'aws', 'anthropic', 'langchain', 'google', 'redhat', 'cisco', 'yale', 'hackerrank'],
      answer: 'Core stack: Python, C++, SQL, PyTorch, Vision Transformers, LangChain/LangGraph, CrewAI, RAG, FastAPI, PostgreSQL, AWS, and Docker. He holds 13 verified certifications including IBM AI Engineering, AWS AI Practitioner, LangChain Deep Agents & Python, Anthropic MCP Advanced, Google Data Analytics & BERT, Red Hat SysAdmin, Cisco Cybersecurity, HackerRank SQL, and Yale Financial Markets.',
      links: [{ label: 'View Skills & Certs', pageId: 'experience' }]
    },
    {
      id: 'contact-info',
      title: 'Contact & Direct Links',
      pageId: 'contact',
      keywords: ['contact', 'email', 'mail', 'hire', 'message', 'reach', 'phone', 'call', 'linkedin', 'github', 'scholar', 'kaggle', 'huggingface', 'youtube'],
      answer: 'You can email Saib directly at saibhossain5@gmail.com (or mhossain221450@bscse.uiu.ac.bd), call +880 1769-918015, or connect via LinkedIn, GitHub (Saibhossain), Google Scholar, and ORCID (0009-0004-2595-2742).',
      links: [
        { label: 'Contact Page', pageId: 'contact' },
        { label: 'Email Saib ↗', href: 'mailto:saibhossain5@gmail.com' }
      ]
    }
  ];

  // ===== 3. FUNNY TAP STUNTS & QUIPS =====
  const STUNTS = [
    {
      id: 'flip',
      cssClass: 'stunt-flip',
      mood: 'star',
      badge: '★ 360°',
      lines: [
        'Wheee! Zero-gravity backflip complete—zero syntax errors!',
        'Hold my gradients—doing a full hyperparameter backflip!'
      ]
    },
    {
      id: 'dance',
      cssClass: 'stunt-dance',
      mood: 'happy',
      badge: '♪ ♫',
      lines: [
        'Boogie mode activated! Dancing at 60 FPS with 0ms backend latency!',
        'Look at these capsule arms go—trained purely on good vibes!'
      ]
    },
    {
      id: 'tickle',
      cssClass: 'stunt-tickle',
      mood: 'tickle',
      badge: 'haha!',
      lines: [
        'Hehe! Careful, that pokes right into my attention heads!',
        'Stop, that tickles my floating-point registers!'
      ]
    },
    {
      id: 'spin',
      cssClass: 'stunt-spin',
      mood: 'cool',
      badge: '⟳ spin',
      lines: [
        'Helicopter mode! Scanning 360° for cool research ideas!',
        'Look Ma, pure 3D CSS transforms—no heavy WebGL needed!'
      ]
    },
    {
      id: 'boost',
      cssClass: 'stunt-boost',
      mood: 'star',
      badge: '↑ boost',
      lines: [
        'Anti-gravity thrusters engaged! Ready to tour any page you pick!',
        'Overclocked on chai and curiosity—zoom!'
      ]
    },
    {
      id: 'scan',
      cssClass: 'stunt-scan',
      mood: 'scan',
      badge: 'SCAN',
      lines: [
        'Scanning visitor... Verdict: 100% awesome human detected!',
        'Diagnostic scan complete: high curiosity, zero prompt injections found!'
      ]
    },
    {
      id: 'love',
      cssClass: 'stunt-love',
      mood: 'love',
      badge: '♥ hi!',
      lines: [
        'Hello human! Saib programmed me to be extra friendly—mostly so I do not hallucinate.',
        'Sending high-precision digital hugs! Tap Tour to explore the page with me!'
      ]
    }
  ];

  const DIZZY_STUNT = {
    id: 'dizzy',
    cssClass: 'stunt-dizzy',
    mood: 'dizzy',
    badge: '@_@',
    lines: [
      'Whoa—3 rapid taps! My gyroscopes are spinning like an unregularized loss curve!',
      'Easy there, human! Too many taps and my weights will quantize down to 1-bit!'
    ]
  };

  // ===== 4. ZERO-API SYNONYM & SCORE ENGINE =====
  const SYNONYMS = {
    work: ['experience', 'job', 'career', 'roles'],
    job: ['experience', 'work', 'roles'],
    cv: ['resume', 'experience', 'biography'],
    resume: ['cv', 'experience'],
    paper: ['research', 'publication', 'journal', 'conference'],
    papers: ['research', 'publications', 'journal', 'conference'],
    cancer: ['oncology', 'msurvpred', 'coast', 'afomp', 'screening'],
    medical: ['fracture', 'msurvpred', 'coast', 'medassist', 'scmpcr', 'oncology'],
    mobile: ['iphone', 'medassist', 'offline', 'edge'],
    security: ['provenance', 'prompt', 'injection', 'praxic', 'firewall', 'safety'],
    agent: ['agentic', 'langgraph', 'crewai', 'memoryos', 'scholaragent', 'praxic'],
    agents: ['agentic', 'langgraph', 'crewai', 'memoryos', 'scholaragent', 'praxic'],
    study: ['education', 'degree', 'uiu', 'chatbot'],
    hire: ['contact', 'email', 'experience', 'cv'],
    email: ['contact', 'mail'],
    robot: ['bot', 'assistant', 'self'],
    guide: ['tour', 'explain', 'page']
  };

  function detectCurrentPageId(pathname) {
    const p = (pathname || '/').toLowerCase();
    for (let i = 1; i < PAGES.length; i++) {
      if (p.includes('/pages/' + PAGES[i].id + '/') || p.endsWith('/pages/' + PAGES[i].id)) {
        return PAGES[i].id;
      }
    }
    return 'home';
  }

  const GENERIC_KW = new Set([
    'paper', 'papers', 'research', 'publication', 'publications', 'journal', 'conference',
    'project', 'projects', 'experience', 'work', 'job', 'career', 'roles', 'saib', 'hossain',
    'ai', 'ml', 'llm', 'system', 'systems', 'model', 'models'
  ]);

  function tokenize(str) {
    const raw = (str || '').toLowerCase().replace(/[^a-z0-9.+_-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
    const exact = new Set(raw);
    const syn = new Set();
    raw.forEach((tok) => {
      if (SYNONYMS[tok]) SYNONYMS[tok].forEach((s) => { if (!exact.has(s)) syn.add(s); });
      if (tok.endsWith('s') && tok.length > 3) {
        const stem = tok.slice(0, -1);
        if (!exact.has(stem)) syn.add(stem);
      }
    });
    return { exact: Array.from(exact), syn: Array.from(syn) };
  }

  function answerQuery(rawQuery, currentPageId) {
    const pageId = currentPageId || 'home';
    const pageMeta = PAGES.find((p) => p.id === pageId) || PAGES[0];
    const q = (rawQuery || '').trim();
    const qLower = q.toLowerCase();

    if (!q) {
      return {
        type: 'chat',
        mood: 'happy',
        text: 'Ask me anything about MD Saib Hossain, his research papers, 13 projects, experience, startup, or ask me to tour this page!',
        links: []
      };
    }

    // 1) Action / stunt commands
    if (/\b(flip|backflip)\b/.test(qLower)) {
      return { type: 'stunt', stuntId: 'flip', mood: 'star', text: 'Incoming zero-gravity backflip! Watch closely!', links: [] };
    }
    if (/\b(dance|boogie|party)\b/.test(qLower)) {
      return { type: 'stunt', stuntId: 'dance', mood: 'happy', text: 'Dance subroutines activated! Turning up the CSS keyframes!', links: [] };
    }
    if (/\b(spin|rotate)\b/.test(qLower)) {
      return { type: 'stunt', stuntId: 'spin', mood: 'cool', text: '360-degree CSS helicopter spin coming right up!', links: [] };
    }
    if (/\b(joke|funny|humor|laugh|trick)\b/.test(qLower)) {
      return {
        type: 'stunt',
        stuntId: 'tickle',
        mood: 'laugh',
        text: 'Saib says being an AI engineer is like being a kindergarten teacher for robots—spending hours telling us to play nice and stop making things up. Good thing I run strictly on his verified portfolio facts!',
        links: []
      };
    }

    // 2) Guided tour command
    if (/\b(tour|walkthrough|walk me|show me around|roam|guide me)\b/.test(qLower)) {
      return {
        type: 'tour',
        mood: 'star',
        text: `Sure! Let me fly around the ${pageMeta.label} page and explain each section aloud!`,
        links: []
      };
    }

    // 3) Current page explanation intent
    if (/\b(this page|current page|where am i|explain page|what is here|about this page)\b/.test(qLower)) {
      return {
        type: 'chat',
        mood: 'scan',
        text: `${pageMeta.tourSummary} ${pageMeta.followUp}`,
        links: []
      };
    }

    // 4) Navigate directly to another page
    const navMatch = qLower.match(/\b(go to|open|visit|show|navigate|take me)\b/);
    if (navMatch) {
      const targetPage = PAGES.find((p) => qLower.includes(p.id) || qLower.includes(p.label.toLowerCase()));
      if (targetPage && targetPage.id !== pageId) {
        return {
          type: 'navigate',
          targetPageId: targetPage.id,
          mood: 'star',
          text: `Right away! Click below to hop to the ${targetPage.label} page—I will meet you there!`,
          links: [{ label: `Go to ${targetPage.label} Page →`, pageId: targetPage.id }]
        };
      }
    }

    // 5) Self-introduction / who is Saib-Bot
    if (/\b(who are you|what are you|your name|how do you work|api|webllm|saib-bot|robot)\b/.test(qLower)) {
      return {
        type: 'chat',
        mood: 'cool',
        text: 'I am Saib-Bot, a 100% client-side 3D cartoon companion built with pure CSS, SVG, native Web Speech TTS, and an offline semantic retriever grounded on Saib’s portfolio data—no external LLM APIs, cloud servers, or tracking needed!',
        links: []
      };
    }

    // 6) Greeting / thanks
    if (/^(hi|hello|hey|salam|assalamu|yo|greetings)\b/.test(qLower)) {
      return {
        type: 'stunt',
        stuntId: 'love',
        mood: 'love',
        text: `Hello! I am Saib-Bot. You are currently on the ${pageMeta.label} page. Ask me anything about Saib’s AI research, projects, or experience—or tap me for a trick!`,
        links: []
      };
    }
    if (/\b(thank|thanks|awesome|cool|nice|great)\b/.test(qLower) && qLower.split(/\s+/).length <= 5) {
      return {
        type: 'stunt',
        stuntId: 'love',
        mood: 'love',
        text: 'You are very welcome! Let me know if you want a guided tour or want to explore another page.',
        links: []
      };
    }

    // 7) Weighted Retrieval across Verified Knowledge Base
    const { exact, syn } = tokenize(qLower);
    let best = null;
    let bestScore = 0;

    KNOWLEDGE.forEach((entry) => {
      let score = 0;
      const ansLower = entry.answer.toLowerCase();
      const titleLower = entry.title.toLowerCase();

      entry.keywords.forEach((kw) => {
        const isGeneric = GENERIC_KW.has(kw);
        const exactWeight = kw.includes(' ') ? 9 : (isGeneric ? 2 : 6.5);
        const synWeight = isGeneric ? 0.5 : 2;
        if (qLower.includes(kw)) {
          score += exactWeight;
        } else if (exact.includes(kw)) {
          score += exactWeight * 0.9;
        } else if (syn.includes(kw)) {
          score += synWeight;
        }
      });

      exact.forEach((tok) => {
        if (tok.length < 3 || GENERIC_KW.has(tok)) return;
        if (titleLower.includes(tok)) score += 2.5;
        if (ansLower.includes(tok)) score += 1.2;
      });

      if (entry.pageId === pageId && score > 0) score += 0.4;

      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    if (best && bestScore >= 3) {
      return {
        type: 'chat',
        mood: 'happy',
        text: best.answer,
        links: best.links || []
      };
    }

    // Check if query names a specific page label even without "go to"
    const namedPage = PAGES.find((p) => exact.includes(p.id) || qLower.includes(p.label.toLowerCase()));
    if (namedPage) {
      return {
        type: 'chat',
        mood: 'happy',
        text: `${namedPage.tourSummary} ${namedPage.followUp}`,
        links: namedPage.id === pageId ? [] : [{ label: `Explore ${namedPage.label} →`, pageId: namedPage.id }]
      };
    }

    return {
      type: 'chat',
      mood: 'scan',
      text: 'I am an offline portfolio guide, so I answer verified questions about MD Saib Hossain! Try asking about his IEEE ICCIT 2025 papers, MSurvPred/COAST oncology research, 13 AI projects (like MedAssist-LLM-iPhone), experience, Praxic Intelligence startup, volunteering, or contact info.',
      links: [
        { label: 'Research Papers', pageId: 'research' },
        { label: '13 AI Projects', pageId: 'projects' },
        { label: 'Contact Saib', pageId: 'contact' }
      ]
    };
  }

  // Export for Node tests & return early if non-browser environment
  globalScope.SaibRobotAssistant = { PAGES, KNOWLEDGE, STUNTS, answerQuery, detectCurrentPageId };
  if (!isBrowser) return;

  // ===== 5. BROWSER RUNTIME CONTROLLER =====
  if (globalScope.__saibBotInitialized) return;
  globalScope.__saibBotInitialized = true;

  const isSubpage = window.location.pathname.includes('/pages/') || Boolean(document.querySelector('link[href*="../../assets/"]'));
  const PREFIX = isSubpage ? '../../' : './';
  const CURRENT_PAGE_ID = detectCurrentPageId(window.location.pathname);
  const CURRENT_PAGE = PAGES.find((p) => p.id === CURRENT_PAGE_ID) || PAGES[0];
  const ROBOT_FACE_IMG = `${PREFIX}assets/images/robot%20face.avif`;

  const state = {
    ttsEnabled: true,
    motionPaused: false,
    minimized: false,
    dockSide: 'right',
    isSpeaking: false,
    stuntIndex: 0,
    tapTimes: [],
    stuntTimer: null,
    blinkTimer: null,
    tourActive: false,
    tourStops: [],
    tourStep: 0,
    highlightedEl: null,
    customPos: null // { left, top } when dragged manually
  };

  function resolveHref(link) {
    if (link.href) return link.href;
    if (link.asset) return PREFIX + link.asset;
    const p = PAGES.find((x) => x.id === link.pageId);
    if (!p) return PREFIX + 'index.html';
    return PREFIX + p.path + (link.hash || '');
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ===== 6. BUILD VOLUMETRIC 3D ROBOT MARKUP & ACCESSIBLE UI =====
  const root = document.createElement('aside');
  root.className = 'saib-bot-root';
  root.setAttribute('aria-label', 'Saib-Bot 3D Interactive Portfolio Assistant');

  root.innerHTML = `
    <div class="saib-bot-sr-only" aria-live="polite" id="saib-bot-live"></div>

    <button type="button" class="saib-bot-min-pill" id="saib-bot-restore-btn" aria-label="Show Saib-Bot 3D assistant">
      <img src="${ROBOT_FACE_IMG}" alt="" width="28" height="28">
      <span>Saib-Bot</span>
    </button>

    <section class="saib-bot-panel" id="saib-bot-panel" role="dialog" aria-labelledby="saib-bot-panel-title" hidden>
      <header class="saib-bot-panel-head">
        <div class="saib-bot-panel-id">
          <img src="${ROBOT_FACE_IMG}" alt="Saib-Bot smiling cyan face" class="saib-bot-panel-face" width="36" height="36">
          <div class="saib-bot-panel-title-wrap">
            <h2 class="saib-bot-panel-title" id="saib-bot-panel-title">Saib-Bot · 3D AI Guide</h2>
            <p class="saib-bot-panel-sub">Page: ${escapeHTML(CURRENT_PAGE.label)} · Offline Voice &amp; Q&amp;A</p>
          </div>
        </div>
        <div class="saib-bot-head-actions">
          <button type="button" class="saib-bot-icon-btn is-active" id="saib-bot-panel-tts" aria-label="Toggle voice speech" title="Voice TTS On/Off">🔊</button>
          <button type="button" class="saib-bot-icon-btn" id="saib-bot-dock-switch" aria-label="Switch robot side left or right" title="Move Left / Right">⇄</button>
          <button type="button" class="saib-bot-icon-btn" id="saib-bot-panel-close" aria-label="Close assistant chat">✕</button>
        </div>
      </header>

      <div class="saib-bot-quick-actions" aria-label="Quick robot actions">
        <button type="button" class="saib-bot-action-pill" data-quick-action="intro">👋 About Saib (Speak)</button>
        <button type="button" class="saib-bot-action-pill" data-quick-action="tour">🧭 Tour ${escapeHTML(CURRENT_PAGE.label)}</button>
        <button type="button" class="saib-bot-action-pill" data-quick-action="stunt">🎲 Funny Trick</button>
      </div>

      <nav class="saib-bot-page-strip" aria-label="Explore all 8 portfolio pages">
        ${PAGES.map((p) => `<a href="${escapeHTML(PREFIX + p.path)}" class="saib-bot-page-link ${p.id === CURRENT_PAGE_ID ? 'is-current' : ''}">${escapeHTML(p.label)}</a>`).join('')}
      </nav>

      <div class="saib-bot-messages" id="saib-bot-messages" role="log" aria-live="polite" aria-relevant="additions"></div>

      <div class="saib-bot-chips" id="saib-bot-chips" aria-label="Suggested questions">
        <button type="button" class="saib-bot-chip" data-ask="Who is MD Saib Hossain?">Who is Saib?</button>
        <button type="button" class="saib-bot-chip" data-ask="What is this page about?">Explain this page</button>
        <button type="button" class="saib-bot-chip" data-ask="Tell me about MSurvPred and COAST papers">Q1 Cancer Papers</button>
        <button type="button" class="saib-bot-chip" data-ask="Tell me about MedAssist-LLM-iPhone">Offline iPhone LLM</button>
        <button type="button" class="saib-bot-chip" data-ask="How can I contact Saib?">Contact &amp; CV</button>
      </div>

      <form class="saib-bot-form" id="saib-bot-form">
        <label for="saib-bot-input" class="saib-bot-sr-only">Ask Saib-Bot a question</label>
        <input type="text" id="saib-bot-input" class="saib-bot-input" placeholder="Ask about Saib, papers, projects..." autocomplete="off">
        <button type="submit" class="saib-bot-send-btn">Ask</button>
      </form>
    </section>

    <div class="saib-bot-bubble" id="saib-bot-bubble" hidden>
      <button type="button" class="saib-bot-bubble-close" id="saib-bot-bubble-close" aria-label="Dismiss speech bubble">&times;</button>
      <div id="saib-bot-bubble-text"></div>
      <div class="saib-bot-bubble-actions" id="saib-bot-bubble-actions"></div>
    </div>

    <div class="saib-bot-avatar-wrap">
      <button type="button" class="saib-bot-character-btn" id="saib-bot-character-btn" aria-label="Tap Saib-Bot for a funny trick or ask a question">
        <div class="saib-bot-stage">
          <div class="bot-shadow" aria-hidden="true"></div>
          <div class="saib-bot-rig" id="saib-bot-rig">
            <span class="bot-emote-badge" id="saib-bot-emote" aria-hidden="true">♪ ♫</span>

            <div class="saib-bot-head" aria-hidden="true">
              <div class="bot-top-cap"></div>
              <div class="bot-ear-left"></div>
              <div class="bot-ear-right"></div>
              <div class="bot-helmet">
                <div class="bot-helmet-gloss"></div>
                <div class="bot-visor">
                  <div class="bot-visor-scanline"></div>
                  <svg class="bot-face-svg" id="saib-bot-face" data-mood="happy" viewBox="0 0 64 36" aria-hidden="true">
                    <circle class="bot-blush" cx="10" cy="24" r="3.2" />
                    <circle class="bot-blush" cx="54" cy="24" r="3.2" />

                    <!-- HAPPY (exact match to robot face.avif) -->
                    <g class="face-state face-happy bot-led-glow">
                      <path d="M 10,18 A 7.5,7.5 0 0 1 25,18 Q 17.5,16.5 10,18 Z" fill="#3eeeff" />
                      <path d="M 39,18 A 7.5,7.5 0 0 1 54,18 Q 46.5,16.5 39,18 Z" fill="#3eeeff" />
                      <path d="M 27,23 H 37 A 5,5.2 0 0 1 27,23 Z" fill="#3eeeff" />
                    </g>

                    <!-- BLINK -->
                    <g class="face-state face-blink bot-led-glow">
                      <line x1="11" y1="17" x2="24" y2="17" stroke="#3eeeff" stroke-width="2.6" stroke-linecap="round" />
                      <line x1="40" y1="17" x2="53" y2="17" stroke="#3eeeff" stroke-width="2.6" stroke-linecap="round" />
                      <path d="M 27,23 H 37 A 5,5.2 0 0 1 27,23 Z" fill="#3eeeff" />
                    </g>

                    <!-- TALKING -->
                    <g class="face-state face-talking bot-led-glow">
                      <path d="M 10,18 A 7.5,7.5 0 0 1 25,18 Q 17.5,16.5 10,18 Z" fill="#3eeeff" />
                      <path d="M 39,18 A 7.5,7.5 0 0 1 54,18 Q 46.5,16.5 39,18 Z" fill="#3eeeff" />
                      <ellipse cx="32" cy="25" rx="5.5" ry="4.5" fill="#3eeeff" />
                    </g>

                    <!-- LAUGH / TICKLE -->
                    <g class="face-state face-laugh bot-led-glow">
                      <path d="M 10,19 L 17.5,13 L 24,18" fill="none" stroke="#3eeeff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M 54,19 L 46.5,13 L 40,18" fill="none" stroke="#3eeeff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M 25,22 H 39 A 7,7 0 0 1 25,22 Z" fill="#3eeeff" />
                    </g>

                    <!-- LOVE -->
                    <g class="face-state face-love bot-led-glow">
                      <path d="M17.5 21 C14 18 11 15 11 12.5 A3.3 3.3 0 0 1 17.5 11 A3.3 3.3 0 0 1 24 12.5 C24 15 21 18 17.5 21 Z" fill="#ff7eb6" />
                      <path d="M46.5 21 C43 18 40 15 40 12.5 A3.3 3.3 0 0 1 46.5 11 A3.3 3.3 0 0 1 53 12.5 C53 15 50 18 46.5 21 Z" fill="#ff7eb6" />
                      <path d="M 27,23 H 37 A 5,5 0 0 1 27,23 Z" fill="#3eeeff" />
                    </g>

                    <!-- STAR -->
                    <g class="face-state face-star bot-led-glow">
                      <polygon points="17.5,9 19.6,14 25,14.4 20.8,17.8 22.2,23 17.5,20 12.8,23 14.2,17.8 10,14.4 15.4,14" fill="#3eeeff" />
                      <polygon points="46.5,9 48.6,14 54,14.4 49.8,17.8 51.2,23 46.5,20 41.8,23 43.2,17.8 39,14.4 44.4,14" fill="#3eeeff" />
                      <path d="M 27,24 Q 32,29 37,24" fill="none" stroke="#3eeeff" stroke-width="2.5" stroke-linecap="round" />
                    </g>

                    <!-- SCAN -->
                    <g class="face-state face-scan bot-led-glow">
                      <circle cx="17.5" cy="15.5" r="4.5" fill="none" stroke="#3eeeff" stroke-width="2.4" />
                      <circle cx="17.5" cy="15.5" r="1.5" fill="#3eeeff" />
                      <circle cx="46.5" cy="15.5" r="4.5" fill="none" stroke="#3eeeff" stroke-width="2.4" />
                      <circle cx="46.5" cy="15.5" r="1.5" fill="#3eeeff" />
                      <line x1="27" y1="25" x2="37" y2="25" stroke="#3eeeff" stroke-width="2.4" stroke-linecap="round" />
                    </g>

                    <!-- COOL -->
                    <g class="face-state face-cool bot-led-glow">
                      <rect x="9" y="11" width="17" height="8" rx="3" fill="#3eeeff" />
                      <rect x="38" y="11" width="17" height="8" rx="3" fill="#3eeeff" />
                      <line x1="26" y1="14" x2="38" y2="14" stroke="#3eeeff" stroke-width="2.2" />
                      <path d="M 27,24 Q 33,27 38,22" fill="none" stroke="#3eeeff" stroke-width="2.4" stroke-linecap="round" />
                    </g>

                    <!-- DIZZY -->
                    <g class="face-state face-dizzy bot-led-glow">
                      <path d="M13,11 L22,20 M22,11 L13,20" stroke="#3eeeff" stroke-width="2.6" stroke-linecap="round" />
                      <path d="M42,11 L51,20 M51,11 L42,20" stroke="#3eeeff" stroke-width="2.6" stroke-linecap="round" />
                      <path d="M 26,25 Q 29,22 32,25 T 38,25" fill="none" stroke="#3eeeff" stroke-width="2.2" stroke-linecap="round" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bot-neck" aria-hidden="true"></div>
            <div class="bot-arm-left" aria-hidden="true"></div>
            <div class="bot-arm-right" aria-hidden="true"></div>

            <div class="bot-torso" aria-hidden="true">
              <div class="bot-torso-gloss"></div>
              <svg class="bot-torso-seam" viewBox="0 0 48 41" fill="none">
                <path d="M 3,22 L 14,24 L 15.5,27.5 L 32.5,27.5 L 34,24 L 45,22" stroke="#9aa8ba" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="bot-thruster" aria-hidden="true"></div>
          </div>
        </div>
      </button>

      <div class="saib-bot-dock-bar" role="toolbar" aria-label="Saib-Bot controls">
        <button type="button" class="saib-bot-dock-btn" id="saib-bot-toggle-panel" aria-expanded="false" aria-controls="saib-bot-panel" aria-label="Open Saib-Bot Q&amp;A chat" title="Ask Saib-Bot">💬</button>
        <button type="button" class="saib-bot-dock-btn is-active" id="saib-bot-toggle-tts" aria-label="Mute or unmute voice speech" title="Voice TTS">🔊</button>
        <button type="button" class="saib-bot-dock-btn" id="saib-bot-toggle-tour" aria-label="Start or stop guided page tour" title="Tour this page">🧭</button>
        <button type="button" class="saib-bot-dock-btn" id="saib-bot-toggle-motion" aria-label="Pause robot animation" title="Pause / Play animation">⏸</button>
        <button type="button" class="saib-bot-drag-handle" id="saib-bot-drag-handle" aria-label="Move Saib-Bot. Drag or use arrow keys to move." title="Drag or press Arrow keys">⠿</button>
        <button type="button" class="saib-bot-dock-btn" id="saib-bot-minimize-btn" aria-label="Minimize Saib-Bot" title="Minimize">−</button>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  // ===== 7. DOM REFS =====
  const els = {
    live: document.getElementById('saib-bot-live'),
    restoreBtn: document.getElementById('saib-bot-restore-btn'),
    panel: document.getElementById('saib-bot-panel'),
    panelTts: document.getElementById('saib-bot-panel-tts'),
    dockSwitch: document.getElementById('saib-bot-dock-switch'),
    panelClose: document.getElementById('saib-bot-panel-close'),
    messages: document.getElementById('saib-bot-messages'),
    chips: document.getElementById('saib-bot-chips'),
    form: document.getElementById('saib-bot-form'),
    input: document.getElementById('saib-bot-input'),
    bubble: document.getElementById('saib-bot-bubble'),
    bubbleText: document.getElementById('saib-bot-bubble-text'),
    bubbleActions: document.getElementById('saib-bot-bubble-actions'),
    bubbleClose: document.getElementById('saib-bot-bubble-close'),
    charBtn: document.getElementById('saib-bot-character-btn'),
    rig: document.getElementById('saib-bot-rig'),
    face: document.getElementById('saib-bot-face'),
    emote: document.getElementById('saib-bot-emote'),
    togglePanelBtn: document.getElementById('saib-bot-toggle-panel'),
    toggleTtsBtn: document.getElementById('saib-bot-toggle-tts'),
    toggleTourBtn: document.getElementById('saib-bot-toggle-tour'),
    toggleMotionBtn: document.getElementById('saib-bot-toggle-motion'),
    dragHandle: document.getElementById('saib-bot-drag-handle'),
    minimizeBtn: document.getElementById('saib-bot-minimize-btn')
  };

  let liveClearTimer = null;
  function announce(msg) {
    if (!els.live) return;
    els.live.textContent = msg;
    clearTimeout(liveClearTimer);
    liveClearTimer = setTimeout(() => {
      if (els.live.textContent === msg) els.live.textContent = '';
    }, 1200);
  }

  function setMood(mood) {
    if (els.face) els.face.setAttribute('data-mood', mood || 'happy');
  }

  // ===== 8. NATIVE SPEECH SYNTHESIS (TTS) + LIP-SYNC + CHIRP =====
  let preferredVoice = null;
  let lipTimer = null;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    preferredVoice =
      voices.find((v) => /en/i.test(v.lang) && /(natural|google|samantha|daniel|aria)/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang)) ||
      voices[0];
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  function sanitizeForSpeech(text) {
    return String(text || '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[★♪♫♥@_/\\#]/g, ' ')
      .replace(/—/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stopSpeech() {
    clearInterval(lipTimer);
    lipTimer = null;
    state.isSpeaking = false;
    root.classList.remove('is-speaking');
    if (els.face && els.face.getAttribute('data-mood') === 'talking') {
      setMood('happy');
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  function speakText(text) {
    if (!state.ttsEnabled || !('speechSynthesis' in window)) return;
    const clean = sanitizeForSpeech(text);
    if (!clean) return;

    stopSpeech();
    if (!preferredVoice) loadVoices();

    const utter = new SpeechSynthesisUtterance(clean);
    if (preferredVoice) utter.voice = preferredVoice;
    utter.rate = 1.03;
    utter.pitch = 1.08;

    let open = true;
    const startTalk = () => {
      state.isSpeaking = true;
      root.classList.add('is-speaking');
      clearInterval(lipTimer);
      lipTimer = setInterval(() => {
        if (!state.isSpeaking) return;
        open = !open;
        setMood(open ? 'talking' : 'happy');
      }, 170);
    };

    const endTalk = () => {
      clearInterval(lipTimer);
      lipTimer = null;
      state.isSpeaking = false;
      root.classList.remove('is-speaking');
      setMood('happy');
    };

    utter.onstart = startTalk;
    utter.onboundary = () => {
      if (state.isSpeaking) setMood(open ? 'talking' : 'happy');
    };
    utter.onend = endTalk;
    utter.onerror = endTalk;

    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      endTalk();
    }
  }

  function playChirp() {
    if (!state.ttsEnabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(860, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, 160);
    } catch (e) {}
  }

  function syncTtsButtons() {
    const icon = state.ttsEnabled ? '🔊' : '🔇';
    [els.toggleTtsBtn, els.panelTts].forEach((btn) => {
      if (!btn) return;
      btn.textContent = icon;
      btn.classList.toggle('is-active', state.ttsEnabled);
      btn.setAttribute('aria-pressed', state.ttsEnabled ? 'true' : 'false');
    });
  }

  function toggleTts() {
    state.ttsEnabled = !state.ttsEnabled;
    if (!state.ttsEnabled) stopSpeech();
    syncTtsButtons();
    persistPrefs();
    announce(state.ttsEnabled ? 'Voice speech enabled' : 'Voice speech muted');
  }

  // ===== 9. SPEECH BUBBLE & CHAT MESSAGES =====
  function showBubble(text, actionButtons) {
    if (!els.bubble || !els.bubbleText || !els.bubbleActions) return;
    els.bubbleText.textContent = text;
    els.bubbleActions.innerHTML = '';

    (actionButtons || []).forEach((act) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'saib-bot-bubble-btn' + (act.secondary ? ' is-secondary' : '');
      b.textContent = act.label;
      b.addEventListener('click', act.onClick);
      els.bubbleActions.appendChild(b);
    });

    els.bubble.hidden = false;
  }

  function hideBubble() {
    if (els.bubble) els.bubble.hidden = true;
  }

  function appendChatMessage(role, text, links) {
    if (!els.messages) return;
    const msg = document.createElement('div');
    msg.className = `saib-bot-msg ${role === 'user' ? 'is-user' : 'is-bot'}`;
    msg.textContent = text;

    if (links && links.length) {
      const linksWrap = document.createElement('div');
      linksWrap.className = 'saib-bot-msg-links';
      links.forEach((lnk) => {
        const a = document.createElement('a');
        a.className = 'saib-bot-msg-link';
        a.href = resolveHref(lnk);
        a.textContent = lnk.label;
        if (lnk.href && lnk.href.startsWith('http')) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        linksWrap.appendChild(a);
      });
      msg.appendChild(linksWrap);
    }

    els.messages.appendChild(msg);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  // ===== 10. PANEL OPEN/CLOSE & PERSISTENT PREFS =====
  function persistPrefs() {
    try {
      sessionStorage.setItem('saibBotPrefs', JSON.stringify({
        ttsEnabled: state.ttsEnabled,
        motionPaused: state.motionPaused,
        minimized: state.minimized,
        dockSide: state.dockSide
      }));
    } catch (e) {}
  }

  function openPanel(focusInput) {
    if (!els.panel) return;
    els.panel.hidden = false;
    if (els.togglePanelBtn) els.togglePanelBtn.setAttribute('aria-expanded', 'true');
    hideBubble();
    if (focusInput && els.input) els.input.focus();
  }

  function closePanel() {
    if (!els.panel) return;
    els.panel.hidden = true;
    if (els.togglePanelBtn) els.togglePanelBtn.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    if (els.panel.hidden) openPanel(true);
    else closePanel();
  }

  function setDockSide(side) {
    state.dockSide = side === 'left' ? 'left' : 'right';
    state.customPos = null;
    root.style.left = '';
    root.style.top = '';
    root.style.right = '';
    root.style.bottom = '';
    root.classList.toggle('is-docked-left', state.dockSide === 'left');
    persistPrefs();
    announce(`Saib-Bot docked ${state.dockSide}`);
  }

  function toggleMotionPause() {
    state.motionPaused = !state.motionPaused;
    root.classList.toggle('is-motion-paused', state.motionPaused);
    if (els.toggleMotionBtn) {
      els.toggleMotionBtn.textContent = state.motionPaused ? '▶' : '⏸';
      els.toggleMotionBtn.setAttribute('aria-label', state.motionPaused ? 'Play robot animation' : 'Pause robot animation');
    }
    persistPrefs();
    announce(state.motionPaused ? 'Robot animation paused' : 'Robot animation playing');
  }

  // ===== 11. 8 FUNNY TAP STUNTS & 3D EYE/CURSOR LOOK-AT =====
  function runStunt(stuntObj, speakLine) {
    if (!els.rig) return;
    clearTimeout(state.stuntTimer);
    STUNTS.concat([DIZZY_STUNT]).forEach((s) => els.rig.classList.remove(s.cssClass));
    void els.rig.offsetWidth; // restart CSS keyframes cleanly

    const reducedMotion = state.motionPaused || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!reducedMotion) {
      els.rig.classList.add(stuntObj.cssClass);
    }

    setMood(stuntObj.mood);
    if (els.emote && stuntObj.badge) {
      els.emote.textContent = stuntObj.badge;
      els.emote.classList.add('show');
    }

    const line = stuntObj.lines[Math.floor(Math.random() * stuntObj.lines.length)];
    showBubble(line, [
      { label: '🧭 Tour Page', onClick: () => startPageTour() },
      { label: '💬 Ask Question', secondary: true, onClick: () => openPanel(true) }
    ]);

    playChirp();
    if (speakLine) speakText(line);

    const animCount = typeof els.rig.getAnimations === 'function' ? els.rig.getAnimations().length : 0;
    const duration = (!reducedMotion && animCount > 0) ? 1300 : 900;
    state.stuntTimer = setTimeout(() => {
      STUNTS.concat([DIZZY_STUNT]).forEach((s) => els.rig.classList.remove(s.cssClass));
      if (els.emote) els.emote.classList.remove('show');
      if (!state.isSpeaking) setMood('happy');
    }, duration);
  }

  function handleRobotTap() {
    if (state.tourActive) {
      advanceTourStep();
      return;
    }

    const now = Date.now();
    state.tapTimes = state.tapTimes.filter((t) => now - t < 1600);
    state.tapTimes.push(now);

    if (state.tapTimes.length >= 3) {
      state.tapTimes = [];
      runStunt(DIZZY_STUNT, true);
      return;
    }

    const stunt = STUNTS[state.stuntIndex % STUNTS.length];
    state.stuntIndex++;
    runStunt(stunt, true);
  }

  // Periodic natural LED blink + 3D cursor head look-at
  function startIdleLookAndBlink() {
    state.blinkTimer = setInterval(() => {
      if (state.isSpeaking || state.tourActive) return;
      const cur = els.face && els.face.getAttribute('data-mood');
      if (cur === 'happy') {
        setMood('blink');
        setTimeout(() => {
          if (els.face && els.face.getAttribute('data-mood') === 'blink' && !state.isSpeaking) {
            setMood('happy');
          }
        }, 160);
      }
    }, 4200);

    window.addEventListener('pointermove', (e) => {
      if (state.motionPaused || state.minimized || state.tourActive) return;
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.4;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 280));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 280));
      root.style.setProperty('--look-ry', `${(dx * 16).toFixed(1)}deg`);
      root.style.setProperty('--look-rx', `${(-dy * 12).toFixed(1)}deg`);
      root.style.setProperty('--head-shift-x', `${(dx * 3).toFixed(1)}px`);
    }, { passive: true });
  }

  // ===== 12. PHYSICAL SECTION-ROAMING GUIDED TOUR & CROSS-PAGE CONTINUATION =====
  function buildTourStops() {
    const stops = [];
    const seen = new Set();
    const candidates = Array.from(document.querySelectorAll('main section, main .startup-card, header.res-hero, header.exp-hero, header.about-hero'));

    candidates.forEach((el) => {
      if (el.hidden || el.closest('.saib-bot-root')) return;
      const r = el.getBoundingClientRect();
      if (r.height < 60 && el.offsetHeight < 60) return;

      const heading = el.querySelector('h1, h2, h3');
      const title = heading ? heading.textContent.trim().replace(/\s+/g, ' ') : '';
      const para = el.querySelector('p:not(.sr-only)');
      const snippet = para ? para.textContent.trim().replace(/\s+/g, ' ').slice(0, 155) : '';
      const key = el.id || title || String(stops.length);
      if (seen.has(key) || (!title && !snippet)) return;
      seen.add(key);

      let text = '';
      if (stops.length === 0) {
        text = CURRENT_PAGE.tourSummary;
      } else if (title && snippet) {
        text = `${title}: ${snippet}${snippet.length >= 154 ? '...' : ''}`;
      } else {
        text = title || snippet;
      }

      stops.push({ el, title: title || CURRENT_PAGE.label, text });
    });

    if (stops.length === 0) {
      stops.push({ el: document.querySelector('main') || document.body, title: CURRENT_PAGE.label, text: CURRENT_PAGE.tourSummary });
    }
    return stops.slice(0, 6);
  }

  function clearTourHighlight() {
    if (state.highlightedEl) {
      state.highlightedEl.classList.remove('saib-bot-tour-highlight');
      state.highlightedEl = null;
    }
    root.classList.remove('is-pointing-left', 'is-pointing-right');
  }

  function stopTour(silent) {
    state.tourActive = false;
    clearTourHighlight();
    root.classList.remove('is-flying');
    root.style.setProperty('--bot-fly-x', '0px');
    root.style.setProperty('--bot-fly-y', '0px');
    if (els.toggleTourBtn) els.toggleTourBtn.classList.remove('is-active');
    stopSpeech();
    if (!silent) {
      hideBubble();
      announce('Guided tour stopped');
    }
  }

  function flyToSection(el) {
    if (!el || !root) return;
    // Measure base resting rect first by resetting fly vars temporarily
    root.classList.remove('is-flying');
    root.style.setProperty('--bot-fly-x', '0px');
    root.style.setProperty('--bot-fly-y', '0px');
    const baseRect = root.getBoundingClientRect();
    const secRect = el.getBoundingClientRect();

    // Target subtle glide toward middle-right/left edge beside the section without covering content
    let desiredLeft = baseRect.left;
    let desiredTop = Math.max(84, Math.min(window.innerHeight - baseRect.height - 20, secRect.top + 18));

    if (window.innerWidth > 768) {
      if (secRect.left > 160) {
        desiredLeft = Math.max(16, secRect.left - baseRect.width - 14);
        root.classList.add('is-pointing-right');
        root.classList.remove('is-pointing-left');
      } else {
        desiredLeft = window.innerWidth - baseRect.width - 20;
        root.classList.add('is-pointing-left');
        root.classList.remove('is-pointing-right');
      }
    }

    const dx = Math.round(desiredLeft - baseRect.left);
    const dy = Math.round(desiredTop - baseRect.top);
    void root.offsetWidth;
    root.classList.add('is-flying');
    root.style.setProperty('--bot-fly-x', `${dx}px`);
    root.style.setProperty('--bot-fly-y', `${dy}px`);
  }

  function renderCurrentTourStep() {
    const stop = state.tourStops[state.tourStep];
    if (!stop) {
      stopTour();
      return;
    }

    clearTourHighlight();
    stop.el.classList.add('saib-bot-tour-highlight');
    state.highlightedEl = stop.el;
    setMood('scan');

    try {
      stop.el.scrollIntoView({ behavior: state.motionPaused ? 'auto' : 'smooth', block: 'center' });
    } catch (e) {}

    setTimeout(() => {
      if (!state.tourActive) return;
      flyToSection(stop.el);
    }, 320);

    const isLast = state.tourStep >= state.tourStops.length - 1;
    const curIdx = PAGES.findIndex((p) => p.id === CURRENT_PAGE_ID);
    const nextPage = PAGES[(curIdx + 1) % PAGES.length];

    const buttons = [];
    if (!isLast) {
      buttons.push({
        label: `Next (${state.tourStep + 2}/${state.tourStops.length}) →`,
        onClick: advanceTourStep
      });
    } else {
      buttons.push({
        label: `Fly to ${nextPage.label} Page →`,
        onClick: () => {
          try { sessionStorage.setItem('saibBotTourContinue', nextPage.id); } catch (e) {}
          window.location.href = PREFIX + nextPage.path;
        }
      });
    }
    buttons.push({ label: 'Stop Tour', secondary: true, onClick: () => stopTour(false) });

    showBubble(stop.text, buttons);
    speakText(stop.text);
    announce(`Tour step ${state.tourStep + 1} of ${state.tourStops.length}: ${stop.title}`);
  }

  function startPageTour() {
    closePanel();
    state.tourStops = buildTourStops();
    state.tourStep = 0;
    state.tourActive = true;
    if (els.toggleTourBtn) els.toggleTourBtn.classList.add('is-active');
    renderCurrentTourStep();
  }

  function advanceTourStep() {
    if (!state.tourActive) return;
    if (state.tourStep < state.tourStops.length - 1) {
      state.tourStep++;
      renderCurrentTourStep();
    } else {
      stopTour(false);
    }
  }

  // ===== 13. ACCESSIBLE DRAG HANDLE + KEYBOARD NUDGE =====
  function setupDragging() {
    if (!els.dragHandle) return;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let moved = false;

    function moveTo(left, top) {
      const maxLeft = Math.max(0, window.innerWidth - root.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - root.offsetHeight);
      const clampedLeft = Math.max(0, Math.min(left, maxLeft));
      const clampedTop = Math.max(0, Math.min(top, maxTop));
      root.style.left = `${clampedLeft}px`;
      root.style.top = `${clampedTop}px`;
      root.style.right = 'auto';
      root.style.bottom = 'auto';
      state.customPos = { left: clampedLeft, top: clampedTop };
    }

    els.dragHandle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (state.tourActive) stopTour(true);
      const rect = root.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      moved = false;
      els.dragHandle.setPointerCapture(event.pointerId);
    });

    els.dragHandle.addEventListener('pointermove', (event) => {
      if (!els.dragHandle.hasPointerCapture(event.pointerId)) return;
      if (!moved && Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
      moved = true;
      root.classList.add('is-dragging');
      els.dragHandle.classList.add('dragging');
      moveTo(event.clientX - offsetX, event.clientY - offsetY);
    });

    els.dragHandle.addEventListener('lostpointercapture', () => {
      root.classList.remove('is-dragging');
      els.dragHandle.classList.remove('dragging');
      if (moved) announce('Saib-Bot moved');
    });

    els.dragHandle.addEventListener('keydown', (event) => {
      const step = 15;
      const rect = root.getBoundingClientRect();
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveTo(rect.left - step, rect.top); announce('Saib-Bot moved left'); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); moveTo(rect.left + step, rect.top); announce('Saib-Bot moved right'); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); moveTo(rect.left, rect.top - step); announce('Saib-Bot moved up'); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); moveTo(rect.left, rect.top + step); announce('Saib-Bot moved down'); }
    });

    window.addEventListener('resize', () => {
      if (state.customPos) moveTo(state.customPos.left, state.customPos.top);
    }, { passive: true });
  }

  // ===== 14. QUERY HANDLING & EVENTS =====
  function submitQuestion(text) {
    const clean = (text || '').trim();
    if (!clean) return;

    appendChatMessage('user', clean);
    const res = answerQuery(clean, CURRENT_PAGE_ID);

    if (res.type === 'stunt') {
      const st = STUNTS.find((s) => s.id === res.stuntId) || STUNTS[0];
      appendChatMessage('bot', res.text, res.links);
      runStunt(st, false);
      speakText(res.text);
      return;
    }

    if (res.type === 'tour') {
      appendChatMessage('bot', res.text, res.links);
      startPageTour();
      return;
    }

    setMood(res.mood || 'happy');
    appendChatMessage('bot', res.text, res.links);
    speakText(res.text);
  }

  els.charBtn.addEventListener('click', handleRobotTap);
  els.togglePanelBtn.addEventListener('click', togglePanel);
  els.panelClose.addEventListener('click', closePanel);
  els.toggleTtsBtn.addEventListener('click', toggleTts);
  els.panelTts.addEventListener('click', toggleTts);
  els.toggleTourBtn.addEventListener('click', () => (state.tourActive ? stopTour(false) : startPageTour()));
  els.toggleMotionBtn.addEventListener('click', toggleMotionPause);
  els.dockSwitch.addEventListener('click', () => setDockSide(state.dockSide === 'right' ? 'left' : 'right'));
  els.bubbleClose.addEventListener('click', hideBubble);

  els.minimizeBtn.addEventListener('click', () => {
    stopTour(true);
    closePanel();
    hideBubble();
    state.minimized = true;
    root.classList.add('is-minimized');
    persistPrefs();
    announce('Saib-Bot minimized');
  });

  els.restoreBtn.addEventListener('click', () => {
    state.minimized = false;
    root.classList.remove('is-minimized');
    persistPrefs();
    announce('Saib-Bot restored');
  });

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = els.input.value;
    els.input.value = '';
    submitQuestion(val);
  });

  els.chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.saib-bot-chip');
    if (chip && chip.dataset.ask) submitQuestion(chip.dataset.ask);
  });

  els.panel.addEventListener('click', (e) => {
    const quick = e.target.closest('[data-quick-action]');
    if (!quick) return;
    const act = quick.dataset.quickAction;
    if (act === 'intro') {
      submitQuestion('Who is MD Saib Hossain?');
    } else if (act === 'tour') {
      startPageTour();
    } else if (act === 'stunt') {
      const st = STUNTS[state.stuntIndex % STUNTS.length];
      state.stuntIndex++;
      runStunt(st, true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (els.panel && !els.panel.hidden) closePanel();
      if (state.tourActive) stopTour(false);
    }
  });

  window.addEventListener('pagehide', stopSpeech);
  window.addEventListener('beforeunload', stopSpeech);

  // ===== 15. INITIALIZE STATE (NO AUTO-OPEN MODAL NOISE ON LOAD) =====
  setupDragging();
  startIdleLookAndBlink();

  // Seed initial greeting inside chat drawer (panel stays closed until user opens it)
  appendChatMessage('bot', `Hi! I am Saib-Bot. ${CURRENT_PAGE.tourSummary} ${CURRENT_PAGE.followUp}`);

  try {
    const saved = JSON.parse(sessionStorage.getItem('saibBotPrefs') || 'null');
    if (saved) {
      if (typeof saved.ttsEnabled === 'boolean') state.ttsEnabled = saved.ttsEnabled;
      if (saved.motionPaused) toggleMotionPause();
      if (saved.dockSide === 'left') setDockSide('left');
      if (saved.minimized) {
        state.minimized = true;
        root.classList.add('is-minimized');
      }
      syncTtsButtons();
    }

    const contPage = sessionStorage.getItem('saibBotTourContinue');
    if (contPage === CURRENT_PAGE_ID) {
      sessionStorage.removeItem('saibBotTourContinue');
      setTimeout(startPageTour, 600);
    }
  } catch (e) {}
})(typeof globalThis !== 'undefined' ? globalThis : window);
