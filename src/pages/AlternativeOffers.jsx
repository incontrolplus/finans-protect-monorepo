import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CreditCard,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Euro,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  RefreshCw,
  Gift
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const OFFER_ICONS = {
  revolut_business: { emoji: 'R', gradient: 'from-blue-600 to-indigo-600', color: 'text-blue-400' },
  wise_business: { emoji: 'W', gradient: 'from-emerald-600 to-teal-600', color: 'text-emerald-400' },
  viva_wallet: { emoji: 'V', gradient: 'from-amber-600 to-orange-600', color: 'text-orange-400' },
  sumup: { emoji: 'S', gradient: 'from-cyan-600 to-blue-600', color: 'text-cyan-400' },
};

export function AlternativeOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchOffers = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/alternatives/all`);
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers || []);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const categories = ['all', ...new Set(offers.map((o) => o.reason_category).filter(Boolean))];
  const filteredOffers = selectedCategory === 'all'
    ? offers
    : offers.filter((o) => o.reason_category === selectedCategory);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Alternative Offers...</p>
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
                <Gift className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Alternative B2B Offers &amp; Fallbacks</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Алтернативни финансови и платежни решения за компании, непокриващи Wallester критериите.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Smart Monetization Active
            </span>
            <button
              onClick={fetchOffers}
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

      {/* Info Banner Bento */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-cyan-500/10 via-[#0c1426]/80 to-[#080d1a] backdrop-blur-2xl border border-cyan-500/30 shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">Автоматичен Fallback Механизъм</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Когато потребител при проверка на ЕИК не отговаря на изискванията на Wallester (например не е ООД/ЕООД, дял &lt; 50%, фирмата вече има акаунт или е в регулаторен черен списък), платформата автоматично визуализира най-подходящите алтернативни финансови продукти с гарантирана affiliate комисионна.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {cat === 'all' ? 'Всички Оферти' :
             cat === 'not_ood' ? 'Не е ООД/ЕООД' :
             cat === 'low_ownership' ? 'Дял под 50%' :
             cat === 'already_registered' ? 'Вече Регистрирана' :
             cat === 'blacklisted' ? 'Черен Списък' : cat}
          </button>
        ))}
      </div>

      {/* Offer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOffers.map((offer, idx) => {
          const icon = OFFER_ICONS[offer.provider_slug] || { emoji: '?', gradient: 'from-slate-700 to-slate-900', color: 'text-cyan-400' };
          return (
            <motion.div
              key={offer.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Header Gradient */}
              <div className={`p-6 bg-gradient-to-r ${icon.gradient} relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                      {icon.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white tracking-tight">{offer.provider_name}</h3>
                      <p className="text-xs text-white/80 font-mono mt-0.5">{offer.offer_type || 'Business Account'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    offer.is_active !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {offer.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {offer.description && (
                    <p className="text-xs text-slate-300 leading-relaxed">{offer.description}</p>
                  )}

                  {/* Features */}
                  {offer.features && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Включени Функции:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(offer.features) ? offer.features : []).map((feat, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[11px]">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Commission & Details */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {offer.commission_rate && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 block font-mono">Комисионна:</span>
                        <span className="text-emerald-400 font-mono font-extrabold text-base">{offer.commission_rate}</span>
                      </div>
                    )}
                    {offer.avg_payout && (
                      <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                        <span className="text-[10px] text-slate-400 block font-mono">Среден Payout:</span>
                        <span className="text-cyan-300 font-mono font-extrabold text-base">{offer.avg_payout}</span>
                      </div>
                    )}
                  </div>

                  {offer.reason_category && (
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block font-mono mb-1">Прилага се при:</span>
                      <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
                        {offer.reason_category === 'not_ood' ? 'Фирмата не е ООД/ЕООД' :
                         offer.reason_category === 'low_ownership' ? 'Дял под 50%' :
                         offer.reason_category === 'already_registered' ? 'Вече регистрирана за Wallester' :
                         offer.reason_category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Open Link Button */}
                {offer.signup_url && (
                  <a
                    href={offer.signup_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 text-white text-center text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Отвори Страницата за Регистрация</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredOffers.length === 0 && (
        <div className="p-16 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-slate-400 space-y-2">
          <p className="text-sm font-bold text-white">Няма намерени оферти за избраната категория</p>
          <p className="text-xs">Офертите се зареждат директно от Supabase таблицата alternative_offers.</p>
        </div>
      )}
    </div>
  );
}

export default AlternativeOffers;

