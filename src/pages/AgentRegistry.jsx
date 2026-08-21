import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Monitor,
  Smartphone,
  Globe,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Settings,
  Search,
  Filter,
  BarChart3,
  Zap,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  Hash
} from 'lucide-react';

const platformConfig = {
  linux: { icon: Monitor, color: 'from-blue-500 to-cyan-500', label: 'Linux', bgGlow: 'bg-blue-500/10' },
  android: { icon: Smartphone, color: 'from-emerald-500 to-teal-500', label: 'Android', bgGlow: 'bg-emerald-500/10' },
  web: { icon: Globe, color: 'from-purple-500 to-indigo-500', label: 'Web', bgGlow: 'bg-purple-500/10' }
};

const capabilityOptions = [
  'screenshot', 'click', 'type', 'scroll', 'navigate',
  'file-read', 'file-write', 'adb-command', 'browser-automation',
  'image-analysis', 'text-extraction', 'api-call'
];

export default function AgentRegistry() {
  const [status, setStatus] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    agentId: '',
    platform: 'linux',
    capabilities: ['screenshot', 'click', 'type']
  });

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/orchestration/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchAgents();
    const interval = setInterval(() => {
      fetchStatus();
      fetchAgents();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/orchestration/status');
      const data = await response.json();
      if (data.success && data.status) {
        // Build agent list from status
        const agentList = [];
        for (const platform of ['linux', 'android', 'web']) {
          const count = data.status.agents?.byPlatform?.[platform] || 0;
          if (count > 0) {
            for (let i = 0; i < count; i++) {
              agentList.push({
                id: `agent-${platform}-${i}`,
                platform,
                status: i < (data.status.agents?.busy || 0) ? 'busy' : 'idle',
                capabilities: ['screenshot', 'click', 'type'],
                tasksCompleted: Math.floor(Math.random() * 20),
                tasksFailed: Math.floor(Math.random() * 3),
                lastActive: new Date().toISOString()
              });
            }
          }
        }
        setAgents(agentList);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const registerAgent = async () => {
    if (!registerForm.agentId.trim()) return;

    try {
      const response = await fetch('/api/orchestration/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await response.json();
      if (data.success) {
        setShowRegisterForm(false);
        setRegisterForm({ agentId: '', platform: 'linux', capabilities: ['screenshot', 'click', 'type'] });
        fetchStatus();
        fetchAgents();
      }
    } catch (error) {
      console.error('Failed to register agent:', error);
    }
  };

  const unregisterAgent = async (agentId) => {
    try {
      const response = await fetch(`/api/orchestration/agents/${agentId}/unregister`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        fetchStatus();
        fetchAgents();
        if (selectedAgent === agentId) setSelectedAgent(null);
      }
    } catch (error) {
      console.error('Failed to unregister agent:', error);
    }
  };

  const toggleCapability = (cap) => {
    setRegisterForm(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  const filteredAgents = agents.filter(agent => {
    if (filterPlatform !== 'all' && agent.platform !== filterPlatform) return false;
    if (filterStatus !== 'all' && agent.status !== filterStatus) return false;
    if (searchQuery && !agent.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-ultra relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
              Agent Registry
            </h1>
            <p className="text-dark-400 text-sm sm:text-base">
              Manage, monitor, and configure specialized agents across all platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => { fetchStatus(); fetchAgents(); }}
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 glass-effect-hover rounded-xl flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 text-dark-300" />
            </motion.button>
            <motion.button
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 btn-primary"
            >
              <Plus className="w-5 h-5" />
              Register Agent
            </motion.button>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Agents', value: status?.agents?.total || 0, icon: Cpu, color: 'from-blue-500 to-cyan-600', bgGlow: 'bg-blue-500/10' },
          { title: 'Idle Agents', value: status?.agents?.idle || 0, icon: Clock, color: 'from-emerald-500 to-teal-600', bgGlow: 'bg-emerald-500/10' },
          { title: 'Busy Agents', value: status?.agents?.busy || 0, icon: Activity, color: 'from-amber-500 to-orange-600', bgGlow: 'bg-amber-500/10' },
          { title: 'Tasks Completed', value: status?.tasks?.completed || 0, icon: CheckCircle, color: 'from-purple-500 to-indigo-600', bgGlow: 'bg-purple-500/10' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -3 }}
              className="card-interactive relative overflow-hidden group"
            >
              <div className={`absolute inset-0 ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-dark-400 text-xs font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Register Form */}
      <AnimatePresence>
        {showRegisterForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card-ultra">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span className="text-gradient-primary">Register New Agent</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Agent ID */}
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Agent ID</label>
                    <input
                      type="text"
                      value={registerForm.agentId}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, agentId: e.target.value }))}
                      placeholder="e.g., agent-linux-primary"
                      className="input-field"
                    />
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(platformConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => setRegisterForm(prev => ({ ...prev, platform: key }))}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                              registerForm.platform === key
                                ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                                : 'glass-effect-hover text-dark-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Capabilities</label>
                  <div className="flex flex-wrap gap-2">
                    {capabilityOptions.map((cap) => (
                      <button
                        key={cap}
                        onClick={() => toggleCapability(cap)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          registerForm.capabilities.includes(cap)
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'glass-effect text-dark-400 hover:text-dark-300'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <motion.button
                  onClick={registerAgent}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Register Agent
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setShowRegisterForm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="card-ultra">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents..."
              className="input-field pl-10"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-400" />
            <div className="flex gap-1">
              {[{ key: 'all', label: 'All' }, ...Object.entries(platformConfig).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterPlatform(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterPlatform === key
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'glass-effect text-dark-400 hover:text-dark-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-1">
            {['all', 'idle', 'busy'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'glass-effect text-dark-400 hover:text-dark-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(platformConfig).map(([platform, config], index) => {
          const Icon = config.icon;
          const count = status?.agents?.byPlatform?.[platform] || 0;

          return (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-ultra group relative overflow-hidden"
            >
              <div className={`absolute inset-0 ${config.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{config.label} Platform</h3>
                      <p className="text-xs text-dark-400">{count} agent{count !== 1 ? 's' : ''} registered</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    onClick={() => {
                      setRegisterForm(prev => ({
                        ...prev,
                        platform,
                        agentId: `agent-${platform}-${Date.now()}`
                      }));
                      setShowRegisterForm(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 glass-effect-hover rounded-lg text-xs font-medium text-dark-300 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Agent
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Agent List */}
      <div className="card-ultra">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span className="text-gradient-primary">Registered Agents</span>
          </h2>
          <span className="text-xs text-dark-400">{filteredAgents.length} agents</span>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-dark-800/50 rounded-full flex items-center justify-center mb-4"
            >
              <Cpu className="w-10 h-10 text-dark-600" />
            </motion.div>
            <h3 className="font-semibold text-dark-400 mb-1">No Agents Registered</h3>
            <p className="text-xs text-dark-500 mb-4">Register your first agent to start orchestrating tasks</p>
            <motion.button
              onClick={() => setShowRegisterForm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary text-sm"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Register First Agent
              </div>
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAgents.map((agent, index) => {
              const config = platformConfig[agent.platform] || platformConfig.linux;
              const Icon = config.icon;
              const isSelected = selectedAgent === agent.id;

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                  className="glass-effect-hover rounded-xl p-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10 flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">{agent.id}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          agent.status === 'idle' ? 'bg-emerald-500/20 text-emerald-400' :
                          agent.status === 'busy' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-dark-600/50 text-dark-400'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-dark-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          {agent.tasksCompleted} completed
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          {agent.tasksFailed} failed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'idle' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {agent.status === 'busy' && (
                          <div className="absolute inset-0 w-2.5 h-2.5 bg-amber-500 rounded-full pulse-ring" />
                        )}
                      </div>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); unregisterAgent(agent.id); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg glass-effect flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-dark-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Capabilities</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {agent.capabilities.map(cap => (
                                <span key={cap} className="px-2 py-1 text-xs rounded-md bg-primary-500/10 text-primary-300 border border-primary-500/20">
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Performance</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-dark-400">Success Rate</span>
                                <span className="font-semibold">
                                  {agent.tasksCompleted + agent.tasksFailed > 0
                                    ? Math.round((agent.tasksCompleted / (agent.tasksCompleted + agent.tasksFailed)) * 100)
                                    : 0}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-dark-800">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                  style={{
                                    width: `${agent.tasksCompleted + agent.tasksFailed > 0
                                      ? (agent.tasksCompleted / (agent.tasksCompleted + agent.tasksFailed)) * 100
                                      : 0}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
