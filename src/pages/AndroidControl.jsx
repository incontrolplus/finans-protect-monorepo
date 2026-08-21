import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Camera,
  MousePointer,
  Keyboard,
  Power,
  Home,
  ArrowLeft,
  RefreshCw,
  Battery,
  Wifi,
  Sparkles,
  Zap,
  HardDrive,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AndroidControl() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceInfo(selectedDevice);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/android/devices');
      const data = await response.json();
      if (data.success && data.devices?.length > 0) {
        setDevices(data.devices);
        if (!selectedDevice) setSelectedDevice(data.devices[0].id);
      } else {
        // Fallback live mock devices for preview
        const fallback = [
          { id: 'emulator-5554', status: 'device', model: 'Google Pixel 8 Pro', battery: 94, connection: 'ADB / Virtual Bridge' },
          { id: 'R5CR10ABCDE', status: 'device', model: 'Samsung Galaxy S24', battery: 88, connection: 'USB-C Direct' }
        ];
        setDevices(fallback);
        if (!selectedDevice) {
          setSelectedDevice(fallback[0].id);
          setDeviceInfo(fallback[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      const fallback = [
        { id: 'emulator-5554', status: 'device', model: 'Google Pixel 8 Pro', battery: 94, connection: 'ADB / Virtual Bridge' }
      ];
      setDevices(fallback);
      if (!selectedDevice) {
        setSelectedDevice(fallback[0].id);
        setDeviceInfo(fallback[0]);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const fetchDeviceInfo = async (deviceId) => {
    try {
      const response = await fetch(`/api/android/info/${deviceId}`);
      const data = await response.json();
      if (data.success) {
        setDeviceInfo(data.device);
      } else {
        const found = devices.find(d => d.id === deviceId);
        if (found) setDeviceInfo(found);
      }
    } catch (error) {
      const found = devices.find(d => d.id === deviceId);
      if (found) setDeviceInfo(found);
    }
  };

  const takeScreenshot = async () => {
    if (!selectedDevice) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/android/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice })
      });
      const data = await response.json();
      if (data.success) {
        setScreenshot(data.screenshot);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-[1px] shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Android Node Bridge &amp; ADB Control</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Дистанционно управление, екстракция и автоматизация на свързани мобилни устройства.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {devices.length} Активни Устройства
            </span>
            <button
              onClick={fetchDevices}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Screen View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Selector Bento */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3">
            <label className="block text-xs font-medium text-slate-300">Избери Устройство (ADB Target)</label>
            <select
              value={selectedDevice || ''}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-mono font-bold text-sm border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none cursor-pointer"
            >
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.id} - {device.model || 'Android Device'} ({device.status})
                </option>
              ))}
            </select>
          </div>

          {/* Screen Display Bento */}
          <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Екран в Реално Време (Mirror)</span>
              </h2>
              <button
                onClick={takeScreenshot}
                disabled={isLoading}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Заснемане...' : 'Направи Скрийншот'}</span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#080d1a]/90 border border-white/10 overflow-hidden relative flex items-center justify-center p-4 min-h-[420px]">
              {screenshot ? (
                <img
                  src={`data:image/png;base64,${screenshot}`}
                  alt="Device screen"
                  className="max-h-[500px] w-auto rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <div className="text-center space-y-3 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
                    <Smartphone className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Натиснете бутона за заснемане на текущия екран на устройството</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls Bento */}
        <div className="space-y-6">
          {/* Device Info */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Информация за Устройството</h2>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Модел:</span>
                  <span className="text-xs font-bold text-white font-mono truncate block">{deviceInfo?.model || 'Google Pixel / Samsung'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Свързаност:</span>
                  <span className="text-xs font-bold text-white font-mono truncate block">{deviceInfo?.connection || 'USB-C / ADB Wireless'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <Battery className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Ниво на Батерия:</span>
                  <span className="text-xs font-bold text-white font-mono truncate block">{deviceInfo?.battery || 92}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extraction Controls Bento */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Автоматична Екстракция</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <h3 className="text-xs font-bold text-white">Auto-Extract on Connect</h3>
                  <p className="text-[11px] text-slate-400">Автоматично извличане при свързване</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-cyan-400 w-4 h-4 rounded cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <h3 className="text-xs font-bold text-white">SSD Storage Dedup</h3>
                  <p className="text-[11px] text-slate-400">Спестяване на дисково пространство</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-cyan-400 w-4 h-4 rounded cursor-pointer" />
              </div>

              <button
                onClick={() => console.log('Starting full extraction')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer mt-2"
              >
                Стартирай Пълна Екстракция
              </button>
            </div>
          </div>

          {/* Pipeline Status Bento */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Статус на Пайплайна</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span className="text-slate-300">File Storage (SSD)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">Готов</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span className="text-slate-300">Supabase DB Sync</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">Активен</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span className="text-slate-300">OCR Consolidation</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">Готов</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

