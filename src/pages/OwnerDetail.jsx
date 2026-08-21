import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const STATUS_COLORS = {
  pending_signup: 'bg-gray-500/20 text-gray-400',
  signup_in_progress: 'bg-blue-500/20 text-blue-400',
  awaiting_sms: 'bg-yellow-500/20 text-yellow-400',
  sms_received: 'bg-yellow-300/20 text-yellow-300',
  awaiting_email: 'bg-orange-500/20 text-orange-400',
  email_received: 'bg-orange-300/20 text-orange-300',
  awaiting_contract: 'bg-purple-500/20 text-purple-400',
  contract_signed: 'bg-purple-300/20 text-purple-300',
  pending_review: 'bg-indigo-500/20 text-indigo-400',
  verified: 'bg-green-500/20 text-green-400',
  affiliate_pending: 'bg-teal-500/20 text-teal-400',
  affiliate_confirmed: 'bg-teal-300/20 text-teal-300',
  payout_pending: 'bg-emerald-500/20 text-emerald-400',
  payout_completed: 'bg-green-600/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-400',
  failed: 'bg-red-600/20 text-red-500',
  needs_attention: 'bg-red-400/20 text-red-300',
};

function OwnerDetail({ ownerId, onBack }) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('businesses');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOwner = useCallback(async () => {
    if (!ownerId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}`);
      const data = await res.json();
      if (data.success) {
        setOwner(data.owner);
        setNotes(data.owner.admin_notes || '');
      } else {
        setError(data.error || 'Failed to load owner');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchOwner();
    const interval = setInterval(fetchOwner, 30000);
    return () => clearInterval(interval);
  }, [fetchOwner]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      });
      const data = await res.json();
      if (!data.success) setError('Failed to save notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const retryOwner = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}/retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) fetchOwner();
      else setError(data.error || 'Failed to retry');
    } catch (err) {
      setError(err.message);
    }
  };

  const transitionAccount = async (accountId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/accounts/${accountId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, performedBy: 'admin' }),
      });
      const data = await res.json();
      if (data.success) fetchOwner();
      else setError(data.error || 'Transition failed');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
        <p className="text-red-400">Owner not found</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 text-primary-400 hover:text-primary-300 text-sm">
            Back to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
              &larr;
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{owner.full_name}</h1>
            <p className="text-gray-400 mt-1">Owner Detail | ID: {ownerId?.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {owner.owner_status === 'failed' && (
            <button
              onClick={retryOwner}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            owner.owner_status === 'completed' ? 'bg-green-500/20 text-green-400' :
            owner.owner_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
            owner.owner_status === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {owner.owner_status}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Owner Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
          <h3 className="text-white font-medium mb-3">Лични данни</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Име</p>
              <p className="text-gray-300">{owner.first_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Презиме</p>
              <p className="text-gray-300">{owner.middle_name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Фамилия</p>
              <p className="text-gray-300">{owner.last_name}</p>
            </div>
            <div>
              <p className="text-gray-500">ЕГН</p>
              <p className="text-gray-300 font-mono">{owner.egn || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Телефон</p>
              <p className="text-gray-300">{owner.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-gray-300">{owner.email || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Създаден</p>
              <p className="text-gray-300">{owner.created_at ? new Date(owner.created_at).toLocaleString('bg-BG') : '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Последна активност</p>
              <p className="text-gray-300">{owner.updated_at ? new Date(owner.updated_at).toLocaleString('bg-BG') : '-'}</p>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
          <h3 className="text-white font-medium mb-3">Admin Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
            placeholder="Бележки за този owner..."
          />
          <button
            onClick={saveNotes}
            disabled={saving}
            className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800/50 p-1 rounded-lg w-fit">
        {[
          { id: 'businesses', label: 'Businesses', count: owner.businesses?.length },
          { id: 'accounts', label: 'Accounts', count: owner.accounts?.length },
          { id: 'payouts', label: 'Payouts', count: owner.payouts?.length },
          { id: 'logs', label: 'Action Log', count: owner.logs?.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs text-gray-500">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Businesses */}
      {activeTab === 'businesses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {(owner.businesses || []).map((biz) => (
            <div key={biz.id} className={`bg-dark-800/50 border rounded-xl p-5 ${
              biz.eligibility === 'eligible' ? 'border-green-500/30' : 'border-dark-700'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-medium">{biz.company_name}</h4>
                  {biz.company_name_en && <p className="text-gray-500 text-sm">{biz.company_name_en}</p>}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  biz.eligibility === 'eligible' ? 'bg-green-500/20 text-green-400' :
                  biz.eligibility === 'not_eligible' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {biz.eligibility}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">ЕИК</p>
                  <p className="text-gray-300 font-mono">{biz.eik}</p>
                </div>
                <div>
                  <p className="text-gray-500">Тип</p>
                  <p className="text-gray-300">{biz.business_type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Собственост</p>
                  <p className="text-gray-300">{biz.ownership_share}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Адрес</p>
                  <p className="text-gray-300 text-xs">{biz.address_city}, {biz.address_street}</p>
                </div>
              </div>
            </div>
          ))}
          {(owner.businesses || []).length === 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-500">Няма бизнеси</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Accounts */}
      {activeTab === 'accounts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {(owner.accounts || []).map((acc) => (
            <div key={acc.id} className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">
                    {acc.company_name || acc.business_id?.slice(0, 8)}
                  </h4>
                  <p className="text-gray-500 text-xs font-mono">ID: {acc.id?.slice(0, 12)}...</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[acc.status] || 'bg-gray-500/20 text-gray-400'}`}>
                  {acc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">W. Email</p>
                  <p className="text-gray-300 text-xs">{acc.wallester_email || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">W. Phone</p>
                  <p className="text-gray-300 font-mono text-xs">{acc.wallester_phone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Опити</p>
                  <p className="text-gray-300">{acc.attempt_count || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Обновен</p>
                  <p className="text-gray-300 text-xs">{acc.updated_at ? new Date(acc.updated_at).toLocaleString('bg-BG') : '-'}</p>
                </div>
              </div>

              {acc.last_error && (
                <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                  <p className="text-red-400 text-xs font-mono">{acc.last_error}</p>
                </div>
              )}

              {/* Manual status transition */}
              {!['payout_completed', 'rejected'].includes(acc.status) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {acc.status === 'failed' && (
                    <button
                      onClick={() => transitionAccount(acc.id, 'pending_signup')}
                      className="px-3 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 text-xs rounded-lg transition-colors"
                    >
                      Reset to Pending
                    </button>
                  )}
                  {acc.status === 'needs_attention' && (
                    <button
                      onClick={() => transitionAccount(acc.id, 'pending_signup')}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors"
                    >
                      Retry Signup
                    </button>
                  )}
                  {acc.status === 'verified' && (
                    <button
                      onClick={() => transitionAccount(acc.id, 'affiliate_pending')}
                      className="px-3 py-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-xs rounded-lg transition-colors"
                    >
                      Mark Affiliate Pending
                    </button>
                  )}
                  {acc.status === 'affiliate_confirmed' && (
                    <button
                      onClick={() => transitionAccount(acc.id, 'payout_pending')}
                      className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs rounded-lg transition-colors"
                    >
                      Generate Payout
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {(owner.accounts || []).length === 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-500">Няма Wallester акаунти</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Payouts */}
      {activeTab === 'payouts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-xs font-medium text-gray-400 p-4">Сума</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Статус</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Метод</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Partner</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Създаден</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {(owner.payouts || []).map((p) => (
                <tr key={p.id || p.payout_id} className="hover:bg-dark-700/30">
                  <td className="p-4 text-white font-medium">{p.amount} {p.currency}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 text-sm">{p.payout_method || '-'}</td>
                  <td className="p-4 text-gray-300 text-sm">{p.partner_name || 'Direct'}</td>
                  <td className="p-4 text-gray-500 text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleString('bg-BG') : '-'}
                  </td>
                </tr>
              ))}
              {(owner.payouts || []).length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Няма payouts</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Action Log */}
      {activeTab === 'logs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {(owner.logs || []).map((log, i) => (
            <div key={log.id || i} className="bg-dark-800/50 border border-dark-700 rounded-lg p-3 flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">{log.action}</p>
                  <span className="text-gray-600 text-xs flex-shrink-0">
                    {log.created_at ? new Date(log.created_at).toLocaleString('bg-BG') : ''}
                  </span>
                </div>
                {log.old_status && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {log.old_status} &rarr; {log.new_status}
                  </p>
                )}
                {log.details && (
                  <p className="text-gray-500 text-xs mt-0.5 truncate">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </p>
                )}
                {log.performed_by && (
                  <p className="text-gray-600 text-xs mt-0.5">by {log.performed_by}</p>
                )}
              </div>
            </div>
          ))}
          {(owner.logs || []).length === 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-500">Няма action logs</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default OwnerDetail;
