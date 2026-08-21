import React from 'react';
import { Fingerprint } from 'lucide-react';

const FINGERPRINT_PRESETS = [
  { id: 'stealth', label: 'Full Stealth', description: 'Maximum anti-detection' },
  { id: 'normal', label: 'Normal', description: 'Balanced speed/stealth' },
  { id: 'fast', label: 'Speed', description: 'Minimal overhead, visible automation' },
];

export default function AntiDetectConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        <Fingerprint className="w-4 h-4 text-purple-400" />
        Anti-Detection Settings
      </label>

      <div className="grid grid-cols-3 gap-2">
        {FINGERPRINT_PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => update('preset', p.id)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              config?.preset === p.id
                ? 'border-purple-500/50 bg-purple-500/10 text-white'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <p className="text-xs font-medium">{p.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {[
          { key: 'humanMouse', label: 'Human mouse movement' },
          { key: 'humanTyping', label: 'Human typing simulation' },
          { key: 'blockResources', label: 'Block images/fonts (faster)' },
          { key: 'randomUserAgent', label: 'Random user agent' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-300">{label}</span>
            <button
              onClick={() => update(key, !config?.[key])}
              className={`relative w-10 h-5 rounded-full transition-colors ${config?.[key] ? 'bg-purple-500' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config?.[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}
