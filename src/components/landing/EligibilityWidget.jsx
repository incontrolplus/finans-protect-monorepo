import React, { useState } from 'react';

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
        setError(data.error || 'Error checking eligibility');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-6" id="check">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-800/80 backdrop-blur-sm border border-dark-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Проверка за Eligibility
          </h2>
          <p className="text-gray-400 text-center mb-6">
            Въведете 3 имена на собственик за да проверите eligible фирми
          </p>

          <form onSubmit={handleCheck} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Име"
                required
                className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Презиме"
                className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
                required
                className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all"
            >
              {loading ? 'Проверка...' : 'Провери'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Намерени: {results.total} фирми</span>
                <span className="text-green-400 font-bold">Eligible: {results.eligible}</span>
              </div>

              {results?.companies && results.companies.map((company, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    company.is_eligible
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-dark-700/50 border-dark-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{company.company_name}</p>
                      <p className="text-gray-500 text-xs">
                        EIK: {company.eik} | {company.business_type} | {company.ownership_share}%
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      company.is_eligible
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
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
