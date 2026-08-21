import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function VerificationPipeline() {
  const [accounts, setAccounts] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [manualCode, setManualCode] = useState({});

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };

  const fetchData = useCallback(async () => {
    try {
      const [accountsRes, logsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/wallester_accounts?select=*,verified_owners(full_name,phone,email),owner_businesses(company_name,eik)&status=in.(awaiting_sms,sms_received,awaiting_email,email_received)&order=updated_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/action_log?select=*&action=in.(sms_code_received,email_classified,sms_sent,email_sent)&order=created_at.desc&limit=50`, { headers }),
      ]);

      if (accountsRes.ok) setAccounts(await accountsRes.json());
      if (logsRes.ok) {
        const allLogs = await logsRes.json();
        setSmsLogs(allLogs.filter(l => l.action?.includes('sms')));
        setEmailLogs(allLogs.filter(l => l.action?.includes('email')));
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const submitManualCode = async (accountId, type) => {
    const code = manualCode[accountId];
    if (!code?.trim()) return;

    try {
      const endpoint = type === 'sms' ? '/api/wallester/sms-code' : '/api/wallester/email-event';
      const body = type === 'sms'
        ? { accountId, code: code.trim() }
        : { accountId, type: 'verification_code', code: code.trim() };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setManualCode((prev) => ({ ...prev, [accountId]: '' }));
        fetchData();
      } else {
        setError(data.error || 'Failed to submit code');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const statusConfig = {
    awaiting_sms: { label: 'Awaiting SMS', color: 'bg-yellow-500/20 text-yellow-400', type: 'sms' },
    sms_received: { label: 'SMS Received', color: 'bg-yellow-300/20 text-yellow-300', type: 'sms' },
    awaiting_email: { label: 'Awaiting Email', color: 'bg-orange-500/20 text-orange-400', type: 'email' },
    email_received: { label: 'Email Received', color: 'bg-orange-300/20 text-orange-300', type: 'email' },
  };

  const pendingAccounts = accounts.filter(a => a.status === 'awaiting_sms' || a.status === 'awaiting_email');
  const receivedAccounts = accounts.filter(a => a.status === 'sms_received' || a.status === 'email_received');

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
          <h1 className="text-2xl font-bold text-white">Verification Pipeline</h1>
          <p className="text-gray-400 mt-1">SMS и Email верификация за Wallester акаунти</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Обнови
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
            Задачи 5, 17, 32
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Awaiting SMS</p>
          <p className="text-2xl font-bold text-yellow-400">
            {accounts.filter(a => a.status === 'awaiting_sms').length}
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">SMS Received</p>
          <p className="text-2xl font-bold text-yellow-300">
            {accounts.filter(a => a.status === 'sms_received').length}
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Awaiting Email</p>
          <p className="text-2xl font-bold text-orange-400">
            {accounts.filter(a => a.status === 'awaiting_email').length}
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Email Received</p>
          <p className="text-2xl font-bold text-orange-300">
            {accounts.filter(a => a.status === 'email_received').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800/50 p-1 rounded-lg w-fit">
        {[
          { id: 'pending', label: 'Awaiting', count: pendingAccounts.length },
          { id: 'received', label: 'Received', count: receivedAccounts.length },
          { id: 'sms_log', label: 'SMS Log' },
          { id: 'email_log', label: 'Email Log' },
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
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Verifications */}
      {activeTab === 'pending' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {pendingAccounts.length === 0 ? (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-green-400 font-medium">Няма чакащи верификации</p>
            </div>
          ) : (
            pendingAccounts.map((account) => {
              const config = statusConfig[account.status];
              const isSmS = config?.type === 'sms';
              return (
                <div key={account.id} className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-medium">
                        {account.verified_owners?.full_name || account.owner_id}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {account.owner_businesses?.company_name} | EIK: {account.owner_businesses?.eik}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color}`}>
                      {config?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Телефон</p>
                      <p className="text-gray-300 font-mono">{account.wallester_phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="text-gray-300">{account.wallester_email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{isSmS ? 'SMS изпратен' : 'Email изпратен'}</p>
                      <p className="text-gray-300">
                        {isSmS
                          ? account.sms_sent_at ? new Date(account.sms_sent_at).toLocaleString('bg-BG') : '-'
                          : account.email_sent_at ? new Date(account.email_sent_at).toLocaleString('bg-BG') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Опити</p>
                      <p className="text-gray-300">{account.attempt_count || 0}</p>
                    </div>
                  </div>

                  {/* Manual code entry */}
                  <div className={`border rounded-lg p-3 ${isSmS ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
                    <p className={`text-xs font-medium mb-2 ${isSmS ? 'text-yellow-400' : 'text-orange-400'}`}>
                      Manual {isSmS ? 'SMS' : 'Email'} Code Entry
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={manualCode[account.id] || ''}
                        onChange={(e) => setManualCode((prev) => ({ ...prev, [account.id]: e.target.value }))}
                        placeholder={isSmS ? '123456' : 'Code or link'}
                        className={`flex-1 px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm ${
                          isSmS ? 'focus:ring-yellow-500 font-mono tracking-widest' : 'focus:ring-orange-500'
                        }`}
                      />
                      <button
                        onClick={() => submitManualCode(account.id, isSmS ? 'sms' : 'email')}
                        disabled={!manualCode[account.id]?.trim()}
                        className={`px-4 py-1.5 text-white text-sm rounded-lg transition-colors font-medium disabled:bg-gray-600 ${
                          isSmS ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Received */}
      {activeTab === 'received' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {receivedAccounts.length === 0 ? (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">Няма получени кодове</p>
            </div>
          ) : (
            receivedAccounts.map((account) => (
              <div key={account.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {account.verified_owners?.full_name}
                    </p>
                    <p className="text-gray-400 text-sm">{account.owner_businesses?.company_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {account.status === 'sms_received' ? 'SMS Code Ready' : 'Email Code Ready'}
                    </span>
                    {account.sms_code && (
                      <p className="text-green-400 font-mono text-lg mt-1">{account.sms_code}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* SMS Log */}
      {activeTab === 'sms_log' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-xs font-medium text-gray-400 p-4">Време</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Action</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Account</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {smsLogs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-700/30">
                  <td className="p-4 text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString('bg-BG')}
                  </td>
                  <td className="p-4 text-sm text-yellow-400">{log.action}</td>
                  <td className="p-4 text-sm text-gray-300 font-mono">{(log.account_id || '').slice(0, 8)}...</td>
                  <td className="p-4 text-xs text-gray-400 max-w-xs truncate">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </td>
                </tr>
              ))}
              {smsLogs.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Няма SMS логове</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Email Log */}
      {activeTab === 'email_log' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-xs font-medium text-gray-400 p-4">Време</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Action</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Account</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Type</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {emailLogs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-700/30">
                  <td className="p-4 text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString('bg-BG')}
                  </td>
                  <td className="p-4 text-sm text-orange-400">{log.action}</td>
                  <td className="p-4 text-sm text-gray-300 font-mono">{(log.account_id || '').slice(0, 8)}...</td>
                  <td className="p-4 text-sm text-gray-300">{log.details?.type || '-'}</td>
                  <td className="p-4 text-xs text-gray-400 max-w-xs truncate">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </td>
                </tr>
              ))}
              {emailLogs.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Няма Email логове</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Provider Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">SMS Providers</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Fanytel (Primary)</span>
              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">smstome (Backup)</span>
              <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400">Standby</span>
            </div>
          </div>
        </div>
        <div className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Email Provider</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">IMAP (imap.hostinger.com)</span>
              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">AI Classification</span>
              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">Claude</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPipeline;
