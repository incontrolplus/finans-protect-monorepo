import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const CATEGORIES = [
  { id: 'business', label: 'Business', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'personal', label: 'Personal', color: 'bg-green-500/20 text-green-400' },
  { id: 'ideas', label: 'Ideas', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'tasks', label: 'Tasks', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'contacts', label: 'Contacts', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'finance', label: 'Finance', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'learning', label: 'Learning', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'health', label: 'Health', color: 'bg-red-500/20 text-red-400' },
];

const SOURCES = ['Manual', 'Telegram Saved', 'Phone Notes', 'WeChat', 'Email', 'Voice Memo'];

function NoteAnalyzer() {
  const [activeTab, setActiveTab] = useState('import');
  const [notes, setNotes] = useState([]);
  const [rawText, setRawText] = useState('');
  const [source, setSource] = useState('Manual');
  const [analyzing, setAnalyzing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const importAndAnalyze = async () => {
    if (!rawText.trim()) return;

    setAnalyzing(true);
    const lines = rawText.split('\n').filter(l => l.trim());

    try {
      const prompt = `Analyze and categorize these notes. For each note, provide:
- category (one of: business, personal, ideas, tasks, contacts, finance, learning, health)
- tags (2-3 relevant tags)
- priority (high, medium, low)
- summary (1 sentence)

Notes:
${lines.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Return as JSON array with fields: original, category, tags, priority, summary`;

      let analyzed;
      try {
        const res = await fetch(`${API_BASE}/api/openai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4',
            temperature: 0.3,
          }),
        });
        const data = await res.json();
        if (data.success && data.response) {
          const jsonMatch = data.response.match(/\[[\s\S]*\]/);
          if (jsonMatch) analyzed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback
      }

      if (!analyzed) {
        analyzed = lines.map(line => {
          const lower = line.toLowerCase();
          let category = 'personal';
          if (lower.includes('buy') || lower.includes('pay') || lower.includes('EUR') || lower.includes('пари')) category = 'finance';
          else if (lower.includes('idea') || lower.includes('идея') || lower.includes('може би')) category = 'ideas';
          else if (lower.includes('call') || lower.includes('meet') || lower.includes('обади')) category = 'contacts';
          else if (lower.includes('learn') || lower.includes('book') || lower.includes('course') || lower.includes('учи')) category = 'learning';
          else if (lower.includes('gym') || lower.includes('doctor') || lower.includes('здраве')) category = 'health';
          else if (lower.includes('work') || lower.includes('wallester') || lower.includes('бизнес') || lower.includes('client')) category = 'business';
          else if (lower.includes('todo') || lower.includes('трябва') || lower.includes('fix') || lower.includes('направи')) category = 'tasks';

          return {
            original: line,
            category,
            tags: [category, source.toLowerCase().replace(' ', '_')],
            priority: 'medium',
            summary: line.slice(0, 80),
          };
        });
      }

      const newNotes = analyzed.map((n, i) => ({
        id: Date.now() + i,
        text: n.original || lines[i],
        category: n.category,
        tags: n.tags || [],
        priority: n.priority || 'medium',
        summary: n.summary || '',
        source,
        createdAt: new Date().toISOString(),
      }));

      setNotes(prev => [...prev, ...newNotes]);
      setRawText('');
      setActiveTab('browse');
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchCategory = filterCategory === 'all' || n.category === filterCategory;
    const matchSearch = !searchQuery ||
      n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const categoryStats = CATEGORIES.map(cat => ({
    ...cat,
    count: notes.filter(n => n.category === cat.id).length,
  }));

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const updateCategory = (id, newCat) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, category: newCat } : n));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Note Analyzer</h1>
          <p className="text-gray-400 mt-1">
            Импортиране, AI категоризиране и организиране на бележки
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
          Задачи 28, 29
        </span>
      </div>

      {/* Stats */}
      {notes.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {categoryStats.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setFilterCategory(cat.id === filterCategory ? 'all' : cat.id); setActiveTab('browse'); }}
              className={`p-2 rounded-lg text-center transition-colors ${
                filterCategory === cat.id ? 'ring-2 ring-primary-500' : ''
              } bg-dark-800/50 border border-dark-700 hover:border-dark-600`}
            >
              <p className="text-lg font-bold text-white">{cat.count}</p>
              <p className="text-xs text-gray-500">{cat.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'import', label: 'Import Notes' },
          { id: 'browse', label: `Browse (${notes.length})` },
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

      {/* Import Tab */}
      {activeTab === 'import' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Import & Analyze</h2>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-300"
            >
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your notes here (one per line)...&#10;&#10;Examples:&#10;Call Dimitar about the new OOD registration&#10;Buy domain for wallesters.com campaign&#10;Read about Wise business fees&#10;Gym at 7am tomorrow&#10;Idea: automate the email verification with AI"
            rows={12}
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-y"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {rawText.split('\n').filter(l => l.trim()).length} notes detected
            </span>
            <button
              onClick={importAndAnalyze}
              disabled={analyzing || !rawText.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Import & Analyze with AI</span>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-300"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Notes List */}
          <AnimatePresence>
            {filteredNotes.length === 0 ? (
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
                <p className="text-gray-400">
                  {notes.length === 0 ? 'No notes imported yet. Go to Import tab to add notes.' : 'No notes match your filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotes.map((note, idx) => {
                  const cat = CATEGORIES.find(c => c.id === note.category);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.02 }}
                      className="bg-dark-800/50 border border-dark-700 rounded-lg p-4 hover:border-dark-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <p className="text-gray-200 text-sm">{note.text}</p>
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            <select
                              value={note.category}
                              onChange={(e) => updateCategory(note.id, e.target.value)}
                              className="px-2 py-0.5 bg-dark-700 border border-dark-600 rounded text-xs text-gray-400"
                            >
                              {CATEGORIES.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                              ))}
                            </select>
                            {note.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-dark-700/80 text-gray-500 text-xs rounded">
                                #{tag}
                              </span>
                            ))}
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              note.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              note.priority === 'low' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {note.priority}
                            </span>
                            <span className="text-xs text-gray-600">{note.source}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="ml-3 p-1 text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Export */}
          {notes.length > 0 && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  const data = JSON.stringify(notes, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'analyzed_notes.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm rounded-lg transition-colors"
              >
                Export JSON
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Sources & Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { source: 'Telegram Saved Messages', status: 'Via Bot API extraction', icon: 'TG' },
            { source: 'Phone Notes', status: 'Copy-paste or API sync', icon: 'PH' },
            { source: 'WeChat / TKMaster', status: 'Manual export', icon: 'WC' },
          ].map(s => (
            <div key={s.source} className="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg">
              <div className="w-8 h-8 bg-dark-700 rounded flex items-center justify-center text-gray-400 text-xs font-bold">
                {s.icon}
              </div>
              <div>
                <p className="text-sm text-gray-300">{s.source}</p>
                <p className="text-xs text-gray-500">{s.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NoteAnalyzer;
