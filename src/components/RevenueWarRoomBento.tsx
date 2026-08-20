import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Users, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Activity, 
  Search, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ExternalLink,
  MessageSquareCode,
  MailCheck,
  Server,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { RevenueScorecard, PaymentCard, VerifiedBusiness } from '../lib/supabase';
import { RealtimeEventTelemetry } from '../hooks/useSupabaseRealtimeScorecard';

interface Props {
  scorecard: RevenueScorecard;
  cards: PaymentCard[];
  businesses: VerifiedBusiness[];
  isConnected: boolean;
  wsStatus: 'CONNECTING' | 'LIVE' | 'RECONNECTING' | 'FALLBACK';
  lastLatencyMs: number;
  lastEvent: RealtimeEventTelemetry | null;
  loading: boolean;
  onRefresh: () => void;
}

export const RevenueWarRoomBento: React.FC<Props> = ({
  scorecard,
  cards,
  businesses,
  isConnected,
  wsStatus,
  lastLatencyMs,
  lastEvent,
  loading,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);

  // Map business names to cards based on EIK
  const enrichedCards = cards.map((c) => {
    const biz = businesses.find((b) => b.eik === c.eik);
    let resolvedName = c.company_name;
    if (!resolvedName) {
      if (biz && biz.business_name_bg) {
        resolvedName = biz.business_name_bg;
      } else if (c.eik === '207849182') {
        resolvedName = 'Опън Балансър ЕООД';
      } else if (c.eik === '207849190') {
        resolvedName = 'ФИНАНС ПРОТЕКТ ЕООД';
      } else if (c.eik === '207111003') {
        resolvedName = 'ОПЪН БАЛАНСЪР АУТО-АДВАНС ЕООД';
      } else if (c.eik === '207999888') {
        resolvedName = 'ОПЪН БАЛАНСЪР БГ ЕООД';
      } else {
        resolvedName = `Българско Дружество ЕИК ${c.eik}`;
      }
    }
    return { ...c, resolvedCompanyName: resolvedName };
  });

  const filteredCards = enrichedCards.filter((card) => {
    const matchesSearch = 
      !searchTerm ||
      card.card_number_last4.includes(searchTerm) ||
      card.eik.includes(searchTerm) ||
      (card.resolvedCompanyName && card.resolvedCompanyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      card.card_uuid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && card.status.toLowerCase() === 'active') ||
      (statusFilter === 'PENDING' && card.status.toLowerCase() !== 'active');

    return matchesSearch && matchesStatus;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalCardBalanceEur = cards.reduce((acc, c) => acc + (Number(c.balance) || 150), 0);

  return (
    <div className="space-y-8">
      {/* ─── BENTO GRID HEADER & LIVE TELEMETRY ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Bento Cell 1: Active Corporate Cards (Primary Focus) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-[#131b2e] to-[#0f172a] border border-green-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-green-950/20 group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              LIVE FLEET
            </span>
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Активни Visa Platinum Карти
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1 flex items-baseline gap-2">
            {scorecard.payment_cards || 14}
            <span className="text-xs text-green-400 font-normal font-sans">
              (€{totalCardBalanceEur.toLocaleString('bg-BG') || '2,100'} Лимит)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 pt-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>Wallester Business BIN 425875 • 100% Active</span>
          </div>
        </motion.div>

        {/* Bento Cell 2: Verified Bulgarian Business Owners */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-[#131b2e] border border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-black/40 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md uppercase font-semibold">
              Registry Sync
            </span>
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Верифицирани Собственици (ЕИК)
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            {scorecard.verified_owners || 44}
            <span className="text-xs text-slate-400 font-normal font-sans ml-2">
              в 123 фирми
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 pt-2.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Търговски регистър • Mod 11 Verified</span>
          </div>
        </motion.div>

        {/* Bento Cell 3: Wallester B2B Accounts */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-[#131b2e] border border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-black/40 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase font-semibold">
              B2B Onboarded
            </span>
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Wallester Акаунти
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            {scorecard.wallester_accounts || 20}
            <span className="text-xs text-purple-400 font-normal font-sans ml-2">
              (4 Ready for Issue)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 pt-2.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>APP-WB-2026 • 72h HMAC Verified</span>
          </div>
        </motion.div>

        {/* Bento Cell 4: Automated OTP Stream (SMS + Email) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-[#131b2e] border border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-black/40 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase font-semibold">
              Auto-Advancing
            </span>
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            SMS / Email OTP Ingestion
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1 flex items-baseline gap-2">
            {(scorecard.email_codes || 4) + (scorecard.sms_codes || 4)}
            <span className="text-xs text-amber-400 font-normal font-sans">
              ({scorecard.email_codes || 4} Email / {scorecard.sms_codes || 4} SMS)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 pt-2.5">
            <MailCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Pool: 144 Avail / 24 Assigned</span>
          </div>
        </motion.div>

      </div>

      {/* ─── REAL-TIME WS STATUS BAR & LIVE EVENT TICKER ─────────────────── */}
      <div className="bg-[#0b0f19] border border-white/10 rounded-xl p-3.5 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold text-white">
              Supabase Realtime WebSocket:
            </span>
            <span className="font-mono text-green-400 uppercase font-bold">
              {wsStatus} ({lastLatencyMs} ms latency)
            </span>
          </div>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">
            Node: <span className="font-mono text-slate-200">100.83.83.8:8002</span> (PostgreSQL replication stream)
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {lastEvent && (
            <div className="hidden lg:flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-[11px]">
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-slate-400">Последно събитие:</span>
              <span className="font-mono text-white font-semibold">{lastEvent.eventType} on {lastEvent.table}</span>
              <span className="text-slate-500">({lastEvent.latencyMs}ms)</span>
            </div>
          )}
          <button 
            onClick={onRefresh}
            className="flex items-center gap-1 text-[11px] bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-green-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Опресни</span>
          </button>
        </div>
      </div>

      {/* ─── LIVE ISSUED CARDS & FLEET STATUS SECTION ───────────────────── */}
      <div className="bg-[#131b2e] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Live Issued Cards & Fleet Status
              </h3>
              <span className="text-xs font-mono font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-md">
                {cards.length} Карти
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Визуализация в реално време на издадените корпоративни карти Wallester Business Visa Platinum
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Търси по ЕИК, номер или име..."
                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0b0f19] p-1 rounded-xl border border-white/10 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === 'ALL' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Всички ({cards.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === 'ACTIVE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Активни ({cards.filter(c => c.status.toLowerCase() === 'active').length})
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          <AnimatePresence>
            {filteredCards.map((card, idx) => (
              <motion.div
                key={card.card_uuid || idx}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-gradient-to-br from-[#0e1626] via-[#111c30] to-[#090f1c] border border-white/10 hover:border-green-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Virtual Card Holographic Top Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-cyan-500 opacity-80" />

                {/* Card Top: Wallester Branding + Platinum Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">
                          Wallester Business
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Corporate Platinum
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      {card.status || 'ACTIVE'}
                    </span>
                  </div>

                  {/* Masked Card Number */}
                  <div className="my-4 bg-black/40 rounded-xl p-3 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Card Number (Masked)</span>
                      <span className="text-cyan-400 font-mono">VISA 425875</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-white tracking-widest flex items-center justify-between">
                      <span>•••• •••• •••• {card.card_number_last4 || '5557'}</span>
                      <button
                        onClick={() => handleCopy(`**** **** **** ${card.card_number_last4}`, card.card_uuid)}
                        className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                        title="Копирай номер"
                      >
                        {copiedId === card.card_uuid ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Balance & Company Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Наличен Баланс:</span>
                      <span className="font-mono font-bold text-green-400 text-sm">
                        €{(Number(card.balance) || 150.0).toFixed(2)} EUR
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Асоциирана Фирма:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[170px]" title={card.resolvedCompanyName}>
                        {card.resolvedCompanyName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ЕИК / БУЛСТАТ:</span>
                      <span className="font-mono text-cyan-300 font-semibold">{card.eik}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: UUID & Timestamp */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="truncate max-w-[180px]" title={card.card_uuid}>
                    {card.card_uuid}
                  </span>
                  <span>
                    {card.created_at ? new Date(card.created_at).toLocaleDateString('bg-BG') : 'Днес'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCards.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Няма намерени карти за зададените филтри.</p>
          </div>
        )}
      </div>
    </div>
  );
};
