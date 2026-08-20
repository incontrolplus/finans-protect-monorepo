import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  Activity, 
  ExternalLink, 
  Layers, 
  Globe, 
  Server, 
  Sparkles, 
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useSupabaseRealtimeScorecard } from './hooks/useSupabaseRealtimeScorecard';
import { RevenueWarRoomBento } from './components/RevenueWarRoomBento';
import { EikVerificationWidget } from './components/EikVerificationWidget';
import { SubdomainsMeshMonitor } from './components/SubdomainsMeshMonitor';

export function App() {
  const {
    scorecard,
    cards,
    businesses,
    isConnected,
    wsStatus,
    lastLatencyMs,
    lastEvent,
    loading,
    error,
    refresh
  } = useSupabaseRealtimeScorecard();

  const [activeTab, setActiveTab] = useState<'warroom' | 'verify' | 'mesh'>('warroom');

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-green-500/30 selection:text-green-300">
      
      {/* ─── TOP NOTIFICATION BANNER ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0e1726] to-green-950 border-b border-green-500/20 py-2 px-4 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        <span className="font-semibold text-green-300">Стъпка 4 Live:</span>
        <span>Единен Real-Time Dashboard & Bento-Box UI за Open Balancer (14 Активни Visa Platinum Карти, €150 Бонус)</span>
      </div>

      {/* ─── NAVIGATION BAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0c0e14]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 p-[1px] flex items-center justify-center shadow-lg shadow-green-500/20">
                <div className="w-full h-full bg-[#0c0e14] rounded-[11px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Open Balancer
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-green-500/20 text-green-300 border border-green-500/30 px-1.5 py-0.2 rounded">
                    Core V4.5
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-0.5">
                  Revenue War Room & B2B Portal
                </span>
              </div>
            </a>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131b2e] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('warroom')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'warroom'
                  ? 'bg-green-500 text-slate-950 font-bold shadow-md shadow-green-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Revenue War Room ({cards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'verify'
                  ? 'bg-green-500 text-slate-950 font-bold shadow-md shadow-green-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>B2B Проверка на ЕИК</span>
            </button>

            <button
              onClick={() => setActiveTab('mesh')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'mesh'
                  ? 'bg-green-500 text-slate-950 font-bold shadow-md shadow-green-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Mesh Subdomains (10)</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* WS Live Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#131b2e] border border-white/10 px-3 py-1.5 rounded-xl text-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-mono text-[11px] text-slate-300">
                {wsStatus === 'LIVE' ? 'Realtime WS' : wsStatus}
              </span>
              <span className="font-mono text-[10px] text-green-400 font-bold">
                {lastLatencyMs}ms
              </span>
            </div>

            <a
              href="/ports"
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-xl transition-colors hidden lg:inline-flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Port Registry</span>
            </a>

            <button
              onClick={refresh}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl transition-all active:scale-95"
              title="Презареди данни"
            >
              <RefreshCw className={`w-4 h-4 text-green-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-10">
        
        {/* Hero Section */}
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Жив финтех поток • Supabase Realtime • Wallester API V4.5
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Финансов Контролен Център & <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-green-200 to-emerald-400">
                  B2B Издаване на Карти в Реално Време
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Интегрирана платформа за автоматичен онбординг на български дружества (ООД/ЕООД), незабавна валидация по Търговския регистър чрез Mod 11 алгоритъм и управление на флот от активни карти Wallester Visa Platinum.
              </p>
            </div>

            {/* Quick Stats Block */}
            <div className="bg-[#131b2e] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6 shadow-xl shrink-0">
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Флот от Карти</div>
                <div className="text-2xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
                  {scorecard.payment_cards || 14} <span className="text-xs text-green-400 font-sans font-normal">Active</span>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Одобрен Бонус</div>
                <div className="text-2xl font-bold font-mono text-green-400 mt-0.5">
                  €150.00
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">SLA Гаранция</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">
                  99.9%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 1: B2B VERIFICATION & INSTANT ELIGIBILITY WIDGET ── */}
        <section id="verify-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              1. B2B Проверка & Онбординг Портал
            </h2>
            <span className="text-xs text-slate-500 font-mono">Mod 11 Checksum Calculator</span>
          </div>
          <EikVerificationWidget onSuccessfulVerification={refresh} />
        </section>

        {/* ─── SECTION 2: REVENUE WAR ROOM BENTO & LIVE CARDS FLEET ────── */}
        <section id="warroom-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              2. Revenue War Room & Live Issued Cards
            </h2>
            <span className="text-xs text-slate-500 font-mono">Real-Time Telemetry</span>
          </div>
          <RevenueWarRoomBento
            scorecard={scorecard}
            cards={cards}
            businesses={businesses}
            isConnected={isConnected}
            wsStatus={wsStatus}
            lastLatencyMs={lastLatencyMs}
            lastEvent={lastEvent}
            loading={loading}
            onRefresh={refresh}
          />
        </section>

        {/* ─── SECTION 3: MESH SUBDOMAINS & SSL INFRASTRUCTURE MONITOR ─── */}
        <section id="mesh-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              3. Open Balancer Mesh Infrastructure & Edge Health
            </h2>
            <span className="text-xs text-slate-500 font-mono">Cloudflare Anycast CDN</span>
          </div>
          <SubdomainsMeshMonitor />
        </section>

      </main>

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#090a0f] py-8 text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-slate-300 font-semibold flex items-center justify-center md:justify-start gap-2">
              <span>🦁 Open Balancer Core Infrastructure</span>
              <span>•</span>
              <span>ИНКОНТРОЛ ПЛЮС ЕООД</span>
            </div>
            <div className="text-[11px] text-slate-500">
              ЕИК 207849182 • ДДС № BG207849182 • Wallester Business Authorized B2B Partner
            </div>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              PostgreSQL Realtime WebSocket Live
            </span>
            <a href="https://openbalancer.com/docs.html" className="hover:text-white transition-colors">
              Документация
            </a>
            <a href="/ports" className="hover:text-white transition-colors">
              Портове
            </a>
            <a href="https://openbalancer.com/terms.html" className="hover:text-white transition-colors">
              Общи условия
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
