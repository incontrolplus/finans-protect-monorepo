import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Settings,
  Shield,
  Globe,
  AlertTriangle,
  Activity,
  Clock,
  MemoryStick,
  Puzzle,
  Brain,
  Moon,
  Lock,
  Keyboard,
  SpellCheck,
  Braces,
  SearchCode
} from 'lucide-react';
import { createExtensionAPI, extensionRegistry } from '../lib/extensionRuntime';

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

const EXTENSION_UIS = {
  'dark-reader': DarkReaderUI,
  'ublock-origin': UBlockUI,
  'bitwarden': BitwardenUI,
  'vimium': VimiumUI,
  'grammarly': GrammarlyUI,
  'json-viewer': JsonViewerUI,
  'wappalyzer': WappalyzerUI
};

export default function ExtensionSandbox({ extension, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runtime, setRuntime] = useState(null);
  const [stats, setStats] = useState({ uptime: 0, apiCalls: 0, storage: '0 KB' });
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Initialize extension runtime
    const api = extensionRegistry.register(extension.id, {
      manifest_version: extension.manifestVersion || 3,
      name: extension.name,
      version: extension.version,
      permissions: extension.permissions || []
    });
    setRuntime(api);

    // Update stats periodically
    const interval = setInterval(() => {
      setStats({
        uptime: Math.floor((Date.now() - startTime.current) / 1000),
        apiCalls: Math.floor(Math.random() * 50),
        storage: `${(Math.random() * 100).toFixed(1)} KB`
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      extensionRegistry.unregister(extension.id);
    };
  }, [extension]);

  const ExtUI = EXTENSION_UIS[extension.id] || DefaultExtensionUI;
  const IconComponent = ICON_MAP[extension.icon] || Puzzle;

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-dark-900 p-4 overflow-auto' : ''}`}>
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold">{extension.name}</h2>
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" /> Running
                </span>
                <span>v{extension.version}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SandboxStat icon={Clock} label={`${stats.uptime}s`} />
            <SandboxStat icon={Activity} label={`${stats.apiCalls} calls`} />
            <SandboxStat icon={Shield} label="Sandboxed" color="text-emerald-400" />

            <div className="h-6 w-px bg-dark-700 mx-1" />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 glass-effect rounded-lg hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 glass-effect rounded-lg hover:bg-red-500/20 text-red-400"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Extension UI */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card min-h-[400px]"
      >
        <ExtUI extension={extension} runtime={runtime} />
      </motion.div>

      {/* Permissions info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Sandbox Permissions
        </h3>
        <div className="flex flex-wrap gap-2">
          {(extension.permissions || []).map(perm => (
            <span key={perm} className="text-xs px-2 py-1 glass-effect rounded-full text-dark-300">
              {perm}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SandboxStat({ icon: Icon, label, color = 'text-dark-400' }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}

// Default extension UI
function DefaultExtensionUI({ extension }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Puzzle className="w-16 h-16 text-dark-500 mb-4" />
      <h3 className="text-lg font-bold mb-2">{extension.name}</h3>
      <p className="text-dark-400 text-sm max-w-md mb-4">{extension.description}</p>
      <div className="glass-effect rounded-lg p-4 max-w-sm">
        <p className="text-xs text-dark-400">
          This extension is running in sandboxed mode. Full functionality
          requires the extension's original web assets to be loaded.
        </p>
      </div>
    </div>
  );
}

// Dark Reader simulated UI
function DarkReaderUI({ runtime }) {
  const [enabled, setEnabled] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [mode, setMode] = useState('dynamic');

  useEffect(() => {
    if (runtime) {
      runtime.storage.local.get({ darkReaderEnabled: true }).then(data => {
        setEnabled(data.darkReaderEnabled);
      });
    }
  }, [runtime]);

  const toggleDarkMode = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (runtime) {
      runtime.storage.local.set({ darkReaderEnabled: newState });
    }
    // Apply dark mode to parent document as demo
    document.documentElement.style.filter = newState
      ? `brightness(${brightness}%) contrast(${contrast}%) sepia(${sepia}%)`
      : '';
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Dark Reader</h3>
        <button
          onClick={toggleDarkMode}
          className={`w-14 h-7 rounded-full transition-all relative ${
            enabled ? 'bg-primary-500' : 'bg-dark-600'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${
            enabled ? 'left-8' : 'left-1'
          }`} />
        </button>
      </div>

      <div className="space-y-4">
        <SliderControl label="Brightness" value={brightness} onChange={setBrightness} />
        <SliderControl label="Contrast" value={contrast} onChange={setContrast} />
        <SliderControl label="Sepia" value={sepia} onChange={setSepia} max={100} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-dark-400">Mode</p>
        <div className="grid grid-cols-3 gap-2">
          {['dynamic', 'filter', 'static'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                mode === m ? 'bg-primary-500 text-white' : 'glass-effect text-dark-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SliderControl({ label, value, onChange, min = 50, max = 150 }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-dark-400">{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-500"
      />
    </div>
  );
}

// uBlock Origin simulated UI
function UBlockUI() {
  const [enabled, setEnabled] = useState(true);
  const [stats] = useState({
    blocked: Math.floor(Math.random() * 10000) + 5000,
    domains: Math.floor(Math.random() * 200) + 100,
    lists: 12,
    filters: 310542
  });

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div className="text-center">
        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${
            enabled ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30' : 'bg-dark-700'
          }`}
        >
          <Shield className={`w-12 h-12 ${enabled ? 'text-white' : 'text-dark-500'}`} />
        </button>
        <p className="mt-3 text-sm text-dark-400">{enabled ? 'Protection Active' : 'Protection Paused'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ads Blocked" value={stats.blocked.toLocaleString()} />
        <StatCard label="Domains Blocked" value={stats.domains.toString()} />
        <StatCard label="Filter Lists" value={stats.lists.toString()} />
        <StatCard label="Total Filters" value={stats.filters.toLocaleString()} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-effect rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-primary-400">{value}</p>
      <p className="text-xs text-dark-400">{label}</p>
    </div>
  );
}

// Bitwarden simulated UI
function BitwardenUI() {
  const [locked, setLocked] = useState(true);
  const [password, setPassword] = useState('');

  const unlock = () => {
    if (password.length > 0) setLocked(false);
  };

  if (locked) {
    return (
      <div className="max-w-sm mx-auto space-y-4 py-8">
        <div className="text-center">
          <Lock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-1">Bitwarden</h3>
          <p className="text-sm text-dark-400">Enter your master password</p>
        </div>
        <input
          type="password"
          placeholder="Master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
          className="input-field"
        />
        <button onClick={unlock} className="btn-primary w-full">Unlock</button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-3">
      <h3 className="font-bold text-lg mb-4">My Vault</h3>
      {['github.com', 'google.com', 'anthropic.com', 'brave.com'].map(site => (
        <div key={site} className="glass-effect p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-white/10">
          <Globe className="w-5 h-5 text-primary-400" />
          <div className="flex-1">
            <p className="font-medium text-sm">{site}</p>
            <p className="text-xs text-dark-400">user@example.com</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Vimium simulated UI
function VimiumUI() {
  const [hints, setHints] = useState(false);

  return (
    <div className="max-w-sm mx-auto space-y-4 py-4">
      <h3 className="font-bold text-lg">Vimium Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {[
          ['j / k', 'Scroll down / up'],
          ['h / l', 'Scroll left / right'],
          ['gg / G', 'Top / bottom of page'],
          ['f', 'Open link hints'],
          ['F', 'Open link in new tab'],
          ['/', 'Search page'],
          ['o', 'Open URL bar'],
          ['t', 'Create new tab'],
          ['x', 'Close tab']
        ].map(([key, desc]) => (
          <div key={key} className="flex items-center gap-3 text-sm">
            <kbd className="bg-dark-700 px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center text-primary-400">
              {key}
            </kbd>
            <span className="text-dark-400">{desc}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setHints(!hints)}
        className="btn-primary w-full text-sm"
      >
        {hints ? 'Hide' : 'Show'} Link Hints
      </button>
    </div>
  );
}

// Grammarly simulated UI
function GrammarlyUI() {
  const [text, setText] = useState('');
  const [suggestions] = useState([
    { type: 'grammar', text: 'Consider using "their" instead of "there"', color: 'text-red-400' },
    { type: 'clarity', text: 'This sentence could be more concise', color: 'text-yellow-400' },
    { type: 'engagement', text: 'Good use of active voice', color: 'text-emerald-400' }
  ]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="font-bold text-lg">Grammarly</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing to check your grammar..."
        className="input-field h-32 resize-none"
      />
      <div className="space-y-2">
        <p className="text-xs text-dark-400 font-medium">Suggestions</p>
        {suggestions.map((s, i) => (
          <div key={i} className="glass-effect p-3 rounded-lg flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${s.color}`} />
            <div>
              <p className="text-xs text-dark-300">{s.text}</p>
              <span className="text-xs text-dark-500 capitalize">{s.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// JSON Viewer simulated UI
function JsonViewerUI() {
  const [input, setInput] = useState('{"name":"Claude","version":"3.5","features":["chat","vision","code"]}');
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    try {
      setFormatted(JSON.stringify(JSON.parse(input), null, 2));
    } catch {
      setFormatted('Invalid JSON');
    }
  }, [input]);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">JSON Viewer</h3>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste JSON here..."
        className="input-field h-24 resize-none font-mono text-xs"
      />
      <pre className="glass-effect rounded-lg p-4 text-xs font-mono overflow-auto max-h-48 text-emerald-400">
        {formatted}
      </pre>
    </div>
  );
}

// Wappalyzer simulated UI
function WappalyzerUI() {
  const techs = [
    { name: 'React', version: '18.2.0', category: 'JavaScript frameworks', confidence: 100 },
    { name: 'Vite', version: '5.0', category: 'Build tools', confidence: 100 },
    { name: 'Tailwind CSS', version: '3.4', category: 'CSS frameworks', confidence: 100 },
    { name: 'Node.js', version: '20', category: 'Runtime', confidence: 95 },
    { name: 'Express', version: '4.18', category: 'Web frameworks', confidence: 90 },
    { name: 'Socket.io', version: '4.6', category: 'Real-time', confidence: 85 }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Wappalyzer</h3>
        <span className="text-xs text-dark-400">{techs.length} technologies detected</span>
      </div>
      <div className="space-y-2">
        {techs.map(tech => (
          <div key={tech.name} className="glass-effect p-3 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{tech.name} <span className="text-dark-500">{tech.version}</span></p>
              <p className="text-xs text-dark-400">{tech.category}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${tech.confidence}%` }}
                />
              </div>
              <span className="text-xs text-dark-500">{tech.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
