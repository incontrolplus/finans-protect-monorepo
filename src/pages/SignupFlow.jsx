import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  ShieldCheck,
  MessageSquare,
  Mail,
  FileSignature,
  FileCheck,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const STEPS = [
  { id: 'pending_signup', label: 'Pending', icon: '1' },
  { id: 'signup_in_progress', label: 'Signup', icon: '2' },
  { id: 'awaiting_sms', label: 'SMS Wait', icon: '3' },
  { id: 'sms_received', label: 'SMS OK', icon: '4' },
  { id: 'awaiting_email', label: 'Email Wait', icon: '5' },
  { id: 'email_received', label: 'Email OK', icon: '6' },
  { id: 'awaiting_contract', label: 'Contract', icon: '7' },
  { id: 'contract_signed', label: 'Signed', icon: '8' },
  { id: 'pending_review', label: 'Review', icon: '9' },
  { id: 'verified', label: 'Verified', icon: '10' },
];

export function SignupFlow() {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerDetail, setOwnerDetail] = useState(null);
  const [activeSignup, setActiveSignup] = useState(null);
  const [smsCode, setSmsCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchOwners = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners?status=has_eligible`);
      const data = await res.json();
      if (data.success) setOwners(data.owners || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOwnerDetail = useCallback(async (ownerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}`);
      const data = await res.json();
      if (data.success) {
        setOwnerDetail(data.owner);
        const activeAccount = data.owner.accounts?.find(
          (a) => !['payout_completed', 'rejected', 'failed'].includes(a.status)
        );
        setActiveSignup(activeAccount || null);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  useEffect(() => {
    if (selectedOwner) {
      fetchOwnerDetail(selectedOwner);
      pollRef.current = setInterval(() => fetchOwnerDetail(selectedOwner), 10000);
      return () => clearInterval(pollRef.current);
    }
  }, [selectedOwner, fetchOwnerDetail]);

  const startSignup = async (businessId) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/start-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: selectedOwner, businessId }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('Signup initiated', `Account ${data.accountId || 'created'}, n8n automation triggered`);
        fetchOwnerDetail(selectedOwner);
      } else {
        setError(data.error || 'Failed to start signup');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitSmsCode = async () => {
    if (!smsCode.trim() || !activeSignup) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/sms-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: activeSignup.id, code: smsCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('SMS Code Verified', `Code: ${smsCode}`);
        setSmsCode('');
        fetchOwnerDetail(selectedOwner);
      } else {
        setError(data.error || 'Failed to submit SMS code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitEmailCode = async () => {
    if (!emailCode.trim() || !activeSignup) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/email-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: activeSignup.id,
          type: 'verification_code',
          code: emailCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('Email Code Verified', `Code: ${emailCode}`);
        setEmailCode('');
        fetchOwnerDetail(selectedOwner);
      } else {
        setError(data.error || 'Failed to submit email code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const addLog = (title, detail) => {
    setLogs((prev) => [{ title, detail, time: new Date().toLocaleTimeString('bg-BG') }, ...prev].slice(0, 50));
  };

  const getStepIndex = (status) => STEPS.findIndex((s) => s.id === status);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Signup Flow Автоматизация...</p>
      </div>
    );
  }

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
                <Play className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Wallester Signup Flow Automation</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Автоматизирана регистрация на Wallester Business акаунти чрез n8n, Airtop и OTP Relay.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Airtop Browser Engine
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              OTP Interceptor Active
            </span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-lg">
            Затвори
          </button>
        </motion.div>
      )}

      {/* Main Grid: Left Owners & Activity, Right Stepper & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Owner Selection & Activity Log (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Owners Card */}
          <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl overflow-hidden space-y-4">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Eligible Собственици</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {owners.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {owners.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <p className="font-semibold text-white text-xs">Няма намерени собственици</p>
                  <p className="text-[11px]">Извършете проверка в Eligibility Check.</p>
                </div>
              ) : (
                owners.map((owner) => {
                  const oId = owner.id || owner.owner_id;
                  const isSelected = selectedOwner === oId;
                  return (
                    <button
                      key={oId}
                      onClick={() => setSelectedOwner(oId)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-cyan-500/20 via-[#0c1426]/90 to-[#080d1a] border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-white font-bold text-xs tracking-tight">{owner.full_name}</p>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {owner.eligible_businesses || 0} фирма
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono flex items-center justify-between">
                        <span>Статус: {owner.owner_status || 'New'}</span>
                        {owner.phone && <span>{owner.phone}</span>}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Log Card */}
          <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Live Activity Stream</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-xs font-mono scrollbar-thin scrollbar-thumb-white/10">
              {logs.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-[11px]">Очаква се действие...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-300 font-bold">{log.title}</span>
                      <span className="text-slate-500">{log.time}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed">{log.detail}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Stepper, Interactive Forms & Eligible Businesses (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedOwner ? (
            <div className="p-16 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-2xl border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white">Изберете собственик от панела вляво</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Заредете досието на собственика, за да управлявате онбординг процеса и OTP кодовете.
              </p>
            </div>
          ) : !ownerDetail ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
              <p className="text-xs font-mono text-cyan-300">Зареждане на досие...</p>
            </div>
          ) : (
            <>
              {/* Owner Header Info Card */}
              <div className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Избран Собственик</span>
                    <h2 className="text-lg font-extrabold text-white tracking-tight">{ownerDetail.full_name}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                    ownerDetail.owner_status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    ownerDetail.owner_status === 'processing' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}>
                    {ownerDetail.owner_status || 'New'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 text-xs">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-slate-400">Имейл</p>
                    <p className="text-white font-medium mt-0.5 truncate">{ownerDetail.email || '—'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-slate-400">Телефон</p>
                    <p className="text-white font-mono mt-0.5">{ownerDetail.phone || '—'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-slate-400">ЕГН / Идентификатор</p>
                    <p className="text-cyan-300 font-mono font-bold mt-0.5">{ownerDetail.egn || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Stepper - Active Signup */}
              {activeSignup && (
                <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-base font-bold text-white">
                        Активна Регистрация: <span className="text-cyan-300">{activeSignup.company_name || activeSignup.business_id}</span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      ID: {activeSignup.id?.slice(0, 8)}...
                    </span>
                  </div>

                  {/* Stepper Nodes */}
                  <div className="flex items-center justify-between overflow-x-auto pb-3 gap-2 scrollbar-thin scrollbar-thumb-white/10">
                    {STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(activeSignup.status);
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step.id} className="flex items-center flex-1 min-w-[70px]">
                          <div className="flex flex-col items-center mx-auto">
                            <div
                              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                isCompleted
                                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-emerald-500/20'
                                  : isCurrent
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white ring-4 ring-cyan-500/20 scale-110 shadow-cyan-500/20'
                                  : 'bg-white/5 text-slate-500 border border-white/10'
                              }`}
                            >
                              {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.icon}
                            </div>
                            <span className={`text-[10px] font-mono mt-2 whitespace-nowrap ${
                              isCurrent ? 'text-cyan-300 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1.5 ${isCompleted ? 'bg-emerald-500' : 'bg-white/10'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* SMS Input Box */}
                  {activeSignup.status === 'awaiting_sms' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                        <MessageSquare className="w-4 h-4" />
                        <span>SMS Верификационен Код</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Wallester изпрати SMS на номер <strong className="text-white font-mono">{activeSignup.wallester_phone || ownerDetail.phone}</strong>. Въведете кода за потвърждение:
                      </p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value)}
                          placeholder="123456"
                          maxLength={8}
                          className="flex-1 px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-mono font-bold text-center text-lg tracking-widest placeholder-slate-600 border border-amber-500/40 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 outline-none"
                        />
                        <button
                          onClick={submitSmsCode}
                          disabled={actionLoading || !smsCode.trim()}
                          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                        >
                          {actionLoading ? 'Обработка...' : 'Потвърди SMS'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Email Input Box */}
                  {activeSignup.status === 'awaiting_email' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-3 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-2 text-orange-300 font-bold text-sm">
                        <Mail className="w-4 h-4" />
                        <span>Имейл Верификация / Код</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Wallester изпрати потвърждение на <strong className="text-white">{activeSignup.wallester_email || ownerDetail.email}</strong>. Въведете кода или линка:
                      </p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="Код или линк за валидация"
                          className="flex-1 px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-600 border border-orange-500/40 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 outline-none"
                        />
                        <button
                          onClick={submitEmailCode}
                          disabled={actionLoading || !emailCode.trim()}
                          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-orange-500/20 active:scale-95"
                        >
                          {actionLoading ? 'Обработка...' : 'Потвърди Имейл'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Contract Approval Box */}
                  {activeSignup.status === 'awaiting_contract' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                        <FileSignature className="w-4 h-4" />
                        <span>Подписване на Договор (Admin Одобрение)</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Airtop автоматизацията изчаква потвърждение за финализиране на договора. Можете да одобрите заявката през секцията Payout Queue.
                      </p>
                    </motion.div>
                  )}

                  {/* Error Notification */}
                  {activeSignup.last_error && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                      <p>Грешка: {activeSignup.last_error}</p>
                      <p className="text-slate-400 text-[10px] mt-1">Опит: {activeSignup.attempt_count}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Eligible Businesses Card List */}
              <div className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Допустими Фирми за Издаване на Карта</h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Собственост &gt;= 50% &amp; Mod 11
                  </span>
                </div>

                <div className="space-y-3">
                  {(ownerDetail.businesses || [])
                    .filter((b) => b.eligibility === 'eligible' || !b.eligibility)
                    .map((biz) => {
                      const hasActiveAccount = (ownerDetail.accounts || []).some(
                        (a) => a.business_id === biz.id && !['payout_completed', 'rejected', 'failed'].includes(a.status)
                      );
                      const completedAccount = (ownerDetail.accounts || []).find(
                        (a) => a.business_id === biz.id && a.status === 'payout_completed'
                      );

                      return (
                        <div
                          key={biz.id}
                          className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{biz.company_name}</h4>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
                                Mod 11 OK
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-1">
                              ЕИК: <strong className="text-cyan-300">{biz.eik}</strong> | {biz.business_type || 'ЕООД'} | Дял: <strong className="text-white">{biz.ownership_share || 100}%</strong>
                            </p>
                          </div>

                          <div className="shrink-0">
                            {completedAccount ? (
                              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Издадена Карта
                              </span>
                            ) : hasActiveAccount ? (
                              <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 animate-pulse" />
                                В Процес
                              </span>
                            ) : (
                              <button
                                onClick={() => startSignup(biz.id)}
                                disabled={actionLoading}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{actionLoading ? 'Стартиране...' : 'Стартирай Регистрация'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {(ownerDetail.businesses || []).filter((b) => b.eligibility === 'eligible' || !b.eligibility).length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      <p className="text-xs">Няма открити допустими бизнеси за този собственик.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignupFlow;

