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
  Palette
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
    // Save settings (in a real app, this would send to backend)
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-dark-400 text-sm">Configure your Wallestars Control Center</p>
          </div>
        </div>
      </motion.div>

      {/* API Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary-400" />
          Anthropic API
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-400 mb-2">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="sk-ant-..."
              className="input-field"
            />
            <p className="text-xs text-dark-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Computer Use Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary-400" />
          Computer Use (Linux)
        </h2>
        <div className="space-y-4">
          <ToggleSetting
            label="Enable Computer Use"
            description="Allow Claude to control your desktop"
            checked={settings.computerUseEnabled}
            onChange={(checked) => handleChange('computerUseEnabled', checked)}
          />
          <div>
            <label className="block text-sm text-dark-400 mb-2">
              Screenshot Interval (ms)
            </label>
            <input
              type="number"
              value={settings.screenshotInterval}
              onChange={(e) => handleChange('screenshotInterval', parseInt(e.target.value))}
              min="500"
              max="5000"
              step="100"
              className="input-field"
            />
            <p className="text-xs text-dark-500 mt-2">
              How often to capture screen for streaming (500-5000ms)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Theme Customization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-400" />
          Theme Customization
        </h2>
        <ThemeSettings />
      </motion.div>

      {/* Android Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary-400" />
          Android Control
        </h2>
        <div className="space-y-4">
          <ToggleSetting
            label="Enable Android Control"
            description="Control Android devices via ADB"
            checked={settings.androidEnabled}
            onChange={(checked) => handleChange('androidEnabled', checked)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-400 mb-2">ADB Host</label>
              <input
                type="text"
                value={settings.adbHost}
                onChange={(e) => handleChange('adbHost', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-2">ADB Port</label>
              <input
                type="number"
                value={settings.adbPort}
                onChange={(e) => handleChange('adbPort', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary-400" />
          System Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Version" value="1.0.0" />
          <InfoItem label="Runtime" value="Vite + React" />
          <InfoItem label="Platform" value={navigator.platform} />
          <InfoItem label="User Agent" value={navigator.userAgent.split(' ')[0]} />
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </motion.button>

        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-green-400"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Settings saved successfully!</span>
          </motion.div>
        )}
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-effect p-4 rounded-lg border border-amber-500/30"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-400 mb-1">Security Notice</h3>
            <p className="text-sm text-dark-300">
              Computer Use and Android Control features grant powerful system access. Only use these
              features in trusted environments. Never share your API keys or run untrusted commands.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="glass-effect p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">{label}</h3>
          <p className="text-sm text-dark-400">{description}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(!checked)}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            checked ? 'bg-primary-500' : 'bg-dark-700'
          }`}
        >
          <motion.div
            animate={{ x: checked ? 28 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-5 h-5 bg-white rounded-full"
          />
        </motion.button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="glass-effect p-3 rounded-lg">
      <p className="text-xs text-dark-400 mb-1">{label}</p>
      <p className="font-semibold text-sm truncate">{value}</p>
    </div>
  );
}
