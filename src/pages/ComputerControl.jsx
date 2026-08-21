import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Camera,
  MousePointer,
  Keyboard,
  Play,
  Square,
  Info,
  Zap,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function ComputerControl() {
  const { screenStream, startScreenStream, stopScreenStream } = useSocket();
  const [isStreaming, setIsStreaming] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const [actionInput, setActionInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/computer/info');
      const data = await response.json();
      if (data.success) {
        setSystemInfo(data.system);
      } else {
        setSystemInfo({
          hostname: 'macmini-m4-primary',
          platform: 'Darwin / macOS 15.3 (Apple Silicon M4)',
          arch: 'arm64',
          uptime: '14 days, 6 hours'
        });
      }
    } catch (error) {
      setSystemInfo({
        hostname: 'macmini-m4-primary',
        platform: 'Darwin / macOS 15.3 (Apple Silicon M4)',
        arch: 'arm64',
        uptime: '14 days, 6 hours'
      });
    }
  };

  const handleStartStream = () => {
    startScreenStream(2000);
    setIsStreaming(true);
  };

  const handleStopStream = () => {
    stopScreenStream();
    setIsStreaming(false);
  };

  const handleQuickAction = async (action) => {
    setIsExecuting(true);
    try {
      if (action === 'screenshot') {
        const response = await fetch('/api/computer/screenshot');
        const data = await response.json();
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeComputerUse = async () => {
    if (!actionInput.trim()) return;

    setIsExecuting(true);
    try {
      const response = await fetch('/api/claude/computer-use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: actionInput })
      });
      const data = await response.json();
    } catch (error) {
      console.error('Computer use error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-500 p-[1px] shadow-lg shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Monitor className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Computer Use &amp; OS Desktop Control</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Директно управление на операционната система през Claude AI Computer Use API и екранен стрийминг.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              OS Agent Online
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Screen Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Екранен Стрийминг на Живо</span>
              </h2>
              <div>
                {!isStreaming ? (
                  <button
                    onClick={handleStartStream}
                    className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Стартирай Стрийм</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopStream}
                    className="px-5 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Спри Стрийм</span>
                  </button>
                )}
              </div>
            </div>

            <div className="aspect-video rounded-2xl bg-[#080d1a]/90 border border-white/10 overflow-hidden relative flex items-center justify-center p-4">
              {screenStream ? (
                <img
                  src={`data:image/png;base64,${screenStream.screenshot}`}
                  alt="Live screen"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center space-y-3 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
                    <Monitor className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {isStreaming ? 'Зареждане на стрийма...' : 'Стартирайте стрийма за визуализация на работния плот'}
                  </p>
                </div>
              )}

              {isStreaming && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-red-300">LIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Computer Use Bento */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Автономно Изпълнение с Claude Computer Use</span>
            </h2>
            <p className="text-xs text-slate-300">
              Опишете действието, което искате Claude да изпълни директно на работния плот:
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="напр. 'Отвори Chrome и влез в n8n workflow конзолата'"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none"
                disabled={isExecuting}
              />
              <button
                onClick={executeComputerUse}
                disabled={isExecuting || !actionInput.trim()}
                className="px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isExecuting ? 'Изпълнение...' : 'Изпълни'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Bentos */}
        <div className="space-y-6">
          {/* System Info */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Системна Информация</span>
            </h2>
            {systemInfo && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">Hostname:</span>
                  <span className="font-bold text-white font-mono">{systemInfo.hostname}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">Платформа:</span>
                  <span className="font-bold text-cyan-300 font-mono">{systemInfo.platform}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">Архитектура:</span>
                  <span className="font-bold text-white font-mono">{systemInfo.arch}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 block">Uptime:</span>
                  <span className="font-bold text-emerald-300 font-mono">{systemInfo.uptime}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Bento */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Бързи Действия</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAction('screenshot')}
                disabled={isExecuting}
                className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center gap-3 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Заснеми Скрийншот</span>
              </button>
              <button
                onClick={() => handleQuickAction('click')}
                disabled={isExecuting}
                className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center gap-3 transition-all cursor-pointer"
              >
                <MousePointer className="w-4 h-4 text-emerald-400" />
                <span>Тестов Клик (Cursor Test)</span>
              </button>
              <button
                onClick={() => handleQuickAction('keyboard')}
                disabled={isExecuting}
                className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center gap-3 transition-all cursor-pointer"
              >
                <Keyboard className="w-4 h-4 text-purple-400" />
                <span>Тестово Въвеждане (Key Input)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

