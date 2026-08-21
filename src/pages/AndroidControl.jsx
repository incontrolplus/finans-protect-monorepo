import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Wifi
} from 'lucide-react';

export default function AndroidControl() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceInfo(selectedDevice);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/android/devices');
      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
        if (data.devices.length > 0 && !selectedDevice) {
          setSelectedDevice(data.devices[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchDeviceInfo = async (deviceId) => {
    try {
      const response = await fetch(`/api/android/info/${deviceId}`);
      const data = await response.json();
      if (data.success) {
        setDeviceInfo(data.device);
      }
    } catch (error) {
      console.error('Failed to fetch device info:', error);
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
      } else {
        alert('Failed to take screenshot: ' + data.error);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const performAction = async (action, params = {}) => {
    if (!selectedDevice) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/android/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice, ...params })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Action performed:', action);
      } else {
        alert('Action failed: ' + data.error);
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Android Control</h1>
              <p className="text-dark-400 text-sm">
                {devices.length} device{devices.length !== 1 ? 's' : ''} connected
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchDevices}
            className="p-3 glass-effect rounded-lg hover:bg-white/10"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {devices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <Smartphone className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Devices Connected</h3>
          <p className="text-dark-400 mb-6">
            Connect an Android device via ADB to get started
          </p>
          <div className="glass-effect p-4 rounded-lg max-w-md mx-auto text-left">
            <p className="text-sm mb-2 font-semibold">Quick Setup:</p>
            <ol className="text-sm text-dark-400 space-y-1 list-decimal list-inside">
              <li>Enable Developer Options on your device</li>
              <li>Enable USB Debugging</li>
              <li>Connect via USB or WiFi (adb connect)</li>
              <li>Click refresh above to detect devices</li>
            </ol>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Screen */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <label className="block text-sm text-dark-400 mb-2">Select Device</label>
              <select
                value={selectedDevice || ''}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="input-field"
              >
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.id} - {device.status}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Screen View */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary-400" />
                  Device Screen
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={takeScreenshot}
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  Take Screenshot
                </motion.button>
              </div>

              <div className="bg-dark-800 rounded-lg overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
                {screenshot ? (
                  <img
                    src={`data:image/png;base64,${screenshot}`}
                    alt="Device screen"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Smartphone className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                      <p className="text-dark-500">Take a screenshot to view device</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Device Info */}
            {deviceInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card"
              >
                <h2 className="text-xl font-bold mb-4">Device Info</h2>
                <div className="space-y-3">
                  <InfoCard
                    icon={Smartphone}
                    label="Model"
                    value={deviceInfo.model || 'Unknown Android'}
                  />
                  <InfoCard
                    icon={Wifi}
                    label="Connection"
                    value={deviceInfo.android || 'USB-C / ADB'}
                  />
                  <InfoCard
                    icon={Battery}
                    label="Battery"
                    value={`${deviceInfo.battery || 85}%`}
                  />
                </div>
              </motion.div>
            )}

            {/* Extraction Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-xl font-bold mb-4">Extraction System</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                  <div>
                    <h3 className="text-sm font-semibold">Auto-Extract</h3>
                    <p className="text-xs text-dark-400">Extract on connect</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                  <div>
                    <h3 className="text-sm font-semibold">Dedup (dedupr)</h3>
                    <p className="text-xs text-dark-400">Save SSD space</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="pt-2">
                  <ActionButton
                    icon={RefreshCw}
                    label="Force Extraction (All)"
                    onClick={() => console.log('Starting full extraction')}
                    disabled={isLoading}
                    className="bg-primary-600 hover:bg-primary-500 text-white border-0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Pipeline Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-xl font-bold mb-4">Pipeline Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">File Copy (SSD)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Ready</span>
                </div>
                <div className="flex items-center justify-between border-t border-dark-700/50 pt-2">
                  <span className="text-sm text-dark-300">Supabase DB Sync</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Pending</span>
                </div>
                <div className="flex items-center justify-between border-t border-dark-700/50 pt-2">
                  <span className="text-sm text-dark-300">Contact Consolidation</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">Idle</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-effect p-3 rounded-lg flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary-400" />
      <div>
        <p className="text-xs text-dark-400">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ControlButton({ icon: Icon, label, onClick, disabled, span = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`glass-effect p-4 rounded-lg hover:bg-white/10 transition-all flex flex-col items-center gap-2 disabled:opacity-50 ${span}`}
    >
      <Icon className="w-6 h-6 text-primary-400" />
      <span className="text-xs">{label}</span>
    </motion.button>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full glass-effect p-3 rounded-lg hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-50"
    >
      <Icon className="w-5 h-5 text-primary-400" />
      <span>{label}</span>
    </motion.button>
  );
}
