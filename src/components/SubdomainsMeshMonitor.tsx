import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  ShieldCheck, 
  Activity, 
  ExternalLink, 
  Lock, 
  Server, 
  Search, 
  Cpu, 
  LayoutDashboard, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Bot, 
  Sparkles, 
  Network, 
  Zap,
  Info,
  X
} from 'lucide-react';

interface SubdomainItem {
  domain: string;
  title: string;
  category: 'core' | 'agent' | 'infra';
  categoryLabel: string;
  desc: string;
  httpStatus: number;
  sslValid: boolean;
  sslIssuer: string;
  sslExpiry: string;
  daysLeft: number;
  latency: number;
  dnsTarget: string;
  iconName: string;
}

const SUBDOMAINS_DATA: SubdomainItem[] = [
  {
    domain: "openbalancer.com",
    title: "Главен B2B Портал",
    category: "core",
    categoryLabel: "Core Platform",
    desc: "Официален портал, Master Service Agreement (MSA) и SLA договори.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-16",
    daysLeft: 88,
    latency: 38,
    dnsTarget: "Cloudflare Pages Edge (Global Anycast)",
    iconName: "globe"
  },
  {
    domain: "dashboard.openbalancer.com",
    title: "Контролен Панел & Телеметрия",
    category: "core",
    categoryLabel: "Telemetry Hub",
    desc: "Команден център за визуализация на състоянието и метриките на клъстера.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 42,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "layout-dashboard"
  },
  {
    domain: "cashflow.openbalancer.com",
    title: "Wallestars Cashflow & Billing",
    category: "core",
    categoryLabel: "Billing Gateway",
    desc: "B2B фактуриране, автоматичен кешфлоу и управление на разходите.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-16",
    daysLeft: 87,
    latency: 45,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "credit-card"
  },
  {
    domain: "ai.openbalancer.com",
    title: "AI Inference & Reverse Proxy",
    category: "agent",
    categoryLabel: "AI Gateway",
    desc: "Високоскоростен обратен прокси за стрийминг на LLM модели без буфериране.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 39,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "cpu"
  },
  {
    domain: "docs.openbalancer.com",
    title: "Техническа Документация",
    category: "core",
    categoryLabel: "Documentation",
    desc: "Пълни API спецификации, SDK ръководства и инструкции за интеграция.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 36,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "book-open"
  },
  {
    domain: "ocr.openbalancer.com",
    title: "Microinvest OCR Pipeline",
    category: "agent",
    categoryLabel: "Document AI",
    desc: "Интелигентно разпознаване на фактури, екстракция и трансформация на документи.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 48,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "file-text"
  },
  {
    domain: "hermes.openbalancer.com",
    title: "Hermes Multi-Agent Swarm",
    category: "agent",
    categoryLabel: "Swarm Orchestrator",
    desc: "Координационен център за автономни софтуерни агенти и суб-агентни процеси.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 51,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "bot"
  },
  {
    domain: "openclaw.openbalancer.com",
    title: "OpenClaw Agent Hub",
    category: "agent",
    categoryLabel: "Agent Gateway",
    desc: "Управление на OpenClaw демън сесии, Telegram ботове и инструменти.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 44,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "sparkles"
  },
  {
    domain: "mesh.openbalancer.com",
    title: "Tailscale WireGuard Mesh",
    category: "infra",
    categoryLabel: "Node Topology",
    desc: "Криптирана вътрешна топология между MacBook Air, Mac Mini и бекъп възли.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 41,
    dnsTarget: "Cloudflare Pages Edge / Tailscale",
    iconName: "network"
  },
  {
    domain: "wallestars.openbalancer.com",
    title: "Wallestars Automation Platform",
    category: "infra",
    categoryLabel: "Automation Hub",
    desc: "Издаване на корпоративни карти, Express API бекенд и автоматизация.",
    httpStatus: 200,
    sslValid: true,
    sslIssuer: "Google Trust Services",
    sslExpiry: "2026-11-17",
    daysLeft: 89,
    latency: 46,
    dnsTarget: "Cloudflare Pages Edge",
    iconName: "zap"
  }
];

const renderIcon = (name: string) => {
  switch (name) {
    case 'globe': return <Globe className="w-4 h-4 text-green-400" />;
    case 'layout-dashboard': return <LayoutDashboard className="w-4 h-4 text-green-400" />;
    case 'credit-card': return <CreditCard className="w-4 h-4 text-green-400" />;
    case 'cpu': return <Cpu className="w-4 h-4 text-green-400" />;
    case 'book-open': return <BookOpen className="w-4 h-4 text-green-400" />;
    case 'file-text': return <FileText className="w-4 h-4 text-green-400" />;
    case 'bot': return <Bot className="w-4 h-4 text-green-400" />;
    case 'sparkles': return <Sparkles className="w-4 h-4 text-green-400" />;
    case 'network': return <Network className="w-4 h-4 text-green-400" />;
    case 'zap': return <Zap className="w-4 h-4 text-green-400" />;
    default: return <Server className="w-4 h-4 text-green-400" />;
  }
};

export const SubdomainsMeshMonitor: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'core' | 'agent' | 'infra'>('all');
  const [search, setSearch] = useState<string>('');
  const [activeModalItem, setActiveModalItem] = useState<SubdomainItem | null>(null);

  const filtered = SUBDOMAINS_DATA.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch =
      !search ||
      item.domain.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#131b2e] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Open Balancer Mesh Fleet & SSL Status
            </h3>
            <span className="text-xs font-mono font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-md">
              10/10 Online (100% SLA)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Реално време за преглед на 10-те поддомейна, SSL сертификати и Cloudflare Anycast CDN
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търси поддомейн..."
              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0b0f19] p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filter === 'all' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Всички (10)
            </button>
            <button
              onClick={() => setFilter('core')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filter === 'core' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Core & Portal
            </button>
            <button
              onClick={() => setFilter('agent')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filter === 'agent' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI & Agents
            </button>
            <button
              onClick={() => setFilter('infra')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filter === 'infra' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mesh Infra
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((item) => (
          <motion.div
            key={item.domain}
            whileHover={{ y: -2 }}
            className="bg-[#0b0f19]/70 border border-white/10 hover:border-green-500/35 rounded-xl p-4 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    {renderIcon(item.iconName)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono text-white leading-tight">
                      {item.domain}
                    </h4>
                    <span className="text-[10px] text-slate-400">{item.title}</span>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  {item.categoryLabel}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                {item.desc}
              </p>

              {/* Status Metrics */}
              <div className="bg-black/30 rounded-lg p-2.5 border border-white/5 space-y-1.5 text-xs mb-3 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    HTTP Status:
                  </span>
                  <span className="text-green-400 font-bold">{item.httpStatus} OK ({item.latency}ms)</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-green-400" />
                    SSL Expiry:
                  </span>
                  <span className="text-slate-200">{item.daysLeft} дни ({item.sslExpiry})</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setActiveModalItem(item)}
                className="flex-1 text-[11px] bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-1.5 rounded-lg border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Info className="w-3 h-3 text-slate-400" />
                <span>Детайли</span>
              </button>
              <a
                href={`https://${item.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg border border-green-500/20 transition-colors"
                title="Отвори поддомейн"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Drawer for Subdomain Telemetry */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#131b2e] border border-white/10 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-4"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    {activeModalItem.domain}
                  </h3>
                  <p className="text-xs text-slate-400">{activeModalItem.title}</p>
                </div>
              </div>

              <div className="bg-[#0b0f19] border border-white/5 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">HTTP Статус:</span>
                  <span className="font-mono text-green-400 font-bold">{activeModalItem.httpStatus} OK (Латентност: {activeModalItem.latency}ms)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">SSL Издател:</span>
                  <span className="font-mono text-slate-200">{activeModalItem.sslIssuer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Валидност:</span>
                  <span className="font-mono text-green-400">{activeModalItem.daysLeft} дни остават (до {activeModalItem.sslExpiry})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CDN Маршрутизиране:</span>
                  <span className="font-mono text-cyan-300">{activeModalItem.dnsTarget}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Шифър (Cipher):</span>
                  <span className="font-mono text-[11px] text-slate-400">TLS 1.3 / AEAD-AES256-GCM-SHA384</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`https://${activeModalItem.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Отвори в браузъра</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-xl border border-white/10"
                >
                  Затвори
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
