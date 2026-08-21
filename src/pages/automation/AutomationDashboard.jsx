import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Globe, Cpu, Clock, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Play, Square, Zap
} from 'lucide-react';

const API = '/api/playwright';

const COLOR_CLASSES = {
  sky: 'bg-sky-500/20 text-sky-400',
  purple: 'bg-purple-500/20 text-purple-400',
  indigo: 'bg-indigo-500/20 text-indigo-400',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  blue: 'bg-blue-500/20 text-blue-400',
};

function StatCard({ label, value, icon: Icon, color = 'sky' }) {
  const [bg, text] = (COLOR_CLASSES[color] || COLOR_CLASSES.sky).split(' ');
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${text}`} />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function JobBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    running: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

export default function AutomationDashboard() {
  const [health, setHealth] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, jobsRes] = await Promise.all([
        fetch(`${API}/health`),
        fetch(`${API}/jobs`),
      ]);
      const healthData = await healthRes.json();
      const jobsData = await jobsRes.json();
      setHealth(healthData.data);
      setJobs(jobsData.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const pool = health?.pool || {};
  const queues = health?.queues || {};

  const totalPending = Object.values(queues).reduce((s, q) => s + (q.pending || 0), 0);
  const totalRunning = Object.values(queues).reduce((s, q) => s + (q.running || 0), 0);
  const totalCompleted = Object.values(queues).reduce((s, q) => s + (q.completed || 0), 0);
  const totalFailed = Object.values(queues).reduce((s, q) => s + (q.failed || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-sky-400" />
            Automation Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Self-hosted browser automation platform</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error} — Is the Playwright service running?</span>
        </div>
      )}

      {/* Pool status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Browsers" value={pool.browsers ?? '—'} icon={Globe} />
        <StatCard label="Active Contexts" value={pool.activeContexts ?? '—'} icon={Cpu} color="purple" />
        <StatCard label="Max Contexts" value={pool.maxContexts ?? '—'} icon={Activity} color="indigo" />
        <StatCard
          label="Pool Utilization"
          value={pool.utilization != null ? `${Math.round(pool.utilization * 100)}%` : '—'}
          icon={Activity}
          color={pool.utilization > 0.8 ? 'red' : 'green'}
        />
      </div>

      {/* Queue stats */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Queue Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Pending" value={totalPending} icon={Clock} color="yellow" />
          <StatCard label="Running" value={totalRunning} icon={Play} color="blue" />
          <StatCard label="Completed" value={totalCompleted} icon={CheckCircle2} color="green" />
          <StatCard label="Failed" value={totalFailed} icon={XCircle} color="red" />
        </div>
      </div>

      {/* Queue breakdown */}
      {Object.keys(queues).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(queues).map(([name, q]) => (
            <div key={name} className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-medium text-sky-400 capitalize mb-3">{name} Queue</h3>
              <div className="space-y-1 text-sm">
                {['pending', 'running', 'completed', 'failed'].map(status => (
                  <div key={status} className="flex justify-between text-gray-400">
                    <span className="capitalize">{status}</span>
                    <span className="font-mono text-white">{q[status] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent jobs */}
      <div className="bg-white/5 rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recent Jobs</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No jobs yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {jobs.slice(0, 20).map(job => (
              <div key={job.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{job.type}</p>
                  <p className="text-xs text-gray-500">{job.id} · {job.queue}</p>
                </div>
                <div className="flex items-center gap-3">
                  <JobBadge status={job.status} />
                  <span className="text-xs text-gray-600">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
