import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const PROVIDERS = [
  {
    name: 'Wise',
    slug: 'wise',
    fee: '0.4-0.6%',
    speed: '1-2 hours',
    rating: 5,
    color: 'from-green-500 to-emerald-600',
    pros: ['Lowest fees', 'Mid-market rate', 'Fast transfers', 'Multi-currency account'],
    cons: ['ID verification required', 'Limits for new accounts'],
    bestFor: 'Large EUR transfers with lowest cost',
  },
  {
    name: 'Revolut Business',
    slug: 'revolut',
    fee: '0-1%',
    speed: 'Instant',
    rating: 4,
    color: 'from-blue-500 to-indigo-600',
    pros: ['Free FX on weekdays (plan)', 'Instant transfers', 'Multi-currency', 'Cards'],
    cons: ['Weekend markup', 'Monthly fee for best rates', 'Account freezes possible'],
    bestFor: 'Regular EUR conversions with business account',
  },
  {
    name: 'Interactive Brokers',
    slug: 'ibkr',
    fee: '$2 flat',
    speed: '1-2 days',
    rating: 4,
    color: 'from-red-500 to-red-700',
    pros: ['Best rate for large amounts', 'Investment platform', 'Very low forex fees'],
    cons: ['Complex setup', 'Wire transfer delays', 'Not beginner-friendly'],
    bestFor: 'Amounts over 10,000 EUR',
  },
  {
    name: 'Bank Transfer (Direct)',
    slug: 'bank',
    fee: '1-3%',
    speed: '1-3 days',
    rating: 2,
    color: 'from-gray-500 to-gray-700',
    pros: ['Simple', 'No extra accounts', 'Traditional'],
    cons: ['Worst exchange rate', 'High fees', 'Slow'],
    bestFor: 'Avoid if possible',
  },
];

const INVESTMENT_CATEGORIES = [
  { name: 'Emergency Fund', allocation: 20, description: '3-6 месеца разходи в EUR savings', risk: 'None' },
  { name: 'ETF Index (VWCE)', allocation: 40, description: 'Vanguard FTSE All-World UCITS ETF', risk: 'Medium' },
  { name: 'EUR Bonds / T-Bills', allocation: 20, description: 'Government bonds, 2-4% yield', risk: 'Low' },
  { name: 'Crypto (BTC/ETH)', allocation: 10, description: 'Long-term hold, hardware wallet', risk: 'High' },
  { name: 'Business Reinvestment', allocation: 10, description: 'Tools, marketing, automation', risk: 'Medium' },
];

function CurrencyConverter() {
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('BGN');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates, setRates] = useState({ BGN_EUR: 0.5113, EUR_BGN: 1.9558, USD_EUR: 0.92, EUR_USD: 1.087 });
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(5000);

  const converted = amount * (rates[`${fromCurrency}_${toCurrency}`] || 1);

  const providerResults = PROVIDERS.map(p => {
    const feePercent = parseFloat(p.fee) / 100 || 0.01;
    const fee = amount * feePercent;
    const net = converted - (converted * feePercent);
    return { ...p, fee: fee.toFixed(2), netAmount: net.toFixed(2) };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Currency & Investment</h1>
          <p className="text-gray-400 mt-1">
            EUR конвертиране, сравнение на providers и инвестиционен план
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
          Задачи 33, 34
        </span>
      </div>

      {/* Converter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Currency Converter</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
            >
              <option>BGN</option>
              <option>EUR</option>
              <option>USD</option>
            </select>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); }}
              className="p-2 rounded-full bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
            >
              <option>EUR</option>
              <option>BGN</option>
              <option>USD</option>
            </select>
          </div>
        </div>

        <div className="mt-6 bg-dark-700/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            {amount.toLocaleString()} {fromCurrency} =
          </p>
          <p className="text-3xl font-bold text-white mt-1">
            {converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Mid-market rate: 1 {fromCurrency} = {(rates[`${fromCurrency}_${toCurrency}`] || 1).toFixed(4)} {toCurrency}
          </p>
          {fromCurrency === 'BGN' && toCurrency === 'EUR' && (
            <p className="text-yellow-400/60 text-xs mt-1">
              BGN е фиксиран към EUR: 1 EUR = 1.95583 BGN
            </p>
          )}
        </div>
      </motion.div>

      {/* Provider Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-white">Provider Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providerResults.map((provider, idx) => (
            <motion.div
              key={provider.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedProvider(selectedProvider === provider.slug ? null : provider.slug)}
              className={`bg-dark-800/50 border rounded-xl overflow-hidden cursor-pointer transition-colors ${
                selectedProvider === provider.slug ? 'border-primary-500/50' : 'border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className={`bg-gradient-to-r ${provider.color} p-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold">{provider.name}</h3>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < provider.rating ? 'text-yellow-300' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-gray-500 text-xs">Fee</p>
                    <p className="text-white font-medium">{provider.fee} {toCurrency}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">You get</p>
                    <p className="text-green-400 font-bold">{provider.netAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Speed</p>
                    <p className="text-gray-300 text-sm">{provider.speed}</p>
                  </div>
                </div>

                {selectedProvider === provider.slug && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-3 border-t border-dark-700"
                  >
                    <p className="text-sm text-gray-400">{provider.bestFor}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-green-400 mb-1">Pros</p>
                        {provider.pros.map((p, i) => (
                          <p key={i} className="text-xs text-gray-400">+ {p}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs text-red-400 mb-1">Cons</p>
                        {provider.cons.map((c, i) => (
                          <p key={i} className="text-xs text-gray-400">- {c}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Investment Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-800/50 border border-dark-700 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Basic Investment Plan</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Monthly:</label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm font-mono"
            />
            <span className="text-gray-400 text-sm">EUR</span>
          </div>
        </div>

        <div className="space-y-3">
          {INVESTMENT_CATEGORIES.map((cat) => {
            const catAmount = (investmentAmount * cat.allocation) / 100;
            return (
              <div key={cat.name} className="flex items-center space-x-4">
                <div className="w-16 text-right">
                  <span className="text-primary-400 font-bold">{cat.allocation}%</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{cat.name}</span>
                    <span className="text-gray-400 text-sm font-mono">{catAmount.toFixed(0)} EUR</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.allocation}%` }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        cat.risk === 'None' ? 'bg-blue-500' :
                        cat.risk === 'Low' ? 'bg-green-500' :
                        cat.risk === 'Medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-gray-500 text-xs">{cat.description}</span>
                    <span className={`text-xs ${
                      cat.risk === 'None' ? 'text-blue-400' :
                      cat.risk === 'Low' ? 'text-green-400' :
                      cat.risk === 'Medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {cat.risk} risk
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-dark-700/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Yearly projection:</span>
            <span className="text-white font-bold">{(investmentAmount * 12).toLocaleString()} EUR</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-400">5-year (7% avg return):</span>
            <span className="text-green-400 font-bold">
              ~{Math.round(investmentAmount * 12 * ((Math.pow(1.07, 5) - 1) / 0.07) * 1.07).toLocaleString()} EUR
            </span>
          </div>
        </div>
      </motion.div>

      {/* Security Tips */}
      <div className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Security Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Използвай различни банкови сметки за business и лични средства',
            'Активирай 2FA на всички финансови платформи',
            'Не конвертирай големи суми наведнъж - spread over time',
            'Документирай всяка транзакция за данъчни цели',
            'Използвай VPN при достъп до финансови акаунти',
            'Пази private keys на hardware wallet (Ledger/Trezor)',
          ].map((tip, i) => (
            <p key={i} className="text-sm text-gray-400 flex items-start space-x-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-1.5"></span>
              <span>{tip}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CurrencyConverter;
