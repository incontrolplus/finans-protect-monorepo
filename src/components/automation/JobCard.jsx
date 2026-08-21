import React from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, Ban } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', spin: true },
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  cancelled: { icon: Ban, color: 'text-gray-400', bg: 'bg-gray-500/20' },
};

export default function JobCard({ job, onCancel }) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{job.type}</p>
            <p className="text-xs text-gray-500">{job.queue}</p>
          </div>
        </div>
        {job.status === 'pending' && onCancel && (
          <button onClick={() => onCancel(job.id)} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
        )}
      </div>

      <p className="text-xs text-gray-600 font-mono">{job.id}</p>

      {job.error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">{job.error}</p>
      )}

      <div className="flex justify-between text-xs text-gray-600">
        <span>Retry {job.retries}/{job.maxRetries}</span>
        <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
