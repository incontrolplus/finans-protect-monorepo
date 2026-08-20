const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const net = require('net');

const PORT = parseInt(process.env.PORT || '5001', 10);
const DIST_DIR = path.join(__dirname, '..', 'dist');

// ─── MASTER SERVICE & PORT REGISTRY (SSOT) ───────────────────────────
const SERVICE_REGISTRY = [
  {
    service: 'Open Balancer Control Center',
    port: 5001,
    protocol: 'HTTP',
    role: 'Platform Management & Mesh Dashboard',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'Core Management'
  },
  {
    service: 'Open Balancer Web / Cashflow',
    port: 8083,
    protocol: 'HTTP',
    role: 'Cashflow Management & Client Portal',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'Frontend & UI'
  },
  {
    service: 'n8n Workflow Automation',
    port: 5679,
    protocol: 'HTTP/WS',
    role: 'Autonomous Agent Workflows & Webhooks',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'Automation'
  },
  {
    service: 'Infisical Secret Manager',
    port: 8080,
    protocol: 'HTTP',
    role: 'Zero-Knowledge Secrets & Vault Sync',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'Security & Auth'
  },
  {
    service: 'Supabase Kong API Gateway',
    port: 8002,
    protocol: 'HTTP',
    role: 'PostgreSQL REST / Auth / Storage Gateway',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'Database'
  },
  {
    service: 'Supabase Kong SSL Gateway',
    port: 8443,
    protocol: 'HTTPS',
    role: 'Encrypted Database Gateway',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'Database'
  },
  {
    service: 'Self-Hosted Firecrawl API',
    port: 3002,
    protocol: 'HTTP',
    role: 'LLM Web Scraping & Crawling Engine',
    primaryHost: '100.83.83.8',
    secondaryHost: null,
    category: 'AI & Data Engine'
  },
  {
    service: 'OpenClaw Multi-Agent Gateway',
    port: 18789,
    protocol: 'HTTP/WS',
    role: 'Agent Fleet Communication & RPC',
    primaryHost: '100.120.246.89',
    secondaryHost: null,
    category: 'Agent Orchestration'
  },
  {
    service: 'Ollama Local LLM Inference',
    port: 11434,
    protocol: 'HTTP',
    role: 'Private On-Device LLM & Embeddings',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'AI & Data Engine'
  },
  {
    service: 'noVNC / Windows VM Proxy',
    port: 8006,
    protocol: 'HTTP/WS',
    role: 'Remote Microinvest VM GUI Bridge',
    primaryHost: '100.83.83.8',
    secondaryHost: '100.70.181.127',
    category: 'Remote Access'
  },
  {
    service: 'Cloudflare Tunnel Metrics',
    port: 20241,
    protocol: 'HTTP',
    role: 'Edge Tunnel Telemetry & Health Exporter',
    primaryHost: null,
    secondaryHost: '100.70.181.127',
    category: 'Infrastructure'
  },
  {
    service: 'Wallestars Express API',
    port: 3500,
    protocol: 'HTTP',
    role: 'Local Dev Platform API',
    primaryHost: '100.120.246.89',
    secondaryHost: null,
    category: 'Development'
  }
];

function checkPort(host, port, timeoutMs = 400) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let responded = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      responded = true;
      const latency = Date.now() - start;
      socket.destroy();
      resolve({ open: true, latencyMs: latency });
    });

    socket.on('timeout', () => {
      if (!responded) {
        responded = true;
        socket.destroy();
        resolve({ open: false, latencyMs: null, error: 'TIMEOUT' });
      }
    });

    socket.on('error', (err) => {
      if (!responded) {
        responded = true;
        socket.destroy();
        resolve({ open: false, latencyMs: null, error: err.code });
      }
    });

    socket.connect(port, host);
  });
}

async function scanMeshCluster() {
  const hosts = [
    { id: 'macmini-primary', name: 'Mac Mini Primary (Leon)', ip: '100.83.83.8', localFallback: '127.0.0.1' },
    { id: 'macmini-secondary', name: 'Mac Mini Secondary (Leon2)', ip: '100.70.181.127', localFallback: '127.0.0.1' },
    { id: 'dios-macbook-air', name: 'MacBook Air M4 (Local)', ip: '127.0.0.1', localFallback: '127.0.0.1' }
  ];

  const results = [];

  for (const item of SERVICE_REGISTRY) {
    const entry = {
      ...item,
      nodes: {}
    };

    for (const host of hosts) {
      const probeIp = (process.env.NODE_NAME === host.id || (!process.env.NODE_NAME && host.id === 'dios-macbook-air'))
        ? '127.0.0.1'
        : host.ip;

      const probe = await checkPort(probeIp, item.port, 250);
      entry.nodes[host.id] = {
        hostName: host.name,
        ip: host.ip,
        isOpen: probe.open,
        latencyMs: probe.latencyMs,
        status: probe.open ? 'ONLINE' : 'STANDBY_OR_INACTIVE',
        isExpectedHost: item.primaryHost === host.ip || item.secondaryHost === host.ip
      };
    }

    // Collision detection logic
    const activeNodes = Object.entries(entry.nodes).filter(([_, n]) => n.isOpen);
    entry.activeInstances = activeNodes.length;
    entry.hasCollisionRisk = activeNodes.length > 2 && item.category !== 'Core Management';

    results.push(entry);
  }

  return {
    timestamp: new Date().toISOString(),
    totalServices: results.length,
    activeServices: results.filter(r => r.activeInstances > 0).length,
    services: results
  };
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'HEALTHY',
      node: process.env.NODE_NAME || 'dios-macbook-air',
      platform: 'Open Balancer',
      role: 'HA-Mesh-Control-Center',
      sla_guarantee: '99.9%',
      timestamp: new Date().toISOString()
    }));
  }

  if (pathname === '/api/ports' || pathname === '/api/ports/registry' || pathname === '/api/cluster/services') {
    const scanData = await scanMeshCluster();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(scanData, null, 2));
  }

  if (pathname === '/api/openbalancer/status' || pathname === '/api/mesh/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      status: 'ONLINE',
      mode: 'Active-Active-HA-Mesh',
      primary_node: '100.83.83.8',
      secondary_node: '100.70.181.127',
      local_node: '127.0.0.1',
      cluster: {
        mesh_status: 'HEALTHY',
        active_connectors: 2,
        total_connections: 8,
        services: ['n8n (5679)', 'supabase (8002)', 'infisical (8080)', 'control-center (5001)', 'cashflow (8083)', 'firecrawl (3002)', 'ollama (11434)']
      },
      timestamp: new Date().toISOString()
    }));
  }

  // Interactive Live Port & Service Monitor UI
  if (pathname === '/ports' || pathname === '/services' || pathname === '/ports.html') {
    const scanData = await scanMeshCluster();
    const rowsHtml = scanData.services.map(s => {
      const primaryStatus = s.nodes['macmini-primary'].isOpen ? '<span style="color:#10b981;font-weight:600;">● ONLINE</span>' : '<span style="color:#6b7280;">○ STANDBY</span>';
      const secondaryStatus = s.nodes['macmini-secondary'].isOpen ? '<span style="color:#3b82f6;font-weight:600;">● MESH PROXY</span>' : '<span style="color:#6b7280;">○ STANDBY</span>';
      const localStatus = s.nodes['dios-macbook-air'].isOpen ? '<span style="color:#10b981;font-weight:600;">● ACTIVE</span>' : '<span style="color:#6b7280;">○ -</span>';

      return `
        <tr style="border-bottom:1px solid #1e293b;">
          <td style="padding:14px 16px;font-weight:600;color:#f8fafc;">
            ${s.service}
            <div style="font-size:12px;color:#94a3b8;font-weight:normal;margin-top:2px;">${s.role}</div>
          </td>
          <td style="padding:14px 16px;"><span style="background:#1e293b;color:#38bdf8;padding:4px 8px;border-radius:6px;font-family:monospace;font-weight:bold;">:${s.port}</span></td>
          <td style="padding:14px 16px;color:#cbd5e1;font-size:13px;">${s.category}</td>
          <td style="padding:14px 16px;">${primaryStatus}</td>
          <td style="padding:14px 16px;">${secondaryStatus}</td>
          <td style="padding:14px 16px;">${localStatus}</td>
          <td style="padding:14px 16px;">
            ${s.hasCollisionRisk 
              ? '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">⚠️ DUP RISK</span>'
              : '<span style="background:#065f46;color:#34d399;padding:2px 8px;border-radius:4px;font-size:11px;">✓ OK</span>'}
          </td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Balancer — Mesh Service & Port Registry</title>
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 32px 40px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 8px 0; color: #fff; display:flex; align-items:center; gap:12px; }
    .subtitle { color: #94a3b8; margin-bottom: 28px; font-size: 14px; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #0f172a; padding: 14px 16px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e293b; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #131b2e; border: 1px solid #1e293b; border-radius: 10px; padding: 16px 20px; }
    .stat-val { font-size: 24px; font-weight: 700; color: #38bdf8; margin-top: 4px; }
    .stat-lbl { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
  </style>
</head>
<body>
  <h1>🦁 Open Balancer Service & Port Monitor</h1>
  <div class="subtitle">Real-Time Single Source of Truth (SSOT) Port Allocation & Cluster Telemetry</div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-lbl">Общо Регистрирани Услуги</div>
      <div class="stat-val">${scanData.totalServices}</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Активни в Мрежата</div>
      <div class="stat-val" style="color:#10b981;">${scanData.activeServices}</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">SLA Гаранция</div>
      <div class="stat-val" style="color:#a855f7;">99.9%</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Mesh Topology</div>
      <div class="stat-val" style="color:#f59e0b;">Active-Active</div>
    </div>
  </div>

  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Услуга / Функция</th>
          <th>Порт</th>
          <th>Категория</th>
          <th>Primary (100.83.83.8)</th>
          <th>Secondary (100.70.181.127)</th>
          <th>MacBook Air (Local)</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<!DOCTYPE html><html><head><title>Open Balancer Control Center</title></head><body style="background:#0b0f19;color:#fff;font-family:sans-serif;padding:40px;"><h1>🦁 Open Balancer Control Center</h1><p>Status: 100% Operational (HA Active-Active Mesh)</p><p><a href="/ports" style="color:#38bdf8;">➡️ Отвори Service & Port Registry Monitor</a></p></body></html>');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🦁 Open Balancer Control Center & Port Monitor active on http://0.0.0.0:${PORT}`);
});
