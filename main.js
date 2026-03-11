const accordion = document.querySelector('[data-accordion]');
if (accordion) {
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
  });
  items.forEach((item) => {
    item.addEventListener('click', () => {
      window.setTimeout(syncFaqState, 0);
    });
  });
}

const revealElements = document.querySelectorAll('[data-reveal]');
if (revealElements.length > 0 && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

if (typeof window !== 'undefined' && window.AOS && typeof window.AOS.init === 'function') {
  window.AOS.init({
    duration: 850,
    once: true,
    easing: 'ease-out-cubic'
  });
}

const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const syncHeaderState = () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  };
  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
}

const promoModal = document.getElementById('pack-promo-modal');
const promoClose = document.getElementById('promo-close');
const promoLater = document.getElementById('promo-later');
const packNudge = document.getElementById('pack-nudge');
const packNudgeClose = document.getElementById('pack-nudge-close');

if (promoModal || packNudge) {
  const promoStorageKey = 'pfuk_pack_promo_dismissed_until';
  const nudgeStorageKey = 'pfuk_pack_nudge_dismissed_until';

  const now = () => Date.now();
  const safeGet = (key) => {
    try {
      return Number(window.localStorage.getItem(key) || 0);
    } catch {
      return 0;
    }
  };
  const safeSet = (key, value) => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // Ignore storage errors and continue without persistence.
    }
  };

  const modalDismissedUntil = safeGet(promoStorageKey);
  const nudgeDismissedUntil = safeGet(nudgeStorageKey);

  const openPromoModal = () => {
    if (!promoModal) return;
    promoModal.classList.add('is-open');
    promoModal.setAttribute('aria-hidden', 'false');
  };

  const closePromoModal = (snoozeHours = 24) => {
    if (!promoModal) return;
    promoModal.classList.remove('is-open');
    promoModal.setAttribute('aria-hidden', 'true');
    safeSet(promoStorageKey, now() + snoozeHours * 60 * 60 * 1000);
  };

  const openNudge = () => {
    if (!packNudge) return;
    packNudge.classList.add('is-open');
  };

  const closeNudge = (snoozeHours = 12) => {
    if (!packNudge) return;
    packNudge.classList.remove('is-open');
    safeSet(nudgeStorageKey, now() + snoozeHours * 60 * 60 * 1000);
  };

  if (promoModal && now() > modalDismissedUntil) {
    window.setTimeout(openPromoModal, 18000);

    const exitIntentHandler = (event) => {
      if (event.clientY <= 8) {
        openPromoModal();
        document.removeEventListener('mouseleave', exitIntentHandler);
      }
    };
    document.addEventListener('mouseleave', exitIntentHandler);

    promoClose?.addEventListener('click', () => closePromoModal(24));
    promoLater?.addEventListener('click', () => closePromoModal(24));
    promoModal.addEventListener('click', (event) => {
      if (event.target === promoModal) closePromoModal(24);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePromoModal(24);
    });
  }

  if (packNudge && now() > nudgeDismissedUntil) {
    window.setTimeout(openNudge, 8000);
    packNudgeClose?.addEventListener('click', () => closeNudge(12));
  }
}

const salesPopup = document.getElementById('sales-notification');
const salesText = document.getElementById('sales-text');
const salesTime = document.getElementById('sales-time');
const salesIcon = document.getElementById('sales-icon');
const salesClose = document.getElementById('sales-close');

if (salesPopup && salesText && salesTime && salesIcon) {
  const activityData = [
    { text: 'A learner in Manchester just started the free mock theory test.', time: '2 mins ago', icon: '📘' },
    { text: 'A learner in London just downloaded the free 7-day revision plan.', time: '7 mins ago', icon: '🎁' },
    { text: 'A learner in Leeds just requested practical test support.', time: '14 mins ago', icon: '🚗' },
    { text: 'A learner in Birmingham just viewed Pass Pack Pro.', time: 'Just now', icon: '💎' }
  ];

  let notificationTimer;
  let cycleTimer;
  let isDismissed = false;

  const hideNotification = () => salesPopup.classList.remove('show');

  const showNotification = () => {
    if (isDismissed) return;
    const event = activityData[Math.floor(Math.random() * activityData.length)];
    salesText.textContent = event.text;
    salesTime.textContent = event.time;
    salesIcon.textContent = event.icon;
    salesPopup.classList.add('show');

    window.clearTimeout(notificationTimer);
    notificationTimer = window.setTimeout(hideNotification, 5000);
  };

  const scheduleNext = () => {
    if (isDismissed) return;
    const nextDelay = 10000 + Math.floor(Math.random() * 5000);
    cycleTimer = window.setTimeout(() => {
      showNotification();
      scheduleNext();
    }, nextDelay);
  };

  window.setTimeout(() => {
    showNotification();
    scheduleNext();
  }, 3000);

  if (salesClose) {
    salesClose.addEventListener('click', () => {
      isDismissed = true;
      hideNotification();
      window.clearTimeout(notificationTimer);
      window.clearTimeout(cycleTimer);
    });
  }
}
