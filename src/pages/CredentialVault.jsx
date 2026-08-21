import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Lock,
  ShieldCheck,
  Building2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Layers,
  Globe2,
  Terminal,
  Zap,
  Tag,
  Euro,
  DollarSign
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function CredentialVault() {
  const [credentials, setCredentials] = useState([]);
  const [fintechAccounts, setFintechAccounts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('credentials');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [credsRes, fintechRes, purchasesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/credentials`),
        fetch(`${API_BASE}/api/admin/fintech-accounts`),
        fetch(`${API_BASE}/api/admin/purchases`),
      ]);

      const credsData = await credsRes.json();
      const fintechData = await fintechRes.json();
      const purchasesData = await purchasesRes.json();

      if (credsData.success) setCredentials(credsData.credentials || []);
      if (fintechData.success) setFintechAccounts(fintechData.accounts || []);
      if (purchasesData.success) setPurchases(purchasesData.summary || []);

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

  const platforms = [...new Set(credentials.map(c => c.platform))].filter(Boolean).sort();

  const filteredCredentials = credentials.filter(c => {
    const matchesSearch = !searchTerm ||
      c.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.platform?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !platformFilter || c.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const platformColors = {
    google: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    meta: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
    instagram: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    telegram: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    wallester: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    revolut: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    wise: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Credential Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px] shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Credential Vault &amp; KMS Storage</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Криптирано съхранение на служебни акаунти, финтех ключове и провайдърни интеграции.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              AES-256-GCM Encrypted
            </span>
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Обновяване...' : 'Обнови'}</span>
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
          { label: 'Общо Credentials', count: credentials.length, sub: `${credentials.filter(c => c.is_active).length} активни`, color: 'text-white', glow: 'from-purple-500/10' },
          { label: 'Финтех Акаунти', count: fintechAccounts.length, sub: `${fintechAccounts.filter(a => a.is_active).length} активни`, color: 'text-cyan-400', glow: 'from-cyan-500/10' },
          { label: 'Свързани Платформи', count: platforms.length, sub: 'Wallester, Wise, Rev...', color: 'text-purple-300', glow: 'from-purple-500/15' },
          { label: 'Закупени Профили', count: purchases.reduce((sum, p) => sum + (p.total_purchased || 0), 0), sub: 'Общо записи', color: 'text-emerald-400', glow: 'from-emerald-500/10' },
        ].map((c, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative rounded-3xl p-5 bg-gradient-to-br ${c.glow} via-[#0c1426]/70 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-lg space-y-2 overflow-hidden`}
          >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
            <span className="text-xs font-semibold text-slate-300">{c.label}</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${c.color}`}>{c.count}</p>
            <p className="text-[11px] font-mono text-slate-400">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 w-fit">
        {[
          { id: 'credentials', label: 'Credentials Списък', count: credentials.length },
          { id: 'fintech', label: 'Fintech Сметки (IBAN)', count: fintechAccounts.length },
          { id: 'purchases', label: 'История на Покупките', count: purchases.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/40'
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
        {/* 1. Credentials Tab */}
        {activeTab === 'credentials' && (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Търсене по потребителско име, имейл или платформа..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none"
                />
              </div>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full sm:w-56 px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
              >
                <option value="">Всички Платформи</option>
                {platforms.map(p => (
                  <option key={p} value={p}>{p.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCredentials.length === 0 ? (
                <div className="col-span-full p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-slate-400">
                  <p className="text-sm">Няма намерени credentials записи.</p>
                </div>
              ) : (
                filteredCredentials.map((cred) => (
                  <div
                    key={cred.id}
                    className={`relative rounded-3xl p-5 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border ${
                      cred.is_active ? 'border-white/10 hover:border-purple-500/40' : 'border-rose-500/20 opacity-60'
                    } shadow-xl space-y-3 transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          platformColors[cred.platform] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        }`}>
                          {cred.platform}
                        </span>
                        <span className="text-slate-400 text-xs">{cred.account_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cred.is_verified && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                            Verified
                          </span>
                        )}
                        <span className={`w-2.5 h-2.5 rounded-full ${cred.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-mono">
                      {cred.username && (
                        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-slate-500 block font-sans">Username:</span>
                          <span className="text-white font-bold truncate block">{cred.username}</span>
                        </div>
                      )}
                      {cred.email && (
                        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-slate-500 block font-sans">Email:</span>
                          <span className="text-slate-200 truncate block">{cred.email}</span>
                        </div>
                      )}
                      {cred.phone && (
                        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-slate-500 block font-sans">Phone:</span>
                          <span className="text-cyan-300 block">{cred.phone}</span>
                        </div>
                      )}
                      {cred.last_login_at && (
                        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-slate-500 block font-sans">Последен Вход:</span>
                          <span className="text-slate-400 block">{new Date(cred.last_login_at).toLocaleDateString('bg-BG')}</span>
                        </div>
                      )}
                    </div>

                    {cred.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cred.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* 2. Fintech Accounts Tab */}
        {activeTab === 'fintech' && (
          <motion.div
            key="fintech"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {fintechAccounts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-slate-400">
                <p className="text-sm">Няма регистрирани финтех сметки.</p>
              </div>
            ) : (
              fintechAccounts.map((account, idx) => (
                <div
                  key={idx}
                  className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                        platformColors[account.platform] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      }`}>
                        {account.platform}
                      </span>
                      {account.is_primary && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        KYC: <strong className="text-emerald-400">{account.kyc_level || 'Full'}</strong>
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${account.is_active ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Титуляр:</span>
                      <span className="font-bold text-white mt-0.5 block truncate">{account.account_holder}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Наличност:</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-sm mt-0.5 block">
                        {account.current_balance != null ? `${account.current_balance.toFixed(2)} ${account.currency || 'EUR'}` : '—'}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">IBAN / Сметка:</span>
                      <span className="font-mono text-cyan-300 font-bold mt-0.5 block truncate">{account.iban || account.account_number || '—'}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Собственик / Партньор:</span>
                      <span className="text-slate-300 mt-0.5 block truncate">{account.owner_name || account.partner_name || '—'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* 3. Purchases Tab */}
        {activeTab === 'purchases' && (
          <motion.div
            key="purchases"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Платформа</th>
                    <th className="p-4">Тип</th>
                    <th className="p-4 text-center">Общо</th>
                    <th className="p-4 text-center">Активни</th>
                    <th className="p-4 text-center">Неактивни</th>
                    <th className="p-4 text-right">Разход ($)</th>
                    <th className="p-4 text-center">Качество</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {purchases.map((p, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors font-mono">
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          platformColors[p.platform] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        }`}>
                          {p.platform}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-sans">{p.account_type}</td>
                      <td className="p-4 text-center text-white font-bold">{p.total_purchased}</td>
                      <td className="p-4 text-center text-emerald-400 font-bold">{p.active_count}</td>
                      <td className="p-4 text-center text-rose-400">{p.dead_count}</td>
                      <td className="p-4 text-right text-emerald-400 font-bold">
                        {p.total_spent ? `$${p.total_spent.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-bold ${
                          p.avg_quality >= 7 ? 'text-emerald-400' :
                          p.avg_quality >= 4 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {p.avg_quality ? p.avg_quality.toFixed(1) : '-'}/10
                        </span>
                      </td>
                    </tr>
                  ))}
                  {purchases.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">Няма записи за покупки</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CredentialVault;

