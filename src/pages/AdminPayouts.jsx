import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Euro,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  X,
  Building2,
  User,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Zap,
  Sparkles
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const fetchPayouts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/queue`);
      const data = await res.json();
      if (data.success) {
        setPayouts(data.payouts || []);
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
    fetchPayouts();
    const interval = setInterval(fetchPayouts, 30000);
    return () => clearInterval(interval);
  }, [fetchPayouts]);

  const handleApprove = async (payoutId) => {
    setActionLoading(payoutId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPayouts();
      } else {
        setError(data.error || 'Failed to approve');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (payoutId) => {
    setActionLoading(payoutId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/${payoutId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: 'admin', reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(null);
        setRejectReason('');
        fetchPayouts();
      } else {
        setError(data.error || 'Failed to reject');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleValidate = async (payoutId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/${payoutId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setValidationResult({ id: payoutId, ...data.validation });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      admin_review: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      retry: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      failed: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${colors[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Payout Queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Payout Approval &amp; Queue</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Административно валидиране, одобрение и изплащане на бонуси и комисиони.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Anti-Fraud Engine Active
            </span>
            <button
              onClick={fetchPayouts}
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
          { label: 'Чакащи (Pending)', count: payouts.filter(p => p.status === 'pending').length, color: 'text-amber-400', glow: 'from-amber-500/10' },
          { label: 'Admin Review', count: payouts.filter(p => p.status === 'admin_review').length, color: 'text-cyan-300', glow: 'from-cyan-500/10' },
          { label: 'Повторни (Retry)', count: payouts.filter(p => p.status === 'retry').length, color: 'text-orange-400', glow: 'from-orange-500/10' },
          { label: 'Обща Сума в Опашката', count: `€${payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}`, color: 'text-emerald-400', glow: 'from-emerald-500/15' },
        ].map((c, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative rounded-3xl p-5 bg-gradient-to-br ${c.glow} via-[#0c1426]/70 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-lg space-y-2 overflow-hidden`}
          >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <span className="text-xs font-semibold text-slate-300">{c.label}</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${c.color}`}>{c.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Validation Result Modal / Card */}
      {validationResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-6 border backdrop-blur-2xl shadow-xl space-y-3 ${
            validationResult.valid
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-rose-500/10 border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              )}
              <h3 className={`font-bold text-sm ${validationResult.valid ? 'text-emerald-300' : 'text-rose-300'}`}>
                {validationResult.valid ? 'Валидацията премина успешно (Passed)' : 'Валидацията откри несъответствия'}
              </h3>
            </div>
            <button
              onClick={() => setValidationResult(null)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {validationResult.issues?.length > 0 && (
            <ul className="space-y-1 text-xs text-rose-200">
              {validationResult.issues.map((issue, i) => (
                <li key={i} className="flex items-center gap-1.5 font-mono">
                  <span>•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-slate-400 text-xs font-mono pt-1">
            Дневен оборот: €{validationResult.daily_total || 0} | Часови трансфери: {validationResult.hourly_count || 0}
          </p>
        </motion.div>
      )}

      {/* Payout List */}
      <div className="space-y-4">
        {payouts.length === 0 ? (
          <div className="p-16 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[#0a1824]/90 to-[#080d1a] border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Няма чакащи плащания в опашката</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Всички генерирани Wallester бонуси са обработени и изплатени успешно.
            </p>
          </div>
        ) : (
          payouts.map((payout) => (
            <motion.div
              key={payout.payout_id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4 overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-extrabold font-mono text-emerald-400">
                      €{payout.amount} {payout.currency || 'EUR'}
                    </span>
                    {statusBadge(payout.status)}
                    <span className="text-xs font-mono text-slate-400">
                      ID: {payout.payout_id?.slice(0, 8)}...
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Собственик:</span>
                      <span className="font-bold text-white mt-0.5 block truncate">{payout.owner_name}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Фирма:</span>
                      <span className="font-medium text-slate-200 mt-0.5 block truncate">{payout.company_name}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">ЕИК:</span>
                      <span className="font-mono font-bold text-cyan-300 mt-0.5 block">{payout.eik}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Партньор:</span>
                      <span className="text-slate-300 mt-0.5 block truncate">{payout.partner_name || 'Direct (Owner)'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span>Метод: <strong className="text-white">{payout.payout_method || 'Банков превод'}</strong></span>
                    <span>Канал: <strong className="text-white">{payout.communication_channel || 'Telegram'}: {payout.communication_handle || '—'}</strong></span>
                    <span>Бонус: <strong className="text-emerald-300 font-bold">€{payout.affiliate_bonus_amount || 150}</strong></span>
                  </div>

                  {payout.last_error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                      Грешка: {payout.last_error} (Опит: {payout.attempt_count})
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                  <button
                    onClick={() => handleValidate(payout.payout_id)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Валидирай
                  </button>
                  <button
                    onClick={() => handleApprove(payout.payout_id)}
                    disabled={actionLoading === payout.payout_id}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    {actionLoading === payout.payout_id ? 'Обработка...' : 'Одобри'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(payout.payout_id)}
                    disabled={actionLoading === payout.payout_id}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Отхвърли
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#080d1a] border border-white/10 p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Отхвърляне на Плащане</h3>
              <p className="text-xs text-slate-300">
                Моля посочете причината за отхвърляне, която ще бъде записана в регистъра:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Въведете причина за отхвърляне..."
                className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none h-28 resize-none"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/10"
                >
                  Отказ
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/20 active:scale-95"
                >
                  {actionLoading ? 'Обработка...' : 'Потвърди Отхвърляне'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPayouts;

