import React, { useState } from 'react';
import { Search, Layers } from 'lucide-react';

const TIER_COLORS = {
  1: 'text-green-400',
  2: 'text-sky-400',
  3: 'text-purple-400',
  4: 'text-yellow-400',
  5: 'text-orange-400',
};

const TIER_LABELS = {
  1: 'Exact',
  2: 'Fuzzy',
  3: 'Embedding',
  4: 'LLM',
  5: 'Visual',
};

export default function ElementPicker({ sessionId, onSelect }) {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const findElement = async () => {
    if (!description || !sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/playwright/sessions/${sessionId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, _preview: true }),
      });
      const data = await res.json();
      setResult(data.data);
      if (onSelect) onSelect(data.data);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && findElement()}
          placeholder='Describe element, e.g. "Sign In button"'
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50"
        />
        <button
          onClick={findElement}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 rounded-lg text-sm disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {result && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Found via</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span className={`text-sm font-medium ${TIER_COLORS[result.tier] || 'text-gray-400'}`}>
                Tier {result.tier} — {TIER_LABELS[result.tier] || 'Unknown'}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600">{result.method}</span>
        </div>
      )}
    </div>
  );
}
