import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Globe2,
  Calendar,
  Clock,
  Plus,
  Send,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Instagram,
  Facebook,
  SendHorizontal,
  Linkedin
} from 'lucide-react';

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram Business',
    icon: 'IG',
    color: 'from-pink-500 via-rose-500 to-purple-600',
    features: ['Post scheduling', 'Story automation', 'DM auto-responses', 'Hashtag research'],
    accounts: [],
    status: 'active',
  },
  {
    id: 'facebook',
    name: 'Facebook Pages',
    icon: 'FB',
    color: 'from-blue-600 via-indigo-600 to-blue-800',
    features: ['Page posting', 'Group management', 'Lead Ads sync', 'Messenger bot'],
    accounts: [],
    status: 'active',
  },
  {
    id: 'telegram',
    name: 'Telegram Channels',
    icon: 'TG',
    color: 'from-cyan-500 via-sky-500 to-blue-600',
    features: ['Broadcast alerts', 'Bot commands', 'Private group gating', 'Member verification'],
    accounts: [],
    status: 'active',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn B2B',
    icon: 'LI',
    color: 'from-blue-700 via-indigo-700 to-slate-900',
    features: ['Corporate feed posts', 'Founder updates', 'Company page analytics'],
    accounts: [],
    status: 'active',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    icon: 'TT',
    color: 'from-slate-900 via-purple-900 to-cyan-900',
    features: ['Short video ads', 'Audio trend sync', 'Hashtag tracking'],
    accounts: [],
    status: 'planned',
  },
];

const SCHEDULE_SLOTS = [
  { time: '09:00', label: 'Утринен Пик (Business)', engagement: 'High' },
  { time: '12:30', label: 'Обедна Пауза', engagement: 'High' },
  { time: '15:30', label: 'Следобеден Трафик', engagement: 'Medium' },
  { time: '19:00', label: 'Вечерен Праймтайм', engagement: 'Very High' },
  { time: '21:30', label: 'Късен Мобилен Преглед', engagement: 'Medium' },
];

export function SocialAutomation() {
  const [activeTab, setActiveTab] = useState('platforms');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: '', platforms: [], scheduledTime: '', image: '' });

  const addPost = () => {
    if (!newPost.content.trim() || newPost.platforms.length === 0) return;
    setPosts(prev => [...prev, {
      ...newPost,
      id: Date.now(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    }]);
    setNewPost({ content: '', platforms: [], scheduledTime: '', image: '' });
  };

  const togglePlatform = (platformId) => {
    setNewPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-cyan-500 p-[1px] shadow-lg shadow-violet-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Share2 className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Social Automation &amp; Multi-Channel Engine</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Оркестрация на социални канали, авто-постинг на рекламни оферти и комуникация с лийдове.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Channel Sync Online
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 w-fit">
        {[
          { id: 'platforms', label: 'Канали & Акаунти', icon: Globe2 },
          { id: 'scheduler', label: 'Планировчик на Постове', icon: Calendar },
          { id: 'analytics', label: 'Аналитика & Reach', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-violet-500/20 border border-violet-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panes */}
      <AnimatePresence mode="wait">
        {/* 1. Platforms Tab */}
        {activeTab === 'platforms' && (
          <motion.div
            key="platforms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SOCIAL_PLATFORMS.map((platform, idx) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
                className={`relative rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between shadow-xl ${
                  selectedPlatform === platform.id ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`p-5 bg-gradient-to-r ${platform.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-extrabold text-lg border border-white/30">
                      {platform.icon}
                    </div>
                    <h3 className="text-white font-bold text-base tracking-tight">{platform.name}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-black/30 text-white border border-white/20">
                    {platform.status}
                  </span>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Автоматизации:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {platform.features.map((f, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[11px]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Свързани акаунти: <strong className="text-white">0</strong></span>
                    <button className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer">
                      + Свържи Акаунт
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 2. Scheduler Tab */}
        {activeTab === 'scheduler' && (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* New Post Bento */}
            <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Планиране на Нов Пост</h2>

              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Напишете съдържанието на поста тук..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-violet-500/40 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 outline-none resize-y"
              />

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">Целеви Платформи:</label>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        newPost.platforms.includes(p.id)
                          ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md border border-violet-400/40'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Дата и Час на Публикуване</label>
                  <input
                    type="datetime-local"
                    value={newPost.scheduledTime}
                    onChange={(e) => setNewPost(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium border border-white/10 hover:border-violet-500/40 focus:border-violet-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">URL на Изображение / Медия (опция)</label>
                  <input
                    type="text"
                    value={newPost.image}
                    onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium placeholder-slate-500 border border-white/10 hover:border-violet-500/40 focus:border-violet-400 outline-none font-mono"
                  />
                </div>
              </div>

              <button
                onClick={addPost}
                disabled={!newPost.content.trim() || newPost.platforms.length === 0}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-violet-500/25 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Планирай Пост</span>
              </button>
            </div>

            {/* Optimal Times Bento */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Оптимални Времеви Прозорци за Engagement</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {SCHEDULE_SLOTS.map(slot => (
                  <div key={slot.time} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                    <p className="text-white font-mono font-bold text-sm">{slot.time}</p>
                    <p className="text-slate-400 text-[11px] truncate">{slot.label}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      slot.engagement.includes('High') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {slot.engagement}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Posts List */}
            {posts.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/5">
                {posts.map(post => (
                  <div key={post.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-slate-200">{post.content}</p>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span>Платформи: <strong className="text-cyan-300">{post.platforms.join(', ')}</strong></span>
                        {post.scheduledTime && (
                          <span>Час: <strong className="text-white">{new Date(post.scheduledTime).toLocaleString('bg-BG')}</strong></span>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 self-start sm:self-center">
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* 3. Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-16 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3"
          >
            <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Социална Аналитика в Реално Време</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Свържете вашите Facebook, Instagram и Telegram акаунти за автоматично събиране на reach, clicks и конверсии.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SocialAutomation;

