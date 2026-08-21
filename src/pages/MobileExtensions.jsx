import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle,
  Store,
  Download,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Star,
  Users,
  HardDrive,
  Shield,
  Moon,
  Brain,
  Lock,
  Keyboard,
  SpellCheck,
  Braces,
  SearchCode,
  Play,
  Square,
  Settings,
  ExternalLink,
  Smartphone,
  Globe,
  Zap,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ExtensionSandbox from '../components/ExtensionSandbox';
import ClaudeExtensionPanel from '../components/ClaudeExtensionPanel';

const ICON_MAP = {
  brain: Brain,
  moon: Moon,
  shield: Shield,
  lock: Lock,
  keyboard: Keyboard,
  'spell-check': SpellCheck,
  braces: Braces,
  'search-code': SearchCode,
  puzzle: Puzzle
};

function ExtIcon({ icon, className = "w-6 h-6" }) {
  const IconComponent = ICON_MAP[icon] || Puzzle;
  return <IconComponent className={className} />;
}

const CATEGORY_COLORS = {
  'AI & Productivity': 'from-violet-500 to-purple-600',
  'Appearance': 'from-blue-500 to-cyan-600',
  'Privacy & Security': 'from-emerald-500 to-green-600',
  'Navigation': 'from-orange-500 to-amber-600',
  'Developer Tools': 'from-rose-500 to-pink-600'
};

export default function MobileExtensions() {
  const [view, setView] = useState('installed'); // 'installed' | 'store' | 'running'
  const [storeExtensions, setStoreExtensions] = useState([]);
  const [installedExtensions, setInstalledExtensions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeExtension, setActiveExtension] = useState(null);
  const [notification, setNotification] = useState(null);
  const [claudePanelOpen, setClaudePanelOpen] = useState(false);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchStore = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/extensions/store?${params}`);
      const data = await res.json();
      if (data.success) {
        setStoreExtensions(data.extensions);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch store:', error);
    }
  }, [selectedCategory, searchQuery]);

  const fetchInstalled = useCallback(async () => {
    try {
      const res = await fetch('/api/extensions/installed');
      const data = await res.json();
      if (data.success) {
        setInstalledExtensions(data.extensions);
      }
    } catch (error) {
      console.error('Failed to fetch installed:', error);
    }
  }, []);

  useEffect(() => {
    fetchStore();
    fetchInstalled();
  }, [fetchStore, fetchInstalled]);

  useEffect(() => {
    fetchStore();
  }, [selectedCategory, searchQuery, fetchStore]);

  const installExtension = async (extensionId) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/extensions/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        await fetchInstalled();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (error) {
      showNotification('Installation failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const uninstallExtension = async (extensionId) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/extensions/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        if (activeExtension?.id === extensionId) setActiveExtension(null);
        await fetchInstalled();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (error) {
      showNotification('Uninstall failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExtension = async (extensionId) => {
    try {
      const res = await fetch('/api/extensions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        await fetchInstalled();
      }
    } catch (error) {
      showNotification('Toggle failed: ' + error.message, 'error');
    }
  };

  const launchExtension = (ext) => {
    if (ext.id === 'claude-for-browsers') {
      setClaudePanelOpen(true);
    } else {
      setActiveExtension(ext);
      setView('running');
    }
  };

  const isInstalled = (extId) => installedExtensions.some(e => e.id === extId);

  return (
    <div className="space-y-6">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 ${
              notification.type === 'error'
                ? 'bg-red-500/90 text-white'
                : 'bg-emerald-500/90 text-white'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Puzzle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mobile Brave Extensions</h1>
              <p className="text-dark-400 text-sm">
                Desktop extensions on your mobile browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex glass-effect rounded-lg overflow-hidden">
              <TabButton
                active={view === 'installed'}
                onClick={() => setView('installed')}
                icon={Puzzle}
                label="Installed"
                count={installedExtensions.length}
              />
              <TabButton
                active={view === 'store'}
                onClick={() => setView('store')}
                icon={Store}
                label="Store"
              />
              {activeExtension && (
                <TabButton
                  active={view === 'running'}
                  onClick={() => setView('running')}
                  icon={Play}
                  label="Running"
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile compatibility badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-gradient-to-r from-primary-500/10 to-amber-500/10 border border-primary-500/20"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary-400" />
            <span className="font-semibold">Mobile Runtime Active</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-dark-400">
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" /> Brave Browser Compatible
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" /> Sandboxed Execution
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" /> Chrome API Polyfill v3
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {view === 'installed' && (
          <motion.div
            key="installed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <InstalledView
              extensions={installedExtensions}
              onToggle={toggleExtension}
              onUninstall={uninstallExtension}
              onLaunch={launchExtension}
              onGoToStore={() => setView('store')}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {view === 'store' && (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <StoreView
              extensions={storeExtensions}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onInstall={installExtension}
              isInstalled={isInstalled}
              isLoading={isLoading}
              onRefresh={fetchStore}
            />
          </motion.div>
        )}

        {view === 'running' && activeExtension && (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ExtensionSandbox
              extension={activeExtension}
              onClose={() => { setActiveExtension(null); setView('installed'); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claude Extension Side Panel */}
      <AnimatePresence>
        {claudePanelOpen && (
          <ClaudeExtensionPanel onClose={() => setClaudePanelOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-primary-500 text-white'
          : 'text-dark-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          active ? 'bg-white/20' : 'bg-dark-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function InstalledView({ extensions, onToggle, onUninstall, onLaunch, onGoToStore, isLoading }) {
  if (extensions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card text-center py-16"
      >
        <Puzzle className="w-20 h-20 text-dark-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Extensions Installed</h3>
        <p className="text-dark-400 mb-6 max-w-md mx-auto">
          Browse the extension store to find and install extensions
          that work on your mobile Brave browser.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoToStore}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Store className="w-5 h-5" />
          Browse Extension Store
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {extensions.map((ext, idx) => (
        <motion.div
          key={ext.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="card hover:border-primary-500/30 border border-transparent transition-all"
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
              CATEGORY_COLORS[ext.category] || 'from-gray-500 to-gray-600'
            } shrink-0`}>
              <ExtIcon icon={ext.icon} className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold truncate">{ext.name}</h3>
                <span className="text-xs text-dark-400">v{ext.version}</span>
                {ext.featured && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-sm text-dark-400 line-clamp-2 mb-3">{ext.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLaunch(ext)}
                  disabled={!ext.enabled}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-40"
                >
                  <Play className="w-3 h-3" />
                  Launch
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggle(ext.id)}
                  className={`text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all ${
                    ext.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                  }`}
                >
                  {ext.enabled ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                  {ext.enabled ? 'Enabled' : 'Disabled'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onUninstall(ext.id)}
                  disabled={isLoading}
                  className="text-xs py-1.5 px-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StoreView({
  extensions,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onInstall,
  isInstalled,
  isLoading,
  onRefresh
}) {
  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search extensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryPill
              label="All"
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            />
            {categories.map(cat => (
              <CategoryPill
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            className="p-2 glass-effect rounded-lg hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Featured banner */}
      {selectedCategory === 'all' && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 border border-violet-500/20"
        >
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">Claude for Browsers</h2>
                <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-dark-400 text-sm mb-2">
                Full Anthropic Claude AI assistant in your mobile Brave browser.
                Chat, analyze pages, summarize content, and get AI help anywhere.
              </p>
              <div className="flex items-center gap-4 text-xs text-dark-400">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> 4.9</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 2M+ users</span>
                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> 1.2 MB</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isInstalled('claude-for-browsers') && onInstall('claude-for-browsers')}
              disabled={isLoading || isInstalled('claude-for-browsers')}
              className={`btn-primary px-6 py-3 flex items-center gap-2 shrink-0 ${
                isInstalled('claude-for-browsers') ? 'opacity-60' : ''
              }`}
            >
              {isInstalled('claude-for-browsers') ? (
                <><Check className="w-5 h-5" /> Installed</>
              ) : (
                <><Download className="w-5 h-5" /> Install Now</>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Extension grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extensions.map((ext, idx) => (
          <StoreExtensionCard
            key={ext.id}
            extension={ext}
            index={idx}
            onInstall={onInstall}
            installed={isInstalled(ext.id)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {extensions.length === 0 && (
        <div className="card text-center py-12">
          <Search className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No extensions found</h3>
          <p className="text-dark-400">Try a different search term or category</p>
        </div>
      )}
    </div>
  );
}

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? 'bg-primary-500 text-white'
          : 'glass-effect text-dark-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function StoreExtensionCard({ extension, index, onInstall, installed, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card hover:border-primary-500/30 border border-transparent transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${
          CATEGORY_COLORS[extension.category] || 'from-gray-500 to-gray-600'
        } shrink-0`}>
          <ExtIcon icon={extension.icon} className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold truncate text-sm">{extension.name}</h3>
            {extension.featured && (
              <Star className="w-3 h-3 text-amber-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-dark-400">{extension.author}</p>
        </div>
      </div>

      <p className="text-sm text-dark-400 line-clamp-2 mb-4">{extension.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-dark-500">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> {extension.rating}
          </span>
          <span>{extension.users}</span>
          <span>{extension.size}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !installed && onInstall(extension.id)}
          disabled={isLoading || installed}
          className={`text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all ${
            installed
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'btn-primary'
          } disabled:opacity-60`}
        >
          {installed ? (
            <><Check className="w-3 h-3" /> Installed</>
          ) : isLoading ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Installing</>
          ) : (
            <><Download className="w-3 h-3" /> Install</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
