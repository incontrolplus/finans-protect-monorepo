import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Key,
  Monitor,
  Smartphone,
  Wifi,
  Save,
  CheckCircle,
  AlertCircle,
  Palette,
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import ThemeSettings from '../components/ThemeSettings';

export default function Settings() {
  const [settings, setSettings] = useState({
    apiKey: '',
    computerUseEnabled: true,
    androidEnabled: false,
    screenshotInterval: 2000,
    adbHost: 'localhost',
    adbPort: 5037
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Системни Настройки & Интеграции</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Управление на API ключове, параметри на отдалечените агенти и работната среда.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Запази Настройките</span>
            </button>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Настройките бяха запазени успешно!</span>
        </div>
      )}

      {/* Grid Configuration Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anthropic API Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Anthropic AI Конфигурация</span>
          </h2>
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">API Secret Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-3.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500 font-mono mt-2">
              Управлявайте ключа си в{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        </div>

        {/* Computer Use Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>Computer Use (OS Automation)</span>
          </h2>
          <ToggleSetting
            label="Активирай Computer Use"
            description="Позволи на Claude да управлява отдалечения работен плот"
            checked={settings.computerUseEnabled}
            onChange={(checked) => handleChange('computerUseEnabled', checked)}
          />
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Интервал на Скрийншоти (ms)
            </label>
            <input
              type="number"
              value={settings.screenshotInterval}
              onChange={(e) => handleChange('screenshotInterval', parseInt(e.target.value))}
              min="500"
              max="5000"
              step="100"
              className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none font-mono"
            />
          </div>
        </div>

        {/* Android Control Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android ADB Управление</span>
          </h2>
          <ToggleSetting
            label="Активирай Android Модул"
            description="Директен контрол на мобилни устройства през ADB"
            checked={settings.androidEnabled}
            onChange={(checked) => handleChange('androidEnabled', checked)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">ADB Host</label>
              <input
                type="text"
                value={settings.adbHost}
                onChange={(e) => handleChange('adbHost', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs border border-white/10 focus:border-cyan-400 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">ADB Port</label>
              <input
                type="number"
                value={settings.adbPort}
                onChange={(e) => handleChange('adbPort', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs border border-white/10 focus:border-cyan-400 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* System Info Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Wifi className="w-4 h-4 text-purple-400" />
            <span>Системна Телеметрия</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Версия" value="v2.4.0 (Enterprise)" />
            <InfoItem label="Среда" value="Cloudflare Pages Edge" />
            <InfoItem label="Платформа" value={typeof navigator !== 'undefined' ? navigator.platform : 'Node Mesh'} />
            <InfoItem label="Cluster SSOT" value="10-Node Mesh Sync" />
          </div>
        </div>
      </div>

      {/* Theme Customization Bento */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Тема & Визуални Настройки</span>
        </h2>
        <ThemeSettings />
      </div>

      {/* Security Alert Bento */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Бележка за Сигурност</h3>
          <p className="text-xs text-slate-300 mt-1">
            Функциите Computer Use и Android Control дават пълен достъп до локалната операционна система. Използвайте ги единствено в сигурни мрежи и никога не споделяйте API ключовете си.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
      <div>
        <h3 className="font-bold text-xs text-white">{label}</h3>
        <p className="text-[11px] text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
      <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">{label}</p>
      <p className="font-bold font-mono text-xs text-white truncate">{value}</p>
    </div>
  );
}

