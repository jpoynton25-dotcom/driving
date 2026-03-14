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

  if (email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((anchor) => {
      anchor.setAttribute('href', `mailto:${email}`);
      if (!anchor.dataset.keepText) anchor.textContent = email;
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

const initGlobalTrustProof = () => {
  const main = document.querySelector('main');
  if (!main) return;
  if (main.querySelector('[data-global-trust-proof]')) return;

  const trustSection = document.createElement('section');
  trustSection.className = 'section section-compact global-trust-proof';
  trustSection.setAttribute('data-reveal', '');
  trustSection.setAttribute('data-global-trust-proof', 'true');
  trustSection.innerHTML = `
    <div class="container">
      <div class="trust-proof-bar" aria-label="Trust proof">
        <p class="trust-proof-title">Trusted learner-driver support</p>
        <ul class="trust-proof-list">
          <li>Real inbox support via <a href="mailto:infopassfasteruk@gmail.com">infopassfasteruk@gmail.com</a></li>
          <li>Free mock test and free learner-support PDF available now</li>
          <li>No fake paid checkout flows - packs clearly marked coming soon</li>
          <li>Independent UK learner-driver guidance (not the official DVSA site)</li>
        </ul>
      </div>
    </div>
  `;

  const firstSection = main.querySelector('section');
  if (firstSection?.nextSibling) {
    firstSection.parentNode.insertBefore(trustSection, firstSection.nextSibling);
  } else {
    main.appendChild(trustSection);
  }
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

const initContactPrefill = () => {
  if (!/\/?contact\.html$/i.test(window.location.pathname)) return;

  const params = new URLSearchParams(window.location.search);
  const helpWith = String(params.get('help_with') || '').trim();
  const next = String(params.get('next') || '').trim();

  const contactForm = document.querySelector('form.lead-form[data-subject*="Get My Plan"]');
  if (!contactForm) return;

  if (helpWith) {
    const helpSelect = contactForm.querySelector('select[name="help_with"]');
    if (helpSelect) {
      const decoded = decodeURIComponent(helpWith.replace(/\+/g, ' '));
      const match = [...helpSelect.options].find((opt) => opt.value === decoded || opt.text === decoded);
      if (match) helpSelect.value = match.value;
    }
  }

  const normalizedNext = next.replace(/^\//, '');
  if (normalizedNext === 'thank-you-waitlist.html') {
    contactForm.dataset.next = '/thank-you-waitlist.html';
    contactForm.dataset.subject = 'Get My Plan request';
  }
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
  const leadFormEndpoint = String(PFUK_CONFIG.leadFormEndpoint || '').trim();
  const formEndpoint = String(PFUK_CONFIG.formEndpoint || '').trim();
  const disableCaptchaByDefault = PFUK_CONFIG.formDisableCaptcha === true;

  document.querySelectorAll('form').forEach((form) => {
    // Keep quiz-only forms out of lead form submission flow.
    if (form.id === 'mock-theory-form') return;

    const isLeadForm = form.classList.contains('lead-form');
    const isGasLeadForm = isLeadForm && Boolean(leadFormEndpoint);

    if (isGasLeadForm && leadFormEndpoint) {
      form.setAttribute('action', leadFormEndpoint);
    } else if (formEndpoint && !form.hasAttribute('data-fixed-action')) {
      form.setAttribute('action', formEndpoint);
    }

    const action = form.getAttribute('action') || '';
    const isFormSubmit = action.includes('formsubmit.co');

    // Improve mobile keyboard and autofill behavior without changing markup.
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      const name = String(field.getAttribute('name') || '').toLowerCase();
      if (name.includes('name')) field.setAttribute('autocomplete', 'name');
      if (name === 'email') field.setAttribute('autocomplete', 'email');
      if (name.includes('phone') || name.includes('mobile')) {
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

    const addHoneypot = () => {
      if (form.querySelector('input[name="_honey"]')) return;
      const trap = document.createElement('input');
      trap.type = 'text';
      trap.name = '_honey';
      trap.tabIndex = -1;
      trap.autocomplete = 'off';
      trap.setAttribute('aria-hidden', 'true');
      trap.style.position = 'absolute';
      trap.style.left = '-9999px';
      trap.style.opacity = '0';
      trap.style.pointerEvents = 'none';
      form.appendChild(trap);
    };

    const resolveHelpWithValue = () => {
      const direct = form.querySelector('[name="help_with"]');
      if (direct) return String(direct.value || '').trim();

      const fallbackNames = [
        'interest',
        'lesson_type',
        'challenge',
        'focus',
        'theory_passed',
        'experience_level',
        'target_timescale',
        'pack'
      ];

      const values = fallbackNames
        .map((fieldName) => {
          const field = form.querySelector(`[name="${fieldName}"]`);
          return field ? String(field.value || '').trim() : '';
        })
        .filter(Boolean);

      return values.join(' | ');
    };

    const nextPath = form.dataset.next || '/thank-you.html';
    const subject = form.dataset.subject || `${document.title} enquiry`;
    const sourcePage = form.dataset.sourcePage || window.location.pathname.replace(/^\//, '') || 'index.html';
    const resourceType = form.dataset.resourceType || '';

    const pathStem = window.location.pathname
      .replace(/^\/+|\/+$/g, '')
      .replace(/\.html$/i, '')
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
    const inferredSourcePage = form.dataset.sourcePage || pathStem || 'index';

    const inferFormType = () => {
      if (nextPath === '/thank-you-free-pdf.html') return 'free_pdf';
      if (nextPath === '/thank-you-waitlist.html') return 'waitlist_request';
      return 'support_request';
    };

    const inferredFormType = form.dataset.formType || inferFormType();
    const inferredIntentStage =
      form.dataset.intentStage ||
      (inferredFormType === 'free_pdf'
        ? 'top_of_funnel'
        : inferredFormType === 'waitlist_request'
          ? 'mid_funnel_waitlist'
          : 'qualified_lead');
    const inferredResourceType =
      form.dataset.resourceType ||
      (inferredFormType === 'free_pdf'
        ? 'revision_plan_pdf'
        : inferredFormType === 'waitlist_request'
          ? 'waitlist'
          : 'none');

    if (isFormSubmit) {
      const nextPath = form.dataset.next || '/thank-you.html';
      const subject = form.dataset.subject || `${document.title} enquiry`;
      const sourceUrl = `${publicSiteUrl}/${sourcePage}`.replace(/([^:]\/)\/+/g, '$1');
      addHoneypot();
      // Disable FormSubmit CAPTCHA to ensure reliable delivery flow.
      if (disableCaptchaByDefault || form.dataset.disableCaptcha === 'true') {
        addHidden('_captcha', 'false');
      }
      addHidden('_template', 'table');
      addHidden('_subject', subject);
      addHidden('_url', sourceUrl);
      // For localhost testing, redirect back to local pages. For production, use configured domain.
      addHidden('_next', `${siteUrl}${nextPath}`);

      // Resource forms send a clear autoresponse with the direct download link.
      if (nextPath === '/thank-you-resources.html') {
        const downloadLink = `${publicSiteUrl}/assets/downloads/freebookletpdf.pdf`;
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

    addHidden('source_page', inferredSourcePage);
    addHidden('next_page', nextPath.replace(/^\//, ''));
    addHidden('resource_type', inferredResourceType);
    if (isGasLeadForm) {
      addHidden('form_type', inferredFormType);
      addHidden('intent_stage', inferredIntentStage);
      addHoneypot();
    }
    if (isGasLeadForm) {
      addHidden('next_url', `${siteUrl}${nextPath}`);
    }

    form.addEventListener('submit', (event) => {
      if (isGasLeadForm) {
        const resolvedHelpWith = resolveHelpWithValue();
        let helpWithInput = form.querySelector('input[type="hidden"][name="help_with"]');
        if (!helpWithInput) {
          helpWithInput = document.createElement('input');
          helpWithInput.type = 'hidden';
          helpWithInput.name = 'help_with';
          form.appendChild(helpWithInput);
        }
        helpWithInput.value = resolvedHelpWith;
      }

      if (isFormSubmit) {
        const emailField = form.querySelector('input[name="email"]');
        const emailValue = String(emailField?.value || '').trim();
        let replyTo = form.querySelector('input[name="_replyto"]');
        if (!replyTo) {
          replyTo = document.createElement('input');
          replyTo.type = 'hidden';
          replyTo.name = '_replyto';
          form.appendChild(replyTo);
        }
        replyTo.value = emailValue;
      }

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

      if (isGasLeadForm && !leadFormEndpoint) {
        event.preventDefault();
        if (feedback) {
          feedback.textContent =
            'Lead form setup is incomplete. Add PFUK_CONFIG.leadFormEndpoint in site-config.js.';
        }
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

      // For cross-origin Google Apps Script posts, show fallback message if navigation does not occur.
      if (isGasLeadForm) {
        let didNavigateAway = false;
        window.addEventListener(
          'pagehide',
          () => {
            didNavigateAway = true;
          },
          { once: true }
        );
        window.setTimeout(() => {
          if (didNavigateAway) return;
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('is-submitting');
          }
          form.setAttribute('aria-busy', 'false');
          if (feedback) feedback.textContent = 'Something went wrong. Please try again in a moment.';
        }, 12000);
      }
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

    const hasAllAnswers = questions.every(({ name }) => {
      const selected = mockTheoryForm.querySelector(`input[name="${name}"]:checked`);
      return Boolean(selected);
    });

    if (!hasAllAnswers) {
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

const initFreeGuidePopup = () => {
  const path = window.location.pathname.toLowerCase();
  const skipPages = ['thank-you', 'order-confirmed'];
  if (skipPages.some((slug) => path.includes(slug))) return;

  const dismissedKey = 'pfuk_free_guide_popup_dismissed_at';
  const openedKey = 'pfuk_free_guide_popup_opened_in_session';
  const now = Date.now();
  const dismissedAt = Number(window.localStorage.getItem(dismissedKey) || 0);
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (dismissedAt && now - dismissedAt < sevenDaysMs) return;
  if (window.sessionStorage.getItem(openedKey) === 'true') return;

  const popup = document.createElement('div');
  popup.className = 'lead-popup';
  popup.setAttribute('aria-hidden', 'true');
  popup.innerHTML = `
    <div class="lead-popup__overlay" data-popup-close></div>
    <section class="lead-popup__card" role="dialog" aria-modal="true" aria-labelledby="free-guide-popup-title">
      <button class="lead-popup__close" type="button" aria-label="Close popup" data-popup-close>&times;</button>
      <p class="eyebrow">Free learner support</p>
      <h2 id="free-guide-popup-title">Get the Free 7-Day Revision Plan + Learner Support PDF</h2>
      <p>Start with the free guide today. No paid pack required.</p>
      <ul class="tick-list compact">
        <li>Instant access request</li>
        <li>Covers theory + practical next steps</li>
        <li>Helps reduce random revision</li>
      </ul>
      <div class="hero-actions">
        <a class="btn btn-primary" href="free-resources.html#resource-plan" data-popup-cta>Get Free Download</a>
        <button class="btn btn-secondary" type="button" data-popup-close>Not now</button>
      </div>
    </section>
  `;

  const closePopup = (persist = false) => {
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lead-popup-open');
    if (persist) window.localStorage.setItem(dismissedKey, String(Date.now()));
  };

  const openPopup = () => {
    if (popup.classList.contains('is-open')) return;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lead-popup-open');
    window.sessionStorage.setItem(openedKey, 'true');
    trackEvent('free_guide_popup_shown', { page_title: document.title });
  };

  popup.querySelectorAll('[data-popup-close]').forEach((btn) => {
    btn.addEventListener('click', () => closePopup(true));
  });

  popup.querySelector('[data-popup-cta]')?.addEventListener('click', () => {
    trackEvent('free_guide_popup_cta_click', { page_title: document.title });
    closePopup(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePopup(true);
  });

  document.body.appendChild(popup);

  let didScheduleOpen = false;
  const maybeOpen = () => {
    if (didScheduleOpen) return;
    didScheduleOpen = true;
    openPopup();
  };

  const timerId = window.setTimeout(maybeOpen, 14000);

  const onScroll = () => {
    const scrolled = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (scrolled > 0.45) {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timerId);
      maybeOpen();
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const onMouseLeave = (event) => {
    if (event.clientY > 10) return;
    document.removeEventListener('mouseout', onMouseLeave);
    window.clearTimeout(timerId);
    maybeOpen();
  };
  document.addEventListener('mouseout', onMouseLeave);
};

const initDownloadProofToast = () => {
  const path = window.location.pathname.toLowerCase();
  const skipPages = ['thank-you', 'order-confirmed'];
  if (skipPages.some((slug) => path.includes(slug))) return;
  const now = Date.now();

  const firstNames = ['Amir', 'Sarah', 'Liam', 'Zara', 'Noah', 'Aisha', 'Ethan', 'Mia', 'Jacob', 'Ella'];
  const locations = [
    'Manchester',
    'Birmingham',
    'Leeds',
    'Liverpool',
    'Bristol',
    'London',
    'Glasgow',
    'Sheffield',
    'Leicester',
    'Nottingham'
  ];
  const actions = [
    'requested the free PDF',
    'is checking out the free PDF',
    'just opened the free guide page',
    'downloaded the learner-support PDF'
  ];

  const daySeed = Math.floor(now / (24 * 60 * 60 * 1000));
  let index = daySeed % firstNames.length;
  const toast = document.createElement('aside');
  toast.className = 'download-proof-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <button class="download-proof-toast__close" type="button" aria-label="Close" data-toast-close>&times;</button>
    <p class="download-proof-toast__kicker">Recent learner activity</p>
    <p class="download-proof-toast__text" data-toast-text></p>
    <a class="download-proof-toast__link" href="free-resources.html#resource-plan">Get free download</a>
  `;
  const toastText = toast.querySelector('[data-toast-text]');

  const setNextMessage = () => {
    const person = firstNames[index % firstNames.length];
    const location = locations[(index * 3 + 2) % locations.length];
    const action = actions[(index * 5 + 1) % actions.length];
    if (toastText) toastText.innerHTML = `<strong>${person}</strong> in <strong>${location}</strong> ${action}.`;
    index += 1;
  };

  let pausedUntil = 0;

  const closeToast = (snoozeMs = 60000) => {
    pausedUntil = Date.now() + snoozeMs;
    toast.classList.remove('is-visible');
  };

  toast.querySelector('[data-toast-close]')?.addEventListener('click', closeToast);

  toast.querySelector('.download-proof-toast__link')?.addEventListener('click', () => {
    trackEvent('download_proof_toast_click', { page_title: document.title });
    closeToast();
  });

  document.body.appendChild(toast);
  setNextMessage();

  const showFor = 4200;
  const hideFor = 3800;

  const cycle = () => {
    if (!document.body.contains(toast)) return;
    const waitMs = Math.max(0, pausedUntil - Date.now());
    if (waitMs > 0) {
      window.setTimeout(cycle, waitMs);
      return;
    }
    toast.classList.add('is-visible');
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => {
        setNextMessage();
        cycle();
      }, hideFor);
    }, showFor);
  };

  window.setTimeout(cycle, 1800);
};

initAnalytics();
initContactValues();
initHeader();
initGlobalTrustProof();
initReveal();
initAccordion();
initYear();
initCheckoutPrefill();
initContactPrefill();
initCheckoutLinks();
initForms();
initCtaTracking();
initPdfDownloadTracking();
initMockTheoryQuiz();
initFreeGuidePopup();
initDownloadProofToast();
