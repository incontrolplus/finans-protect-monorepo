import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function PartnerManagement() {
  const [partners, setPartners] = useState([]);
  const [referralCodes, setReferralCodes] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('partners');
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', commission_rate: 10, contact_info: '' });
  const [showAddCode, setShowAddCode] = useState(false);
  const [newCode, setNewCode] = useState({ partner_id: '', code: '', channel: 'direct', campaign_name: '' });

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };

  const fetchData = useCallback(async () => {
    try {
      const [partnersRes, codesRes, perfRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/partners?select=*&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/referral_codes?select=*,partners(name)&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/partner_performance?select=*`, { headers }),
      ]);

      if (partnersRes.ok) setPartners(await partnersRes.json());
      if (codesRes.ok) setReferralCodes(await codesRes.json());
      if (perfRes.ok) setPerformance(await perfRes.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPartner = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/partners`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          name: newPartner.name,
          commission_rate: parseFloat(newPartner.commission_rate),
          contact_info: newPartner.contact_info ? { note: newPartner.contact_info } : {},
          is_active: true,
        }),
      });
      if (res.ok) {
        setShowAddPartner(false);
        setNewPartner({ name: '', commission_rate: 10, contact_info: '' });
        fetchData();
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to add partner');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addReferralCode = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/referral_codes`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          partner_id: newCode.partner_id,
          code: newCode.code,
          channel: newCode.channel,
          campaign_name: newCode.campaign_name || null,
          is_active: true,
        }),
      });
      if (res.ok) {
        setShowAddCode(false);
        setNewCode({ partner_id: '', code: '', channel: 'direct', campaign_name: '' });
        fetchData();
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to add code');
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Partner Management</h1>
          <p className="text-gray-400 mt-1">Управление на affiliate партньори и referral кодове</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPartner(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
          >
            + Partner
          </button>
          <button
            onClick={() => setShowAddCode(true)}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            + Referral Code
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400">
            Задачи 41, 43
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
          <p className="text-sm text-gray-400">Partners</p>
          <p className="text-2xl font-bold text-white">{partners.length}</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Active Codes</p>
          <p className="text-2xl font-bold text-blue-400">{referralCodes.filter(c => c.is_active).length}</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Referrals</p>
          <p className="text-2xl font-bold text-green-400">
            {performance.reduce((s, p) => s + (p.total_referrals || 0), 0)}
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Earned</p>
          <p className="text-2xl font-bold text-emerald-400">
            {performance.reduce((s, p) => s + parseFloat(p.total_earned || 0), 0).toFixed(2)} EUR
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800/50 p-1 rounded-lg w-fit">
        {[
          { id: 'partners', label: 'Partners' },
          { id: 'codes', label: 'Referral Codes' },
          { id: 'performance', label: 'Performance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {partners.map((partner) => (
            <div key={partner.id} className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium text-lg">{partner.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-400">Commission: <span className="text-emerald-400 font-bold">{partner.commission_rate}%</span></span>
                    <span className="text-gray-400">KYC: <span className={partner.kyc_verified ? 'text-green-400' : 'text-yellow-400'}>{partner.kyc_verified ? 'Verified' : 'Pending'}</span></span>
                  </div>
                  {partner.contact_info && typeof partner.contact_info === 'object' && (
                    <p className="text-gray-500 text-xs mt-2">
                      {JSON.stringify(partner.contact_info)}
                    </p>
                  )}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  partner.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {partner.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
          {partners.length === 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-500">Няма партньори</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Referral Codes Tab */}
      {activeTab === 'codes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-xs font-medium text-gray-400 p-4">Code</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Partner</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Channel</th>
                <th className="text-left text-xs font-medium text-gray-400 p-4">Campaign</th>
                <th className="text-center text-xs font-medium text-gray-400 p-4">Uses</th>
                <th className="text-center text-xs font-medium text-gray-400 p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {referralCodes.map((rc) => (
                <tr key={rc.id} className="hover:bg-dark-700/30">
                  <td className="p-4 text-white font-mono text-sm">{rc.code}</td>
                  <td className="p-4 text-gray-300">{rc.partners?.name || '-'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-dark-700 text-gray-300 text-xs rounded">{rc.channel}</span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{rc.campaign_name || '-'}</td>
                  <td className="p-4 text-center text-gray-300">
                    {rc.uses_count}{rc.max_uses ? `/${rc.max_uses}` : ''}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${rc.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {rc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {referralCodes.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Няма referral кодове</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-xs font-medium text-gray-400 p-4">Partner</th>
                <th className="text-center text-xs font-medium text-gray-400 p-4">Referrals</th>
                <th className="text-center text-xs font-medium text-gray-400 p-4">Signups</th>
                <th className="text-center text-xs font-medium text-gray-400 p-4">Completed</th>
                <th className="text-center text-xs font-medium text-gray-400 p-4">Conversion</th>
                <th className="text-right text-xs font-medium text-gray-400 p-4">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {performance.map((p) => (
                <tr key={p.partner_id} className="hover:bg-dark-700/30">
                  <td className="p-4 text-white font-medium">{p.partner_name}</td>
                  <td className="p-4 text-center text-gray-300">{p.total_referrals}</td>
                  <td className="p-4 text-center text-blue-400">{p.signups}</td>
                  <td className="p-4 text-center text-green-400">{p.completed}</td>
                  <td className="p-4 text-center text-gray-300">{p.conversion_rate}%</td>
                  <td className="p-4 text-right text-emerald-400 font-bold">{parseFloat(p.total_earned || 0).toFixed(2)} EUR</td>
                </tr>
              ))}
              {performance.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Няма performance данни</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Add Partner Modal */}
      {showAddPartner && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-white mb-4">Add Partner</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newPartner.name}
                onChange={(e) => setNewPartner(p => ({ ...p, name: e.target.value }))}
                placeholder="Partner name"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                value={newPartner.commission_rate}
                onChange={(e) => setNewPartner(p => ({ ...p, commission_rate: e.target.value }))}
                placeholder="Commission %"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={newPartner.contact_info}
                onChange={(e) => setNewPartner(p => ({ ...p, contact_info: e.target.value }))}
                placeholder="Contact info (optional)"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowAddPartner(false)}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addPartner}
                disabled={!newPartner.name}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Referral Code Modal */}
      {showAddCode && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-white mb-4">Add Referral Code</h3>
            <div className="space-y-3">
              <select
                value={newCode.partner_id}
                onChange={(e) => setNewCode(c => ({ ...c, partner_id: e.target.value }))}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Partner</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={newCode.code}
                onChange={(e) => setNewCode(c => ({ ...c, code: e.target.value }))}
                placeholder="Referral code (e.g., PARTNER2024)"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
              <select
                value={newCode.channel}
                onChange={(e) => setNewCode(c => ({ ...c, channel: e.target.value }))}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {['direct', 'telegram', 'facebook', 'instagram', 'viber', 'landing_page', 'email'].map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <input
                type="text"
                value={newCode.campaign_name}
                onChange={(e) => setNewCode(c => ({ ...c, campaign_name: e.target.value }))}
                placeholder="Campaign name (optional)"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowAddCode(false)}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addReferralCode}
                disabled={!newCode.partner_id || !newCode.code}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PartnerManagement;
