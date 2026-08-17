/* ==========================================================================
   OpenBalancer — Interactive Simulation & UI Logic
   Operated by INCONTROL PLUS ЕООД
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoadBalancerSimulator();
  initCopyCodeButtons();
  initContactModal();
  initContactPageForm();
  initSmoothScroll();
  initCookieBanner();
});

/**
 * Interactive Load Balancer Simulator
 */
function initLoadBalancerSimulator() {
  const sendBtn = document.getElementById('sim-send-req-btn');
  const autoToggle = document.getElementById('sim-auto-toggle');
  const latencyDisplay = document.getElementById('sim-avg-latency');
  const reqCountDisplay = document.getElementById('sim-req-count');
  const activeBackendDisplay = document.getElementById('sim-active-node');
  
  const backends = [
    { id: 1, name: 'srv-us-east-1 (AI Cluster 1)', weight: 1, latency: 12, status: 'UP', count: 0 },
    { id: 2, name: 'srv-eu-west-1 (AI Cluster 2)', weight: 1, latency: 18, status: 'UP', count: 0 },
    { id: 3, name: 'srv-ap-southeast-1 (Failover Node)', weight: 1, latency: 45, status: 'UP', count: 0 }
  ];

  let currentIdx = 0;
  let totalRequests = 142850;
  let autoInterval = null;

  function dispatchRequest() {
    const availableNodes = backends.filter(b => b.status === 'UP');
    if (availableNodes.length === 0) return;

    const targetNode = availableNodes[currentIdx % availableNodes.length];
    currentIdx++;
    totalRequests++;
    targetNode.count++;

    // Update UI highlights
    backends.forEach(b => {
      const el = document.getElementById(`backend-card-${b.id}`);
      if (el) {
        if (b.id === targetNode.id) {
          el.classList.add('active');
          setTimeout(() => el.classList.remove('active'), 400);
        }
      }
    });

    // Update Counter & Latency
    if (reqCountDisplay) {
      reqCountDisplay.textContent = totalRequests.toLocaleString();
    }
    if (latencyDisplay) {
      const jitter = Math.floor(Math.random() * 5) - 2;
      const currentLat = Math.max(8, targetNode.latency + jitter);
      latencyDisplay.textContent = `${currentLat} ms`;
    }
    if (activeBackendDisplay) {
      activeBackendDisplay.textContent = targetNode.name.split(' ')[0];
    }
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      dispatchRequest();
    });
  }

  if (autoToggle) {
    autoToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        autoInterval = setInterval(dispatchRequest, 600);
      } else {
        clearInterval(autoInterval);
        autoInterval = null;
      }
    });
  }
}

/**
 * Copy to Clipboard for Terminal Snippets
 */
function initCopyCodeButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeTarget = btn.getAttribute('data-code');
      if (codeTarget) {
        try {
          await navigator.clipboard.writeText(codeTarget);
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy', err);
        }
      }
    });
  });
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
      }, 600);
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

  const cookieChoice = localStorage.getItem('openbalancer_cookie_consent');
  if (cookieChoice) {
    banner.classList.add('hidden');
    return;
  }

  function setConsent(type) {
    localStorage.setItem('openbalancer_cookie_consent', type);
    banner.style.opacity = '0';
    banner.style.transform = 'translate(-50%, 20px)';
    setTimeout(() => {
      banner.classList.add('hidden');
    }, 300);
  }

  if (acceptBtn) acceptBtn.addEventListener('click', () => setConsent('all'));
  if (dismissBtn) dismissBtn.addEventListener('click', () => setConsent('essential'));
}

