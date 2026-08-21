import React, { useState } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function EligibilityWidget({ onResults }) {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(`${API_BASE}/api/registry/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim() || undefined,
          lastName: lastName.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data);
        if (onResults) onResults(data);
      } else {
        setError(data.error || 'Грешка при проверката за допустимост');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-6 relative" id="check">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Търговски Регистър AI Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Бърза Проверка за Допустимост (Wallester)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Въведете трите имена на собственика/управителя за автоматична Mod 11 верификация
            </p>
          </div>

          <form onSubmit={handleCheck} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Име"
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none"
              />
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Презиме"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Проверка в Търговския регистър...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Провери за Допустимост</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {results && (
            <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Намерени фирми: <strong className="text-white">{results.total}</strong></span>
                <span className="text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Допустими (≥50%): {results.eligible}
                </span>
              </div>

              {results?.companies && results.companies.map((company, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    company.is_eligible
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-white/[0.02] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-white font-bold text-xs">{company.company_name}</p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                        ЕИК: {company.eik} | {company.business_type} | Дял: {company.ownership_share}%
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 ${
                      company.is_eligible
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {company.is_eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

