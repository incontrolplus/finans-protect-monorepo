import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Square, RefreshCw, AlertCircle } from 'lucide-react';

const API = '/api/playwright';

const EXAMPLE_SCRIPTS = [
  {
    name: 'Get page title',
    code: `async function() {
  return document.title;
}`,
  },
  {
    name: 'Count links',
    code: `async function() {
  return document.querySelectorAll('a').length;
}`,
  },
  {
    name: 'Get all headings',
    code: `async function() {
  return Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.innerText);
}`,
  },
];

export default function SandboxPlayground() {
  const [url, setUrl] = useState('https://example.com');
  const [script, setScript] = useState(EXAMPLE_SCRIPTS[0].code);
  const [result, setResult] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSandbox = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setScreenshot(null);
    setLogs([]);

    try {
      const res = await fetch(`${API}/sandbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, script }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Sandbox failed');

      setResult(data.data.result);
      setScreenshot(data.data.screenshot);
      setLogs(data.data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-sky-400" />
          Sandbox Playground
        </h1>
        <p className="text-gray-400 text-sm mt-1">Execute Playwright scripts in an isolated browser</p>
      </div>

      {/* URL input */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
        <label className="text-sm font-medium text-gray-300">Target URL</label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
        />
      </div>

      {/* Script editor */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Script</label>
          <div className="flex gap-2">
            {EXAMPLE_SCRIPTS.map(ex => (
              <button
                key={ex.name}
                onClick={() => setScript(ex.code)}
                className="text-xs px-2 py-1 bg-white/5 text-gray-400 hover:text-white rounded transition-all"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={script}
          onChange={e => setScript(e.target.value)}
          rows={8}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-green-400 font-mono focus:outline-none focus:border-sky-500/50 resize-none"
          spellCheck={false}
        />

        <button
          onClick={runSandbox}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        >
          {loading ? <Square className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
          {loading ? 'Running...' : 'Run Script'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-mono">{error}</span>
        </div>
      )}

      {/* Results */}
      {result !== null && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-300">Result</h2>
          <pre className="text-sm text-green-400 font-mono bg-black/20 rounded-lg p-3 overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Console logs */}
      {logs.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-300">Console Output</h2>
          <div className="bg-black/30 rounded-lg p-3 space-y-1 max-h-40 overflow-auto">
            {logs.map((log, i) => (
              <div key={i} className={`text-xs font-mono ${log.level === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                [{log.level}] {log.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshot */}
      {screenshot && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-300">Browser Preview</h2>
          <img src={`data:image/png;base64,${screenshot}`} alt="Browser preview" className="w-full rounded-lg border border-white/10" />
        </div>
      )}
    </motion.div>
  );
}
