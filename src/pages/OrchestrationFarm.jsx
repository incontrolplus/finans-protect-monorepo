import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Users, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function OrchestrationFarm() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxConcurrent, setMaxConcurrent] = useState(5);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/orchestration/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const registerAgent = async (platform) => {
    try {
      const agentId = `agent-${platform}-${Date.now()}`;
      const response = await fetch('/api/orchestration/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          platform,
          capabilities: ['screenshot', 'click', 'type']
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchStatus();
      }
    } catch (error) {
      console.error('Failed to register agent:', error);
    }
  };

  const submitTask = async (type, platform) => {
    try {
      const response = await fetch('/api/orchestration/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          platform,
          priority: 5,
          data: { timestamp: Date.now() }
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchStatus();
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  const updateMaxConcurrent = async () => {
    try {
      const response = await fetch('/api/orchestration/config/max-concurrent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxConcurrent })
      });
      const data = await response.json();
      if (data.success) {
        fetchStatus();
      }
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sky-500">AI Agent Orchestration Farm</h1>
          <p className="text-gray-400 mt-1">Multi-platform parallel execution control</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Agents</p>
              <p className="text-3xl font-bold text-white mt-1">
                {status?.agents.total || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-sky-500 opacity-50" />
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-green-500">Idle: {status?.agents.idle || 0}</span>
            <span className="text-yellow-500">Busy: {status?.agents.busy || 0}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasks Completed</p>
              <p className="text-3xl font-bold text-white mt-1">
                {status?.tasks.completed || 0}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasks Running</p>
              <p className="text-3xl font-bold text-white mt-1">
                {status?.tasks.running || 0}
              </p>
            </div>
            <Activity className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasks Queued</p>
              <p className="text-3xl font-bold text-white mt-1">
                {status?.tasks.queued || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {['linux', 'android', 'web'].map((platform) => (
          <motion.div
            key={platform}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold text-white capitalize mb-4">
              {platform} Platform
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Agents:</span>
                <span className="text-white font-semibold">
                  {status?.agents.byPlatform[platform] || 0}
                </span>
              </div>
              <button
                onClick={() => registerAgent(platform)}
                className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
              >
                Register Agent
              </button>
              <button
                onClick={() => submitTask('test-task', platform)}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Submit Test Task
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Configuration */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Configuration</h3>
        <div className="flex items-center gap-4">
          <label className="text-gray-400">Max Concurrent Tasks:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={maxConcurrent}
            onChange={(e) => setMaxConcurrent(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={updateMaxConcurrent}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
          >
            Update
          </button>
        </div>
      </div>

      {/* Task Queue */}
      {status?.queue && status.queue.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Task Queue</h3>
          <div className="space-y-2">
            {status.queue.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
              >
                <div>
                  <p className="text-white font-semibold">{task.type}</p>
                  <p className="text-gray-400 text-sm">
                    Platform: {task.platform} • Priority: {task.priority}
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm">
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Running Tasks */}
      {status?.runningTasks && status.runningTasks.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Running Tasks</h3>
          <div className="space-y-2">
            {status.runningTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
              >
                <div>
                  <p className="text-white font-semibold">{task.type}</p>
                  <p className="text-gray-400 text-sm">
                    Agent: {task.agentId} • Platform: {task.platform}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm">
                    Running
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
