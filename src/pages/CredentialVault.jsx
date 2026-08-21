import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function CredentialVault() {
  const [credentials, setCredentials] = useState([]);
  const [fintechAccounts, setFintechAccounts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('credentials');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [credsRes, fintechRes, purchasesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/credentials`),
        fetch(`${API_BASE}/api/admin/fintech-accounts`),
        fetch(`${API_BASE}/api/admin/purchases`),
      ]);

      const credsData = await credsRes.json();
      const fintechData = await fintechRes.json();
      const purchasesData = await purchasesRes.json();

      if (credsData.success) setCredentials(credsData.credentials);
      if (fintechData.success) setFintechAccounts(fintechData.accounts);
      if (purchasesData.success) setPurchases(purchasesData.summary);

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

  const platforms = [...new Set(credentials.map(c => c.platform))].sort();

  const filteredCredentials = credentials.filter(c => {
    const matchesSearch = !searchTerm ||
      c.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.platform?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !platformFilter || c.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const platformColors = {
    google: 'bg-red-500/20 text-red-400',
    meta: 'bg-blue-600/20 text-blue-400',
    instagram: 'bg-pink-500/20 text-pink-400',
    telegram: 'bg-sky-500/20 text-sky-400',
    wallester: 'bg-emerald-500/20 text-emerald-400',
    revolut: 'bg-indigo-500/20 text-indigo-400',
    wise: 'bg-green-500/20 text-green-400',
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
          <h1 className="text-2xl font-bold text-white">Credential Vault</h1>
          <p className="text-gray-400 mt-1">Управление на акаунти, credentials и финтех платформи</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Обнови
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
            Задачи 2, 6, 30
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
          <p className="text-sm text-gray-400">Credentials</p>
          <p className="text-2xl font-bold text-white">{credentials.length}</p>
          <p className="text-xs text-green-400 mt-1">
            {credentials.filter(c => c.is_active).length} active
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Fintech Accounts</p>
          <p className="text-2xl font-bold text-white">{fintechAccounts.length}</p>
          <p className="text-xs text-green-400 mt-1">
            {fintechAccounts.filter(a => a.is_active).length} active
          </p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Platforms</p>
          <p className="text-2xl font-bold text-white">{platforms.length}</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-sm text-gray-400">Purchases</p>
          <p className="text-2xl font-bold text-white">
            {purchases.reduce((sum, p) => sum + (p.total_purchased || 0), 0)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800/50 p-1 rounded-lg w-fit">
        {[
          { id: 'credentials', label: 'Credentials' },
          { id: 'fintech', label: 'Fintech Accounts' },
          { id: 'purchases', label: 'Purchases' },
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
          </button>
        ))}
      </div>

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search credentials..."
              className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">All Platforms</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Credentials Grid */}
          <div className="grid gap-3">
            {filteredCredentials.length === 0 ? (
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
                <p className="text-gray-400">Няма намерени credentials</p>
              </div>
            ) : (
              filteredCredentials.map((cred) => (
                <motion.div
                  key={cred.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`bg-dark-800/50 border rounded-xl p-4 ${
                    cred.is_active ? 'border-dark-700' : 'border-red-500/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        platformColors[cred.platform] || 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {cred.platform}
                      </span>
                      <span className="text-gray-500 text-xs">{cred.account_type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {cred.is_verified && (
                        <span className="text-green-400 text-xs">Verified</span>
                      )}
                      <span className={`w-2 h-2 rounded-full ${cred.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {cred.username && (
                      <div>
                        <p className="text-gray-500 text-xs">Username</p>
                        <p className="text-gray-300 font-mono">{cred.username}</p>
                      </div>
                    )}
                    {cred.email && (
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p className="text-gray-300">{cred.email}</p>
                      </div>
                    )}
                    {cred.phone && (
                      <div>
                        <p className="text-gray-500 text-xs">Phone</p>
                        <p className="text-gray-300">{cred.phone}</p>
                      </div>
                    )}
                    {cred.last_login_at && (
                      <div>
                        <p className="text-gray-500 text-xs">Last Login</p>
                        <p className="text-gray-300">
                          {new Date(cred.last_login_at).toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                    )}
                  </div>

                  {cred.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cred.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-dark-700 text-gray-400 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Fintech Tab */}
      {activeTab === 'fintech' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {fintechAccounts.length === 0 ? (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center text-gray-500">
              Няма fintech accounts
            </div>
          ) : (
            fintechAccounts.map((account, idx) => (
              <div key={idx} className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      platformColors[account.platform] || 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {account.platform.toUpperCase()}
                    </span>
                    {account.platform_name && (
                      <span className="text-gray-400 text-sm">{account.platform_name}</span>
                    )}
                    {account.is_primary && (
                      <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-medium ${
                      account.kyc_level === 'full' ? 'text-green-400' :
                      account.kyc_level === 'enhanced' ? 'text-yellow-400' :
                      'text-gray-500'
                    }`}>
                      KYC: {account.kyc_level || 'none'}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${account.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                </div>

                {/* Generic fields */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Account Holder</p>
                    <p className="text-gray-200">{account.account_holder}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Currency</p>
                    <p className="text-gray-300">{account.currency}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Balance</p>
                    <p className="text-white font-mono font-semibold">
                      {account.current_balance != null ? account.current_balance.toFixed(2) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Owner / Partner</p>
                    <p className="text-gray-300">{account.owner_name || account.partner_name || '—'}</p>
                  </div>
                  {account.iban && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">IBAN</p>
                      <p className="text-gray-300 font-mono text-xs">{account.iban}</p>
                    </div>
                  )}
                  {account.account_number && (
                    <div>
                      <p className="text-gray-500 text-xs">Account #</p>
                      <p className="text-gray-300 font-mono text-xs">{account.account_number}</p>
                    </div>
                  )}
                </div>

                {/* Platform-specific details */}
                {account.platform_details && Object.keys(account.platform_details).length > 0 && (
                  <div className="border-t border-dark-600 pt-3 mt-2">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                      {account.platform} details
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Revolut */}
                      {account.platform === 'revolut' && <>
                        {account.platform_details.revolut_tag && (
                          <div>
                            <p className="text-gray-500 text-xs">Revolut Tag</p>
                            <p className="text-indigo-400 font-mono text-sm">{account.platform_details.revolut_tag}</p>
                          </div>
                        )}
                        {account.platform_details.card_number_last4 && (
                          <div>
                            <p className="text-gray-500 text-xs">Card</p>
                            <p className="text-gray-300 font-mono">•••• {account.platform_details.card_number_last4}</p>
                          </div>
                        )}
                        {account.platform_details.card_type && (
                          <div>
                            <p className="text-gray-500 text-xs">Card Type</p>
                            <p className="text-gray-300 capitalize">{account.platform_details.card_type}</p>
                          </div>
                        )}
                        {account.platform_details.profile_type && (
                          <div>
                            <p className="text-gray-500 text-xs">Profile</p>
                            <p className="text-gray-300 capitalize">{account.platform_details.profile_type}</p>
                          </div>
                        )}
                      </>}

                      {/* Wise */}
                      {account.platform === 'wise' && <>
                        {account.platform_details.wise_id && (
                          <div>
                            <p className="text-gray-500 text-xs">Wise ID</p>
                            <p className="text-green-400 font-mono text-sm">{account.platform_details.wise_id}</p>
                          </div>
                        )}
                        {account.platform_details.profile_type && (
                          <div>
                            <p className="text-gray-500 text-xs">Profile</p>
                            <p className="text-gray-300 capitalize">{account.platform_details.profile_type}</p>
                          </div>
                        )}
                        {account.platform_details.verification_level && (
                          <div>
                            <p className="text-gray-500 text-xs">Verification</p>
                            <p className="text-yellow-400 capitalize">{account.platform_details.verification_level}</p>
                          </div>
                        )}
                        {account.platform_details.supported_currencies?.length > 0 && (
                          <div>
                            <p className="text-gray-500 text-xs">Currencies</p>
                            <p className="text-gray-300 text-xs">{account.platform_details.supported_currencies.join(', ')}</p>
                          </div>
                        )}
                      </>}

                      {/* Neteller */}
                      {account.platform === 'neteller' && <>
                        {account.platform_details.account_id && (
                          <div>
                            <p className="text-gray-500 text-xs">Account ID</p>
                            <p className="text-gray-300 font-mono text-sm">{account.platform_details.account_id}</p>
                          </div>
                        )}
                        {account.platform_details.net_account_email && (
                          <div>
                            <p className="text-gray-500 text-xs">NET Email</p>
                            <p className="text-gray-300 text-sm">{account.platform_details.net_account_email}</p>
                          </div>
                        )}
                        {account.platform_details.vip_level && (
                          <div>
                            <p className="text-gray-500 text-xs">VIP Level</p>
                            <p className="text-yellow-400 capitalize font-semibold">{account.platform_details.vip_level}</p>
                          </div>
                        )}
                        {account.platform_details.linked_card_last4 && (
                          <div>
                            <p className="text-gray-500 text-xs">Linked Card</p>
                            <p className="text-gray-300 font-mono">•••• {account.platform_details.linked_card_last4}</p>
                          </div>
                        )}
                      </>}

                      {/* Viva */}
                      {account.platform === 'viva' && <>
                        {account.platform_details.merchant_id && (
                          <div>
                            <p className="text-gray-500 text-xs">Merchant ID</p>
                            <p className="text-gray-300 font-mono text-sm">{account.platform_details.merchant_id}</p>
                          </div>
                        )}
                        {account.platform_details.store_id && (
                          <div>
                            <p className="text-gray-500 text-xs">Store ID</p>
                            <p className="text-gray-300 font-mono text-sm">{account.platform_details.store_id}</p>
                          </div>
                        )}
                      </>}

                      {/* SumUp */}
                      {account.platform === 'sumup' && <>
                        {account.platform_details.merchant_code && (
                          <div>
                            <p className="text-gray-500 text-xs">Merchant Code</p>
                            <p className="text-gray-300 font-mono text-sm">{account.platform_details.merchant_code}</p>
                          </div>
                        )}
                        {account.platform_details.reader_serial && (
                          <div>
                            <p className="text-gray-500 text-xs">Reader Serial</p>
                            <p className="text-gray-300 font-mono text-sm">{account.platform_details.reader_serial}</p>
                          </div>
                        )}
                      </>}

                      {/* Generic fallback: other platforms */}
                      {!['revolut','wise','neteller','viva','sumup'].includes(account.platform) &&
                        Object.entries(account.platform_details).map(([k, v]) => (
                          <div key={k}>
                            <p className="text-gray-500 text-xs">{k.replace(/_/g, ' ')}</p>
                            <p className="text-gray-300 text-sm font-mono">
                              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Transfer limits */}
                {(account.transfer_limit_daily || account.transfer_limit_monthly) && (
                  <div className="border-t border-dark-600 pt-3 mt-2 flex space-x-6 text-sm">
                    {account.transfer_limit_daily && (
                      <div>
                        <p className="text-gray-500 text-xs">Daily Limit</p>
                        <p className="text-gray-300 font-mono">{account.transfer_limit_daily.toFixed(2)} {account.currency}</p>
                      </div>
                    )}
                    {account.transfer_limit_monthly && (
                      <div>
                        <p className="text-gray-500 text-xs">Monthly Limit</p>
                        <p className="text-gray-300 font-mono">{account.transfer_limit_monthly.toFixed(2)} {account.currency}</p>
                      </div>
                    )}
                    {account.transfer_limit_per_transaction && (
                      <div>
                        <p className="text-gray-500 text-xs">Per Transaction</p>
                        <p className="text-gray-300 font-mono">{account.transfer_limit_per_transaction.toFixed(2)} {account.currency}</p>
                      </div>
                    )}
                  </div>
                )}

                {account.notes && (
                  <p className="text-gray-500 text-xs mt-3 italic">{account.notes}</p>
                )}
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Platform</th>
                  <th className="text-left text-xs font-medium text-gray-400 p-4">Type</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Total</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Active</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Dead</th>
                  <th className="text-right text-xs font-medium text-gray-400 p-4">Spent</th>
                  <th className="text-center text-xs font-medium text-gray-400 p-4">Avg Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {purchases.map((p, idx) => (
                  <tr key={idx} className="hover:bg-dark-700/30 transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        platformColors[p.platform] || 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {p.platform}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{p.account_type}</td>
                    <td className="p-4 text-center text-white">{p.total_purchased}</td>
                    <td className="p-4 text-center text-green-400">{p.active_count}</td>
                    <td className="p-4 text-center text-red-400">{p.dead_count}</td>
                    <td className="p-4 text-right text-gray-300 font-mono">
                      {p.total_spent ? `$${p.total_spent.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm ${
                        p.avg_quality >= 7 ? 'text-green-400' :
                        p.avg_quality >= 4 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {p.avg_quality ? p.avg_quality.toFixed(1) : '-'}/10
                      </span>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Няма purchase records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CredentialVault;
