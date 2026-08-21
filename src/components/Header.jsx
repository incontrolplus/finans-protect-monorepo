import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, Activity, Cpu, HardDrive, Wifi } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// Mini sparkline component
function Sparkline({ data, width = 60, height = 20, color = '#0ea5e9' }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Determine trend color
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const trending = latest > prev ? '#f59e0b' : latest < prev ? '#10b981' : color;

  return (
    <svg width={width} height={height} className="ml-1">
      <polyline
        points={points}
        fill="none"
        stroke={trending}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Current value dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((latest - min) / range) * height}
        r="2"
        fill={trending}
      />
    </svg>
  );
}

export default function Header({ toggleSidebar, sidebarOpen }) {
  const { connected } = useSocket();
  const [time, setTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 25,
    memory: 45,
    network: 'Connected'
  });
  const [cpuHistory, setCpuHistory] = useState([25, 28, 22, 30, 27, 24, 26, 29, 25, 23]);
  const [memHistory, setMemHistory] = useState([42, 44, 43, 45, 46, 44, 45, 47, 44, 45]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // More realistic stats: small fluctuations around a baseline
    const interval = setInterval(() => {
      setSystemStats(prev => {
        const cpuDelta = (Math.random() - 0.5) * 10;
        const memDelta = (Math.random() - 0.5) * 6;
        const newCpu = Math.max(10, Math.min(95, prev.cpu + cpuDelta));
        const newMem = Math.max(30, Math.min(90, prev.memory + memDelta));

        setCpuHistory(h => [...h.slice(-9), Math.round(newCpu)]);
        setMemHistory(h => [...h.slice(-9), Math.round(newMem)]);

        return {
          cpu: Math.round(newCpu),
          memory: Math.round(newMem),
          network: connected ? 'Connected' : 'Disconnected'
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [connected]);

  return (
    <header className="glass-effect border-b border-white/10 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <div>
              <h2 className="text-xl font-bold text-white">
                {time.toLocaleTimeString()}
              </h2>
              <p className="text-sm text-dark-400">
                {time.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right section - System stats */}
          <div className="flex items-center gap-4">
            {/* CPU */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg"
            >
              <Cpu className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-xs text-dark-400">CPU</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold">{systemStats.cpu}%</p>
                  <Sparkline data={cpuHistory} width={40} height={16} />
                </div>
              </div>
            </motion.div>

            {/* Memory */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg"
            >
              <HardDrive className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-xs text-dark-400">Memory</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold">{systemStats.memory}%</p>
                  <Sparkline data={memHistory} width={40} height={16} />
                </div>
              </div>
            </motion.div>

            {/* Connection status */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg"
            >
              <div className="relative">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full pulse-ring"></div>
                  </>
                ) : (
                  <Wifi className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-dark-400">Status</p>
                <p className={`text-sm font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {systemStats.network}
                </p>
              </div>
            </motion.div>

            {/* Activity indicator */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 glass-effect rounded-lg"
            >
              <Activity className="w-5 h-5 text-primary-400" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
