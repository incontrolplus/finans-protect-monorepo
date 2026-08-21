import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Camera,
  MousePointer,
  Keyboard,
  Play,
  Square,
  Info,
  Zap
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
      }
    } catch (error) {
      console.error('Failed to fetch system info:', error);
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
      let response;
      switch (action) {
        case 'screenshot':
          response = await fetch('/api/computer/screenshot');
          const data = await response.json();
          if (data.success) {
            alert('Screenshot taken successfully!');
          }
          break;
        case 'click':
          response = await fetch('/api/computer/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: 100, y: 100 })
          });
          break;
        default:
          break;
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
      // First take screenshot
      const screenshotRes = await fetch('/api/computer/screenshot');
      const screenshotData = await screenshotRes.json();

      // Send to Claude Computer Use
      const response = await fetch('/api/claude/computer-use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: actionInput,
          screenshot: screenshotData.screenshot
        })
      });

      const data = await response.json();
      if (data.success && data.action) {
        alert(`Claude suggests: ${data.action.explanation}`);
        // Execute the action
        if (data.action.action === 'click') {
          await fetch('/api/computer/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              x: data.action.x,
              y: data.action.y
            })
          });
        }
      }
    } catch (error) {
      console.error('Computer use error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsExecuting(false);
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Computer Use - Linux Control</h1>
              <p className="text-dark-400 text-sm">Control your desktop with Claude AI</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Screen */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-400" />
                Live Screen View
              </h2>
              <div className="flex gap-2">
                {!isStreaming ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartStream}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Stream
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStopStream}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop Stream
                  </motion.button>
                )}
              </div>
            </div>

            <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden relative">
              {screenStream ? (
                <img
                  src={`data:image/png;base64,${screenStream.screenshot}`}
                  alt="Live screen"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <p className="text-dark-500">
                      {isStreaming ? 'Loading stream...' : 'Start streaming to view desktop'}
                    </p>
                  </div>
                </div>
              )}

              {isStreaming && (
                <div className="absolute top-4 right-4 flex items-center gap-2 glass-effect px-3 py-2 rounded-lg">
                  <div className="relative">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full pulse-ring"></div>
                  </div>
                  <span className="text-sm">LIVE</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Control */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-400" />
              AI-Powered Control
            </h2>
            <p className="text-dark-400 text-sm mb-4">
              Describe what you want Claude to do with your computer
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="e.g., Click on the Chrome icon"
                className="input-field flex-1"
                disabled={isExecuting}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={executeComputerUse}
                disabled={isExecuting || !actionInput.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {isExecuting ? 'Executing...' : 'Execute'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary-400" />
              System Info
            </h2>
            {systemInfo ? (
              <div className="space-y-3">
                <InfoItem label="Hostname" value={systemInfo.hostname} />
                <InfoItem label="Platform" value={systemInfo.platform} />
                <InfoItem label="Architecture" value={systemInfo.arch} />
                <InfoItem label="Uptime" value={systemInfo.uptime} />
              </div>
            ) : (
              <p className="text-dark-500">Loading...</p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <ActionButton
                icon={Camera}
                label="Take Screenshot"
                onClick={() => handleQuickAction('screenshot')}
                disabled={isExecuting}
              />
              <ActionButton
                icon={MousePointer}
                label="Test Click"
                onClick={() => handleQuickAction('click')}
                disabled={isExecuting}
              />
              <ActionButton
                icon={Keyboard}
                label="Test Keyboard"
                onClick={() => handleQuickAction('keyboard')}
                disabled={isExecuting}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="glass-effect p-3 rounded-lg">
      <p className="text-xs text-dark-400 mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
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
