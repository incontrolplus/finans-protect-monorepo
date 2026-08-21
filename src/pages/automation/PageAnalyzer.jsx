import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Sparkles, List, ExternalLink, AlertCircle } from 'lucide-react';

const API = '/api/playwright';

export default function PageAnalyzer() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, screenshot: true, extractUVP: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Analysis failed');
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `page-analysis-${Date.now()}.json`;
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-sky-400" />
          Page Analyzer
        </h1>
        <p className="text-gray-400 text-sm mt-1">Extract UVP, features, and structure from any web page</p>
      </div>

      {/* URL input */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="https://example.com"
            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50"
          />
          <button
            onClick={analyze}
            disabled={loading || !url}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <a href={result.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sky-400 text-sm hover:underline">
              <Globe className="w-4 h-4" />
              {result.url}
              <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={exportJSON} className="text-xs px-3 py-1.5 bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all">
              Export JSON
            </button>
          </div>

          {/* UVP */}
          {result.uvp && (
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-sky-400">Unique Value Proposition</h2>
              </div>
              <p className="text-white text-sm leading-relaxed">{result.uvp}</p>
            </div>
          )}

          {/* Key features */}
          {result.keyFeatures?.length > 0 && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <List className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-gray-300">Key Features</h2>
              </div>
              <ul className="space-y-1">
                {result.keyFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-purple-400 mt-0.5">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structure */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Page Structure</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Title:</span> <span className="text-white">{result.title}</span></div>
              {result.description && (
                <div><span className="text-gray-500">Description:</span> <span className="text-gray-300">{result.description}</span></div>
              )}
              {result.structure?.headings?.h1?.length > 0 && (
                <div>
                  <span className="text-gray-500">H1:</span>{' '}
                  <span className="text-gray-300">{result.structure.headings.h1.join(', ')}</span>
                </div>
              )}
              {result.structure?.ctaButtons?.length > 0 && (
                <div>
                  <span className="text-gray-500">CTAs:</span>{' '}
                  <span className="text-green-400">{result.structure.ctaButtons.slice(0, 5).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot */}
          {result.screenshot && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Screenshot</h2>
              <img src={`data:image/png;base64,${result.screenshot}`} alt="Page screenshot" className="w-full rounded-lg border border-white/10" />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
