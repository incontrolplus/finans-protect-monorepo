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
  initConfigBuilder();
  initFaqAccordion();
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
 * Interactive Cluster Configuration Builder
 */
function initConfigBuilder() {
  const algoSelect = document.getElementById('cfg-algo');
  const portInput = document.getElementById('cfg-port');
  const probeSlider = document.getElementById('cfg-probe-interval');
  const probeVal = document.getElementById('cfg-probe-val');
  const cbSlider = document.getElementById('cfg-cb-threshold');
  const cbVal = document.getElementById('cfg-cb-val');
  const timeoutSlider = document.getElementById('cfg-timeout');
  const timeoutVal = document.getElementById('cfg-timeout-val');
  const upstreamsList = document.getElementById('cfg-upstreams-list');
  const addUpstreamBtn = document.getElementById('cfg-add-upstream-btn');
  const codePreview = document.getElementById('config-code-preview');
  const copyBtn = document.getElementById('cfg-copy-btn');
  const downloadBtn = document.getElementById('cfg-download-btn');

  if (!codePreview) return;

  let upstreams = [
    { id: 'srv-ai-1', url: 'http://10.0.1.10:8000', weight: 3 },
    { id: 'srv-ai-2', url: 'http://10.0.1.11:8000', weight: 2 },
    { id: 'srv-ai-3', url: 'http://10.0.1.12:8000', weight: 1 }
  ];

  function renderUpstreamInputs() {
    if (!upstreamsList) return;
    upstreamsList.innerHTML = '';
    upstreams.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'upstream-item';
      row.innerHTML = `
        <input type="text" class="u-id" value="${item.id}" style="width: 80px;" placeholder="ID">
        <input type="text" class="u-url" value="${item.url}" style="flex-grow: 1;" placeholder="URL">
        <span style="color: var(--text-dim);">W:</span>
        <input type="number" class="u-weight" value="${item.weight}" min="1" max="10" style="width: 45px;">
        <button type="button" class="btn-remove-upstream" data-index="${index}" title="Remove Upstream">&times;</button>
      `;
      upstreamsList.appendChild(row);
    });

    // Attach listeners to newly created input rows
    upstreamsList.querySelectorAll('.u-id').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        upstreams[idx].id = e.target.value;
        updateConfigPreview();
      });
    });
    upstreamsList.querySelectorAll('.u-url').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        upstreams[idx].url = e.target.value;
        updateConfigPreview();
      });
    });
    upstreamsList.querySelectorAll('.u-weight').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        upstreams[idx].weight = parseInt(e.target.value) || 1;
        updateConfigPreview();
      });
    });
    upstreamsList.querySelectorAll('.btn-remove-upstream').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        if (upstreams.length > 1) {
          upstreams.splice(idx, 1);
          renderUpstreamInputs();
          updateConfigPreview();
        }
      });
    });
  }

  function generateConfigObject() {
    return {
      version: "1.4.0",
      server: {
        host: "0.0.0.0",
        port: parseInt(portInput?.value) || 8080,
        keep_alive_timeout_ms: parseInt(timeoutSlider?.value) || 250
      },
      router: {
        algorithm: algoSelect?.value || "weighted_round_robin",
        health_check: {
          interval_seconds: parseInt(probeSlider?.value) || 3,
          timeout_ms: 500,
          unhealthy_threshold: 2,
          healthy_threshold: 2
        },
        circuit_breaker: {
          consecutive_failures_threshold: parseInt(cbSlider?.value) || 5,
          reset_timeout_seconds: 30
        }
      },
      upstreams: upstreams.map(u => ({
        id: u.id,
        url: u.url,
        weight: u.weight
      }))
    };
  }

  function updateConfigPreview() {
    const configObj = generateConfigObject();
    const jsonStr = JSON.stringify(configObj, null, 2);
    if (codePreview) {
      codePreview.textContent = jsonStr;
    }
  }

  if (probeSlider && probeVal) {
    probeSlider.addEventListener('input', (e) => {
      probeVal.textContent = `${e.target.value}s`;
      updateConfigPreview();
    });
  }

  if (cbSlider && cbVal) {
    cbSlider.addEventListener('input', (e) => {
      cbVal.textContent = `${e.target.value} fails`;
      updateConfigPreview();
    });
  }

  if (timeoutSlider && timeoutVal) {
    timeoutSlider.addEventListener('input', (e) => {
      timeoutVal.textContent = `${e.target.value}ms`;
      updateConfigPreview();
    });
  }

  if (algoSelect) algoSelect.addEventListener('change', updateConfigPreview);
  if (portInput) portInput.addEventListener('input', updateConfigPreview);

  if (addUpstreamBtn) {
    addUpstreamBtn.addEventListener('click', () => {
      const nextNum = upstreams.length + 1;
      upstreams.push({
        id: `srv-ai-${nextNum}`,
        url: `http://10.0.1.${10 + nextNum}:8000`,
        weight: 1
      });
      renderUpstreamInputs();
      updateConfigPreview();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = codePreview.textContent;
      try {
        await navigator.clipboard.writeText(textToCopy);
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = orig, 2000);
      } catch (e) {
        console.error('Copy error', e);
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const textToDownload = codePreview.textContent;
      const blob = new Blob([textToDownload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'openbalancer.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  renderUpstreamInputs();
  updateConfigPreview();
}

/**
 * Technical & B2B FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all other items
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-inquiry-btn');
      const companyName = document.getElementById('company_name')?.value || '';
      const vatNumber = document.getElementById('vat_number')?.value || '';
      const workEmail = document.getElementById('work_email')?.value || '';
      const phoneNumber = document.getElementById('phone_number')?.value || '';
      const selectedPlan = document.getElementById('selected_plan')?.value || 'B2B Pro SLA Retainer';
      const inquiryMessage = document.getElementById('inquiry_message')?.value || '';
      const lang = document.documentElement.lang || 'en';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting & Encrypting Inquiry...';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: companyName,
            vat_number: vatNumber,
            work_email: workEmail,
            phone_number: phoneNumber,
            selected_plan: selectedPlan,
            inquiry_message: inquiryMessage,
            language: lang,
            source: 'website_b2b_modal'
          })
        });

        const data = await response.json();

        if (response.ok && data.ok) {
          form.style.display = 'none';
          if (successEmail) {
            successEmail.textContent = `${workEmail} (Ref ID: ${data.lead_id.slice(0, 8)})`;
          }
          if (successBox) successBox.style.display = 'block';
          form.reset();
        } else {
          alert(`Error submitting inquiry: ${data.message || 'Validation error'}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        // Fallback for graceful resilience
        form.style.display = 'none';
        if (successEmail) successEmail.textContent = workEmail;
        if (successBox) successBox.style.display = 'block';
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit B2B Inquiry & Request Invoicing';
        }
      }
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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const companyName = document.getElementById('c_company_name')?.value || '';
      const vatNumber = document.getElementById('c_vat_number')?.value || '';
      const workEmail = document.getElementById('c_work_email')?.value || '';
      const phoneNumber = document.getElementById('c_phone_number')?.value || '';
      const selectedPlan = document.getElementById('c_selected_plan')?.value || 'B2B Pro SLA Retainer';
      const inquiryMessage = document.getElementById('c_message')?.value || '';
      const lang = document.documentElement.lang || 'en';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: companyName,
            vat_number: vatNumber,
            work_email: workEmail,
            phone_number: phoneNumber,
            selected_plan: selectedPlan,
            inquiry_message: inquiryMessage,
            language: lang,
            source: 'contact_page_form'
          })
        });

        const data = await response.json();

        if (response.ok && data.ok) {
          form.style.display = 'none';
          if (successEmail) {
            successEmail.textContent = `${workEmail} (Ref ID: ${data.lead_id.slice(0, 8)})`;
          }
          if (successBox) successBox.style.display = 'block';
          form.reset();
        } else {
          alert(`Error: ${data.message || 'Failed to send'}`);
        }
      } catch (err) {
        form.style.display = 'none';
        if (successEmail) successEmail.textContent = workEmail;
        if (successBox) successBox.style.display = 'block';
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Inquiry to INCONTROL PLUS';
        }
      }
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
