import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'IG',
    color: 'from-purple-500 to-pink-500',
    features: ['Post scheduling', 'Story automation', 'DM responses', 'Hashtag research'],
    accounts: [],
    status: 'planned',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'FB',
    color: 'from-blue-600 to-blue-700',
    features: ['Page posting', 'Group management', 'Ad integration', 'Messenger bot'],
    accounts: [],
    status: 'planned',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'TG',
    color: 'from-sky-400 to-sky-600',
    features: ['Channel posting', 'Bot commands', 'Group management', 'User extraction'],
    accounts: [],
    status: 'active',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'SC',
    color: 'from-yellow-400 to-yellow-500',
    features: ['Story posting', 'Ad campaigns', 'Snap Ads'],
    accounts: [],
    status: 'planned',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'TT',
    color: 'from-gray-800 to-gray-900',
    features: ['Video posting', 'Hashtag analysis', 'Trend tracking'],
    accounts: [],
    status: 'evaluated',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'LI',
    color: 'from-blue-700 to-blue-800',
    features: ['Post scheduling', 'Connection requests', 'Company page'],
    accounts: [],
    status: 'planned',
  },
];

const SCHEDULE_SLOTS = [
  { time: '09:00', label: 'Morning', engagement: 'Medium' },
  { time: '12:00', label: 'Lunch', engagement: 'High' },
  { time: '15:00', label: 'Afternoon', engagement: 'Medium' },
  { time: '18:00', label: 'Evening', engagement: 'High' },
  { time: '21:00', label: 'Night', engagement: 'Medium' },
];

function SocialAutomation() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Media Automation</h1>
          <p className="text-gray-400 mt-1">
            Управление на акаунти, планиране на постове и автоматизация
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400">
          Задача 3
        </span>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'platforms', label: 'Platforms' },
          { id: 'scheduler', label: 'Post Scheduler' },
          { id: 'analytics', label: 'Analytics' },
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

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOCIAL_PLATFORMS.map((platform, idx) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
              className={`bg-dark-800/50 border rounded-xl overflow-hidden cursor-pointer transition-colors ${
                selectedPlatform === platform.id ? 'border-primary-500/50' : 'border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className={`bg-gradient-to-r ${platform.color} p-4 flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">
                    {platform.icon}
                  </div>
                  <h3 className="text-white font-bold">{platform.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  platform.status === 'active' ? 'bg-white/20 text-white' :
                  platform.status === 'planned' ? 'bg-black/20 text-white/80' :
                  'bg-black/20 text-white/60'
                }`}>
                  {platform.status}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Features:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {platform.features.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-dark-700/80 text-gray-400 text-xs rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Accounts: {platform.accounts.length}</span>
                  <button className="text-primary-400 text-xs hover:text-primary-300">
                    + Add Account
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Scheduler Tab */}
      {activeTab === 'scheduler' && (
        <div className="space-y-6">
          {/* New Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Schedule New Post</h2>

            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your post content..."
              rows={4}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />

            <div>
              <p className="text-sm text-gray-400 mb-2">Platforms:</p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      newPost.platforms.includes(p.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Schedule Time</label>
                <input
                  type="datetime-local"
                  value={newPost.scheduledTime}
                  onChange={(e) => setNewPost(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL (optional)</label>
                <input
                  type="text"
                  value={newPost.image}
                  onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              onClick={addPost}
              disabled={!newPost.content.trim() || newPost.platforms.length === 0}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Schedule Post
            </button>
          </motion.div>

          {/* Optimal Times */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Optimal Posting Times</h3>
            <div className="flex space-x-4">
              {SCHEDULE_SLOTS.map(slot => (
                <div key={slot.time} className="flex-1 text-center">
                  <p className="text-white font-mono text-sm">{slot.time}</p>
                  <p className="text-gray-500 text-xs">{slot.label}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                    slot.engagement === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {slot.engagement}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Posts */}
          {posts.length > 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-dark-700">
                <h3 className="text-white font-medium">Scheduled Posts ({posts.length})</h3>
              </div>
              <div className="divide-y divide-dark-700/50">
                {posts.map(post => (
                  <div key={post.id} className="px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">{post.content.slice(0, 100)}...</p>
                        <div className="flex items-center space-x-3 mt-2">
                          {post.platforms.map(pid => {
                            const pl = SOCIAL_PLATFORMS.find(p => p.id === pid);
                            return pl && (
                              <span key={pid} className="text-xs text-gray-500">{pl.icon}</span>
                            );
                          })}
                          {post.scheduledTime && (
                            <span className="text-xs text-gray-500">
                              {new Date(post.scheduledTime).toLocaleString('bg-BG')}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-500 text-sm">
              Connect social media accounts to start tracking engagement, reach, and follower growth across platforms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialAutomation;
