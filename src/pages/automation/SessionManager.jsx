import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Globe, Plus, Trash2, Camera, RefreshCw, AlertCircle } from 'lucide-react';

const API = '/api/playwright';

function SessionCard({ session, onClose, onScreenshot }) {
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScreenshot = async () => {
    setLoading(true);
    const result = await onScreenshot(session.sessionId);
    if (result) setScreenshot(result);
    setLoading(false);
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white font-mono">{session.sessionId}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{session.url || 'about:blank'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Active</span>
        </div>
      </div>

      {session.profileName && (
        <p className="text-xs text-sky-400">Profile: {session.profileName}</p>
      )}

      <div className="text-xs text-gray-600">
        Created: {new Date(session.createdAt).toLocaleString()}
      </div>

      {screenshot && (
        <img
          src={`data:image/png;base64,${screenshot}`}
          alt="Session screenshot"
          className="w-full rounded-lg border border-white/10"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={handleScreenshot}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 text-sky-400 rounded-lg text-xs hover:bg-sky-500/30 transition-all disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5" />
          Screenshot
        </button>
        <button
          onClick={() => onClose(session.sessionId)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Close
        </button>
      </div>
    </div>
  );
}

export default function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newUrl, setNewUrl] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/sessions`);
      const data = await res.json();
      setSessions(data.data?.sessions || []);
      setPool(data.data?.pool || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const createSession = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success && newUrl) {
        await fetch(`${API}/sessions/${data.data.sessionId}/navigate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newUrl }),
        });
      }
      await fetchSessions();
      setNewUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const closeSession = async (sessionId) => {
    await fetch(`${API}/sessions/${sessionId}`, { method: 'DELETE' });
    await fetchSessions();
  };

  const takeScreenshot = async (sessionId) => {
    try {
      const res = await fetch(`${API}/sessions/${sessionId}/screenshot`);
      const data = await res.json();
      return data.data?.base64 || null;
    } catch (_) {
      return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-sky-400" />
            Session Manager
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
            {pool && ` · ${pool.activeContexts}/${pool.maxContexts} contexts`}
          </p>
        </div>
        <button onClick={fetchSessions} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Create session */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">New Session</h2>
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://example.com (optional)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50"
          />
          <button
            onClick={createSession}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Sessions grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No active sessions. Create one above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(session => (
            <SessionCard
              key={session.sessionId}
              session={session}
              onClose={closeSession}
              onScreenshot={takeScreenshot}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
