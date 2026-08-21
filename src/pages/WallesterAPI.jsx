import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const CARD_TYPES = [
  { id: 'virtual_debit', name: 'Virtual Debit', description: 'Виртуална дебитна карта за онлайн плащания', fee: 'Free', limit: '10,000 EUR/month' },
  { id: 'plastic_debit', name: 'Plastic Debit', description: 'Физическа дебитна карта с безконтактно плащане', fee: '5 EUR', limit: '25,000 EUR/month' },
  { id: 'virtual_prepaid', name: 'Virtual Prepaid', description: 'Предплатена виртуална карта', fee: 'Free', limit: '5,000 EUR/month' },
];

const API_ENDPOINTS = [
  { method: 'POST', path: '/cards', description: 'Create a new card', status: 'ready' },
  { method: 'GET', path: '/cards/{id}', description: 'Get card details', status: 'ready' },
  { method: 'GET', path: '/cards', description: 'List all cards', status: 'ready' },
  { method: 'PATCH', path: '/cards/{id}/activate', description: 'Activate a card', status: 'ready' },
  { method: 'PATCH', path: '/cards/{id}/block', description: 'Block a card', status: 'ready' },
  { method: 'GET', path: '/cards/{id}/transactions', description: 'Card transactions', status: 'ready' },
  { method: 'POST', path: '/cards/{id}/limits', description: 'Set card limits', status: 'planned' },
  { method: 'GET', path: '/accounts/{id}/balance', description: 'Account balance', status: 'ready' },
];

function WallesterAPI() {
  const [activeTab, setActiveTab] = useState('cards');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState('virtual_debit');
  const [cardholderName, setCardholderName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/cards`);
      const data = await res.json();
      if (data.success) {
        setCards(data.cards || []);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const createCard = async () => {
    if (!cardholderName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedCardType,
          cardholderName: cardholderName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setCardholderName('');
        fetchCards();
      } else {
        setError(data.error || 'Failed to create card');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleCardStatus = async (cardId, action) => {
    try {
      await fetch(`${API_BASE}/api/wallester/cards/${cardId}/${action}`, {
        method: 'PATCH',
      });
      fetchCards();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallester API</h1>
          <p className="text-gray-400 mt-1">
            Управление на карти и акаунти чрез Wallester API
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
          >
            + Create Card
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
            Задача 1
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'cards', label: 'Cards' },
          { id: 'types', label: 'Card Types' },
          { id: 'api', label: 'API Reference' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-12 text-center"
            >
              <div className="w-20 h-20 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">No Cards Yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Създайте първата си бизнес карта чрез Wallester API
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Create Your First Card
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
                >
                  {/* Card Visual */}
                  <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-5 relative">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Wallester</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        card.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        card.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {card.status || 'pending'}
                      </span>
                    </div>
                    <div className="mt-6">
                      <p className="text-gray-300 font-mono text-lg tracking-widest">
                        •••• •••• •••• {card.last4 || '0000'}
                      </p>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-gray-500 text-xs">Cardholder</p>
                        <p className="text-gray-300 text-sm font-medium">{card.cardholderName || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Expires</p>
                        <p className="text-gray-300 text-sm">{card.expiryDate || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="text-gray-300">{card.type || 'virtual_debit'}</span>
                    </div>
                    {card.balance !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Balance</span>
                        <span className="text-white font-medium">{card.balance} EUR</span>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      {card.status !== 'active' && (
                        <button
                          onClick={() => toggleCardStatus(card.id, 'activate')}
                          className="flex-1 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      {card.status === 'active' && (
                        <button
                          onClick={() => toggleCardStatus(card.id, 'block')}
                          className="flex-1 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card Types Tab */}
      {activeTab === 'types' && (
        <div className="grid gap-4">
          {CARD_TYPES.map((type, idx) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-medium">{type.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{type.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">Fee: <span className="text-gray-300">{type.fee}</span></span>
                  <span className="text-xs text-gray-500">Limit: <span className="text-gray-300">{type.limit}</span></span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedCardType(type.id); setShowCreateModal(true); }}
                className="px-4 py-2 bg-primary-600/20 text-primary-400 text-sm rounded-lg hover:bg-primary-600/30 transition-colors"
              >
                Create
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* API Reference Tab */}
      {activeTab === 'api' && (
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-white">API Endpoints</h2>
            <p className="text-gray-500 text-sm">Wallester API endpoints used by the system</p>
          </div>
          <div className="divide-y divide-dark-700/50">
            {API_ENDPOINTS.map((ep, idx) => (
              <div key={idx} className="px-5 py-3 flex items-center space-x-4 hover:bg-dark-700/30">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold min-w-[60px] text-center ${
                  ep.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                  ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {ep.method}
                </span>
                <span className="text-gray-300 font-mono text-sm flex-1">{ep.path}</span>
                <span className="text-gray-500 text-sm">{ep.description}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  ep.status === 'ready' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {ep.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Create New Card</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Card Type</label>
              <select
                value={selectedCardType}
                onChange={(e) => setSelectedCardType(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                {CARD_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.fee}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="IVAN PETROV"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white uppercase placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCard}
                disabled={creating || !cardholderName.trim()}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {creating ? 'Creating...' : 'Create Card'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default WallesterAPI;
