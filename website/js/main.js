/* ==========================================================================
   OpenBalancer — High-Performance Infrastructure JS Logic
   Operated by INCONTROL PLUS ЕООД
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initLanguageSwitcher === 'function') {
    initLanguageSwitcher();
  }
  initMobileDrawer();
  initTerminalTabs();
  initTelemetrySparkline();
  initLoadBalancerSimulator();
  initContactModal();
  initContactPageForm();
  initSmoothScroll();
  initCookieBanner();
});

/**
 * Mobile Navigation Drawer
 */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const drawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!drawer) return;

  function openDrawer() {
    drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  navLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/**
 * Live Prometheus Telemetry Sparkline Generator
 */
function initTelemetrySparkline() {
  const linePath = document.getElementById('sparkline-line');
  const areaPath = document.getElementById('sparkline-area');
  if (!linePath || !areaPath) return;

  const pointsCount = 17;
  const values = [50, 45, 48, 35, 40, 25, 30, 20, 28, 18, 22, 15, 25, 18, 22, 12, 16];

  function updateChart() {
    // Shift values and add new data point with realistic jitter
    values.shift();
    const lastVal = values[values.length - 1];
    const delta = (Math.random() * 12) - 6;
    const newVal = Math.min(52, Math.max(10, Math.round(lastVal + delta)));
    values.push(newVal);

    const step = 800 / (pointsCount - 1);
    let dLine = `M0,${values[0]}`;
    let dArea = `M0,${values[0]}`;

    for (let i = 1; i < pointsCount; i++) {
      const x = Math.round(i * step);
      const y = values[i];
      dLine += ` L${x},${y}`;
      dArea += ` L${x},${y}`;
    }

    dArea += ` L800,60 L0,60 Z`;

    linePath.setAttribute('d', dLine);
    areaPath.setAttribute('d', dArea);
  }

  setInterval(updateChart, 1600);
}

/**
 * Terminal Tabs & Snippet Switcher
 */
function initTerminalTabs() {
  const tabs = document.querySelectorAll('.terminal-tab');
  const copyBtn = document.getElementById('terminal-copy-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(c => {
        c.style.display = 'none';
      });

      const activeContent = document.getElementById(`tab-${target}`);
      if (activeContent) {
        activeContent.style.display = 'block';
      }
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const activeTabContent = document.querySelector('.tab-content:not([style*="display: none"])');
      if (activeTabContent) {
        const textToCopy = activeTabContent.textContent.trim();
        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Copy failed', err);
        }
      }
    });
  }
}

/**
 * Interactive Load Balancer Simulator with Outage Simulation
 */
function initLoadBalancerSimulator() {
  const sendBtn = document.getElementById('sim-send-req-btn');
  const outageBtn = document.getElementById('sim-toggle-outage-btn');
  const latencyDisplay = document.getElementById('sim-avg-latency');
  const reqCountDisplay = document.getElementById('sim-req-count');
  const activeBackendDisplay = document.getElementById('sim-active-node');
  
  const backends = [
    { id: 1, name: 'srv-us-east-1', weight: 2, latency: 12, status: 'UP', count: 0 },
    { id: 2, name: 'srv-eu-west-1', weight: 1, latency: 18, status: 'UP', count: 0 },
    { id: 3, name: 'srv-ap-southeast-1', weight: 1, latency: 45, status: 'UP', count: 0 }
  ];

  let currentIdx = 0;
  let totalRequests = 142850;

  function dispatchRequest() {
    const availableNodes = backends.filter(b => b.status === 'UP');
    if (availableNodes.length === 0) return;

    const targetNode = availableNodes[currentIdx % availableNodes.length];
    currentIdx++;
    totalRequests++;
    targetNode.count++;

    // Highlight active card
    backends.forEach(b => {
      const el = document.getElementById(`backend-card-${b.id}`);
      if (el) {
        if (b.id === targetNode.id && b.status === 'UP') {
          el.classList.add('active');
          setTimeout(() => el.classList.remove('active'), 350);
        }
      }
    });

    if (reqCountDisplay) {
      reqCountDisplay.textContent = totalRequests.toLocaleString();
    }
    if (latencyDisplay) {
      const jitter = Math.floor(Math.random() * 4) - 2;
      const currentLat = Math.max(8, targetNode.latency + jitter);
      latencyDisplay.textContent = `${currentLat} ms`;
    }
    if (activeBackendDisplay) {
      activeBackendDisplay.textContent = targetNode.name;
    }
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', dispatchRequest);
  }

  if (outageBtn) {
    outageBtn.addEventListener('click', () => {
      const node2 = backends.find(b => b.id === 2);
      const card2 = document.getElementById('backend-card-2');
      const pill2 = document.getElementById('status-pill-2');

      if (node2.status === 'UP') {
        node2.status = 'DOWN';
        if (card2) card2.classList.add('down');
        if (pill2) {
          pill2.textContent = 'TRIPPED (503)';
          pill2.className = 'backend-status-pill down';
        }
        outageBtn.textContent = 'Restore Node 2 Health';
      } else {
        node2.status = 'UP';
        if (card2) card2.classList.remove('down');
        if (pill2) {
          pill2.textContent = 'HEALTHY';
          pill2.className = 'backend-status-pill up';
        }
        outageBtn.textContent = 'Simulate Node 2 Outage';
      }
    });
  }
}

/**
 * Interactive B2B Modal & Inquiry Handler
 */
function initContactModal() {
  const modal = document.getElementById('b2b-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const closeSuccessBtn = document.getElementById('close-success-btn');
  const form = document.getElementById('b2b-inquiry-form');
  const successBox = document.getElementById('form-success-box');
  const successEmail = document.getElementById('success-email');
  const selectedPlanInput = document.getElementById('selected_plan');
  const modalTitle = document.getElementById('modal-title');
  const enterpriseButtons = document.querySelectorAll('[data-action="enterprise-inquiry"]');

  if (!modal) return;

  function openModal(planName) {
    if (selectedPlanInput && planName) {
      for (let option of selectedPlanInput.options) {
        if (option.value.includes(planName) || option.text.includes(planName)) {
          option.selected = true;
          break;
        }
      }
    }
    if (modalTitle && planName) {
      modalTitle.textContent = `Inquire: ${planName}`;
    }
    if (form) form.style.display = 'block';
    if (successBox) successBox.style.display = 'none';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  enterpriseButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || 'B2B Pro SLA Retainer';
      openModal(plan);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = document.getElementById('work_email')?.value || 'your team';
      const submitBtn = document.getElementById('submit-inquiry-btn');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing & Registering Inquiry...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit B2B Inquiry & Request Invoicing';
        }
        form.style.display = 'none';
        if (successEmail) successEmail.textContent = emailVal;
        if (successBox) successBox.style.display = 'block';
        form.reset();
      }, 500);
    });
  }
}

/**
 * Contact Page Dedicated Form
 */
function initContactPageForm() {
  const form = document.getElementById('contact-inquiry-form');
  const successBox = document.getElementById('c_success_box');
  const successEmail = document.getElementById('c_success_email');
  const submitBtn = document.getElementById('c_submit_btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = document.getElementById('c_work_email')?.value || 'your team';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Inquiry to INCONTROL PLUS';
        }
        form.style.display = 'none';
        if (successEmail) successEmail.textContent = emailVal;
        if (successBox) successBox.style.display = 'block';
        form.reset();
      }, 500);
    });
  }
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * GDPR Cookie Consent Banner Logic
 */
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies-btn');
  const dismissBtn = document.getElementById('dismiss-cookies-btn');

  if (!banner) return;

  try {
    const cookieChoice = localStorage.getItem('openbalancer_cookie_consent');
    if (cookieChoice) {
      banner.classList.add('hidden');
      return;
    }
  } catch (e) {}

  function setConsent(type) {
    try {
      localStorage.setItem('openbalancer_cookie_consent', type);
    } catch (e) {}
    banner.style.opacity = '0';
    banner.style.transform = 'translate(-50%, 20px)';
    setTimeout(() => {
      banner.classList.add('hidden');
    }, 300);
  }

  if (acceptBtn) acceptBtn.addEventListener('click', () => setConsent('all'));
  if (dismissBtn) dismissBtn.addEventListener('click', () => setConsent('essential'));
}
