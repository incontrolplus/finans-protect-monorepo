import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const API = '/api/playwright';

function MonitorCard({ monitor, onDelete }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white">{monitor.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{monitor.url}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {monitor.isActive ? (
            <><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-xs text-green-400">Active</span></>
          ) : (
            <><div className="w-2 h-2 bg-gray-500 rounded-full" /><span className="text-xs text-gray-400">Paused</span></>
          )}
        </div>
      </div>

      {monitor.selector && (
        <p className="text-xs text-gray-500">Selector: <code className="text-sky-400">{monitor.selector}</code></p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Every {Math.round(monitor.intervalMs / 1000)}s</span>
        {monitor.lastCheck && <span>Last: {new Date(monitor.lastCheck).toLocaleTimeString()}</span>}
      </div>

      {monitor.lastValue && (
        <div className="bg-black/20 rounded p-2">
          <p className="text-xs text-gray-400 truncate">{monitor.lastValue.slice(0, 100)}</p>
        </div>
      )}

      <button
        onClick={() => onDelete(monitor.id)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}

export default function MonitorCenter() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    url: '',
    selector: '',
    intervalMs: 300000,
    alertWebhook: '',
  });

  const fetchMonitors = useCallback(async () => {
    try {
      const res = await fetch(`${API}/monitor`);
      const data = await res.json();
      setMonitors(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 10000);
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  const createMonitor = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/monitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          intervalMs: parseInt(form.intervalMs, 10),
          alertConfig: form.alertWebhook ? { webhookUrl: form.alertWebhook } : {},
        }),
      });
      setShowForm(false);
      setForm({ name: '', url: '', selector: '', intervalMs: 300000, alertWebhook: '' });
      await fetchMonitors();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMonitor = async (id) => {
    await fetch(`${API}/monitor/${id}`, { method: 'DELETE' });
    await fetchMonitors();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-sky-400" />
            Monitor Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">{monitors.length} monitor{monitors.length !== 1 ? 's' : ''} running</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMonitors} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-gray-400 hover:text-white text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-white text-sm">
            <Plus className="w-4 h-4" />
            New Monitor
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={createMonitor} className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Create Monitor</h2>
          {[
            { label: 'Name', field: 'name', type: 'text', placeholder: 'My Monitor' },
            { label: 'URL', field: 'url', type: 'url', placeholder: 'https://example.com' },
            { label: 'CSS Selector (optional)', field: 'selector', type: 'text', placeholder: '.price' },
            { label: 'Alert Webhook (optional)', field: 'alertWebhook', type: 'url', placeholder: 'https://...' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Interval (ms)</label>
            <select
              value={form.intervalMs}
              onChange={e => setForm(f => ({ ...f, intervalMs: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
              <option value={900000}>15 minutes</option>
              <option value={3600000}>1 hour</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 text-gray-400 hover:text-white rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading monitors...</div>
      ) : monitors.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No monitors yet. Create one to start watching pages.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitors.map(m => <MonitorCard key={m.id} monitor={m} onDelete={deleteMonitor} />)}
        </div>
      )}
    </motion.div>
  );
}
