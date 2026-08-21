import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function EligibilityChecker() {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkEligibility = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Моля, въведете поне име и фамилия');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/public_eligibility_check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_first_name: firstName.trim(),
          p_middle_name: middleName.trim() || null,
          p_last_name: lastName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Грешка при проверката');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Проверка за Eligibility</h1>
          <p className="text-gray-400 mt-1">
            Въведете 3 имена за да проверите eligible ООД фирми за Wallester
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            Задача 18
          </span>
        </div>
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <form onSubmit={checkEligibility} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Име *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Иван"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Презиме
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Петров"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Фамилия *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Иванов"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Проверка...</span>
              </>
            ) : (
              <span>Провери Eligibility</span>
            )}
          </button>
        </form>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      {results !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">
            Резултати ({results.length} фирми)
          </h2>

          {results.length === 0 ? (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">Не са намерени фирми за тези имена</p>
              <p className="text-gray-500 text-sm mt-2">
                Проверете дали имената са правилно написани или добавете собственик чрез Registry Check
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((company, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-dark-800/50 border rounded-xl p-5 ${
                    company.is_eligible
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-white font-medium text-lg">
                        {company.company_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>ЕИК: {company.eik}</span>
                        <span>Тип: {company.business_type}</span>
                        <span>Дял: {company.ownership_share}%</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        company.is_eligible
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {company.is_eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                    </span>
                  </div>
                  {company.reason && (
                    <p className="mt-2 text-sm text-gray-500">{company.reason}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Summary */}
          {results.length > 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-400">
                Eligible: {results.filter(r => r.is_eligible).length} / {results.length}
              </span>
              <span className="text-gray-500 text-sm">
                Критерии: ООД/ЕООД + собственост ≥ 50%
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Info */}
      <div className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Критерии за Eligibility</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
            <span>Фирмата трябва да е ООД или ЕООД</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
            <span>Собственикът трябва да притежава поне 50% дял</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
            <span>Фирмата не трябва да има съществуващ Wallester акаунт</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
            <span>Фирмата не трябва да е в черен списък</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EligibilityChecker;
