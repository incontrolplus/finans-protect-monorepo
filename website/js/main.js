/* ==========================================================================
   OpenBalancer — Interactive Simulation & UI Logic
   Operated by INCONTROL PLUS ЕООД
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoadBalancerSimulator();
  initCopyCodeButtons();
  initContactModal();
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
    // Round-Robin with active node check
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
 * Contact Modal & B2B Inquiry Trigger
 */
function initContactModal() {
  const enterpriseButtons = document.querySelectorAll('[data-action="enterprise-inquiry"]');
  enterpriseButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || 'Custom Enterprise SLA';
      const email = 'support@openbalancer.com';
      const subject = encodeURIComponent(`B2B Inquiry / SLA Request: ${plan}`);
      const body = encodeURIComponent(`Hello INCONTROL PLUS team,\n\nWe are interested in discussing an Enterprise SLA & Infrastructure setup for OpenBalancer (${plan}).\n\nCompany Name:\nContact Person:\nInfrastructure Scale:\n\nThank you!`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });
  });
}
