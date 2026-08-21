import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:3000') + '/api/filedash';

const PRIORITY_COLORS = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

const SYNC_COLORS = {
  synced: 'bg-green-500',
  unchanged: 'bg-green-500',
  outdated: 'bg-yellow-500',
  not_synced: 'bg-red-500',
  missing_source: 'bg-dark-500',
  ssd_offline: 'bg-dark-600',
  error: 'bg-red-500',
  not_found: 'bg-dark-500',
};

const CAT_ICONS = {
  credentials: '🔑', openclaw: '🦞', projects: '💻', microinvest_ocr: '🧾',
  n8n_workflows: '⚡', tailscale: '🔗', backups: '💾', supabase: '🗄️',
  hostinger: '🌐', documents: '📄', configs: '⚙️',
};

// ─── Sub-components ────────────────────────────────────────────

function StatsRow({ categories, files, syncStatus }) {
  const totalTracked = Object.values(categories).reduce((s, c) => s + (c.fileCount || 0), 0);
  const found = files.filter(f => f.exists !== false).length;
  const missing = files.filter(f => f.exists === false).length;
  const synced = Object.values(syncStatus).filter(s => s === 'synced' || s === 'unchanged').length;

  const stats = [
    { label: 'Tracked', value: totalTracked, color: 'from-blue-400 to-blue-600' },
    { label: 'Found', value: found || '—', color: 'from-green-400 to-green-600' },
    { label: 'Missing', value: missing, color: 'from-red-400 to-red-600' },
    { label: 'Synced', value: synced || '—', color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <div className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
          <div className="text-xs text-dark-400 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function CategorySidebar({ categories, activeCat, setActiveCat, syncCounts, priorityFilter, setPriorityFilter, setView }) {
  const sorted = Object.entries(categories).sort((a, b) => (a[1].order || 99) - (b[1].order || 99));
  const filtered = priorityFilter === 'all'
    ? sorted
    : sorted.filter(([, c]) => c.priority === priorityFilter);

  return (
    <div className="w-full">
      {/* Priority filter */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {['all', 'critical', 'high', 'medium'].map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              priorityFilter === p
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-dark-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Category list */}
      <div className="space-y-1">
        {filtered.map(([key, cat]) => {
          const counts = syncCounts[key] || {};
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setActiveCat(key); setView('category'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeCat === key
                  ? 'bg-primary-500/15 border border-primary-500/30 text-white'
                  : 'text-dark-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-lg flex-shrink-0">{cat.icon || CAT_ICONS[key] || '📁'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{cat.label}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[cat.priority] || ''}`}>
                    {(cat.priority || '')[0]?.toUpperCase()}
                  </span>
                  {counts.synced > 0 && <span className="text-[10px] text-green-400">{counts.synced}✓</span>}
                  {counts.outdated > 0 && <span className="text-[10px] text-yellow-400">{counts.outdated}~</span>}
                  {counts.notSynced > 0 && <span className="text-[10px] text-red-400">{counts.notSynced}✗</span>}
                </div>
              </div>
              <span className="text-xs text-dark-500 flex-shrink-0">{cat.fileCount}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Extra nav */}
      <div className="border-t border-dark-700 mt-4 pt-4 space-y-1">
        <button onClick={() => setView('ssd')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-white/5 transition-all">
          💾 SSD Contents
        </button>
        <button onClick={() => setView('browse')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-white/5 transition-all">
          📂 Browse Files
        </button>
      </div>
    </div>
  );
}

function FileGrid({ files, syncStatus, onPreview, onBrowse, onTransfer, activeCat }) {
  if (!files.length) {
    return <div className="text-dark-400 text-center py-12">No files in this category</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {files.map((f, i) => {
        const status = syncStatus[f.path] || 'not_synced';
        const dimmed = !f.exists;

        return (
          <motion.div
            key={f.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-dark-800/50 border border-dark-700 rounded-xl p-4 relative group transition-all hover:border-dark-600 ${
              dimmed ? 'opacity-50' : ''
            }`}
          >
            {/* Sync dot */}
            <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${SYNC_COLORS[status] || 'bg-dark-600'}`}
              title={status} />

            <div className="pr-6">
              <div className="flex items-center gap-2 mb-1">
                {f.isDir && <span className="text-xs text-dark-400">📁</span>}
                <h4 className="text-sm font-medium text-white truncate">{f.name}</h4>
              </div>
              <p className="text-xs text-dark-400 truncate mb-2">{f.desc}</p>
              <div className="flex items-center gap-3 text-[11px] text-dark-500">
                <span>{f.sizeHuman || '—'}</span>
                {f.modified && (
                  <span>{new Date(f.modified).toLocaleDateString('bg-BG')}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {f.previewType === 'text' && (
                <button
                  onClick={() => onPreview(f)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all"
                >
                  Preview
                </button>
              )}
              {f.isDir && f.exists && (
                <button
                  onClick={() => onBrowse(f.path)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                >
                  Browse
                </button>
              )}
              {f.exists && (
                <button
                  onClick={() => onTransfer(f.path, activeCat)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                >
                  To SSD
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function TransferProgress({ state }) {
  if (!state || (!state.active && state.total === 0)) return null;
  const pct = state.total > 0 ? Math.round((state.done / state.total) * 100) : 0;

  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 mb-6">
      {state.active ? (
        <>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white font-medium">Syncing: {state.current}</span>
            <span className="text-dark-400">{state.done}/{state.total} — {state.eta} left</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-xs text-dark-500 mt-1">{state.speed}</div>
        </>
      ) : (
        <TransferResults log={state.log} synced={state.synced} failed={state.failed} skipped={state.skipped} />
      )}
    </div>
  );
}

function TransferResults({ log, synced, failed, skipped }) {
  if (!log || log.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">Transfer complete</span>
        <span className="text-xs text-dark-400">
          {synced} synced · {skipped} unchanged · {failed} failed
        </span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {log.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SYNC_COLORS[entry.status] || 'bg-dark-600'}`} />
            <span className="text-dark-300 truncate flex-1">{entry.name}</span>
            <span className={`text-dark-500 ${entry.status === 'error' ? 'text-red-400' : ''}`}>
              {entry.status === 'error' ? 'error' : entry.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SSDContents({ contents, onPreview }) {
  const [collapsed, setCollapsed] = useState({});

  if (!contents.length) {
    return <div className="text-dark-400 text-center py-12">No files on SSD or SSD not connected</div>;
  }

  // Group by device → category
  const grouped = {};
  for (const item of contents) {
    const dk = item.deviceId;
    if (!grouped[dk]) grouped[dk] = { name: item.deviceName, isCurrentDevice: item.isCurrentDevice, categories: {} };
    if (!grouped[dk].categories[item.category]) grouped[dk].categories[item.category] = { size: item.categorySize, files: [] };
    grouped[dk].categories[item.category].files.push(item);
  }

  const toggleCat = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([devId, dev]) => (
        <div key={devId} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-700 flex items-center gap-3">
            <span className="text-sm font-medium text-white">{dev.name}</span>
            {dev.isCurrentDevice && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                current
              </span>
            )}
          </div>
          <div className="divide-y divide-dark-700/50">
            {Object.entries(dev.categories).map(([cat, data]) => {
              const key = `${devId}-${cat}`;
              const isOpen = !collapsed[key];
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCat(key)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-all"
                  >
                    <span className="text-sm text-dark-300">
                      {CAT_ICONS[cat] || '📁'} {cat}
                      <span className="text-dark-500 ml-2">({data.files.length})</span>
                    </span>
                    <span className="text-xs text-dark-500">{data.size} {isOpen ? '▾' : '▸'}</span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-2 space-y-1">
                          {data.files.map(f => (
                            <div key={f.path} className="flex items-center gap-2 text-xs py-1">
                              <span className="text-dark-400">{f.isDir ? '📁' : '📄'}</span>
                              <span className="text-dark-300 truncate flex-1">{f.name}</span>
                              <span className="text-dark-500">{f.sizeHuman}</span>
                              {f.previewType === 'text' && (
                                <button
                                  onClick={() => onPreview(f)}
                                  className="text-green-400 hover:text-green-300 ml-1"
                                >
                                  view
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function FileBrowser({ browseDir, setBrowseDir, onPreview, onTransfer }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/browse?path=${encodeURIComponent(browseDir)}`)
      .then(r => r.json())
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [browseDir]);

  const parts = browseDir.split('/').filter(Boolean);
  const breadcrumbs = parts.map((p, i) => ({
    label: p,
    path: '/' + parts.slice(0, i + 1).join('/'),
  }));

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto text-sm">
        <button onClick={() => setBrowseDir('/Users/diokarabaz')} className="text-primary-400 hover:text-primary-300 flex-shrink-0">~</button>
        {breadcrumbs.slice(-4).map((b, i) => (
          <React.Fragment key={b.path}>
            <span className="text-dark-600">/</span>
            <button
              onClick={() => setBrowseDir(b.path)}
              className="text-dark-300 hover:text-white truncate max-w-[120px]"
            >
              {b.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {loading ? (
        <div className="text-dark-400 text-center py-8">Loading...</div>
      ) : (
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl divide-y divide-dark-700/50">
          {entries.map(e => (
            <div key={e.path} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all group">
              <span className="text-sm flex-shrink-0">{e.isDir ? '📁' : '📄'}</span>
              {e.isDir ? (
                <button onClick={() => setBrowseDir(e.path)} className="text-sm text-dark-200 hover:text-white truncate flex-1 text-left">
                  {e.name}
                </button>
              ) : (
                <span className="text-sm text-dark-300 truncate flex-1">{e.name}</span>
              )}
              <span className="text-xs text-dark-500 flex-shrink-0">{e.sizeHuman}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {e.previewType === 'text' && (
                  <button onClick={() => onPreview(e)} className="text-[11px] text-green-400 hover:text-green-300">preview</button>
                )}
                {!e.isDir && (
                  <button onClick={() => onTransfer(e.path, 'browse')} className="text-[11px] text-purple-400 hover:text-purple-300">to ssd</button>
                )}
              </div>
            </div>
          ))}
          {entries.length === 0 && <div className="text-dark-400 text-center py-6 text-sm">Empty directory</div>}
        </div>
      )}
    </div>
  );
}

function PreviewModal({ file, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!file) return;
    setLoading(true);
    fetch(`${API}/preview?path=${encodeURIComponent(file.path)}`)
      .then(r => r.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => {
        setContent({ type: 'error', error: 'Failed to load preview' });
        setLoading(false);
      });
  }, [file]);

  if (!file) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h3 className="text-white font-medium">{file.name}</h3>
            <p className="text-xs text-dark-400 mt-0.5">{file.path}</p>
          </div>
          <button onClick={onClose} className="text-dark-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-dark-400 text-center py-12">Loading...</div>
          ) : content?.type === 'text' ? (
            <pre className="text-sm text-dark-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {content.content}
            </pre>
          ) : content?.type === 'image' ? (
            <img
              src={`${API}/raw?path=${encodeURIComponent(file.path)}`}
              alt={file.name}
              className="max-w-full rounded-lg"
            />
          ) : content?.type === 'pdf' ? (
            <iframe
              src={`${API}/raw?path=${encodeURIComponent(file.path)}`}
              className="w-full h-[60vh] rounded-lg"
              title={file.name}
            />
          ) : (
            <div className="text-dark-400 text-center py-12">
              {content?.error || 'Cannot preview this file'}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SearchResults({ results, onPreview, onBrowse, onTransfer }) {
  if (!results.length) {
    return <div className="text-dark-400 text-center py-12">No results found</div>;
  }

  return (
    <div className="space-y-2">
      {results.map((r, i) => (
        <motion.div
          key={r.path + i}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.02 }}
          className={`bg-dark-800/50 border border-dark-700 rounded-xl p-4 group hover:border-dark-600 transition-all ${
            !r.exists ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{CAT_ICONS[r.category] || '📄'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{r.name}</div>
              <div className="text-xs text-dark-400 truncate">{r.desc}</div>
              <div className="text-[10px] text-dark-500 mt-0.5">{r.catLabel} · {r.sizeHuman}</div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {r.previewType === 'text' && (
                <button onClick={() => onPreview(r)} className="text-[11px] text-green-400 hover:text-green-300">preview</button>
              )}
              {r.isDir && r.exists && (
                <button onClick={() => onBrowse(r.path)} className="text-[11px] text-blue-400 hover:text-blue-300">browse</button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function FileDashboard() {
  const [categories, setCategories] = useState({});
  const [activeCat, setActiveCat] = useState(null);
  const [files, setFiles] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});
  const [syncCounts, setSyncCounts] = useState({});
  const [ssdStatus, setSsdStatus] = useState({ available: false, freeHuman: '—' });
  const [transferState, setTransferState] = useState({ active: false, total: 0, done: 0, synced: 0, failed: 0, skipped: 0, log: [], current: '', eta: '', speed: '' });
  const [view, setView] = useState('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [browseDir, setBrowseDir] = useState('/Users/diokarabaz');
  const [previewFile, setPreviewFile] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [serviceOnline, setServiceOnline] = useState(null);
  const [deviceMeta, setDeviceMeta] = useState('');

  const searchTimer = useRef(null);
  const pollRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetch(`${API}/ping`).then(r => r.json()).then(d => setServiceOnline(d.online)).catch(() => setServiceOnline(false));
    fetch(`${API}/info`).then(r => r.json()).then(data => {
      setCategories(data.categories || {});
      setDeviceMeta(data.deviceMeta || '');
      const first = Object.entries(data.categories || {}).sort((a, b) => (a[1].order || 99) - (b[1].order || 99))[0];
      if (first) setActiveCat(first[0]);
    }).catch(() => {});
    fetch(`${API}/ssd-status`).then(r => r.json()).then(setSsdStatus).catch(() => {});
  }, []);

  // Poll SSD status
  useEffect(() => {
    const iv = setInterval(() => {
      fetch(`${API}/ssd-status`).then(r => r.json()).then(setSsdStatus).catch(() => {});
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  // Load files when category changes
  useEffect(() => {
    if (!activeCat) return;
    fetch(`${API}/category/${activeCat}`).then(r => r.json()).then(setFiles).catch(() => setFiles([]));
    fetch(`${API}/sync-status?category=${activeCat}`).then(r => r.json()).then(data => {
      const map = {};
      (data || []).forEach(s => { map[s.path] = s.status; });
      setSyncStatus(map);
    }).catch(() => {});
  }, [activeCat]);

  // Compute sync counts for sidebar badges
  useEffect(() => {
    const counts = {};
    for (const key of Object.keys(categories)) {
      fetch(`${API}/sync-status?category=${key}`)
        .then(r => r.json())
        .then(data => {
          const c = { synced: 0, outdated: 0, notSynced: 0 };
          (data || []).forEach(s => {
            if (s.status === 'synced') c.synced++;
            else if (s.status === 'outdated') c.outdated++;
            else if (s.status === 'not_synced') c.notSynced++;
          });
          setSyncCounts(prev => ({ ...prev, [key]: c }));
        }).catch(() => {});
    }
  }, [categories]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetch(`${API}/search?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()).then(setSearchResults).catch(() => setSearchResults([]));
      setView('search');
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  // Poll transfer status
  useEffect(() => {
    if (transferState.active) {
      pollRef.current = setInterval(() => {
        fetch(`${API}/transfer-status`).then(r => r.json()).then(data => {
          setTransferState(data);
          if (!data.active) {
            clearInterval(pollRef.current);
            // Refresh sync status after transfer completes
            if (activeCat) {
              fetch(`${API}/sync-status?category=${activeCat}`).then(r => r.json()).then(d => {
                const map = {};
                (d || []).forEach(s => { map[s.path] = s.status; });
                setSyncStatus(map);
              }).catch(() => {});
            }
          }
        }).catch(() => {});
      }, 500);
      return () => clearInterval(pollRef.current);
    }
  }, [transferState.active, activeCat]);

  const handleTransferAll = useCallback(() => {
    if (!activeCat || transferState.active) return;
    setTransferState(prev => ({ ...prev, active: true, total: 0, done: 0, synced: 0, failed: 0, skipped: 0, log: [] }));
    fetch(`${API}/transfer-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: activeCat }),
    }).catch(() => {});
  }, [activeCat, transferState.active]);

  const handleTransferSingle = useCallback((filePath, category) => {
    fetch(`${API}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, category }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.status) {
          setSyncStatus(prev => ({ ...prev, [filePath]: data.status }));
        }
      })
      .catch(() => {});
  }, []);

  const handleBrowse = useCallback((dir) => {
    setBrowseDir(dir);
    setView('browse');
  }, []);

  // SSD contents
  const [ssdContents, setSsdContents] = useState([]);
  useEffect(() => {
    if (view === 'ssd') {
      fetch(`${API}/ssd-contents`).then(r => r.json()).then(setSsdContents).catch(() => setSsdContents([]));
    }
  }, [view]);

  // Recent files
  const [recentFiles, setRecentFiles] = useState([]);
  useEffect(() => {
    if (view === 'recent') {
      fetch(`${API}/recent`).then(r => r.json()).then(setRecentFiles).catch(() => setRecentFiles([]));
    }
  }, [view]);

  if (serviceOnline === false) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-6xl mb-6">📡</div>
        <h2 className="text-xl font-semibold text-white mb-2">File Dashboard Service Offline</h2>
        <p className="text-dark-400 text-sm mb-4">The Wallestars server is not reachable. File Dashboard is integrated directly.</p>
        <code className="text-xs text-dark-500 bg-dark-800 border border-dark-700 rounded-lg px-4 py-2">
          cd ~/Wallestars && npm run dev
        </code>
      </div>
    );
  }

  const activeCatMeta = categories[activeCat] || {};

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            File Manager
            {ssdStatus.available ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 font-normal">
                SSD · {ssdStatus.freeHuman} free
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-normal">
                SSD offline
              </span>
            )}
          </h1>
          {deviceMeta && <p className="text-sm text-dark-400 mt-1">{deviceMeta}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('recent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === 'recent'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-dark-400 hover:text-white bg-dark-800/50 border border-dark-700'
            }`}
          >
            Recent (7d)
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search files & projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-dark-800/50 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white placeholder-dark-500 w-64 focus:outline-none focus:border-primary-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      <StatsRow categories={categories} files={files} syncStatus={syncStatus} />

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 sticky top-6">
            <CategorySidebar
              categories={categories}
              activeCat={activeCat}
              setActiveCat={setActiveCat}
              syncCounts={syncCounts}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              setView={setView}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {view === 'category' && activeCat && (
              <motion.div key="category" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Category header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeCatMeta.icon || CAT_ICONS[activeCat] || '📁'}</span>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{activeCatMeta.label}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-dark-400">{files.length} tracked files</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${PRIORITY_COLORS[activeCatMeta.priority] || ''}`}>
                          {activeCatMeta.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  {ssdStatus.available && (
                    <button
                      onClick={handleTransferAll}
                      disabled={transferState.active}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        transferState.active
                          ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/30'
                      }`}
                    >
                      {transferState.active ? 'Syncing...' : 'Sync All to SSD'}
                    </button>
                  )}
                </div>

                <TransferProgress state={transferState} />

                <FileGrid
                  files={files}
                  syncStatus={syncStatus}
                  onPreview={setPreviewFile}
                  onBrowse={handleBrowse}
                  onTransfer={handleTransferSingle}
                  activeCat={activeCat}
                />
              </motion.div>
            )}

            {view === 'ssd' && (
              <motion.div key="ssd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-lg font-semibold text-white mb-4">SSD Contents</h2>
                <SSDContents contents={ssdContents} onPreview={setPreviewFile} />
              </motion.div>
            )}

            {view === 'browse' && (
              <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-lg font-semibold text-white mb-4">Browse Files</h2>
                <FileBrowser
                  browseDir={browseDir}
                  setBrowseDir={setBrowseDir}
                  onPreview={setPreviewFile}
                  onTransfer={handleTransferSingle}
                />
              </motion.div>
            )}

            {view === 'search' && (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Search: "{searchQuery}" <span className="text-dark-400 font-normal text-sm">({searchResults.length} results)</span>
                </h2>
                <SearchResults
                  results={searchResults}
                  onPreview={setPreviewFile}
                  onBrowse={handleBrowse}
                  onTransfer={handleTransferSingle}
                />
              </motion.div>
            )}

            {view === 'recent' && (
              <motion.div key="recent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-lg font-semibold text-white mb-4">Recently Modified (7 days)</h2>
                <SearchResults
                  results={recentFiles}
                  onPreview={setPreviewFile}
                  onBrowse={handleBrowse}
                  onTransfer={handleTransferSingle}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      </AnimatePresence>
    </div>
  );
}
