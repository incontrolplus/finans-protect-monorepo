import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Animated Counter Hook ──
function useAnimatedCounter(target, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [value, ref];
}

// ── Data ──
const HERO_STATS = [
  { label: 'Pages', value: 33, color: 'from-blue-400 to-blue-600' },
  { label: 'Migrations', value: 7, color: 'from-green-400 to-green-600' },
  { label: 'Routes', value: 25, color: 'from-purple-400 to-purple-600' },
  { label: 'Workflows', value: 8, color: 'from-orange-400 to-orange-600' },
  { label: 'Landing Components', value: 6, color: 'from-pink-400 to-pink-600' },
];

const ARCHITECTURE_NODES = [
  { id: 'companybook', label: 'CompanyBook', desc: 'Source of company data and owner profiles. Provides the initial dataset of potential cardholders.', status: 'active', x: 0 },
  { id: 'eligibility', label: 'Eligibility Check', desc: 'Validates company data against Wallester requirements: jurisdiction, status, UBO structure, document availability.', status: 'active', x: 1 },
  { id: 'supabase', label: 'Supabase DB', desc: '7 migration files covering owners, cards, credentials, action logs, payout queue, and verification tracking.', status: 'active', x: 2 },
  { id: 'n8n', label: 'n8n Orchestration', desc: '8 workflows: signup, verification, KYC, card ordering, payout processing, status polling, error recovery, daily summary.', status: 'active', x: 3 },
  { id: 'airtop', label: 'Airtop Browser', desc: 'Headless browser automation for Wallester portal interactions. Handles form filling, document uploads, CAPTCHA solving.', status: 'configured', x: 4 },
  { id: 'wallester', label: 'Wallester API', desc: 'REST API integration for card management, balance queries, transaction history, and payout initiation.', status: 'active', x: 5 },
];

const STATUS_COLORS = {
  active: 'bg-green-500',
  configured: 'bg-blue-500',
  pending: 'bg-yellow-500',
};

const CATEGORY_TABS = ['Database', 'Backend', 'Frontend', 'Workflows', 'Infrastructure'];

const CHANGES_BY_CATEGORY = {
  Database: [
    { title: '001_owners.sql', desc: 'Core owners table with company data, eligibility status, and Wallester account references', path: 'supabase/migrations/001_owners.sql', impact: 'new' },
    { title: '002_cards.sql', desc: 'Card lifecycle tracking — ordering, activation, limits, expiry, and linked owner FK', path: 'supabase/migrations/002_cards.sql', impact: 'new' },
    { title: '003_credentials.sql', desc: 'Encrypted credential vault for portal logins, API keys, and session tokens', path: 'supabase/migrations/003_credentials.sql', impact: 'new' },
    { title: '004_action_log.sql', desc: 'Immutable audit trail for every status change, payout, and admin action', path: 'supabase/migrations/004_action_log.sql', impact: 'new' },
    { title: '005_payout_queue.sql', desc: 'Queued payout processing with amount, currency, status, and retry tracking', path: 'supabase/migrations/005_payout_queue.sql', impact: 'new' },
    { title: '006_verification.sql', desc: 'Email/SMS verification pipeline with code generation, expiry, and attempt limits', path: 'supabase/migrations/006_verification.sql', impact: 'new' },
    { title: '007_partners.sql', desc: 'Partner and alternative offer tracking with commission rates and conversion data', path: 'supabase/migrations/007_partners.sql', impact: 'new' },
  ],
  Backend: [
    { title: 'Express API Server', desc: 'Full REST API with 25 route endpoints covering CRUD, status transitions, and batch operations', path: 'server/index.js', impact: 'enhanced' },
    { title: 'Supabase Client', desc: 'Server-side Supabase client with service role key for privileged operations', path: 'server/supabaseClient.js', impact: 'new' },
    { title: 'Payout Controller', desc: 'Rate-limited payout processing with daily limits, admin approval, and audit logging', path: 'server/routes/payouts.js', impact: 'new' },
    { title: 'Owner Routes', desc: 'Owner CRUD with status workflow: eligible → signup → verified → active → payout', path: 'server/routes/owners.js', impact: 'new' },
    { title: 'Card Management', desc: 'Card ordering, activation, limit adjustment, and balance query endpoints', path: 'server/routes/cards.js', impact: 'new' },
    { title: 'Wallester API Integration', desc: 'Direct Wallester API client for card operations and account management', path: 'server/wallesterClient.js', impact: 'new' },
  ],
  Frontend: [
    { title: 'Wallester Dashboard', desc: 'Central overview with owner stats, pipeline funnel, recent activity, and quick actions', path: 'src/pages/WallesterDashboard.jsx', impact: 'new' },
    { title: 'Eligibility Checker', desc: 'Interactive form to validate company data against Wallester requirements', path: 'src/pages/EligibilityChecker.jsx', impact: 'new' },
    { title: 'Signup Flow', desc: 'Multi-step wizard for Wallester account creation with progress tracking', path: 'src/pages/SignupFlow.jsx', impact: 'new' },
    { title: 'Verification Pipeline', desc: 'Email/SMS verification tracking with retry logic and status visualization', path: 'src/pages/VerificationPipeline.jsx', impact: 'new' },
    { title: 'Admin Payouts', desc: 'Payout queue management with approval workflow and batch processing', path: 'src/pages/AdminPayouts.jsx', impact: 'new' },
    { title: 'Credential Vault', desc: 'Secure credential management with masking, rotation alerts, and access logging', path: 'src/pages/CredentialVault.jsx', impact: 'new' },
    { title: 'Owner Detail', desc: 'Deep-dive owner profile with timeline, documents, cards, and action history', path: 'src/pages/OwnerDetail.jsx', impact: 'new' },
    { title: 'Alternative Offers', desc: 'Partner offer management with comparison matrix and conversion tracking', path: 'src/pages/AlternativeOffers.jsx', impact: 'new' },
    { title: 'Action Log', desc: 'Filterable audit log with actor, action type, timestamp, and diff viewer', path: 'src/pages/ActionLog.jsx', impact: 'new' },
    { title: 'Partner Management', desc: 'Partner CRUD with commission tracking and performance analytics', path: 'src/pages/PartnerManagement.jsx', impact: 'new' },
    { title: 'Wallester API & Cards', desc: 'Direct API testing interface and card management dashboard', path: 'src/pages/WallesterAPI.jsx', impact: 'new' },
    { title: 'System Config', desc: 'Runtime configuration for limits, thresholds, feature flags, and notifications', path: 'src/pages/SystemConfig.jsx', impact: 'new' },
    { title: 'Landing Page', desc: 'Public-facing marketing page with hero, features, testimonials, and CTA sections', path: 'src/pages/LandingPage.jsx', impact: 'new' },
    { title: 'AI Creatives', desc: 'AI-powered ad creative generation with templates and A/B testing', path: 'src/pages/AICreatives.jsx', impact: 'new' },
    { title: 'Social Automation', desc: 'Social media scheduling and automation with multi-platform support', path: 'src/pages/SocialAutomation.jsx', impact: 'new' },
    { title: 'Security Dashboard', desc: 'Security checklist, vulnerability scanning, and compliance tracking', path: 'src/pages/SecurityDashboard.jsx', impact: 'new' },
    { title: 'Sidebar Navigation', desc: 'Grouped sidebar with Wallester, Marketing, AI Tools, Infrastructure sections', path: 'src/components/Sidebar.jsx', impact: 'enhanced' },
    { title: 'App Router', desc: 'Central page registry with 33 page entries and animated transitions', path: 'src/App.jsx', impact: 'enhanced' },
  ],
  Workflows: [
    { title: 'Signup Automation', desc: 'Automated Wallester account creation via Airtop browser with form filling and document upload', path: 'n8n/workflows/signup.json', impact: 'new' },
    { title: 'Verification Handler', desc: 'Email/SMS verification code extraction and submission pipeline', path: 'n8n/workflows/verification.json', impact: 'new' },
    { title: 'KYC Processing', desc: 'Know Your Customer document collection, validation, and submission workflow', path: 'n8n/workflows/kyc.json', impact: 'new' },
    { title: 'Card Ordering', desc: 'Automated card ordering with type selection, limit configuration, and shipping', path: 'n8n/workflows/card-order.json', impact: 'new' },
    { title: 'Payout Processing', desc: 'Batch payout execution with balance checks, rate limiting, and confirmation', path: 'n8n/workflows/payouts.json', impact: 'new' },
    { title: 'Status Polling', desc: 'Periodic status checks for pending applications, verifications, and card deliveries', path: 'n8n/workflows/polling.json', impact: 'new' },
    { title: 'Error Recovery', desc: 'Automated retry logic for failed operations with exponential backoff and alerts', path: 'n8n/workflows/error-recovery.json', impact: 'new' },
    { title: 'Daily Summary', desc: 'Daily Telegram report with pipeline stats, errors, payouts, and health checks', path: 'n8n/workflows/daily-summary.json', impact: 'new' },
  ],
  Infrastructure: [
    { title: 'Supabase Project', desc: 'PostgreSQL database with RLS policies, real-time subscriptions, and storage buckets', path: 'supabase/', impact: 'new' },
    { title: 'n8n Instance', desc: 'Self-hosted n8n on Hostinger VPS with 8 active workflows and webhook endpoints', path: 'docker/n8n/', impact: 'new' },
    { title: 'Airtop Config', desc: 'Browser automation profiles with proxy rotation, session management, and CAPTCHA solving', path: 'config/airtop.json', impact: 'new' },
    { title: 'Vite + React', desc: 'Frontend build with Tailwind CSS, Framer Motion, and 33 page components', path: 'vite.config.js', impact: 'enhanced' },
    { title: 'Environment Config', desc: 'Multi-environment configuration for dev, staging, and production', path: '.env.example', impact: 'new' },
    { title: 'Docker Compose', desc: 'Container orchestration for n8n, Express server, and supporting services', path: 'docker-compose.yml', impact: 'new' },
  ],
};

const IMPACT_BADGES = {
  new: { label: 'New', cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  modified: { label: 'Modified', cls: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  enhanced: { label: 'Enhanced', cls: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
};

const TIMELINE_ENTRIES = [
  { date: 'Phase 1', category: 'Database', title: 'Database Schema Design', files: 7, desc: 'Created 7 migration files covering owners, cards, credentials, action logs, payouts, verification, and partners.' },
  { date: 'Phase 1', category: 'Backend', title: 'Express API Setup', files: 6, desc: 'Built REST API server with 25 endpoints for CRUD operations, status transitions, and batch processing.' },
  { date: 'Phase 2', category: 'Frontend', title: 'Core Wallester Pages', files: 11, desc: 'Built Dashboard, Eligibility, Signup, Verification, Payouts, Vault, Owner Detail, Alternatives, Action Log, Partners, API & Cards.' },
  { date: 'Phase 2', category: 'Frontend', title: 'Navigation & Routing', files: 2, desc: 'Updated Sidebar with grouped navigation and App.jsx with 33 page entries and animated transitions.' },
  { date: 'Phase 3', category: 'Workflows', title: 'n8n Automation Pipeline', files: 8, desc: 'Created 8 workflows: signup, verification, KYC, card ordering, payouts, polling, error recovery, daily summary.' },
  { date: 'Phase 3', category: 'Infrastructure', title: 'Airtop Browser Automation', files: 1, desc: 'Configured headless browser profiles with proxy rotation, session management, and CAPTCHA handling.' },
  { date: 'Phase 4', category: 'Frontend', title: 'Marketing & Landing', files: 4, desc: 'Built Landing Page with 6 sections, AI Creatives, Social Automation, and Currency Converter.' },
  { date: 'Phase 4', category: 'Frontend', title: 'Security & Config', files: 2, desc: 'Added Security Dashboard with checklist and System Config for runtime settings.' },
  { date: 'Phase 5', category: 'Frontend', title: 'Personal Development', files: 1, desc: 'Added habit tracker, journal, fitness plan, and mentor tracking page.' },
  { date: 'Phase 5', category: 'Frontend', title: 'Project Changelog', files: 1, desc: 'Interactive changelog with animated counters, architecture diagram, timeline, and impact visualization.' },
];

const BEFORE_AFTER = [
  { before: '0 migrations', after: '7 migrations covering full lifecycle', icon: '🗄️' },
  { before: 'No Wallester pages', after: '11 dedicated Wallester pages', icon: '📄' },
  { before: 'No automation', after: '8 n8n workflows with full pipeline', icon: '⚙️' },
  { before: 'Flat sidebar', after: 'Grouped sidebar with 5 categories', icon: '📁' },
  { before: 'No API layer', after: '25 REST endpoints with auth & limits', icon: '🔌' },
  { before: 'No landing page', after: '6-section marketing landing page', icon: '🏠' },
];

const FILE_MAP = [
  { dir: 'supabase/migrations/', files: ['001_owners.sql', '002_cards.sql', '003_credentials.sql', '004_action_log.sql', '005_payout_queue.sql', '006_verification.sql', '007_partners.sql'], type: 'new' },
  { dir: 'server/', files: ['index.js', 'supabaseClient.js', 'wallesterClient.js', 'routes/owners.js', 'routes/cards.js', 'routes/payouts.js'], type: 'new' },
  { dir: 'src/pages/', files: ['WallesterDashboard.jsx', 'EligibilityChecker.jsx', 'SignupFlow.jsx', 'VerificationPipeline.jsx', 'AdminPayouts.jsx', 'CredentialVault.jsx', 'OwnerDetail.jsx', 'AlternativeOffers.jsx', 'ActionLog.jsx', 'PartnerManagement.jsx', 'WallesterAPI.jsx', 'SystemConfig.jsx', 'LandingPage.jsx', 'AICreatives.jsx', 'SocialAutomation.jsx', 'SecurityDashboard.jsx', 'PersonalDev.jsx', 'ProjectChangelog.jsx'], type: 'new' },
  { dir: 'src/components/', files: ['Sidebar.jsx'], type: 'modified' },
  { dir: 'src/', files: ['App.jsx'], type: 'modified' },
  { dir: 'n8n/workflows/', files: ['signup.json', 'verification.json', 'kyc.json', 'card-order.json', 'payouts.json', 'polling.json', 'error-recovery.json', 'daily-summary.json'], type: 'new' },
  { dir: 'config/', files: ['airtop.json', '.env.example'], type: 'new' },
  { dir: 'docker/', files: ['docker-compose.yml', 'n8n/'], type: 'new' },
];

const TYPE_COLORS = { new: 'text-green-400', modified: 'text-blue-400', existing: 'text-dark-400' };

const CATEGORY_COLORS = {
  Database: 'bg-green-500/20 text-green-400',
  Backend: 'bg-blue-500/20 text-blue-400',
  Frontend: 'bg-purple-500/20 text-purple-400',
  Workflows: 'bg-orange-500/20 text-orange-400',
  Infrastructure: 'bg-cyan-500/20 text-cyan-400',
};

// ── Sub-components ──

function StatCard({ stat, index }) {
  const [value, ref] = useAnimatedCounter(stat.value);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 text-center relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
      <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-dark-400 text-sm mt-1">{stat.label}</div>
    </motion.div>
  );
}

function ArchitectureNode({ node, isExpanded, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.12 }}
      className="flex flex-col items-center"
    >
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={`relative bg-dark-800/70 border rounded-xl px-5 py-4 text-center cursor-pointer transition-all ${isExpanded ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-dark-700 hover:border-dark-500'
          }`}
      >
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${STATUS_COLORS[node.status]}`} />
        <div className="text-sm font-semibold text-white">{node.label}</div>
        <div className="text-xs text-dark-400 mt-0.5 capitalize">{node.status}</div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-dark-800/80 border border-dark-700 rounded-lg p-3 max-w-[220px] text-xs text-dark-300 leading-relaxed"
          >
            {node.desc}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChangeCard({ change, index }) {
  const [expanded, setExpanded] = useState(false);
  const badge = IMPACT_BADGES[change.impact];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 hover:border-dark-500 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-white">{change.title}</h4>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
      <p className="text-xs text-dark-400 mt-1.5 leading-relaxed">{change.desc}</p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[11px] text-primary-400 hover:text-primary-300 mt-2 flex items-center gap-1"
      >
        <span className="font-mono">{expanded ? '▾' : '▸'}</span> {change.path}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-dark-900/50 border border-dark-700 rounded-lg p-3 text-xs text-dark-300 font-mono"
          >
            <span className="text-dark-500">// </span>{change.path}<br />
            <span className="text-green-400">+ {change.desc}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TimelineEntry({ entry, index }) {
  const [expanded, setExpanded] = useState(false);
  const entryRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (entryRef.current) observer.observe(entryRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={entryRef} className="relative pl-8">
      {/* Line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-dark-700" />
      {/* Dot */}
      <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 transition-colors ${visible ? 'bg-primary-500 border-primary-400' : 'bg-dark-700 border-dark-600'
        }`} />
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={visible ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: index * 0.08 }}
        className="pb-6"
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left bg-dark-800/50 border border-dark-700 rounded-xl p-4 hover:border-dark-500 transition-all"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-dark-500">{entry.date}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[entry.category]}`}>
              {entry.category}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white mt-1">{entry.title}</h4>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-dark-400">
            <span>{entry.files} file{entry.files > 1 ? 's' : ''} affected</span>
            <span className="font-mono">{expanded ? '▾' : '▸'}</span>
          </div>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-4 mt-2 bg-dark-900/50 border border-dark-700 rounded-lg p-3 text-xs text-dark-300 leading-relaxed"
            >
              {entry.desc}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function BeforeAfterCard({ item, index }) {
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAfter(true), 800 + index * 300);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setShowAfter(!showAfter)}
      className="bg-dark-800/50 border border-dark-700 rounded-xl p-5 cursor-pointer hover:border-dark-500 transition-all relative overflow-hidden"
    >
      <div className="text-2xl mb-3">{item.icon}</div>
      <AnimatePresence mode="wait">
        {!showAfter ? (
          <motion.div
            key="before"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-medium text-red-400/80 uppercase tracking-wider mb-1">Before</div>
            <div className="text-sm text-dark-300">{item.before}</div>
          </motion.div>
        ) : (
          <motion.div
            key="after"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-medium text-green-400/80 uppercase tracking-wider mb-1">After</div>
            <div className="text-sm text-white font-medium">{item.after}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-2 right-3 text-[10px] text-dark-500">click to toggle</div>
    </motion.div>
  );
}

function FileMapGroup({ group, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-dark-300">📁 {group.dir}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${group.type === 'new' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
            {group.files.length} {group.type}
          </span>
        </div>
        <span className="text-dark-500 text-sm font-mono">{expanded ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-dark-700 p-3 space-y-1">
              {group.files.map((file, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs font-mono px-2 py-1 rounded ${TYPE_COLORS[group.type]}`}>
                  <span>{group.type === 'new' ? '+' : '~'}</span>
                  <span>{file}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ──

export default function ProjectChangelog() {
  const [activeTab, setActiveTab] = useState('Database');
  const [expandedNode, setExpandedNode] = useState(null);
  const completionPercent = 96.8;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Project Changelog
        </h1>
        <p className="text-dark-400 mt-2 text-sm">Interactive overview of all changes made to the Wallestars platform</p>
      </motion.div>

      {/* ─── Section 1: Hero Stats ─── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {HERO_STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
        {/* Active Tasks & Detailed Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Overall Progress & Velocity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Overall Completion</span>
              <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {completionPercent}%
              </span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </motion.div>
            </div>
            <div className="flex justify-between items-center text-xs text-dark-400 border-t border-dark-700/50 pt-3">
              <span>30 of 31 planned tasks completed</span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span>⏱ Predicted completion:</span>
                <span className="font-medium text-white">Mar 10, 2026</span>
              </span>
            </div>

            {/* Category Progress */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3">Progress by Category</h4>
              {[
                { name: 'Core Infrastructure', progress: 100, color: 'bg-green-500' },
                { name: 'Wallester Integrations', progress: 100, color: 'bg-blue-500' },
                { name: 'Marketing / Landing', progress: 100, color: 'bg-purple-500' },
                { name: 'Automation Workflows', progress: 90, color: 'bg-orange-500' },
                { name: 'OpenClaw System', progress: 85, color: 'bg-emerald-500' }
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-32 truncate text-dark-300">{cat.name}</span>
                  <div className="flex-1 bg-dark-700 rounded-full h-1.5">
                    <div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.progress}%` }} />
                  </div>
                  <span className="w-8 text-right text-dark-400 font-mono">{cat.progress}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Tasks list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-5"
          >
            <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Active Tasks (Velocity: 2.4/week)
            </h4>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {[
                { tag: 'Bug', title: 'Calendar year 2025 hardcoded text', status: 'In Progress' },
                { tag: 'Feature', title: 'Hostinger VPS Real-time dashboard', status: 'Pending' },
                { tag: 'Feature', title: 'Auto-Response Rules & n8n hooks', status: 'Pending' },
                { tag: 'Docs', title: 'Compile Final Completion Protocol', status: 'Blocked' },
              ].map((task, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg border border-dark-700 bg-dark-900/30">
                  <div className="flex flex-col gap-1.5">
                    <span className={`text-[10px] w-max font-semibold px-2 py-0.5 rounded-full ${task.tag === 'Bug' ? 'bg-red-500/20 text-red-500' :
                        task.tag === 'Docs' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                      {task.tag}
                    </span>
                    <span className="text-sm text-dark-200">{task.title}</span>
                  </div>
                  <span className={`text-xs ml-2 mt-1 ${task.status === 'In Progress' ? 'text-primary-400 font-medium' :
                      task.status === 'Blocked' ? 'text-dark-500' : 'text-dark-400'
                    }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 2: Architecture Diagram ─── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary-500 rounded-full" />
          Architecture Flow
        </h2>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 overflow-x-auto">
          <div className="flex items-start gap-3 min-w-[900px]">
            {ARCHITECTURE_NODES.map((node, i) => (
              <React.Fragment key={node.id}>
                <ArchitectureNode
                  node={node}
                  isExpanded={expandedNode === node.id}
                  onToggle={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                  index={i}
                />
                {i < ARCHITECTURE_NODES.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    className="flex items-center self-center mt-[-16px]"
                  >
                    <div className="w-8 h-px bg-gradient-to-r from-primary-500/60 to-primary-400/60" />
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-primary-400/60" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-dark-700">
            {Object.entries(STATUS_COLORS).map(([status, cls]) => (
              <div key={status} className="flex items-center gap-2 text-xs text-dark-400">
                <div className={`w-2 h-2 rounded-full ${cls}`} />
                <span className="capitalize">{status}</span>
              </div>
            ))}
            <span className="text-xs text-dark-500 ml-auto">Click a node to expand details</span>
          </div>
        </div>
      </section>

      {/* ─── Section 3: Changes by Category ─── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary-500 rounded-full" />
          Changes by Category
        </h2>
        {/* Tab bar */}
        <div className="flex space-x-1 bg-dark-800/50 p-1 rounded-lg mb-4 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-70">({CHANGES_BY_CATEGORY[tab].length})</span>
            </button>
          ))}
        </div>
        {/* Card grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {CHANGES_BY_CATEGORY[activeTab].map((change, i) => (
              <ChangeCard key={change.title} change={change} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ─── Section 4: Interactive Timeline ─── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary-500 rounded-full" />
          Implementation Timeline
        </h2>
        <div className="relative">
          {TIMELINE_ENTRIES.map((entry, i) => (
            <TimelineEntry key={i} entry={entry} index={i} />
          ))}
        </div>
      </section>

      {/* ─── Section 5: Before / After ─── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary-500 rounded-full" />
          Before &amp; After
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BEFORE_AFTER.map((item, i) => (
            <BeforeAfterCard key={i} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* ─── Section 6: File Impact Map ─── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary-500 rounded-full" />
          File Impact Map
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FILE_MAP.map((group, i) => (
            <FileMapGroup key={group.dir} group={group} index={i} />
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-dark-400">
          <div className="flex items-center gap-1.5"><span className="text-green-400 font-mono">+</span> New files</div>
          <div className="flex items-center gap-1.5"><span className="text-blue-400 font-mono">~</span> Modified files</div>
          <div className="flex items-center gap-1.5">
            Total: <span className="text-white font-medium">{FILE_MAP.reduce((sum, g) => sum + g.files.length, 0)} files</span> across <span className="text-white font-medium">{FILE_MAP.length} directories</span>
          </div>
        </div>
      </section>
    </div>
  );
}
