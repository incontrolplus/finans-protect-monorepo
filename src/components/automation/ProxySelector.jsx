import React from 'react';
import { Shield } from 'lucide-react';

const PROXY_TYPES = [
  { id: 'auto', label: 'Auto (best available)', description: 'Automatically picks residential or datacenter' },
  { id: 'residential', label: 'Residential', description: 'Highest success rate, slower' },
  { id: 'datacenter', label: 'Datacenter', description: 'Fast, lower success rate on protected sites' },
  { id: 'none', label: 'No Proxy', description: 'Direct connection, use with caution' },
];

export default function ProxySelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        <Shield className="w-4 h-4 text-sky-400" />
        Proxy Type
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PROXY_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => onChange(pt.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              value === pt.id
                ? 'border-sky-500/50 bg-sky-500/10 text-white'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <p className="text-xs font-medium">{pt.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{pt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
