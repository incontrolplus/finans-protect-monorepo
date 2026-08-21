import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const STEPS = [
  { id: 'pending_signup', label: 'Pending', icon: '1' },
  { id: 'signup_in_progress', label: 'Signup', icon: '2' },
  { id: 'awaiting_sms', label: 'SMS', icon: '3' },
  { id: 'sms_received', label: 'SMS OK', icon: '4' },
  { id: 'awaiting_email', label: 'Email', icon: '5' },
  { id: 'email_received', label: 'Email OK', icon: '6' },
  { id: 'awaiting_contract', label: 'Contract', icon: '7' },
  { id: 'contract_signed', label: 'Signed', icon: '8' },
  { id: 'pending_review', label: 'Review', icon: '9' },
  { id: 'verified', label: 'Verified', icon: '10' },
];

function SignupFlow() {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerDetail, setOwnerDetail] = useState(null);
  const [activeSignup, setActiveSignup] = useState(null);
  const [smsCode, setSmsCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchOwners = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners?status=has_eligible`);
      const data = await res.json();
      if (data.success) setOwners(data.owners || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOwnerDetail = useCallback(async (ownerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}`);
      const data = await res.json();
      if (data.success) {
        setOwnerDetail(data.owner);
        const activeAccount = data.owner.accounts?.find(
          (a) => !['payout_completed', 'rejected', 'failed'].includes(a.status)
        );
        setActiveSignup(activeAccount || null);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  useEffect(() => {
    if (selectedOwner) {
      fetchOwnerDetail(selectedOwner);
      pollRef.current = setInterval(() => fetchOwnerDetail(selectedOwner), 10000);
      return () => clearInterval(pollRef.current);
    }
  }, [selectedOwner, fetchOwnerDetail]);

  const startSignup = async (businessId) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/start-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: selectedOwner, businessId }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('Signup initiated', `Account ${data.accountId || 'created'}, n8n triggered`);
        fetchOwnerDetail(selectedOwner);
      } else {
        setError(data.error || 'Failed to start signup');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitSmsCode = async () => {
    if (!smsCode.trim() || !activeSignup) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/sms-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: activeSignup.id, code: smsCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('SMS code submitted', `Code: ${smsCode}`);
        setSmsCode('');
        fetchOwnerDetail(selectedOwner);
      } else {
        setError(data.error || 'Failed to submit SMS code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitEmailCode = async () => {
    if (!emailCode.trim() || !activeSignup) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallester/email-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: activeSignup.id,
          type: 'verification_code',
          code: emailCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('Email code submitted', `Code: ${emailCode}`);
        setEmailCode('');
        fetchOwnerDetail(selectedOwner);
      } else {
        setError(data.error || 'Failed to submit email code');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const addLog = (title, detail) => {
    setLogs((prev) => [{ title, detail, time: new Date().toLocaleTimeString('bg-BG') }, ...prev].slice(0, 50));
  };

  const getStepIndex = (status) => STEPS.findIndex((s) => s.id === status);

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
          <h1 className="text-2xl font-bold text-white">Signup Flow</h1>
          <p className="text-gray-400 mt-1">Airtop browser automation за Wallester регистрация</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          Задачи 1, 8, 31, 47
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-gray-500 hover:text-gray-300 text-sm">X</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Owner Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">Owners с eligible бизнеси</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {owners.length === 0 ? (
                <p className="text-gray-500 text-sm">Няма owners с eligible бизнеси</p>
              ) : (
                owners.map((owner) => (
                  <button
                    key={owner.id || owner.owner_id}
                    onClick={() => setSelectedOwner(owner.id || owner.owner_id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedOwner === (owner.id || owner.owner_id)
                        ? 'bg-primary-600/20 border border-primary-500/30'
                        : 'bg-dark-700/50 hover:bg-dark-700 border border-transparent'
                    }`}
                  >
                    <p className="text-white font-medium text-sm">{owner.full_name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {owner.owner_status} | {owner.eligible_businesses || 0} eligible
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">Activity Log</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">Няма активност</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-xs border-b border-dark-700 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{log.title}</span>
                      <span className="text-gray-600">{log.time}</span>
                    </div>
                    <p className="text-gray-400 mt-0.5">{log.detail}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedOwner ? (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-12 text-center">
              <p className="text-gray-400">Изберете owner от списъка вляво</p>
            </div>
          ) : !ownerDetail ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {/* Owner Info */}
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-lg">{ownerDetail.full_name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ownerDetail.owner_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    ownerDetail.owner_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ownerDetail.owner_status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-300">{ownerDetail.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Телефон</p>
                    <p className="text-gray-300">{ownerDetail.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ЕГН</p>
                    <p className="text-gray-300 font-mono">{ownerDetail.egn || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Stepper - Active Signup */}
              {activeSignup && (
                <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
                  <h3 className="text-white font-medium mb-4">
                    Active Signup: {activeSignup.company_name || activeSignup.business_id}
                  </h3>

                  {/* Stepper */}
                  <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
                    {STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(activeSignup.status);
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step.id} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isCurrent
                                  ? 'bg-primary-500 text-white ring-4 ring-primary-500/30'
                                  : 'bg-dark-700 text-gray-500'
                              }`}
                            >
                              {isCompleted ? '\u2713' : step.icon}
                            </div>
                            <span className={`text-[10px] mt-1 whitespace-nowrap ${
                              isCurrent ? 'text-primary-400 font-medium' : isCompleted ? 'text-green-400' : 'text-gray-600'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div className={`w-6 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-dark-700'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* SMS Input */}
                  {activeSignup.status === 'awaiting_sms' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4"
                    >
                      <p className="text-yellow-400 font-medium text-sm mb-2">SMS Verification Required</p>
                      <p className="text-gray-400 text-xs mb-3">
                        Wallester изпрати SMS на {activeSignup.wallester_phone}. Въведете кода:
                      </p>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value)}
                          placeholder="123456"
                          maxLength={8}
                          className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-center text-lg tracking-widest"
                        />
                        <button
                          onClick={submitSmsCode}
                          disabled={actionLoading || !smsCode.trim()}
                          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                        >
                          {actionLoading ? '...' : 'Submit'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Email Input */}
                  {activeSignup.status === 'awaiting_email' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4"
                    >
                      <p className="text-orange-400 font-medium text-sm mb-2">Email Verification Required</p>
                      <p className="text-gray-400 text-xs mb-3">
                        Wallester изпрати email на {activeSignup.wallester_email}. Въведете кода или линка:
                      </p>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="Code or verification link"
                          className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={submitEmailCode}
                          disabled={actionLoading || !emailCode.trim()}
                          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                        >
                          {actionLoading ? '...' : 'Submit'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Contract Approval */}
                  {activeSignup.status === 'awaiting_contract' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4"
                    >
                      <p className="text-purple-400 font-medium text-sm mb-2">Contract Signing - Admin Approval</p>
                      <p className="text-gray-400 text-xs mb-3">
                        Airtop чака admin одобрение за подписване на договора.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Одобрете през Payout Queue или натиснете бутона по-долу.
                      </p>
                    </motion.div>
                  )}

                  {/* Error display */}
                  {activeSignup.last_error && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mt-3">
                      <p className="text-red-400 text-xs font-mono">{activeSignup.last_error}</p>
                      <p className="text-gray-500 text-xs mt-1">Attempt: {activeSignup.attempt_count}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Eligible Businesses */}
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-medium mb-3">Eligible бизнеси</h3>
                <div className="space-y-3">
                  {(ownerDetail.businesses || [])
                    .filter((b) => b.eligibility === 'eligible')
                    .map((biz) => {
                      const hasActiveAccount = (ownerDetail.accounts || []).some(
                        (a) => a.business_id === biz.id && !['payout_completed', 'rejected', 'failed'].includes(a.status)
                      );
                      const completedAccount = (ownerDetail.accounts || []).find(
                        (a) => a.business_id === biz.id && a.status === 'payout_completed'
                      );

                      return (
                        <div key={biz.id} className="flex items-center justify-between bg-dark-700/50 rounded-lg p-3">
                          <div>
                            <p className="text-white text-sm font-medium">{biz.company_name}</p>
                            <p className="text-gray-500 text-xs">
                              EIK: {biz.eik} | {biz.business_type} | {biz.ownership_share}%
                            </p>
                          </div>
                          <div>
                            {completedAccount ? (
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                                Completed
                              </span>
                            ) : hasActiveAccount ? (
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                                In Progress
                              </span>
                            ) : (
                              <button
                                onClick={() => startSignup(biz.id)}
                                disabled={actionLoading}
                                className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white text-xs rounded-lg transition-colors font-medium"
                              >
                                {actionLoading ? '...' : 'Start Signup'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {(ownerDetail.businesses || []).filter((b) => b.eligibility === 'eligible').length === 0 && (
                    <p className="text-gray-500 text-sm">Няма eligible бизнеси</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignupFlow;
