import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  Lock,
  Globe2,
  Layers,
  Sparkles,
  ArrowRight,
  Wifi,
  Cpu
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const CARD_TYPES = [
  { id: 'virtual_debit', name: 'Virtual Debit Card', description: 'Моментална виртуална дебитна карта за дигитални разплащания', fee: 'Free (0 EUR)', limit: '10,000 EUR/месец', color: 'from-cyan-500/20 to-blue-600/20' },
  { id: 'plastic_debit', name: 'Physical Plastic Debit', description: 'Физическа NFC карта с безконтактно плащане и банкомат теглене', fee: '5 EUR (Еднократно)', limit: '25,000 EUR/месец', color: 'from-purple-500/20 to-indigo-600/20' },
  { id: 'virtual_prepaid', name: 'Virtual Prepaid Pro', description: 'Предплатена корпоративна карта за маркетинг и рекламни бюджети', fee: 'Free (0 EUR)', limit: '5,000 EUR/месец', color: 'from-emerald-500/20 to-teal-600/20' },
];

const API_ENDPOINTS = [
  { method: 'POST', path: '/api/wallester/cards', description: 'Издаване на нова виртуална или физическа карта', status: 'ready' },
  { method: 'GET', path: '/api/wallester/cards/{id}', description: 'Извличане на ПИН, CVV и статус на карта', status: 'ready' },
  { method: 'GET', path: '/api/wallester/cards', description: 'Списък с всички издадени корпоративни карти', status: 'ready' },
  { method: 'PATCH', path: '/api/wallester/cards/{id}/activate', description: 'Активиране на новоиздадена карта', status: 'ready' },
  { method: 'PATCH', path: '/api/wallester/cards/{id}/block', description: 'Временно замразяване или блокиране', status: 'ready' },
  { method: 'GET', path: '/api/wallester/cards/{id}/transactions', description: 'Трансакционна история в реално време', status: 'ready' },
  { method: 'POST', path: '/api/wallester/cards/{id}/limits', description: 'Задаване на дневни и месечни лимити', status: 'ready' },
  { method: 'GET', path: '/api/wallester/accounts/{id}/balance', description: 'Баланс и налични средства по сметката', status: 'ready' },
];

export function WallesterAPI() {
  const [activeTab, setActiveTab] = useState('cards');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState('virtual_debit');
  const [cardholderName, setCardholderName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCards = useCallback(async () => {
    setIsRefreshing(true);
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
      setTimeout(() => setIsRefreshing(false), 500);
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
          cardholderName: cardholderName.trim().toUpperCase(),
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
                <CreditCard className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Wallester BaaS &amp; Card Engine</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Директна интеграция за мигновено издаване и управление на Visa/Mastercard корпоративни карти.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Издай Карта</span>
            </button>
            <button
              onClick={fetchCards}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
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

      {/* Tabs Navigation */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 w-fit">
        {[
          { id: 'cards', label: 'Издадени Карти', count: cards.length },
          { id: 'types', label: 'Типове Карти & Тарифи', count: CARD_TYPES.length },
          { id: 'api', label: 'REST API Ендпойнти', count: API_ENDPOINTS.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id
                  ? 'bg-black/30 text-white'
                  : 'bg-white/10 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panes */}
      <AnimatePresence mode="wait">
        {/* 1. Cards Tab */}
        {activeTab === 'cards' && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {cards.length === 0 ? (
              <div className="p-16 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-2xl border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Няма активни издадени карти</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                    Издайте първата си виртуална или физическа Wallester карта за вашия бизнес.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Издай Първа Карта
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                  <motion.div
                    key={card.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="relative rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between"
                  >
                    {/* Realistic Liquid Glass Card Mockup */}
                    <div className="p-6 bg-gradient-to-br from-[#0e1c36] via-[#102447] to-[#0a1224] border-b border-white/10 relative overflow-hidden space-y-6">
                      <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-extrabold tracking-widest text-cyan-300 uppercase">
                          WALLESTER
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          card.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          card.status === 'blocked' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {card.status || 'Active'}
                        </span>
                      </div>

                      {/* Chip & NFC */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-200 p-[1px] shadow-sm">
                          <div className="w-full h-full bg-amber-500/80 rounded-[7px] flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-amber-950" />
                          </div>
                        </div>
                        <Wifi className="w-5 h-5 text-white/40 rotate-90" />
                      </div>

                      <div>
                        <p className="text-lg font-mono font-bold tracking-widest text-white drop-shadow">
                          •••• •••• •••• {card.last4 || '4242'}
                        </p>
                      </div>

                      <div className="flex items-end justify-between text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Титуляр:</span>
                          <span className="font-bold text-white uppercase">{card.cardholderName || 'BUSINESS CLIENT'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-sans">Валидна до:</span>
                          <span className="text-slate-300">{card.expiryDate || '12/28'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Balance */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Наличност:</span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          €{card.balance !== undefined ? card.balance : '1,500.00'} EUR
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        {card.status !== 'active' ? (
                          <button
                            onClick={() => toggleCardStatus(card.id, 'activate')}
                            className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Активирай
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleCardStatus(card.id, 'block')}
                            className="flex-1 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Блокирай
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* 2. Card Types Tab */}
        {activeTab === 'types' && (
          <motion.div
            key="types"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid gap-4"
          >
            {CARD_TYPES.map((type, idx) => (
              <div
                key={type.id}
                className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
              >
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{type.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">{type.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs font-mono">
                    <span className="text-slate-400">Такса: <strong className="text-emerald-400">{type.fee}</strong></span>
                    <span className="text-slate-400">Лимит: <strong className="text-cyan-300">{type.limit}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedCardType(type.id); setShowCreateModal(true); }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer shrink-0"
                >
                  Издай Този Тип
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* 3. API Reference Tab */}
        {activeTab === 'api' && (
          <motion.div
            key="api"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/10">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Wallester BaaS REST API Reference</h2>
              <p className="text-xs text-slate-400 mt-0.5">Всички интегрирани бекенд ендпойнти за карти и сметки</p>
            </div>
            <div className="divide-y divide-white/5">
              {API_ENDPOINTS.map((ep, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold min-w-[65px] text-center border ${
                      ep.method === 'GET' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      ep.method === 'POST' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
                      'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{ep.path}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-xs text-slate-400">{ep.description}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {ep.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Card Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#080d1a] border border-white/10 p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white">Издаване на Нова Карта</h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Тип Карта</label>
                  <select
                    value={selectedCardType}
                    onChange={(e) => setSelectedCardType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
                  >
                    {CARD_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.fee})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Име на Титуляра (Латиница)</label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="IVAN PETROV"
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium uppercase placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/10"
                >
                  Отказ
                </button>
                <button
                  onClick={createCard}
                  disabled={creating || !cardholderName.trim()}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
                >
                  {creating ? 'Издаване...' : 'Потвърди Издаване'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WallesterAPI;

