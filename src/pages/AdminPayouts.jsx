import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const fetchPayouts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/queue`);
      const data = await res.json();
      if (data.success) {
        setPayouts(data.payouts);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
    const interval = setInterval(fetchPayouts, 30000);
    return () => clearInterval(interval);
  }, [fetchPayouts]);

  const handleApprove = async (payoutId) => {
    setActionLoading(payoutId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPayouts();
      } else {
        setError(data.error || 'Failed to approve');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (payoutId) => {
    setActionLoading(payoutId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/${payoutId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: 'admin', reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(null);
        setRejectReason('');
        fetchPayouts();
      } else {
        setError(data.error || 'Failed to reject');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleValidate = async (payoutId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/payouts/${payoutId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setValidationResult({ id: payoutId, ...data.validation });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      admin_review: 'bg-blue-500/20 text-blue-400',
      retry: 'bg-orange-500/20 text-orange-400',
      failed: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    );
  };

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
          <h1 className="text-2xl font-bold text-white">Payout Queue</h1>
          <p className="text-gray-400 mt-1">Одобрение и управление на плащания</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPayouts}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Обнови
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
            Задачи 41, 43, 47
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {payouts.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Admin Review</p>
          <p className="text-2xl font-bold text-blue-400">
            {payouts.filter(p => p.status === 'admin_review').length}
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Retry</p>
          <p className="text-2xl font-bold text-orange-400">
            {payouts.filter(p => p.status === 'retry').length}
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Amount</p>
          <p className="text-2xl font-bold text-emerald-400">
            {payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)} EUR
          </p>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-4 ${
            validationResult.valid
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${validationResult.valid ? 'text-green-400' : 'text-red-400'}`}>
                {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
              </p>
              {validationResult.issues?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {validationResult.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-red-300">- {issue}</li>
                  ))}
                </ul>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Daily total: {validationResult.daily_total} EUR | Hourly count: {validationResult.hourly_count}
              </p>
            </div>
            <button
              onClick={() => setValidationResult(null)}
              className="text-gray-500 hover:text-gray-300"
            >
              X
            </button>
          </div>
        </motion.div>
      )}

      {/* Payout List */}
      <div className="space-y-4">
        {payouts.length === 0 ? (
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
            <p className="text-green-400 font-medium">Няма pending payouts</p>
            <p className="text-gray-500 text-sm mt-1">Всички плащания са обработени</p>
          </div>
        ) : (
          payouts.map((payout) => (
            <motion.div
              key={payout.payout_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-white font-medium text-lg">
                      {payout.amount} {payout.currency}
                    </h3>
                    {statusBadge(payout.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Owner</p>
                      <p className="text-gray-300">{payout.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Partner</p>
                      <p className="text-gray-300">{payout.partner_name || 'Direct (owner)'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Фирма</p>
                      <p className="text-gray-300">{payout.company_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ЕИК</p>
                      <p className="text-gray-300 font-mono">{payout.eik}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Метод</p>
                      <p className="text-gray-300">{payout.payout_method || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Комуникация</p>
                      <p className="text-gray-300">
                        {payout.communication_channel}: {payout.communication_handle}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Affiliate бонус</p>
                      <p className="text-gray-300">{payout.affiliate_bonus_amount} EUR</p>
                    </div>
                  </div>

                  {payout.last_error && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                      <p className="text-red-400 text-xs font-mono">{payout.last_error}</p>
                      <p className="text-gray-500 text-xs">Attempt: {payout.attempt_count}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleValidate(payout.payout_id)}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors"
                  >
                    Validate
                  </button>
                  <button
                    onClick={() => handleApprove(payout.payout_id)}
                    disabled={actionLoading === payout.payout_id}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    {actionLoading === payout.payout_id ? '...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(payout.payout_id)}
                    disabled={actionLoading === payout.payout_id}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-white mb-4">Reject Payout</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Причина за отхвърляне..."
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {actionLoading ? '...' : 'Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminPayouts;
