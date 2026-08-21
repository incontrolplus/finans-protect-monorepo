import React from 'react';
import { Monitor } from 'lucide-react';

export default function BrowserLiveView({ screenshot, className = '' }) {
  if (!screenshot) {
    return (
      <div className={`flex items-center justify-center bg-black/30 rounded-lg border border-white/10 ${className}`}>
        <div className="text-center text-gray-600">
          <Monitor className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No preview available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-white/10 ${className}`}>
      <img
        src={`data:image/png;base64,${screenshot}`}
        alt="Browser live view"
        className="w-full"
      />
    </div>
  );
}
