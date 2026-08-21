import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORMS = [
  {
    category: 'Browser Automation',
    items: [
      {
        name: 'Airtop',
        role: 'Primary browser automation for Wallester signups',
        status: 'active',
        integration: 'n8n + Supabase',
        url: 'https://airtop.ai',
        features: ['Cloud browsers', 'AI prompts', 'Session management', 'Proxy support'],
        usedFor: ['Wallester signup flow', 'Form filling', 'Email verification clicks'],
        priority: 1,
      },
      {
        name: 'BitBrowser',
        role: 'Anti-detect browser for multi-account management',
        status: 'planned',
        integration: 'Manual + API',
        url: 'https://www.bitbrowser.net',
        features: ['Fingerprint masking', 'Profile management', 'Proxy per profile', 'Cookie import'],
        usedFor: ['Account purchasing verification', 'Multi-profile sessions', 'Social media accounts'],
        priority: 2,
      },
      {
        name: 'Automa',
        role: 'Chrome extension for simple automations',
        status: 'standby',
        integration: 'Browser extension',
        features: ['Visual workflow builder', 'No-code', 'Lightweight', 'Free'],
        usedFor: ['Quick scraping', 'Form auto-fill', 'Simple repeating tasks'],
        priority: 3,
      },
      {
        name: 'Browser Use',
        role: 'AI-powered browser automation framework',
        status: 'evaluated',
        integration: 'Python SDK',
        url: 'https://browser-use.com',
        features: ['LLM-driven', 'Vision-based', 'Python native', 'Open source'],
        usedFor: ['Complex navigation', 'AI-guided interactions'],
        priority: 3,
      },
      {
        name: 'Stagehand',
        role: 'Web interaction framework by Browserbase',
        status: 'evaluated',
        integration: 'SDK',
        features: ['Act/Extract/Observe', 'Vision + DOM', 'TypeScript'],
        usedFor: ['Structured data extraction', 'Complex web tasks'],
        priority: 3,
      },
    ],
  },
  {
    category: 'Workflow Orchestration',
    items: [
      {
        name: 'n8n',
        role: 'Central workflow orchestrator',
        status: 'active',
        integration: 'Self-hosted on Hostinger VPS',
        url: 'https://n8n.io',
        features: ['Visual workflows', 'Webhook triggers', 'HTTP nodes', '400+ integrations'],
        usedFor: ['Lifecycle state machine', 'SMS/Email monitoring', 'Airtop orchestration', 'Notifications'],
        priority: 1,
      },
      {
        name: 'Make (Integromat)',
        role: 'Alternative workflow tool',
        status: 'not_used',
        features: ['Visual', 'Cloud-hosted', 'Good for simple flows'],
        usedFor: [],
        priority: 4,
      },
    ],
  },
  {
    category: 'Database & Backend',
    items: [
      {
        name: 'Supabase',
        role: 'Primary database and auth',
        status: 'active',
        integration: 'PostgreSQL + REST API + Realtime',
        url: 'https://supabase.com',
        features: ['PostgreSQL', 'Row Level Security', 'Edge Functions', 'Realtime subscriptions', 'Storage'],
        usedFor: ['All data storage', 'RLS policies', 'RPC functions', 'Webhook triggers via pg_net'],
        priority: 1,
      },
      {
        name: 'Netlify Functions',
        role: 'Serverless API endpoints',
        status: 'active',
        integration: 'Netlify deployment',
        features: ['Serverless', 'Auto-deploy', 'Edge network'],
        usedFor: ['Public eligibility API', 'Signup triggers', 'Status checks'],
        priority: 2,
      },
    ],
  },
  {
    category: 'Communication',
    items: [
      {
        name: 'Telegram Bot',
        role: 'Admin notifications and alerts',
        status: 'active',
        integration: 'Bot API via server route',
        features: ['Real-time alerts', 'Structured messages', 'Daily summaries'],
        usedFor: ['Payout approvals', 'Error alerts', 'Status updates', 'Daily reports'],
        priority: 1,
      },
      {
        name: 'smstome / Fanytel',
        role: 'SMS verification code reception',
        status: 'active',
        integration: 'n8n HTTP polling',
        features: ['Bulgarian numbers', 'API access', 'Affordable'],
        usedFor: ['Wallester SMS verification', 'Phone number verification'],
        priority: 1,
      },
      {
        name: 'IMAP (workmail.pro)',
        role: 'Email monitoring',
        status: 'active',
        integration: 'n8n IMAP trigger',
        features: ['Real-time email reading', 'AI classification', 'Link extraction'],
        usedFor: ['Wallester email verification', 'Contract notifications', 'Status emails'],
        priority: 1,
      },
    ],
  },
  {
    category: 'AI & LLM',
    items: [
      {
        name: 'Claude (Anthropic)',
        role: 'Primary AI for code and analysis',
        status: 'active',
        integration: 'API + Claude Code CLI',
        features: ['Code generation', 'Analysis', 'Long context', 'Tool use'],
        usedFor: ['Development', 'Email classification', 'Data analysis'],
        priority: 1,
      },
      {
        name: 'OpenAI GPT',
        role: 'AI for creatives and chat',
        status: 'active',
        integration: 'API',
        features: ['GPT-4', 'DALL-E', 'Assistants API'],
        usedFor: ['Ad copy generation', 'Chat responses', 'Image prompts'],
        priority: 2,
      },
      {
        name: 'Tryholo',
        role: 'AI video/creative generation',
        status: 'planned',
        integration: 'API',
        features: ['AI video ads', 'Template-based', 'Auto-generation'],
        usedFor: ['Ad creatives', 'Social media content'],
        priority: 3,
      },
    ],
  },
  {
    category: 'Mobile & Device',
    items: [
      {
        name: 'Duoplus / vsphone',
        role: 'Virtual phone for mobile verifications',
        status: 'evaluated',
        features: ['Cloud phone', 'Android emulation', 'Remote control'],
        usedFor: ['App-based verifications', 'Mobile number management'],
        priority: 3,
      },
      {
        name: 'Meta Quest 3',
        role: 'VR visualization of complex systems',
        status: 'planned',
        features: ['3D visualization', 'Immersive workspace', 'Spatial computing'],
        usedFor: ['System architecture visualization', 'Focus sessions'],
        priority: 4,
      },
    ],
  },
  {
    category: 'Hosting & Infrastructure',
    items: [
      {
        name: 'Hostinger VPS',
        role: 'Primary server infrastructure',
        status: 'active',
        integration: 'SSH + API',
        features: ['KVM VPS', 'Ubuntu', 'Full root access', 'Affordable'],
        usedFor: ['n8n hosting', 'Backend services', 'Proxy management'],
        priority: 1,
      },
      {
        name: 'Hostinger Horizon',
        role: 'AI website builder',
        status: 'planned',
        integration: 'Web UI + API',
        features: ['AI-generated sites', 'Quick deployment', 'Templates'],
        usedFor: ['Landing pages', 'Marketing sites', 'wallesters.com'],
        priority: 2,
      },
      {
        name: 'Netlify',
        role: 'Frontend hosting + functions',
        status: 'active',
        integration: 'Git deploy',
        features: ['CDN', 'Auto-deploy', 'Functions', 'Forms'],
        usedFor: ['Wallestars dashboard hosting', 'API functions'],
        priority: 1,
      },
    ],
  },
  {
    category: 'Ads & Marketing',
    items: [
      {
        name: 'Meta Ads (FB/IG)',
        role: 'Primary ad platform',
        status: 'planned',
        features: ['Targeting', 'Pixel tracking', 'Lookalike audiences'],
        usedFor: ['Lead generation', 'Wallester promotion'],
        priority: 2,
      },
      {
        name: 'Google Ads',
        role: 'Search and display ads',
        status: 'planned',
        features: ['Search ads', 'Display network', 'YouTube'],
        usedFor: ['Intent-based leads', 'Brand awareness'],
        priority: 2,
      },
    ],
  },
];

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400',
  planned: 'bg-blue-500/20 text-blue-400',
  evaluated: 'bg-yellow-500/20 text-yellow-400',
  standby: 'bg-gray-500/20 text-gray-400',
  not_used: 'bg-red-500/20 text-red-400',
};

function PlatformCatalog() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const allItems = PLATFORMS.flatMap(cat =>
    cat.items.map(item => ({ ...item, category: cat.category }))
  );

  const filteredPlatforms = PLATFORMS.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase()) ||
        (item.usedFor || []).some(u => u.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchStatus;
    }),
  })).filter(cat => cat.items.length > 0);

  const stats = {
    total: allItems.length,
    active: allItems.filter(i => i.status === 'active').length,
    planned: allItems.filter(i => i.status === 'planned').length,
    evaluated: allItems.filter(i => i.status === 'evaluated').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Catalog</h1>
          <p className="text-gray-400 mt-1">
            Каталог на всички платформи, инструменти и интеграции
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
          Задачи 7, 12, 28
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Active', value: stats.active, color: 'text-green-400' },
          { label: 'Planned', value: stats.planned, color: 'text-blue-400' },
          { label: 'Evaluated', value: stats.evaluated, color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Търси платформа..."
          className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-300"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="evaluated">Evaluated</option>
          <option value="standby">Standby</option>
        </select>
      </div>

      {/* Categories */}
      {filteredPlatforms.map((cat, ci) => (
        <motion.div
          key={cat.category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.05 }}
          className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-700/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-white">{cat.category}</h2>
              <span className="text-gray-500 text-sm">({cat.items.length})</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === cat.category ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {(expandedCategory === cat.category || expandedCategory === null) && (
              <motion.div
                initial={expandedCategory !== null ? { height: 0, opacity: 0 } : false}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-dark-700"
              >
                <div className="p-4 grid gap-4 md:grid-cols-2">
                  {cat.items.map((item) => (
                    <div key={item.name} className="bg-dark-700/30 border border-dark-600/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-medium">{item.name}</h3>
                          <p className="text-gray-400 text-sm mt-0.5">{item.role}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || STATUS_COLORS.standby}`}>
                          {item.status}
                        </span>
                      </div>

                      {item.integration && (
                        <p className="text-xs text-gray-500">
                          Integration: <span className="text-gray-400">{item.integration}</span>
                        </p>
                      )}

                      {item.features && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.features.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 bg-dark-800/80 text-gray-400 text-xs rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.usedFor && item.usedFor.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Used for:</p>
                          <ul className="space-y-0.5">
                            {item.usedFor.map((u, i) => (
                              <li key={i} className="text-xs text-gray-400 flex items-center space-x-1.5">
                                <span className="w-1 h-1 bg-primary-500 rounded-full"></span>
                                <span>{u}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default PlatformCatalog;
