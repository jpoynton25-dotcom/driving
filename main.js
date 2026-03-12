const PFUK_CONFIG = window.PFUK_CONFIG || {};

const trackEvent = (name, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
};

const initAnalytics = () => {
  const ga4Id = String(PFUK_CONFIG.ga4Id || '').trim();
  if (!ga4Id || !/^G-[A-Z0-9]+$/i.test(ga4Id) || window.gtag) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ga4Id);
};

const initContactValues = () => {
  const email = String(PFUK_CONFIG.contactEmail || '').trim();
  const phone = String(PFUK_CONFIG.contactPhone || '').trim();
  const phoneDisplay = String(PFUK_CONFIG.contactPhoneDisplay || phone).trim();

  if (email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((anchor) => {
      anchor.setAttribute('href', `mailto:${email}`);
      if (!anchor.dataset.keepText) anchor.textContent = email;
    });
  }

  if (phone) {
    document.querySelectorAll('a[href^="tel:"]').forEach((anchor) => {
      anchor.setAttribute('href', `tel:${phone}`);
      const isCallNow = /call now/i.test(anchor.textContent || '');
      if (!isCallNow && !anchor.dataset.keepText) anchor.textContent = phoneDisplay;
    });
  }
};

const initHeader = () => {
  const siteHeader = document.querySelector('.site-header');
  if (!siteHeader) return;

  const navToggle = siteHeader.querySelector('.nav-toggle');
  const navPanel = siteHeader.querySelector('#primary-menu');

  const closeMenu = () => {
    siteHeader.classList.remove('menu-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation menu');
  };

  const syncHeaderState = () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  };

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });

  if (!navToggle || !navPanel) return;

  navToggle.addEventListener('click', () => {
    const isOpen = siteHeader.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  navPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!siteHeader.contains(event.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1120) closeMenu();
  });
};

const initReveal = () => {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (revealElements.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => observer.observe(el));
};

const initAccordion = () => {
  document.querySelectorAll('[data-accordion]').forEach((accordion) => {
    const items = [...accordion.querySelectorAll('details')];

    const syncFaqState = () => {
      items.forEach((entry) => {
        if (entry.open) {
          entry.classList.add('active');
        } else {
          entry.classList.remove('active');
        }
      });
    };

    syncFaqState();
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
        syncFaqState();
      });
      item.addEventListener('click', () => {
        window.setTimeout(syncFaqState, 0);
      });
    });
  });
};

const initYear = () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
};

const initCheckoutPrefill = () => {
  const packSelect = document.querySelector('select[name="pack"]');
  if (!packSelect) return;
  const params = new URLSearchParams(window.location.search);
  const pack = params.get('pack');
  if (!pack) return;
  const match = [...packSelect.options].find((opt) => opt.value === pack);
  if (match) packSelect.value = pack;
};

const initCheckoutLinks = () => {
  const checkoutLinks = PFUK_CONFIG.checkoutLinks || {};
  const starter = String(checkoutLinks.starter || '').trim();
  const pro = String(checkoutLinks.pro || '').trim();

  if (starter) {
    document.querySelectorAll('[data-checkout="starter"]').forEach((el) => {
      el.setAttribute('href', starter);
    });
  }
  if (pro) {
    document.querySelectorAll('[data-checkout="pro"]').forEach((el) => {
      el.setAttribute('href', pro);
    });
  }
};

const initForms = () => {
  const configuredSiteUrl = String(PFUK_CONFIG.siteUrl || 'https://passfasteruk.co.uk').replace(/\/$/, '');
  const hostname = window.location.hostname;
  const isLocalRuntime =
    window.location.protocol === 'file:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1';
  const runtimeOrigin =
    window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : configuredSiteUrl;
  const siteUrl = isLocalRuntime ? runtimeOrigin : configuredSiteUrl;
  const publicSiteUrl = configuredSiteUrl || siteUrl;
  const formEndpoint = String(PFUK_CONFIG.formEndpoint || '').trim();

  document.querySelectorAll('form').forEach((form) => {
    if (formEndpoint && !form.hasAttribute('data-fixed-action')) {
      form.setAttribute('action', formEndpoint);
    }

    const action = form.getAttribute('action') || '';
    const isFormSubmit = action.includes('formsubmit.co');

    // Improve mobile keyboard and autofill behavior without changing markup.
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      const name = String(field.getAttribute('name') || '').toLowerCase();
      if (name.includes('name')) field.setAttribute('autocomplete', 'name');
      if (name === 'email') field.setAttribute('autocomplete', 'email');
      if (name.includes('phone')) {
        field.setAttribute('autocomplete', 'tel');
        field.setAttribute('inputmode', 'tel');
      }
      if (name.includes('postcode')) {
        field.setAttribute('autocomplete', 'postal-code');
        field.setAttribute('inputmode', 'text');
      }
      if (name.includes('message')) field.setAttribute('autocomplete', 'off');
    });

    let feedback = form.querySelector('[data-form-feedback]');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'form-feedback';
      feedback.setAttribute('data-form-feedback', '');
      feedback.setAttribute('aria-live', 'polite');
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton?.parentNode) {
        submitButton.parentNode.insertBefore(feedback, submitButton);
      } else {
        form.appendChild(feedback);
      }
    }

    const addHidden = (name, value) => {
      if (!value) return;
      if (form.querySelector(`input[name="${name}"]`)) return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    const nextPath = form.dataset.next || '/thank-you.html';
    const subject = form.dataset.subject || `${document.title} enquiry`;
    const sourcePage = form.dataset.sourcePage || window.location.pathname.replace(/^\//, '') || 'index.html';
    const resourceType = form.dataset.resourceType || '';

    if (isFormSubmit) {
      const nextPath = form.dataset.next || '/thank-you.html';
      const subject = form.dataset.subject || `${document.title} enquiry`;
      // Keep FormSubmit reCAPTCHA enabled by default.
      // Their autoresponse feature does not work when reCAPTCHA is disabled.
      if (form.dataset.disableCaptcha === 'true') {
        addHidden('_captcha', 'false');
      }
      addHidden('_template', 'table');
      addHidden('_subject', subject);
      // For localhost testing, redirect back to local pages. For production, use configured domain.
      addHidden('_next', `${siteUrl}${nextPath}`);

      // Resource forms send a clear autoresponse with the direct download link.
      if (nextPath === '/thank-you-resources.html') {
        const downloadLink = `${publicSiteUrl}/assets/downloads/free-revision-plan.pdf`;
        const autoResponseLines = [
          'Your free Pass Faster UK resource is ready.',
          '',
          `Download your Free 7-Day Revision Plan + Learner Support PDF: ${downloadLink}`,
          '',
          `Free Mock Theory Test: ${publicSiteUrl}/mock-theory-test.html`,
          `Practical Test Support: ${publicSiteUrl}/practical-test.html`,
          '',
          'If the link does not open directly, copy and paste it into your browser.'
        ];
        addHidden('_autoresponse', autoResponseLines.join('\n'));
      }
    }

    addHidden('source_page', sourcePage);
    addHidden('next_page', nextPath.replace(/^\//, ''));
    addHidden('resource_type', resourceType);

    form.addEventListener('submit', (event) => {
      if (window.location.protocol === 'file:') {
        event.preventDefault();
        if (feedback) {
          feedback.textContent =
            'Form submissions need a local web server. Open this site via http://localhost (not file://).';
        }
        return;
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        if (feedback) feedback.textContent = 'Please complete all required fields.';
        form.reportValidity();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('is-submitting');
      }
      form.setAttribute('aria-busy', 'true');
      if (feedback) feedback.textContent = 'Submitting your details...';

      trackEvent('generate_lead', {
        form_id: form.id || form.getAttribute('name') || 'lead-form',
        page_title: document.title
      });
    });
  });
};

const initCtaTracking = () => {
  document.querySelectorAll('a.btn, button.btn').forEach((button) => {
    button.addEventListener('click', () => {
      trackEvent('select_content', {
        content_type: 'cta',
        item_id: button.textContent?.trim() || 'button',
        link_url: button.getAttribute('href') || ''
      });
    });
  });
};

const initPdfDownloadTracking = () => {
  document.querySelectorAll('.track-pdf-download').forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      const fileName = href.split('/').pop() || 'file.pdf';
      const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : 'pdf';
      trackEvent('file_download', {
        file_name: fileName,
        file_extension: extension,
        link_url: href
      });
    });
  });
};

const initMockTheoryQuiz = () => {
  const mockTheoryForm = document.getElementById('mock-theory-form');
  if (!mockTheoryForm) return;

  const questions = [
    { name: 'q1', correct: 'c', topic: 'Vehicle control' },
    { name: 'q2', correct: 'a', topic: 'Road signs and rules' },
    { name: 'q3', correct: 'b', topic: 'Weather and visibility' },
    { name: 'q4', correct: 'c', topic: 'Pedestrian safety' },
    { name: 'q5', correct: 'b', topic: 'Driver awareness' },
    { name: 'q6', correct: 'b', topic: 'Following distance' },
    { name: 'q7', correct: 'b', topic: 'Vehicle safety checks' },
    { name: 'q8', correct: 'c', topic: 'Junction awareness' },
    { name: 'q9', correct: 'b', topic: 'Road user awareness' },
    { name: 'q10', correct: 'b', topic: 'Hazard perception' }
  ];

  const validationEl = document.getElementById('mock-validation');
  const resultSection = document.getElementById('mock-results');
  const scoreEl = document.getElementById('result-score');
  const statusEl = document.getElementById('result-status');
  const weakTopicsEl = document.getElementById('result-weak-topics');
  const nextStepEl = document.getElementById('result-next-step');
  const resetBtn = document.getElementById('mock-reset');

  const clearQuestionState = () => {
    questions.forEach(({ name }) => {
      const questionCard = mockTheoryForm.querySelector(`[data-question="${name}"]`);
      questionCard?.classList.remove('is-correct', 'is-incorrect');
    });
  };

  mockTheoryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!mockTheoryForm.checkValidity()) {
      mockTheoryForm.reportValidity();
      if (validationEl) validationEl.textContent = 'Please answer all 10 questions before submitting.';
      return;
    }

    clearQuestionState();
    if (validationEl) validationEl.textContent = '';

    const formData = new FormData(mockTheoryForm);
    let score = 0;
    const weakTopicCounts = {};

    questions.forEach(({ name, correct, topic }) => {
      const selected = formData.get(name);
      const questionCard = mockTheoryForm.querySelector(`[data-question="${name}"]`);
      if (selected === correct) {
        score += 1;
        questionCard?.classList.add('is-correct');
      } else {
        questionCard?.classList.add('is-incorrect');
        weakTopicCounts[topic] = (weakTopicCounts[topic] || 0) + 1;
      }
    });

    const weakTopics = Object.entries(weakTopicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);

    if (scoreEl) scoreEl.textContent = `${score}/${questions.length}`;

    if (statusEl) {
      statusEl.classList.remove('is-pass', 'is-progress', 'is-not-ready');
      if (score >= 8) {
        statusEl.textContent = 'Strong result: keep momentum and tighten any weaker areas.';
        statusEl.classList.add('is-pass');
      } else if (score >= 5) {
        statusEl.textContent = 'Making progress but needs more work: focus weak areas and retake soon.';
        statusEl.classList.add('is-progress');
      } else {
        statusEl.textContent = 'Not test-ready yet: use the free plan, then retake after focused revision.';
        statusEl.classList.add('is-not-ready');
      }
    }

    if (weakTopicsEl) {
      weakTopicsEl.innerHTML = '';
      if (weakTopics.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No major weak topic clusters found in this mock.';
        weakTopicsEl.appendChild(li);
      } else {
        weakTopics.slice(0, 3).forEach((topic) => {
          const li = document.createElement('li');
          li.textContent = topic;
          weakTopicsEl.appendChild(li);
        });
      }
    }

    if (nextStepEl) {
      if (score >= 8) {
        nextStepEl.textContent =
          'Take one more mock within 48 hours, then move into practical confidence prep or Pass Pack acceleration.';
      } else if (score >= 5) {
        nextStepEl.textContent =
          'Use the free 7-day revision plan and prioritise your weaker topics before your next mock attempt.';
      } else {
        nextStepEl.textContent =
          'Start with the free revision plan now, then consider Pass First Time Pack for a structured catch-up route.';
      }
    }

    if (resultSection) {
      resultSection.classList.remove('is-hidden');
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    trackEvent('mock_test_submitted', { score, total: questions.length });
  });

  resetBtn?.addEventListener('click', () => {
    mockTheoryForm.reset();
    clearQuestionState();
    if (validationEl) validationEl.textContent = '';
    resultSection?.classList.add('is-hidden');
  });
};

initAnalytics();
initContactValues();
initHeader();
initReveal();
initAccordion();
initYear();
initCheckoutPrefill();
initCheckoutLinks();
initForms();
initCtaTracking();
initPdfDownloadTracking();
initMockTheoryQuiz();
