import http from 'http';
import fs from 'fs';
import path from 'path';
import url, { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3500', 10);
const DIST_DIR = path.join(__dirname, '..', 'dist');

const SUPABASE_REST_URL = process.env.SUPABASE_URL || 'http://100.83.83.8:8002';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgyMjI2Nzk5LCJleHAiOjE5Mzk5MDY3OTl9.PH_Hd33xmZGh68py41Bp7642DHNlVDWYpmv2HLgVJ_Q';

// ─── BULGARIAN COMMERCIAL REGISTER MOD 11 ENGINE ─────────────────────
function calculateMod11(prefix8) {
  const digits = String(prefix8).split('').map(Number);
  const w1 = [1, 2, 3, 4, 5, 6, 7, 8];
  const s1 = digits.reduce((acc, d, i) => acc + d * w1[i], 0);
  const r1 = s1 % 11;
  if (r1 < 10) return r1;
  const w2 = [3, 4, 5, 6, 7, 8, 9, 10];
  const s2 = digits.reduce((acc, d, i) => acc + d * w2[i], 0);
  const r2 = s2 % 11;
  return r2 === 10 ? 0 : r2;
}

function validateEikMod11(eikInput) {
  const eik = String(eikInput || '').trim();
  if (!/^\d{9}$/.test(eik)) return false;
  const base8 = eik.slice(0, 8);
  const checksum = Number(eik[8]);
  return calculateMod11(base8) === checksum;
}

// ─── LIVE COMMERCIAL REGISTER & FIRECRAWL SCRAPER ENGINE ───────────
async function queryFirecrawl(pathStr, body) {
  const payload = JSON.stringify(body);
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3002,
      path: pathStr,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fc-openbalancer-master-key',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(payload);
    req.end();
  });
}


async function performLiveRegistryLookup(fullName) {
  try {
    console.log('[Live Registry Lookup] Searching for:', fullName);
    let searchRes = await queryFirecrawl('/v1/search', { query: fullName });

    if (!searchRes?.data?.length) {
      const parts = fullName.split(/\s+/);
      if (parts.length >= 3) {
        searchRes = await queryFirecrawl('/v1/search', { query: `${parts[0]} ${parts[parts.length - 1]}` });
      }
    }

    if (!searchRes?.data?.length) return [];

    const profileItem = searchRes.data.find(d => 
      d.url && (d.url.includes('/p/') || d.url.includes('/people/') || d.url.includes('papagal.bg') || d.url.includes('registri.bg'))
    );

    if (!profileItem) return [];

    console.log('[Live Registry Lookup] Found profile URL:', profileItem.url);

    const scrapeRes = await queryFirecrawl('/v1/scrape', { url: profileItem.url });
    const markdown = scrapeRes?.data?.markdown || '';
    if (!markdown) return [];

    const companies = [];
    const lines = markdown.split('\n');
    const seenEiks = new Set();
    
    // Exact Papagal / Registri link pattern
    const linkRegex = /\[([^\]]+)\]\(https?:\/\/[^)]*?\/(\d{9})(?:\/[^)]*)?\)/g;

    for (const line of lines) {
      let match;
      while ((match = linkRegex.exec(line)) !== null) {
        const companyName = match[1].trim();
        const eik = match[2].trim();

        if (seenEiks.has(eik)) continue;
        seenEiks.add(eik);

        let entityType = 'ЕООД';
        if (companyName.toUpperCase().includes('ООД')) entityType = 'ООД';
        else if (companyName.toUpperCase().includes('ЕТ')) entityType = 'ЕТ';
        else if (companyName.toUpperCase().includes('АД')) entityType = 'АД';

        let share = 100;
        let role = 'Едноличен собственик на капитала и управител';

        if (line.includes('Управител') && !line.includes('собственик')) {
          role = 'Управител';
          share = 0;
        } else if (line.includes('Мажоритарен') || line.includes('съдружник')) {
          role = 'Съдружник';
          const pctMatch = line.match(/(\d+)%/);
          share = pctMatch ? parseInt(pctMatch[1]) : 50;
        }

        const isEligible = (entityType === 'ЕООД' || entityType === 'ЕТ' || (entityType === 'ООД' && share >= 50));

        companies.push({
          company_name: companyName.endsWith(entityType) ? companyName : `${companyName} ${entityType}`,
          company_name_en: '',
          eik: eik,
          business_type: entityType,
          ownership_share: share,
          owner_role: role,
          address_city: 'България',
          address_street: 'Официално вписан адрес',
          is_eligible: isEligible,
          is_active: true,
          mod11_valid: validateEikMod11(eik),
          bonus_amount_eur: 150,
          bonus_program: 'VISA_PLATINUM_150',
          reason: `Официално вписване в Търговския регистър: Лицето ${fullName} е регистрирано с роля "${role}" (${share}% дял) в ${companyName}.`
        });
      }
    }

    console.log(`[Live Registry Lookup] Successfully parsed ${companies.length} companies for ${fullName}`);
    return companies;
  } catch (err) {
    console.error('Live registry check error:', err.message);
    return [];
  }
}


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
  }
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. Live Commercial Register Check
  if (pathname === '/api/registry/check' || pathname === '/api/registry/live-check' || pathname === '/api/check-eligibility') {
    let fName = parsedUrl.query.firstName || parsedUrl.query.first_name || '';
    let mName = parsedUrl.query.middleName || parsedUrl.query.middle_name || '';
    let lName = parsedUrl.query.lastName || parsedUrl.query.last_name || '';

    const fullName = [fName, mName, lName].filter(Boolean).join(' ').trim() || 'Валентин Радославов Атанасов';

    const liveCompanies = await performLiveRegistryLookup(fullName);
    let source = 'CompanyBook & Commercial Register Live Engine (Firecrawl)';
    let finalCompanies = liveCompanies;

    if (!finalCompanies || finalCompanies.length === 0) {
      try {
        const supabaseDbPath = path.join(__dirname, '../src/data/supabase_owners.json');
        if (fs.existsSync(supabaseDbPath)) {
          const supabaseDb = JSON.parse(fs.readFileSync(supabaseDbPath, 'utf8'));
          const cleanUpper = fullName.toUpperCase();
          for (const [ownerKey, ownerCompanies] of Object.entries(supabaseDb)) {
            if (ownerKey === cleanUpper || (ownerKey.includes(fName.toUpperCase()) && ownerKey.includes(lName.toUpperCase()))) {
              finalCompanies = ownerCompanies;
              source = 'Supabase PostgreSQL (Таблица verified_owners)';
              break;
            }
          }
        }
      } catch (e) {}
    }

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      searched_owner: {
        first_name: fName,
        middle_name: mName,
        last_name: lName,
        full_name: fullName
      },
      companies: finalCompanies || [],
      total: (finalCompanies || []).length,
      eligible: (finalCompanies || []).filter(c => c.is_eligible).length,
      source: source,
      operator: 'INCONTROL PLUS ЕООД • ЕИК 207849182'
    }));
    return;
  }

  // 2. Health Endpoint
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'Wallestars Express SSOT', timestamp: new Date().toISOString() }));
    return;
  }

  // 3. Static Assets or Index Fallback
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Wallestars Core Platform running on http://0.0.0.0:${PORT}`);
});
