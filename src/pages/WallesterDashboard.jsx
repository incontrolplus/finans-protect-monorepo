import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function WallesterDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [queue, setQueue] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, queueRes, ownersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/system_metrics?select=*&limit=1`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/processing_queue?select=*&order=hours_in_status.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/owner_dashboard?select=*&order=last_activity.desc.nullslast&limit=100`, { headers }),
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m[0] || null);
      }
      if (queueRes.ok) setQueue(await queueRes.json());
      if (ownersRes.ok) setOwners(await ownersRes.json());

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statusColors = {
    pending_signup: 'bg-gray-500',
    signup_in_progress: 'bg-blue-500',
    awaiting_sms: 'bg-yellow-500',
    sms_received: 'bg-yellow-400',
    awaiting_email: 'bg-orange-500',
    email_received: 'bg-orange-400',
    awaiting_contract: 'bg-purple-500',
    contract_signed: 'bg-purple-400',
    pending_review: 'bg-indigo-500',
    verified: 'bg-green-500',
    affiliate_pending: 'bg-teal-500',
    affiliate_confirmed: 'bg-teal-400',
    payout_pending: 'bg-emerald-500',
    payout_completed: 'bg-green-600',
    rejected: 'bg-red-500',
    failed: 'bg-red-600',
    needs_attention: 'bg-red-400 animate-pulse',
  };

  const MetricCard = ({ label, value, color = 'text-white', subtext }) => (
    <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '-'}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallester Dashboard</h1>
          <p className="text-gray-400 mt-1">Мониторинг на owners, бизнеси и lifecycle</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Обнови
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400">
            Задачи 27, 40
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-1">
            Проверете Supabase URL и ключ в .env файла
          </p>
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <MetricCard label="Общо Owners" value={metrics.total_owners} />
          <MetricCard label="Pending" value={metrics.pending_owners} color="text-yellow-400" />
          <MetricCard label="Processing" value={metrics.processing_owners} color="text-blue-400" />
          <MetricCard label="Eligible бизнеси" value={metrics.eligible_businesses} color="text-green-400" />
          <MetricCard label="Wallester акаунти" value={metrics.total_accounts} />
          <MetricCard label="Needs Attention" value={metrics.needs_attention} color="text-red-400" />
          <MetricCard label="Completed" value={metrics.completed} color="text-green-500" />
          <MetricCard label="Pending Payouts" value={metrics.pending_payouts} color="text-emerald-400" />
          <MetricCard
            label="Изплатено"
            value={`${metrics.total_paid_amount}`}
            color="text-green-400"
            subtext="EUR"
          />
        </motion.div>
      )}

      {/* Lifecycle State Machine Visualization */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
        <h3 className="text-white font-medium mb-4">Account Lifecycle Pipeline</h3>
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1">
          {[
            { status: 'pending_signup', label: 'Pending', color: 'bg-gray-500' },
            { status: 'signup_in_progress', label: 'Signup', color: 'bg-blue-500' },
            { status: 'awaiting_sms', label: 'SMS', color: 'bg-yellow-500' },
            { status: 'awaiting_email', label: 'Email', color: 'bg-orange-500' },
            { status: 'awaiting_contract', label: 'Contract', color: 'bg-purple-500' },
            { status: 'pending_review', label: 'Review', color: 'bg-indigo-500' },
            { status: 'verified', label: 'Verified', color: 'bg-green-500' },
            { status: 'affiliate_pending', label: 'Affiliate', color: 'bg-teal-500' },
            { status: 'payout_pending', label: 'Payout', color: 'bg-emerald-500' },
            { status: 'payout_completed', label: 'Done', color: 'bg-green-600' },
          ].map((step, idx, arr) => {
            const count = queue.filter(q => q.status === step.status).length;
            return (
              <React.Fragment key={step.status}>
                <div className="flex flex-col items-center min-w-[70px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${step.color} ${count > 0 ? 'ring-2 ring-white/30' : 'opacity-50'}`}>
                    {count}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">{step.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex-shrink-0 w-4 h-0.5 bg-dark-600 mt-[-12px]" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Error states */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-700">
          {[
            { status: 'failed', label: 'Failed', color: 'bg-red-600' },
            { status: 'needs_attention', label: 'Needs Attention', color: 'bg-red-400' },
            { status: 'rejected', label: 'Rejected', color: 'bg-red-500' },
          ].map((step) => {
            const count = queue.filter(q => q.status === step.status).length;
            return (
              <div key={step.status} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${step.color} ${count > 0 ? '' : 'opacity-30'}`}>
                  {count}
                </div>
                <span className="text-xs text-gray-500">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800/50 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Owners' },
          { id: 'queue', label: 'Опашка' },
          { id: 'lifecycle', label: 'Lifecycle' },
          { id: 'attention', label: 'Needs Attention' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.id === 'attention' && metrics?.needs_attention > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                {metrics.needs_attention}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Owners Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Owner</th>
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Статус</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Бизнеси</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Eligible</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Акаунти</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Completed</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Attention</th>
                  <th className="text-right text-xs font-medium text-gray-400 p-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {owners.map((owner) => (
                  <tr key={owner.owner_id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{owner.full_name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        owner.owner_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        owner.owner_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                        owner.owner_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {owner.owner_status}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-300">{owner.total_businesses}</td>
                    <td className="p-4 text-center text-green-400">{owner.eligible_businesses}</td>
                    <td className="p-4 text-center text-gray-300">{owner.wallester_accounts_count}</td>
                    <td className="p-4 text-center text-green-400">{owner.completed_payouts}</td>
                    <td className="p-4 text-center">
                      {owner.needs_attention_count > 0 ? (
                        <span className="text-red-400 font-bold">{owner.needs_attention_count}</span>
                      ) : (
                        <span className="text-gray-600">0</span>
                      )}
                    </td>
                    <td className="p-4 text-right text-xs text-gray-500">
                      {owner.last_activity ? new Date(owner.last_activity).toLocaleDateString('bg-BG') : '-'}
                    </td>
                  </tr>
                ))}
                {owners.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Няма owners в системата
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Owner</th>
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Фирма</th>
                  <th className="text-left text-xs font-medium text-gray-400 p-4">ЕИК</th>
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Статус</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Опити</th>
                  <th className="text-right text-xs font-medium text-gray-400 p-4">Часове в статус</th>
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Грешка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {queue.map((item) => (
                  <tr key={item.account_id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="p-4 text-white">{item.owner_name}</td>
                    <td className="p-4 text-gray-300">{item.company_name}</td>
                    <td className="p-4 text-gray-400 font-mono text-sm">{item.eik}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${
                        statusColors[item.status] || 'bg-gray-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-400">{item.attempt_count}</td>
                    <td className="p-4 text-right text-gray-400">
                      {item.hours_in_status != null ? `${Math.round(item.hours_in_status)}h` : '-'}
                    </td>
                    <td className="p-4 text-red-400 text-xs max-w-xs truncate">
                      {item.last_error || '-'}
                    </td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Опашката е празна
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Lifecycle Tab */}
      {activeTab === 'lifecycle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* State Machine Diagram */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
            <h3 className="text-white font-medium mb-4">State Transitions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { from: 'pending_signup', to: 'signup_in_progress', trigger: 'Airtop session created', timeout: null },
                { from: 'signup_in_progress', to: 'awaiting_sms', trigger: 'Form submitted', timeout: '2h' },
                { from: 'awaiting_sms', to: 'sms_received', trigger: 'SMS code received', timeout: '30min' },
                { from: 'sms_received', to: 'awaiting_email', trigger: 'SMS verified', timeout: null },
                { from: 'awaiting_email', to: 'email_received', trigger: 'Email code/link received', timeout: '60min' },
                { from: 'email_received', to: 'awaiting_contract', trigger: 'Email verified', timeout: null },
                { from: 'awaiting_contract', to: 'contract_signed', trigger: 'Admin approval + signing', timeout: '48h' },
                { from: 'contract_signed', to: 'pending_review', trigger: 'Submitted to Wallester', timeout: null },
                { from: 'pending_review', to: 'verified', trigger: 'Wallester approves', timeout: '7d' },
                { from: 'verified', to: 'affiliate_pending', trigger: 'Affiliate check started', timeout: null },
                { from: 'affiliate_pending', to: 'affiliate_confirmed', trigger: 'Admin confirms bonus', timeout: '30d' },
                { from: 'affiliate_confirmed', to: 'payout_pending', trigger: 'Payout generated', timeout: null },
                { from: 'payout_pending', to: 'payout_completed', trigger: 'Payout sent', timeout: null },
              ].map((t, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-white ${statusColors[t.from] || 'bg-gray-500'}`}>
                    {t.from.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-600">&rarr;</span>
                  <span className={`px-2 py-0.5 rounded text-white ${statusColors[t.to] || 'bg-gray-500'}`}>
                    {t.to.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-500 ml-1 flex-1 truncate">{t.trigger}</span>
                  {t.timeout && (
                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px] flex-shrink-0">
                      {t.timeout}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Accounts by Status */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
            <h3 className="text-white font-medium mb-3">Accounts by Status</h3>
            <div className="space-y-2">
              {Object.entries(statusColors).map(([status, color]) => {
                const count = queue.filter(q => q.status === status).length;
                if (count === 0) return null;
                return (
                  <div key={status} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`} />
                    <span className="text-gray-300 text-sm flex-1">{status.replace(/_/g, ' ')}</span>
                    <span className="text-white font-bold">{count}</span>
                    <div className="w-32 bg-dark-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color.split(' ')[0]}`}
                        style={{ width: `${Math.min((count / Math.max(queue.length, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeout Rules */}
          <div className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Timeout Rules</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Signup</p>
                <p className="text-yellow-400 font-mono">2 hours</p>
              </div>
              <div>
                <p className="text-gray-500">SMS Wait</p>
                <p className="text-yellow-400 font-mono">30 min</p>
              </div>
              <div>
                <p className="text-gray-500">Email Wait</p>
                <p className="text-orange-400 font-mono">60 min</p>
              </div>
              <div>
                <p className="text-gray-500">Contract</p>
                <p className="text-purple-400 font-mono">48 hours</p>
              </div>
              <div>
                <p className="text-gray-500">Wallester Review</p>
                <p className="text-indigo-400 font-mono">7 days</p>
              </div>
              <div>
                <p className="text-gray-500">Affiliate Confirm</p>
                <p className="text-teal-400 font-mono">30 days</p>
              </div>
              <div>
                <p className="text-gray-500">Max Retries</p>
                <p className="text-red-400 font-mono">3</p>
              </div>
              <div>
                <p className="text-gray-500">Retry Delay</p>
                <p className="text-orange-400 font-mono">attempt * 30min</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Needs Attention Tab */}
      {activeTab === 'attention' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {queue
            .filter((item) => item.status === 'needs_attention' || item.status === 'failed')
            .map((item) => (
              <div
                key={item.account_id}
                className="bg-red-500/5 border border-red-500/30 rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">
                      {item.owner_name} - {item.company_name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">ЕИК: {item.eik}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${
                    statusColors[item.status] || 'bg-gray-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                {item.last_error && (
                  <div className="mt-3 bg-dark-800/50 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-mono">{item.last_error}</p>
                  </div>
                )}
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  <span>Опити: {item.attempt_count}</span>
                  <span>В статус: {Math.round(item.hours_in_status || 0)}h</span>
                  {item.next_retry_at && (
                    <span>Следващ опит: {new Date(item.next_retry_at).toLocaleString('bg-BG')}</span>
                  )}
                </div>
              </div>
            ))}
          {queue.filter((item) => item.status === 'needs_attention' || item.status === 'failed').length === 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-green-400 font-medium">Всичко е наред!</p>
              <p className="text-gray-500 text-sm mt-1">Няма записи, които изискват внимание</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default WallesterDashboard;
