import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const OFFER_ICONS = {
  revolut_business: { emoji: 'R', gradient: 'from-blue-500 to-blue-700' },
  wise_business: { emoji: 'W', gradient: 'from-green-500 to-green-700' },
  viva_wallet: { emoji: 'V', gradient: 'from-orange-500 to-orange-700' },
  sumup: { emoji: 'S', gradient: 'from-blue-400 to-blue-600' },
};

function AlternativeOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchOffers = useCallback(async () => {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alternative Offers</h1>
          <p className="text-gray-400 mt-1">
            Алтернативни предложения за non-eligible компании
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
          Задачи 16, 44, 50
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {cat === 'all' ? 'All' :
             cat === 'not_ood' ? 'Not OOD/EOOD' :
             cat === 'low_ownership' ? 'Low Ownership (<50%)' :
             cat === 'already_registered' ? 'Already Registered' :
             cat === 'blacklisted' ? 'Blacklisted' : cat}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-5">
        <h3 className="text-primary-400 font-medium text-sm mb-2">How It Works</h3>
        <p className="text-gray-400 text-sm">
          Когато компания не отговаря на критериите за Wallester (не е ООД/ЕООД, собственост {"<"} 50%,
          вече регистрирана или в черен списък), предлагаме алтернативни бизнес услуги с affiliate комисионни.
        </p>
      </div>

      {/* Offer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOffers.map((offer, idx) => {
          const icon = OFFER_ICONS[offer.provider_slug] || { emoji: '?', gradient: 'from-gray-500 to-gray-700' };
          return (
            <motion.div
              key={offer.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${icon.gradient} p-5`}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {icon.emoji}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{offer.provider_name}</h3>
                    <p className="text-white/70 text-sm">{offer.offer_type || 'Business Account'}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {offer.description && (
                  <p className="text-gray-400 text-sm">{offer.description}</p>
                )}

                {/* Features */}
                {offer.features && (
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(offer.features) ? offer.features : []).map((feat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-dark-700/50 text-gray-300 text-xs rounded">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commission & Details */}
                <div className="grid grid-cols-2 gap-3">
                  {offer.commission_rate && (
                    <div className="bg-dark-700/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Commission</p>
                      <p className="text-emerald-400 font-bold text-lg">{offer.commission_rate}</p>
                    </div>
                  )}
                  {offer.avg_payout && (
                    <div className="bg-dark-700/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Avg Payout</p>
                      <p className="text-white font-bold text-lg">{offer.avg_payout}</p>
                    </div>
                  )}
                </div>

                {/* Applicable Reasons */}
                {offer.reason_category && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Applicable when:</p>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      {offer.reason_category === 'not_ood' ? 'Company is not OOD/EOOD' :
                       offer.reason_category === 'low_ownership' ? 'Ownership < 50%' :
                       offer.reason_category === 'already_registered' ? 'Already has Wallester' :
                       offer.reason_category}
                    </span>
                  </div>
                )}

                {/* Signup Link */}
                {offer.signup_url && (
                  <a
                    href={offer.signup_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-center text-sm rounded-lg transition-colors font-medium"
                  >
                    Open Signup Page
                  </a>
                )}

                {/* Active status */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${
                    offer.is_active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {offer.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                  {offer.priority && (
                    <span className="text-gray-500">Priority: {offer.priority}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredOffers.length === 0 && (
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
          <p className="text-gray-400">Няма offers за тази категория</p>
          <p className="text-gray-500 text-sm mt-1">
            Offers се зареждат от Supabase таблица alternative_offers
          </p>
        </div>
      )}
    </div>
  );
}

export default AlternativeOffers;
