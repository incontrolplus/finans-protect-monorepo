import React from 'react';
import { Globe, Camera, Trash2 } from 'lucide-react';

export default function SessionCard({ session, onClose, onScreenshot }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          <p className="text-sm text-white font-mono truncate">{session.sessionId}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      <p className="text-xs text-gray-500 truncate">{session.url || 'about:blank'}</p>

      {session.profileName && (
        <p className="text-xs text-sky-400">Profile: {session.profileName}</p>
      )}

      <div className="flex gap-2">
        {onScreenshot && (
          <button
            onClick={() => onScreenshot(session.sessionId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 text-sky-400 rounded-lg text-xs hover:bg-sky-500/30 transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            Screenshot
          </button>
        )}
        {onClose && (
          <button
            onClick={() => onClose(session.sessionId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Close
          </button>
        )}
      </div>
    </div>
  );
}
