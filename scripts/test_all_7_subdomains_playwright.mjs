import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SUBDOMAINS = [
  {
    id: 1,
    url: 'https://n8n.openbalancer.com',
    expectedTitle: 'n8n Automation Engine — Open Balancer',
    subdomain: 'n8n.openbalancer.com',
    service: 'n8n Workflow Automation Platform'
  },
  {
    id: 2,
    url: 'https://infisical.openbalancer.com',
    expectedTitle: 'Infisical Secrets Vault & Key Management — Open Balancer',
    subdomain: 'infisical.openbalancer.com',
    service: 'Infisical Secrets Vault'
  },
  {
    id: 3,
    url: 'https://hermes.openbalancer.com',
    expectedTitle: 'Hermes Multi-Agent Swarm — Open Balancer',
    subdomain: 'hermes.openbalancer.com',
    service: 'Hermes Autonomous Swarm Orchestrator'
  },
  {
    id: 4,
    url: 'https://admin.openbalancer.com',
    expectedTitle: 'Admin & Database Studio — Open Balancer',
    subdomain: 'admin.openbalancer.com',
    service: 'Open Balancer Admin & Database Studio'
  },
  {
    id: 5,
    url: 'https://win.openbalancer.com',
    expectedTitle: 'Windows 11 VM & Microinvest Workspace — Open Balancer',
    subdomain: 'win.openbalancer.com',
    service: 'Windows 11 VM Matrix & noVNC Desktop'
  },
  {
    id: 6,
    url: 'https://mcp.openbalancer.com',
    expectedTitle: 'Model Context Protocol (MCP) Hub — Open Balancer',
    subdomain: 'mcp.openbalancer.com',
    service: 'Model Context Protocol (MCP) Hub'
  },
  {
    id: 7,
    url: 'https://tailscale.openbalancer.com',
    expectedTitle: 'Tailscale WireGuard Mesh — Open Balancer',
    subdomain: 'tailscale.openbalancer.com',
    service: 'Tailscale WireGuard Mesh Network Hub'
  }
];

const SCREENSHOT_DIR = path.join(process.cwd(), 'playwright-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runSuite() {
  console.log('======================================================================');
  console.log('🚀 Open Balancer — Playwright Verification Suite for 7 Subdomains');
  console.log('======================================================================\n');

  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const launchOptions = {
    headless: true,
    args: [
      '--host-resolver-rules=MAP *.openbalancer.com 104.21.78.146',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  };
  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OpenBalancer-Audit/4.5'
  });

  const results = [];
  let passedCount = 0;

  for (const target of SUBDOMAINS) {
    console.log(`[${target.id}/7] Testing: ${target.url} (${target.service})`);
    const page = await context.newPage();
    const startTime = Date.now();
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    try {
      const response = await page.goto(target.url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });

      const latencyMs = Date.now() - startTime;
      const status = response ? response.status() : 0;
      const title = await page.title();
      const bodyText = await page.innerText('body');
      const hasContent = bodyText.length > 50;
      const titleMatches = title.includes(target.expectedTitle.split('—')[0].trim());

      const screenshotPath = path.join(SCREENSHOT_DIR, `${target.subdomain}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const isPassed = status === 200 && titleMatches && hasContent;

      if (isPassed) {
        passedCount++;
        console.log(`  ✅ PASS: Status ${status} OK | Title: "${title}" | Latency: ${latencyMs}ms`);
      } else {
        console.log(`  ❌ FAIL: Status ${status} | Title: "${title}" (Expected: "${target.expectedTitle}") | Latency: ${latencyMs}ms`);
      }

      results.push({
        id: target.id,
        url: target.url,
        service: target.service,
        status,
        title,
        latencyMs,
        passed: isPassed,
        screenshot: screenshotPath,
        consoleErrors: consoleErrors.slice(0, 3)
      });

    } catch (err) {
      console.log(`  ❌ ERROR: ${err.message}`);
      results.push({
        id: target.id,
        url: target.url,
        service: target.service,
        status: 'ERROR',
        error: err.message,
        passed: false
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n======================================================================');
  console.log(`📊 FINAL PLAYWRIGHT SCORECARD: ${passedCount}/${SUBDOMAINS.length} PASSED (${((passedCount / SUBDOMAINS.length) * 100).toFixed(1)}%)`);
  console.log('======================================================================');
  console.table(results.map(r => ({
    'ID': r.id,
    'Subdomain': r.url.replace('https://', ''),
    'Status': r.status,
    'Title': (r.title || '').substring(0, 35) + '...',
    'Latency': `${r.latencyMs || 0}ms`,
    'Result': r.passed ? '🟢 PASS' : '🔴 FAIL'
  })));

  return { passedCount, total: SUBDOMAINS.length, results };
}

runSuite().then(({ passedCount, total }) => {
  if (passedCount === total) {
    console.log('\n🌟 ALL 7 SUBDOMAINS ARE 100% OPERATIONAL & VERIFIED!');
    process.exit(0);
  } else {
    console.error(`\n⚠️ Some subdomains failed verification (${passedCount}/${total}).`);
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
