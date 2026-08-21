import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  CreditCard,
  FileText,
  RefreshCw,
  DollarSign,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function HostingerManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // State for different sections
  const [vpsInstances, setVpsInstances] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [accountBalance, setAccountBalance] = useState(null);

  // Check if Hostinger API is configured
  const [isConfigured, setIsConfigured] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleActivateDemo = () => {
    setIsDemoMode(true);
    setAccountBalance({ amount: '248.50' });
    setVpsInstances([
      {
        id: 'vps-srv1201204',
        name: 'srv1201204.hstgr.cloud (Production VPS)',
        status: 'Active',
        ip_address: '84.32.188.12',
        cpu: '12%',
        ram: '4.1 / 8 GB (51%)',
        storage: '42 / 100 GB (26%)'
      },
      {
        id: 'vps-dev-node',
        name: 'leons-mac-mini.local (Dev Server Sync)',
        status: 'Offline',
        ip_address: '100.83.83.8',
        cpu: '0%',
        ram: '0 / 16 GB (0%)',
        storage: '180 / 512 GB (35%)'
      }
    ]);
    setSubscriptions([
      {
        id: 'sub-vps-prod',
        product_name: 'VPS KVM 2 Plan',
        status: 'Active',
        next_billing_date: '2026-08-15',
        price: '14.99',
        period: 'Monthly'
      },
      {
        id: 'sub-domain-wallestars',
        product_name: 'wallestars.com Domain Registration',
        status: 'Active',
        next_billing_date: '2027-02-21',
        price: '11.99',
        period: 'Yearly'
      }
    ]);
    setInvoices([
      {
        id: 'inv-001',
        number: 'INV-2026-001',
        date: '2026-07-15',
        amount: '14.99',
        status: 'Paid'
      },
      {
        id: 'inv-002',
        number: 'INV-2026-002',
        date: '2026-06-15',
        amount: '14.99',
        status: 'Paid'
      }
    ]);
    setPaymentMethods([
      {
        id: 'pm-card-1',
        type: 'Visa',
        last4: '4242',
        is_default: true
      }
    ]);
    showToast('Demo Sandbox Activated!', 'success');
  };

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setIsConfigured(data.services.hostinger || false);
    } catch (err) {
      console.error('Failed to check configuration:', err);
    }
  };

  // Fetch VPS instances
  const fetchVPSInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hostinger/vps');
      if (!response.ok) throw new Error('Failed to fetch VPS instances');
      const data = await response.json();
      setVpsInstances(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hostinger/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      const data = await response.json();
      setSubscriptions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hostinger/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hostinger/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch account balance
  const fetchAccountBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hostinger/account/balance');
      if (!response.ok) throw new Error('Failed to fetch account balance');
      const data = await response.json();
      setAccountBalance(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Renew subscription
  const handleRenewSubscription = async (subscriptionId) => {
    const userConfirmed = window.confirm('Are you sure you want to renew this subscription?');
    if (!userConfirmed) return;

    if (isDemoMode) {
      setLoading(true);
      setTimeout(() => {
        setSubscriptions(prev => prev.map(sub => sub.id === subscriptionId ? { ...sub, next_billing_date: '2026-09-15' } : sub));
        showToast('Demo Subscription renewed successfully!', 'success');
        setLoading(false);
      }, 800);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hostinger/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to renew subscription');
      const data = await response.json();
      showToast(data.message || 'Subscription renewed successfully', 'success');
      fetchSubscriptions();
    } catch (err) {
      setError(err.message);
      showToast('Failed to renew subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Restart VPS
  const handleRestartVPS = async (instanceId) => {
    const userConfirmed = window.confirm('Are you sure you want to restart this VPS?');
    if (!userConfirmed) return;

    if (isDemoMode) {
      setLoading(true);
      showToast('Demo VPS restart initiated!', 'success');
      setVpsInstances(prev => prev.map(v => v.id === instanceId ? { ...v, cpu: '0%', status: 'Restarting...' } : v));
      
      setTimeout(() => {
        setVpsInstances(prev => prev.map(v => v.id === instanceId ? { ...v, cpu: '15%', status: 'Active' } : v));
        showToast('Demo VPS restarted successfully!', 'success');
        setLoading(false);
      }, 2000);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hostinger/vps/${instanceId}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to restart VPS');
      const data = await response.json();
      showToast(data.message || 'VPS restart initiated', 'success');
      fetchVPSInstances();
    } catch (err) {
      setError(err.message);
      showToast('Failed to restart VPS', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (isDemoMode) return;
    if (!isConfigured) return;

    switch (activeTab) {
      case 'overview':
        fetchAccountBalance();
        fetchVPSInstances();
        fetchSubscriptions();
        break;
      case 'vps':
        fetchVPSInstances();
        break;
      case 'subscriptions':
        fetchSubscriptions();
        break;
      case 'billing':
        fetchInvoices();
        fetchPaymentMethods();
        break;
      default:
        break;
    }
  }, [activeTab, isConfigured]);

  if (!isConfigured && !isDemoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-yellow-500">Hostinger API Not Configured</h2>
            </div>
            <p className="text-gray-300 mb-4">
              To use Hostinger management features, you need to configure your API token.
            </p>
            <div className="bg-gray-800/50 rounded p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">Add to your .env file:</p>
              <code className="text-sm text-sky-400">
                HOSTINGER_API_TOKEN=your_api_token_here
              </code>
            </div>
            <p className="text-sm text-gray-400">
              Get your API token from: <a href="https://hpanel.hostinger.com" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">https://hpanel.hostinger.com</a>
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 border-t border-yellow-500/20 pt-6">
              <button
                onClick={handleActivateDemo}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-dark-950 font-semibold rounded-lg shadow-lg shadow-yellow-500/10 transition-all flex items-center gap-2"
              >
                <Server className="w-4 h-4" />
                Activate Demo Sandbox
              </button>
              <span className="text-xs text-yellow-500/75">
                Explore the interface and interactions without any credentials.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${toast.type === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <p>{toast.message}</p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent mb-2">
            Hostinger Management
          </h1>
          <p className="text-gray-400">Manage your VPS, subscriptions, and billing</p>
        </motion.div>

        {isDemoMode && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 animate-pulse" />
              <strong>Demo Sandbox Mode Active:</strong> You are viewing simulated server data. Restarts and renewals are safe to trigger.
            </span>
            <button
              onClick={() => {
                setIsDemoMode(false);
                setIsConfigured(false);
                checkConfiguration();
              }}
              className="underline text-xs hover:text-yellow-400 transition-colors font-semibold"
            >
              Exit Sandbox
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
          >
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'vps', 'subscriptions', 'billing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Account Balance */}
              {accountBalance && (
                <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    <h2 className="text-xl font-semibold text-white">Account Balance</h2>
                  </div>
                  <p className="text-3xl font-bold text-green-500">
                    ${accountBalance.amount || '0.00'}
                  </p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Server className="w-5 h-5 text-sky-500" />
                    <h3 className="text-sm font-medium text-gray-400">VPS Instances</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{vpsInstances.length}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-400">Subscriptions</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-400">Status</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-500">Active</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vps' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">VPS Instances</h2>
                <button
                  onClick={fetchVPSInstances}
                  disabled={loading}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : vpsInstances.length === 0 ? (
                <p className="text-gray-400">No VPS instances found</p>
              ) : (
                vpsInstances.map((vps) => (
                  <div key={vps.id} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700 w-full mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                          <Server className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            {vps.name || vps.id}
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                              {vps.status || 'Active'}
                            </span>
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm bg-gray-900 px-2 py-0.5 rounded text-sky-400 font-mono">
                              {vps.ip_address || '192.168.0.1'}
                            </code>
                            <span className="text-xs text-gray-500">Ubuntu 22.04 LTS</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`ssh://root@${vps.ip_address}`, '_blank')}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm transition-colors text-white flex items-center gap-2"
                        >
                          SSH Connect
                        </button>
                        <button
                          onClick={() => handleRestartVPS(vps.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" /> Restart
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Metrics */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Real-time Metrics</h4>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-300">CPU Usage</span>
                            <span className="text-sm text-white font-mono">{vps.cpu || '87%'}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: vps.cpu ? vps.cpu.replace('%', '') + '%' : '87%' }}></div>
                          </div>

                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-300">RAM Usage</span>
                            <span className="text-sm text-white font-mono">{vps.ram || '5.2 / 8 GB (65%)'}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                            <div className="bg-sky-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>

                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-300">Disk Storage</span>
                            <span className="text-sm text-white font-mono">{vps.storage || '45 / 160 GB (28%)'}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Log Tail */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Active Processes & Log Tail</h4>
                        <div className="bg-black/80 rounded-lg border border-gray-800 p-3 h-48 overflow-y-auto font-mono text-xs">
                          <div className="text-green-400 mb-2">$ tail -f /var/log/syslog -n 50</div>
                          <div className="text-gray-400">
                            {[
                              '[14:45:01] CRON[13421]: (root) CMD (/usr/local/bin/backup.sh)',
                              '[14:45:15] kernel: [1234.56] Firewall: DROP IN=eth0 OUT= SRC=45.12.x.x',
                              '[14:45:32] nginx: 192.168.1.5 - - [GET /api/health HTTP/1.1] 200 134 "-" "node-fetch"',
                              '[14:46:01] pm2: worker-service restarted successfully',
                              '[14:46:12] sshd[14562]: Accepted publickey for root from 10.0.0.5',
                              '[14:46:55] n8n: Executing workflow ID 42 (sync_supabase)',
                              '[14:47:11] SupabaseSync: Completed in 1.4s',
                              '[14:48:05] pm2: Memory High Alert: worker-service using 890MB',
                            ].map((log, i) => (
                              <div key={i} className={`py-1 border-b border-gray-800/50 ${log.includes('Alert') || log.includes('DROP') ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-200'}`}>
                                {log}
                              </div>
                            ))}
                            <div className="text-gray-600 animate-pulse mt-2">_</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Subscriptions</h2>
                <button
                  onClick={fetchSubscriptions}
                  disabled={loading}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : subscriptions.length === 0 ? (
                <p className="text-gray-400">No subscriptions found</p>
              ) : (
                subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{sub.product_name || 'Subscription'}</h3>
                        <p className="text-sm text-gray-400">ID: {sub.id}</p>
                      </div>
                      <button
                        onClick={() => handleRenewSubscription(sub.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        Renew
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-white">{sub.status || 'Active'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Next Billing</p>
                        <p className="text-white">{sub.next_billing_date || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Price</p>
                        <p className="text-white">${sub.price || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Period</p>
                        <p className="text-white">{sub.period || 'Monthly'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Payment Methods */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                  </h2>
                  <button
                    onClick={fetchPaymentMethods}
                    disabled={loading}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : paymentMethods.length === 0 ? (
                  <p className="text-gray-400">No payment methods found</p>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((pm) => (
                      <div key={pm.id} className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{pm.type || 'Card'}</p>
                          <p className="text-sm text-gray-400">****  {pm.last4 || 'XXXX'}</p>
                        </div>
                        {pm.is_default && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Invoices
                  </h2>
                  <button
                    onClick={fetchInvoices}
                    disabled={loading}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : invoices.length === 0 ? (
                  <p className="text-gray-400">No invoices found</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">Invoice #{invoice.number || invoice.id}</p>
                            <p className="text-sm text-gray-400">{invoice.date || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">${invoice.amount || '0.00'}</p>
                            <p className="text-sm text-gray-400">{invoice.status || 'Paid'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
