import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Share2,
  TrendingUp,
  Award,
  DollarSign,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Building2,
  ArrowRight,
  ShieldCheck,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function PartnerManagement() {
  const [partners, setPartners] = useState([]);
  const [referralCodes, setReferralCodes] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('partners');
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', commission_rate: 10, contact_info: '' });
  const [showAddCode, setShowAddCode] = useState(false);
  const [newCode, setNewCode] = useState({ partner_id: '', code: '', channel: 'direct', campaign_name: '' });
  const [copiedCode, setCopiedCode] = useState(null);

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [partnersRes, codesRes, perfRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/partners?select=*&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/referral_codes?select=*,partners(name)&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/partner_performance?select=*`, { headers }),
      ]);

      if (partnersRes.ok) setPartners(await partnersRes.json());
      if (codesRes.ok) setReferralCodes(await codesRes.json());
      if (perfRes.ok) setPerformance(await perfRes.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const addPartner = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/partners`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          name: newPartner.name,
          commission_rate: parseFloat(newPartner.commission_rate),
          contact_info: newPartner.contact_info ? { note: newPartner.contact_info } : {},
          is_active: true,
        }),
      });
      if (res.ok) {
        setShowAddPartner(false);
        setNewPartner({ name: '', commission_rate: 10, contact_info: '' });
        fetchData();
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to add partner');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addReferralCode = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/referral_codes`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          partner_id: newCode.partner_id,
          code: newCode.code,
          channel: newCode.channel,
          campaign_name: newCode.campaign_name || null,
          is_active: true,
        }),
      });
      if (res.ok) {
        setShowAddCode(false);
        setNewCode({ partner_id: '', code: '', channel: 'direct', campaign_name: '' });
        fetchData();
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to add code');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Partner Management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-teal-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Partner &amp; Affiliate Network</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Управление на партньорската мрежа, комисионни структури и проследяване на реферали.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddPartner(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Нов Партньор</span>
            </button>
            <button
              onClick={() => setShowAddCode(true)}
              className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>+ Referral Код</span>
            </button>
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 backdrop-blur-md"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Summary Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Общо Партньори', count: partners.length, color: 'text-white', glow: 'from-teal-500/10' },
          { label: 'Активни Referral Кодове', count: referralCodes.filter(c => c.is_active).length, color: 'text-cyan-300', glow: 'from-cyan-500/10' },
          { label: 'Реализирани Реферали', count: performance.reduce((s, p) => s + (p.total_referrals || 0), 0), color: 'text-teal-400', glow: 'from-teal-500/15' },
          { label: 'Общо Изплатени Комисиони', count: `€${performance.reduce((s, p) => s + parseFloat(p.total_earned || 0), 0).toFixed(2)}`, color: 'text-emerald-400', glow: 'from-emerald-500/15' },
        ].map((c, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative rounded-3xl p-5 bg-gradient-to-br ${c.glow} via-[#0c1426]/70 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-lg space-y-2 overflow-hidden`}
          >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
            <span className="text-xs font-semibold text-slate-300">{c.label}</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${c.color}`}>{c.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 w-fit">
        {[
          { id: 'partners', label: 'Партньори', count: partners.length },
          { id: 'codes', label: 'Referral Кодове', count: referralCodes.length },
          { id: 'performance', label: 'Резултати & Конверсии', count: performance.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 text-white shadow-lg shadow-teal-500/20 border border-teal-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id
                  ? 'bg-black/30 text-white'
                  : 'bg-white/10 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panes */}
      <AnimatePresence mode="wait">
        {/* 1. Partners Tab */}
        {activeTab === 'partners' && (
          <motion.div
            key="partners"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {partners.length === 0 ? (
              <div className="col-span-full p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-slate-400">
                <p className="text-sm">Няма регистрирани партньори.</p>
              </div>
            ) : (
              partners.map((partner) => (
                <div
                  key={partner.id}
                  className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3 overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{partner.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                        <span className="text-slate-400">
                          Комисионна: <strong className="text-teal-300 font-bold">{partner.commission_rate}%</strong>
                        </span>
                        <span className="text-slate-400">
                          KYC: <strong className={partner.kyc_verified ? 'text-emerald-400' : 'text-amber-400'}>{partner.kyc_verified ? 'Потвърден' : 'Чакащ'}</strong>
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      partner.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {partner.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>

                  {partner.contact_info && typeof partner.contact_info === 'object' && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 font-mono">
                      {JSON.stringify(partner.contact_info)}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* 2. Referral Codes Tab */}
        {activeTab === 'codes' && (
          <motion.div
            key="codes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Реферален Код</th>
                    <th className="p-4">Партньор</th>
                    <th className="p-4">Канал</th>
                    <th className="p-4">Кампания</th>
                    <th className="p-4 text-center">Използвания</th>
                    <th className="p-4 text-center">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referralCodes.map((rc) => (
                    <tr key={rc.id} className="hover:bg-white/[0.03] transition-colors font-mono">
                      <td className="p-4">
                        <button
                          onClick={() => copyToClipboard(rc.code)}
                          className="flex items-center gap-1.5 text-cyan-300 font-bold hover:text-cyan-200 transition-colors cursor-pointer"
                        >
                          <span>{rc.code}</span>
                          {copiedCode === rc.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-white font-sans">{rc.partners?.name || '—'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px]">
                          {rc.channel}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-sans">{rc.campaign_name || '—'}</td>
                      <td className="p-4 text-center text-slate-200 font-bold">
                        {rc.uses_count}{rc.max_uses ? `/${rc.max_uses}` : ''}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          rc.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {rc.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {referralCodes.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Няма намерени referral кодове</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 3. Performance Tab */}
        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Партньор</th>
                    <th className="p-4 text-center">Реферали</th>
                    <th className="p-4 text-center">Регистрации</th>
                    <th className="p-4 text-center">Завършени</th>
                    <th className="p-4 text-center">Конверсия</th>
                    <th className="p-4 text-right">Заработено (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {performance.map((p) => (
                    <tr key={p.partner_id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 font-sans font-bold text-white">{p.partner_name}</td>
                      <td className="p-4 text-center text-slate-300">{p.total_referrals}</td>
                      <td className="p-4 text-center text-cyan-300 font-bold">{p.signups}</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">{p.completed}</td>
                      <td className="p-4 text-center text-teal-300 font-bold">{p.conversion_rate}%</td>
                      <td className="p-4 text-right text-emerald-400 font-extrabold text-sm">
                        €{parseFloat(p.total_earned || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {performance.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Няма данни за ефективността</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Partner Modal */}
      <AnimatePresence>
        {showAddPartner && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#080d1a] border border-white/10 p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Добавяне на Партньор</h3>
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner(p => ({ ...p, name: e.target.value }))}
                  placeholder="Име на партньора или агенцията"
                  className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
                />
                <input
                  type="number"
                  value={newPartner.commission_rate}
                  onChange={(e) => setNewPartner(p => ({ ...p, commission_rate: e.target.value }))}
                  placeholder="Комисионна ставка (%)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none font-mono"
                />
                <input
                  type="text"
                  value={newPartner.contact_info}
                  onChange={(e) => setNewPartner(p => ({ ...p, contact_info: e.target.value }))}
                  placeholder="Контакт (Telegram / Email)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddPartner(false)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/10"
                >
                  Отказ
                </button>
                <button
                  onClick={addPartner}
                  disabled={!newPartner.name}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  Добави
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Referral Code Modal */}
      <AnimatePresence>
        {showAddCode && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#080d1a] border border-white/10 p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Генериране на Referral Код</h3>
              <div className="space-y-3 text-xs">
                <select
                  value={newCode.partner_id}
                  onChange={(e) => setNewCode(c => ({ ...c, partner_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-cyan-500/40 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
                >
                  <option value="">Изберете Партньор</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newCode.code}
                  onChange={(e) => setNewCode(c => ({ ...c, code: e.target.value }))}
                  placeholder="Referral код (напр. PROMO2026)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none font-mono uppercase"
                />
                <select
                  value={newCode.channel}
                  onChange={(e) => setNewCode(c => ({ ...c, channel: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-cyan-500/40 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
                >
                  {['direct', 'telegram', 'facebook', 'instagram', 'viber', 'landing_page', 'email'].map(ch => (
                    <option key={ch} value={ch}>{ch.toUpperCase()}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newCode.campaign_name}
                  onChange={(e) => setNewCode(c => ({ ...c, campaign_name: e.target.value }))}
                  placeholder="Име на кампания (опционално)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddCode(false)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/10"
                >
                  Отказ
                </button>
                <button
                  onClick={addReferralCode}
                  disabled={!newCode.partner_id || !newCode.code}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  Създай Код
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PartnerManagement;

