import React from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Database,
  ArrowUpRight,
  Disc,
  Clock,
  Thermometer,
  Sparkles
} from 'lucide-react';
import { useClusterHardwareTelemetry, ClusterNodeTelemetry } from '../hooks/useClusterHardwareTelemetry';

export const ClusterHardwareRadarBento: React.FC = () => {
  const { data, loading, isLive, refresh } = useClusterHardwareTelemetry();

  const formatGb = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '0.0';
    return Number(val).toFixed(1);
  };

  // Color dynamics helper functions
  const getRamBarColor = (pct: number) => {
    if (pct >= 90) return 'from-rose-500 to-red-600';
    if (pct >= 75) return 'from-amber-500 to-orange-500';
    return 'from-cyan-500 to-blue-500';
  };

  const getRamTextColor = (pct: number) => {
    if (pct >= 90) return 'text-rose-400';
    if (pct >= 75) return 'text-amber-400';
    return 'text-cyan-400';
  };

  const getStorageBarColor = (usedPct: number) => {
    if (usedPct >= 90) return 'from-rose-500 to-red-500';
    if (usedPct >= 75) return 'from-amber-500 to-orange-400';
    return 'from-emerald-500 to-teal-500';
  };

  const getStorageTextColor = (usedPct: number) => {
    if (usedPct >= 90) return 'text-rose-400';
    if (usedPct >= 75) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getFreeStorageTextColor = (freeGb: number) => {
    if (freeGb < 15) return 'text-rose-400';
    if (freeGb < 35) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getCpuLoadTextColor = (loadPct: number) => {
    if (loadPct >= 85) return 'text-rose-400';
    if (loadPct >= 60) return 'text-amber-400';
    if (loadPct >= 35) return 'text-cyan-400';
    return 'text-emerald-400';
  };

  const getTempTextColor = (tempC: number) => {
    if (tempC >= 65) return 'text-rose-400';
    if (tempC >= 48) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getTempBadge = (tempC: number) => {
    if (tempC >= 65) {
      return {
        bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        label: 'Повишена',
        iconColor: 'text-rose-400',
        textColor: 'text-rose-400'
      };
    }
    if (tempC >= 48) {
      return {
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        label: 'Активна',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-400'
      };
    }
    return {
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'Оптимална (Nominal)',
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-400'
    };
  };

  const avgRamPct = data.summary?.avg_ram_pct || 61.5;
  const avgTempC = data.summary?.avg_cpu_temp_c || 38.8;
  const freeStorageGb = data.summary?.free_storage_gb || 421.6;

  return (
    <div className="bg-[#0b101d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Ambient Glow Spheres */}
      <div className="absolute -top-10 left-1/3 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 blur-3xl pointer-events-none -z-10" />

      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Real-Time Hardware &amp; Thermal Fleet Radar
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SLA {data.sla_target} Uptime
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Клъстерна Телеметрия &amp; Сторидж Радар
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Автономен мониторинг в реално време на RAM оперативна памет, Root SSD дялове, температура на процесора (CPU Temp) и 2TB Philips NVMe Vault.
          </p>
        </div>

        {/* Fleet Aggregate Metrics Triad */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#070b14] border border-white/10 p-2.5 sm:p-3.5 rounded-2xl shrink-0 flex-wrap sm:flex-nowrap">
          <div className="text-center px-3 py-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">ОБЩА RAM</span>
            <span className={`text-sm sm:text-base font-bold font-mono ${getRamTextColor(avgRamPct)}`}>
              {formatGb(data.summary?.used_ram_gb)} / {data.summary?.total_ram_gb || 48} GB
            </span>
            <span className={`text-[10px] font-mono block font-semibold ${getRamTextColor(avgRamPct)}`}>
              ({avgRamPct}%)
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />
          <div className="text-center px-3 py-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">СВОБОДЕН ДИСК</span>
            <span className={`text-sm sm:text-base font-bold font-mono ${getFreeStorageTextColor(freeStorageGb)}`}>
              {formatGb(freeStorageGb)} GB
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              от 2.38 TB
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />
          <div className="text-center px-3 py-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">CPU ТЕМПЕРАТУРА</span>
            <span className={`text-sm sm:text-base font-bold font-mono flex items-center justify-center gap-1 ${getTempTextColor(avgTempC)}`}>
              <Thermometer className={`w-3.5 h-3.5 ${getTempTextColor(avgTempC)}`} />
              {avgTempC}°C
            </span>
            <span className={`text-[10px] font-mono block font-semibold ${getTempTextColor(avgTempC)}`}>
              {avgTempC < 48 ? 'Хладен клъстер' : (avgTempC < 65 ? 'Активен клъстер' : 'Повишена')}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />
          <div className="text-center px-2">
            <span className="text-[9px] text-slate-500 uppercase font-mono block">СИНХРОНИЗАЦИЯ</span>
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="mt-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Обнови телеметрията"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="text-[10px]">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Node Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data.nodes.map((node: ClusterNodeTelemetry, idx: number) => {
          const isSecondary = node.id === 'macmini-secondary';
          const tempBadge = getTempBadge(node.cpu_temp_c || 38.5);
          const cpuTextColor = getCpuLoadTextColor(node.cpu_pct);
          const ramTextColor = getRamTextColor(node.ram.used_pct);
          const storageTextColor = getStorageTextColor(node.storage.root_used_pct);
          const freeStorageTextColor = getFreeStorageTextColor(node.storage.root_free_gb);

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-[#0e1526] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6 transition-all"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <div className="space-y-5">
                {/* Node Header: Icon + Name + Status + Heartbeat Ago */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Server className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {node.display_name}
                      </h3>
                      <span className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {node.ip} • {node.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {node.status}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" />
                      {node.seconds_ago !== undefined ? `${node.seconds_ago}s ago` : 'Live'}
                    </span>
                  </div>
                </div>

                {/* 1. CPU & Temperature Section with Dynamic Colors */}
                <div className="bg-[#080d1a] border border-white/5 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      Процесор (Apple M4 SoC)
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className={`font-bold text-xs ${cpuTextColor}`}>{node.cpu_pct}% Load</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${tempBadge.bg}`}>
                        <Thermometer className={`w-3 h-3 ${tempBadge.iconColor}`} />
                        <span className={tempBadge.textColor}>{node.cpu_temp_c}°C</span>
                      </span>
                    </div>
                  </div>

                  {/* CPU Load Progress Bar */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, node.cpu_pct * 2)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${node.cpu_pct >= 85 ? 'bg-gradient-to-r from-rose-500 to-red-600' : (node.cpu_pct >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500')}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      Температура: <strong className={tempBadge.textColor}>{node.cpu_temp_c}°C</strong>
                    </span>
                    <span className={`font-semibold ${tempBadge.textColor}`}>{tempBadge.label}</span>
                  </div>
                </div>

                {/* 2. RAM Utilization Section with Dynamic Colors */}
                <div className="bg-[#080d1a] border border-white/5 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      RAM Памет (Unified Memory)
                    </span>
                    <span className={`font-mono font-bold ${ramTextColor}`}>
                      {node.ram.used_pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${node.ram.used_pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${getRamBarColor(node.ram.used_pct)}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      Заета: <strong className={ramTextColor}>{formatGb(node.ram.used_gb)} GB</strong>
                    </span>
                    <span>
                      Свободна: <strong className="text-cyan-300">{formatGb(node.ram.free_gb)} GB</strong> / {node.ram.total_gb} GB
                    </span>
                  </div>
                </div>

                {/* 3. Root Internal Storage Section with Dynamic Colors */}
                <div className="bg-[#080d1a] border border-white/5 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      Вътрешен SSD Диск (Root /)
                    </span>
                    <span className={`font-mono font-bold ${storageTextColor}`}>
                      {node.storage.root_used_pct}% зает
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${node.storage.root_used_pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${getStorageBarColor(node.storage.root_used_pct)}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      Свободни: <strong className={`font-semibold ${freeStorageTextColor}`}>{formatGb(node.storage.root_free_gb)} GB</strong>
                    </span>
                    <span>
                      Общо: <strong className="text-slate-300">{formatGb(node.storage.root_total_gb)} GB</strong>
                    </span>
                  </div>
                </div>

                {/* 4. External Storage (PHILIPS_SSD) - Only for macmini-secondary */}
                {isSecondary && node.storage.external_ssd && (
                  <div className="bg-gradient-to-br from-indigo-950/40 to-[#080d1a] border border-indigo-500/20 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Disc className="w-3.5 h-3.5 text-indigo-400" />
                        {node.storage.external_ssd.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {node.storage.external_ssd.mount_point}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${node.storage.external_ssd.used_pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>
                        Свободни: <strong className="text-indigo-300 font-semibold">{formatGb(node.storage.external_ssd.free_gb)} GB</strong>
                      </span>
                      <span>
                        Общо: <strong className="text-slate-300">{formatGb(node.storage.external_ssd.total_gb)} GB</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Node Footer: WireGuard Mesh Tag */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  WireGuard Mesh: <strong className="text-emerald-400">{node.tailscale.peer_count} Peers</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {node.tailscale.mode}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Всички хардуерни показатели (RAM, Root SSD, Температура и WireGuard) се опресняват автономно от клъстерния демон <code className="text-cyan-400 font-mono text-[11px]">device_heartbeat_daemon.py</code>.
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500 shrink-0">
          Sync: {new Date(data.timestamp).toLocaleTimeString('bg-BG')}
        </div>
      </div>
    </div>
  );
};

export default ClusterHardwareRadarBento;
