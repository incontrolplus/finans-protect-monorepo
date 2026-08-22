import React, { useState, useEffect } from 'react';
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
  const socketCtx = useSocket();
  const connected = socketCtx ? socketCtx.connected : true;

  const [time, setTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 33,
    memory: 45,
    network: 'Connected'
  });
  const [cpuHistory, setCpuHistory] = useState([33, 28, 35, 30, 32, 34, 29, 31, 33, 33]);
  const [memHistory, setMemHistory] = useState([42, 44, 43, 45, 46, 44, 45, 47, 44, 45]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => {
        const cpuDelta = (Math.random() - 0.5) * 6;
        const memDelta = (Math.random() - 0.5) * 4;
        const newCpu = Math.max(15, Math.min(85, prev.cpu + cpuDelta));
        const newMem = Math.max(35, Math.min(80, prev.memory + memDelta));

        setCpuHistory(h => [...h.slice(-9), Math.round(newCpu)]);
        setMemHistory(h => [...h.slice(-9), Math.round(newMem)]);

        return {
          cpu: Math.round(newCpu),
          memory: Math.round(newMem),
          network: 'Connected'
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left section: Toggle & Current Clock */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-300 hover:text-white"
              aria-label="Превключи страничното меню"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
                {time.toLocaleTimeString()}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {time.toLocaleDateString('bg-BG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right section - System telemetry */}
          <div className="flex items-center gap-3">
            {/* CPU Metric */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">CPU</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold font-mono text-white">{systemStats.cpu}%</span>
                  <Sparkline data={cpuHistory} width={36} height={14} color="#06b6d4" />
                </div>
              </div>
            </div>

            {/* Memory Metric */}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Memory</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold font-mono text-white">{systemStats.memory}%</span>
                  <Sparkline data={memHistory} width={36} height={14} color="#06b6d4" />
                </div>
              </div>
            </div>

            {/* Operator Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-cyan-500/20 shrink-0">
                MP
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-[11px] font-bold text-white block leading-tight">Miroslav P.</span>
                <span className="text-[9px] font-mono text-cyan-400 block leading-tight font-semibold">SUPER_ADMIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
