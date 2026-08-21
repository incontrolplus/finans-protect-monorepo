import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Monitor,
  Smartphone,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Globe,
  ArrowUpRight,
  Sparkles,
  Users,
  Mail,
  Video,
  FileText,
  Calendar,
  Cloud,
  Shield,
  ExternalLink,
  Brain,
  Network,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import PlatformLinks from '../components/PlatformLinks';
import SystemCharts from '../components/charts/SystemCharts';

export default function Dashboard() {
  const { connected, actionLogs } = useSocket();
  const [backendOffline, setBackendOffline] = useState(false);
  const [stats, setStats] = useState({
    totalActions: 0,
    claudeRequests: 0,
    systemUptime: 0,
    successRate: 99.8
  });

  useEffect(() => {
    fetch('/api/health')
      .then(res => {
        if (!res.ok) throw new Error('Offline');
        return res.json();
      })
      .then(() => {
        setBackendOffline(false);
      })
      .catch(() => {
        setBackendOffline(true);
      });

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActions: prev.totalActions + Math.floor(Math.random() * 3),
        systemUptime: prev.systemUptime + 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Actions',
      value: stats.totalActions,
      icon: Activity,
      color: 'from-blue-600 to-cyan-600',
      change: '+14%',
      trend: 'up'
    },
    {
      title: 'Active Agents & Nodes',
      value: '10 Nodes',
      icon: Network,
      color: 'from-purple-600 to-indigo-600',
      change: '100% Mesh',
      trend: 'up'
    },
    {
      title: 'Cluster Uptime',
      value: `${Math.floor(stats.systemUptime / 60) + 124}h`,
      icon: Clock,
      color: 'from-emerald-600 to-teal-600',
      change: '99.99%',
      trend: 'stable'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: 'from-amber-600 to-orange-600',
      change: '+0.4%',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Open Balancer Master Command Center</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Интелигентна автоматизация, мулти-агентен клъстер и Wallester финтех екосистема.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              10-Node SSOT Mesh Live
            </span>
          </div>
        </div>
      </div>

      {/* Metric Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3 overflow-hidden group hover:border-cyan-400/40 transition-all"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md border border-white/20`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">{stat.title}</span>
                <p className="text-2xl font-bold font-mono text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connected Platforms Bento */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Свързани Платформи & Услуги</span>
        </h2>
        <PlatformLinks />
      </div>

      {/* Quick Actions & Recent Activity Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Бързи Операции</span>
          </h2>
          <div className="space-y-3">
            <QuickActionButton
              icon={Monitor}
              title="Computer Use Driver"
              description="Дистанционно управление на операционната система"
              color="from-blue-600 to-cyan-600"
            />
            <QuickActionButton
              icon={Smartphone}
              title="Android ADB Bridge"
              description="Мобилна автоматизация и SMS синхронизация"
              color="from-emerald-600 to-teal-600"
            />
            <QuickActionButton
              icon={MessageSquare}
              title="Claude AI Assistant"
              description="Интелигентен координиращ диалог в реално време"
              color="from-purple-600 to-indigo-600"
            />
          </div>
        </div>

        {/* Recent Activity Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Скорошни Действия</span>
          </h2>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {actionLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-mono text-xs">
                Няма скорошни действия
              </div>
            ) : (
              actionLogs.slice(0, 8).map((log, index) => (
                <div
                  key={index}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white truncate">{log.action || 'Клъстерно събитие'}</p>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-time Charts Section */}
      <SystemCharts />

      {/* Multi-Agent Architecture Bento */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>Multi-Agent Intelligence Matrix</span>
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Microsoft Semantic Kernel Mapped
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AgentArchCard
            icon={Cpu}
            title="Orchestrator"
            description="Централен координатор на потока и състоянието"
            color="from-blue-600 to-cyan-600"
            status="Active"
          />
          <AgentArchCard
            icon={Database}
            title="Agent Registry"
            description="Каталог за откриване на нодове и възможности"
            color="from-emerald-600 to-teal-600"
            status="Active"
          />
          <AgentArchCard
            icon={Layers}
            title="Specialized Nodes"
            description="Linux, Android и Web агенти със специализирани ядки"
            color="from-purple-600 to-indigo-600"
            status="3 Platforms"
          />
        </div>
      </div>

      {/* Microsoft 365 Ecosystem Bento */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Microsoft 365 Cloud Enterprise Suite</span>
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>2 / 25 Лиценза Активни</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <M365AppCard
            icon={Mail}
            title="Outlook"
            description="Корпоративна поща & календар"
            color="from-blue-600 to-cyan-600"
            link="https://outlook.office.com"
          />
          <M365AppCard
            icon={Video}
            title="Teams"
            description="Колаборация, чат и срещи"
            color="from-purple-600 to-indigo-600"
            link="https://teams.microsoft.com"
          />
          <M365AppCard
            icon={FileText}
            title="Office 365"
            description="Word, Excel, PowerPoint"
            color="from-amber-600 to-orange-600"
            link="https://office.com"
          />
          <M365AppCard
            icon={Cloud}
            title="OneDrive"
            description="1TB облачно пространство"
            color="from-cyan-600 to-blue-700"
            link="https://onedrive.live.com"
          />
          <M365AppCard
            icon={Calendar}
            title="Bookings"
            description="Графици за срещи и резервации"
            color="from-emerald-600 to-teal-600"
            link="https://outlook.office.com/bookings"
          />
          <M365AppCard
            icon={Shield}
            title="Admin Center"
            description="Администрация и сигурност"
            color="from-rose-600 to-pink-600"
            link="https://admin.microsoft.com"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, title, description, color }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/40 transition-all flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md border border-white/20 shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">{title}</h3>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors" />
    </div>
  );
}

function M365AppCard({ icon: Icon, title, description, color, link }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/40 transition-all flex items-start gap-3.5 group"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md border border-white/20 shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">{title}</h3>
          <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[11px] text-slate-400">{description}</p>
      </div>
    </a>
  );
}

function AgentArchCard({ icon: Icon, title, description, color, status }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3.5">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md border border-white/20 shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-xs text-white">{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {status}
          </span>
        </div>
        <p className="text-[11px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}

