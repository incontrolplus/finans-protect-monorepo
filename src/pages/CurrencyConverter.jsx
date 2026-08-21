import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PROVIDERS = [
  {
    name: 'Wise Business',
    slug: 'wise',
    fee: '0.4-0.6%',
    speed: '1-2 часа',
    rating: 5,
    color: 'from-emerald-600 to-teal-700',
    pros: ['Най-ниски FX такси', 'Официален реален пазарен курс', 'Бързи SEPA преводи', 'Мултивалутна сметка'],
    cons: ['Изисква KYC верификация'],
    bestFor: 'Големи обеми EUR/BGN разплащания с минимална комисионна',
  },
  {
    name: 'Revolut Business',
    slug: 'revolut',
    fee: '0-0.8%',
    speed: 'Мигновено',
    rating: 4,
    color: 'from-blue-600 to-indigo-700',
    pros: ['Безплатна конвертация в делнични дни', 'Моментални преводи', 'Корпоративни карти'],
    cons: ['Уикенд марк-ъп от 1%'],
    bestFor: 'Ежедневни бизнес плащания и онлайн абонаменти',
  },
  {
    name: 'Interactive Brokers (IBKR)',
    slug: 'ibkr',
    fee: '$2 Flat',
    speed: '1-2 работни дни',
    rating: 5,
    color: 'from-purple-600 to-indigo-800',
    pros: ['Институционален Spot курс', 'Без надценка', 'Директна инвестиционна интеграция'],
    cons: ['По-сложен интерфейс'],
    bestFor: 'Суми над 10,000 EUR за инвестиции',
  },
  {
    name: 'Традиционна Банка (Direct Wire)',
    slug: 'bank',
    fee: '1.5-3.0%',
    speed: '2-4 работни дни',
    rating: 2,
    color: 'from-slate-700 to-slate-900',
    pros: ['Без регистрация в нови платформи'],
    cons: ['Скрити надценки в курса', 'Високи изходящи такси'],
    bestFor: 'Препоръчва се избягване при големи суми',
  },
];

const INVESTMENT_CATEGORIES = [
  { name: 'Авариен Фонд (Emergency Liquidity)', allocation: 20, description: '3-6 месеца оперативни разходи в EUR / BGN спестовна сметка', risk: 'None', color: 'from-blue-500 to-cyan-500' },
  { name: 'ETF Индексен Фонд (VWCE / CSPX)', allocation: 40, description: 'Vanguard FTSE All-World & S&P 500 UCITS ETF', risk: 'Medium', color: 'from-emerald-500 to-teal-500' },
  { name: 'Държавни Облигации & T-Bills', allocation: 20, description: 'EUR облигации с фиксирана доходност 3-4% годишно', risk: 'Low', color: 'from-indigo-500 to-purple-500' },
  { name: 'Крипто Активи (BTC / ETH)', allocation: 10, description: 'Дългосрочно съхранение на хардуерен портфейл (Cold Storage)', risk: 'High', color: 'from-amber-500 to-orange-500' },
  { name: 'Реинвестиция в Бизнес Автоматизация', allocation: 10, description: 'Инфраструктура, n8n сървъри, AI проксита и маркетинг', risk: 'Medium', color: 'from-pink-500 to-rose-500' },
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState(2500);
  const [fromCurrency, setFromCurrency] = useState('BGN');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates] = useState({ BGN_EUR: 0.5113, EUR_BGN: 1.9558, USD_EUR: 0.92, EUR_USD: 1.087, BGN_USD: 0.556, USD_BGN: 1.798 });
  const [selectedProvider, setSelectedProvider] = useState('wise');
  const [investmentAmount, setInvestmentAmount] = useState(5000);

  const rateKey = `${fromCurrency}_${toCurrency}`;
  const rate = fromCurrency === toCurrency ? 1 : (rates[rateKey] || 1);
  const converted = amount * rate;

  const providerResults = PROVIDERS.map(p => {
    const feePercent = p.slug === 'ibkr' ? 0.001 : (parseFloat(p.fee) / 100 || 0.005);
    const feeVal = p.slug === 'ibkr' ? 2 : amount * feePercent;
    const net = converted - (feeVal * rate);
    return { ...p, calculatedFee: feeVal.toFixed(2), netAmount: net.toFixed(2) };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Coins className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>FX Currency &amp; Treasury Intelligence</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Калкулатор на валутни курсове, сравнение на доставчици и инвестиционно разпределение на капитала.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Fixed EUR Peg Active
            </span>
          </div>
        </div>
      </div>

      {/* Converter Bento */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Валутен Конвертор в Реално Време</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Сума за Конвертиране</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-mono font-extrabold text-lg border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">От Валута</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-bold text-sm border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none cursor-pointer"
            >
              <option value="BGN">BGN (Български Лев)</option>
              <option value="EUR">EUR (Евро)</option>
              <option value="USD">USD (Щатски Долар)</option>
            </select>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={() => {
                const temp = fromCurrency;
                setFromCurrency(toCurrency);
                setToCurrency(temp);
              }}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-white border border-white/10 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Към Валута</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-bold text-sm border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none cursor-pointer"
            >
              <option value="EUR">EUR (Евро)</option>
              <option value="BGN">BGN (Български Лев)</option>
              <option value="USD">USD (Щатски Долар)</option>
            </select>
          </div>
        </div>

        {/* Result Highlight Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-[#0c1426]/90 to-[#080d1a] border border-cyan-500/30 text-center space-y-1">
          <p className="text-xs text-slate-400 font-mono">
            {amount.toLocaleString()} {fromCurrency} =
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-200 font-mono">
            {converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
          </p>
          <p className="text-slate-400 text-xs font-mono pt-1">
            Пазарен курс: 1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
          </p>
        </div>
      </div>

      {/* Provider Comparison Bento */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Сравнение на Доставчици &amp; Разходи</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providerResults.map((provider) => {
            const isSelected = selectedProvider === provider.slug;
            return (
              <motion.div
                key={provider.slug}
                onClick={() => setSelectedProvider(isSelected ? null : provider.slug)}
                className={`relative rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border transition-all cursor-pointer overflow-hidden shadow-xl ${
                  isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`p-5 bg-gradient-to-r ${provider.color} flex items-center justify-between`}>
                  <h3 className="text-base font-bold text-white tracking-tight">{provider.name}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/30 text-white border border-white/20">
                    Рейтинг: {provider.rating}/5
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">Такса:</span>
                      <span className="text-xs font-bold text-white font-mono">{provider.fee}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-400 block font-mono">Получавате:</span>
                      <span className="text-xs font-bold text-emerald-300 font-mono">{provider.netAmount} {toCurrency}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">Скорост:</span>
                      <span className="text-xs font-bold text-slate-200 font-mono">{provider.speed}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic">{provider.bestFor}</p>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-3 border-t border-white/10 space-y-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Предимства:</span>
                        {provider.pros.map((p, i) => (
                          <p key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{p}</span>
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Investment Plan Bento */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Базов Инвестиционен План &amp; Капитал</h2>
            <p className="text-xs text-slate-400 mt-0.5">Разпределение на свободните корпоративни средства по рискови категории</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono">Месечен Капитал:</span>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
              className="w-28 px-3 py-1.5 rounded-xl bg-[#090f1d]/90 text-white font-mono font-bold text-xs border border-white/10 outline-none text-center"
            />
            <span className="text-xs text-slate-300 font-mono">EUR</span>
          </div>
        </div>

        <div className="space-y-4">
          {INVESTMENT_CATEGORIES.map((cat) => {
            const catAmount = (investmentAmount * cat.allocation) / 100;
            return (
              <div key={cat.name} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{cat.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      cat.risk === 'None' ? 'bg-blue-500/20 text-blue-300' :
                      cat.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-300' :
                      cat.risk === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {cat.risk} Risk
                    </span>
                  </div>
                  <span className="font-mono font-bold text-cyan-300">
                    {cat.allocation}% ({catAmount.toFixed(0)} EUR/месец)
                  </span>
                </div>

                <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
                    style={{ width: `${cat.allocation}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CurrencyConverter;

