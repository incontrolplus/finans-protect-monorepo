import React, { useState, useMemo } from 'react';
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
  Zap,
  Key,
  Bot,
  Database,
  Monitor,
  Terminal,
  Network,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface SubdomainItem {
  id: string;
  domain: string;
  title: string;
  desc: string;
  badge: string;
  portTag: string;
  url: string;
  icon: any;
  iconColor: string;
}

const CLUSTER_NODES: SubdomainItem[] = [
  {
    id: 'cashflow',
    domain: 'cashflow.openbalancer.com',
    title: 'Cashflow & B2B Cards',
    desc: 'Финтех контролен център за автоматично издаване на корпоративни карти Wallester Visa Platinum и Mod 11 ЕИК верификация.',
    badge: '200 OK',
    portTag: 'Port 3500 • React Realtime',
    url: 'https://cashflow.openbalancer.com',
    icon: CreditCard,
    iconColor: 'text-cyan-400'
  },
  {
    id: 'n8n',
    domain: 'n8n.openbalancer.com',
    title: 'n8n Automation Engine',
    desc: 'Ядро за автоматизация на бизнес процеси, уебхуци, синхронизация с Търговския регистър и банкови интеграции.',
    badge: '200 OK',
    portTag: 'Port 5679 • Docker Engine',
    url: 'https://n8n.openbalancer.com',
    icon: Zap,
    iconColor: 'text-amber-400'
  },
  {
    id: 'infisical',
    domain: 'infisical.openbalancer.com',
    title: 'Infisical Secrets KMS',
    desc: 'Централизиран криптографски трезор за API ключове, Cloudflare токени, SSH сертификати и системни тайни.',
    badge: '200 OK',
    portTag: 'Port 8080 • AES-256 Vault',
    url: 'https://infisical.openbalancer.com',
    icon: Key,
    iconColor: 'text-emerald-400'
  },
  {
    id: 'hermes',
    domain: 'hermes.openbalancer.com',
    title: 'Hermes AI Swarm Hub',
    desc: 'Оркестратор за мулти-агентни структури, асинхронни AI разпределени задачи и паралелни автономни работни потоци.',
    badge: '200 OK',
    portTag: 'Mesh Agent Protocol',
    url: 'https://hermes.openbalancer.com',
    icon: Bot,
    iconColor: 'text-blue-400'
  },
  {
    id: 'admin',
    domain: 'admin.openbalancer.com',
    title: 'Database Studio & Admin',
    desc: 'PostgreSQL 17 база данни, Kong API Gateway, таблици за верифицирани дружества и финансова телеметрия.',
    badge: '200 OK',
    portTag: 'Port 8002 • PostgreSQL 17',
    url: 'https://admin.openbalancer.com',
    icon: Database,
    iconColor: 'text-purple-400'
  },
  {
    id: 'win',
    domain: 'win.openbalancer.com',
    title: 'Windows 11 VM (Delta Pro)',
    desc: 'QEMU изолирана среда с noVNC уеб терминал за защитено изпълнение на десктоп приложения и автоматизации.',
    badge: '200 OK',
    portTag: 'Port 8006 • noVNC WebRTC',
    url: 'https://win.openbalancer.com',
    icon: Monitor,
    iconColor: 'text-rose-400'
  },
  {
    id: 'mcp',
    domain: 'mcp.openbalancer.com',
    title: 'MCP Protocol Hub',
    desc: 'Регистър за инструменти по Model Context Protocol, осигуряващ сигурен достъп на AI агенти до системни ресурси.',
    badge: '200 OK',
    portTag: 'JSON-RPC 2.0 Bridge',
    url: 'https://mcp.openbalancer.com',
    icon: Sparkles,
    iconColor: 'text-cyan-400'
  },
  {
    id: 'tailscale',
    domain: 'tailscale.openbalancer.com',
    title: 'Tailscale WireGuard Mesh',
    desc: 'Защитена криптирана P2P мрежа между MacBook Air, Mac Mini Leon (100.83.83.8) и Mac Mini Leon2 (100.70.181.127).',
    badge: '200 OK',
    portTag: 'WireGuard Encrypted',
    url: 'https://tailscale.openbalancer.com',
    icon: Network,
    iconColor: 'text-teal-400'
  }
];

export const SubdomainsMeshMonitor: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return CLUSTER_NODES;
    const term = searchTerm.toLowerCase();
    return CLUSTER_NODES.filter(node => 
      node.title.toLowerCase().includes(term) ||
      node.domain.toLowerCase().includes(term) ||
      node.desc.toLowerCase().includes(term) ||
      node.portTag.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="bg-[#0b101d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-cyan-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Top Main Banner matching the screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Централен Контролен Панел
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Пълен мониторинг и управление на 10-те активни възела от клъстера на Open Balancer, оркестрация на агенти и защита на данните в реално време.
          </p>
        </div>

        {/* Status Badges Triad */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#070b14] border border-white/10 p-2 sm:p-3 rounded-2xl shrink-0">
          <div className="text-center px-2.5 py-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">АКТИВНИ ВЪЗЛИ</span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">10 / 10</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-center px-2.5 py-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">КЛЪСТЕРЕН СТАТУС</span>
            <span className="text-sm sm:text-base font-bold font-mono text-cyan-400">OPERATIONAL</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-center px-2.5 py-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">SSL / EDGE</span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">100% ANYCAST</span>
          </div>
        </div>
      </div>

      {/* Sub-header Controls: Search & Operator Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-mesh-subdomains"
            name="searchSubdomains"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Търсене на възел или услуга..."
            aria-label="Търсене на възел или услуга в клъстера"
            className="w-full bg-[#070b14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        {/* Operator Tag */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>Оператор:</span>
          <span className="font-semibold text-slate-200">ИНКОНТРОЛ ПЛЮС ЕООД</span>
          <span>•</span>
          <span className="font-mono text-slate-400">ЕИК 207849182</span>
        </div>
      </div>

      {/* 10-Node Grid matching screenshot layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredNodes.map((node) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0e1526] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden group flex flex-col justify-between transition-all hover:shadow-cyan-500/5"
              >
                <div>
                  {/* Top Row: Icon, Domain, 200 OK Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className={`w-5 h-5 ${node.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {node.title}
                        </h3>
                        <span className="text-[11px] font-mono text-cyan-400/90 block">
                          {node.domain}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {node.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[48px] mb-4">
                    {node.desc}
                  </p>
                </div>

                {/* Bottom Row: Port Tag & Action Button */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-2">
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    {node.portTag}
                  </span>

                  <a
                    href={node.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Отвори</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Operator Details */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-[11px] text-slate-500">
          🔒 Open Balancer Core Infrastructure • ИНКОНТРОЛ ПЛЮС ЕООД • ЕИК 207849182
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          Cloudflare Anycast CDN • Zero Data Loss Policy • SSL A+ Certified
        </p>
      </div>
    </div>
  );
};

export default SubdomainsMeshMonitor;
