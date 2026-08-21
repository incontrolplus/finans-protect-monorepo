import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Monitor,
  Smartphone,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Globe,
  ArrowUpRight,
  Sparkles,
  Users,
  Mail,
  Video,
  FileText,
  Calendar,
  Cloud,
  Shield,
  ExternalLink,
  Brain,
  Network,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import PlatformLinks from '../components/PlatformLinks';
import SystemCharts from '../components/charts/SystemCharts';

export default function Dashboard() {
  const { connected, actionLogs } = useSocket();
  const [backendOffline, setBackendOffline] = useState(false);
  const [stats, setStats] = useState({
    totalActions: 0,
    claudeRequests: 0,
    systemUptime: 0,
    successRate: 98.5
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetch('/api/health')
      .then(res => {
        if (!res.ok) throw new Error('Offline');
        return res.json();
      })
      .then(data => {
        setBackendOffline(false);
        console.log('Health check:', data);
      })
      .catch(err => {
        setBackendOffline(true);
        console.warn('Dashboard running in offline/local simulation mode');
      });

    // Update stats
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActions: prev.totalActions + Math.floor(Math.random() * 3),
        systemUptime: prev.systemUptime + 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Actions',
      value: stats.totalActions,
      icon: Activity,
      color: 'from-blue-500 via-blue-600 to-cyan-600',
      bgGlow: 'bg-blue-500/10',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Claude Requests',
      value: actionLogs.length,
      icon: MessageSquare,
      color: 'from-purple-500 via-purple-600 to-pink-600',
      bgGlow: 'bg-purple-500/10',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'System Uptime',
      value: `${Math.floor(stats.systemUptime / 60)}m`,
      icon: Clock,
      color: 'from-emerald-500 via-green-600 to-teal-600',
      bgGlow: 'bg-emerald-500/10',
      change: '100%',
      trend: 'stable'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: 'from-amber-500 via-orange-600 to-amber-600',
      bgGlow: 'bg-amber-500/10',
      change: '+2%',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome header - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-ultra relative overflow-hidden group"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient-primary mb-2">
                Welcome to Wallestars
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-dark-400 text-sm sm:text-base lg:text-lg">
                  Your intelligent automation control center powered by Claude AI
                </p>
                {backendOffline && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold w-max">
                    Offline Simulation Mode
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ rotate: 180, scale: 1.1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 border border-white/10"
          >
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
        </div>

        {/* Decorative ambient glow - positioned in top-right corner extending beyond bounds for soft edge effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl"
        />
      </motion.div>

      {/* Stats grid - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card-interactive relative overflow-hidden group"
            >
              {/* Background glow effect */}
              <div className={`absolute inset-0 ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`text-xs sm:text-sm font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}
                  >
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    {stat.change}
                  </motion.span>
                </div>
                <h3 className="text-dark-400 text-xs sm:text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
              </div>

              {/* Performance-optimized shimmer effect - only animates on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="shimmer absolute inset-0" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Platform Links - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-ultra relative overflow-hidden"
      >
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            <span className="text-gradient-primary">Connected Platforms</span>
          </h2>
          <PlatformLinks />
        </div>
      </motion.div>

      {/* Quick actions & Recent activity - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card-ultra"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            <span className="text-gradient-primary">Quick Actions</span>
          </h2>
          <div className="space-y-3">
            <QuickActionButton
              icon={Monitor}
              title="Computer Use"
              description="Control your Linux desktop"
              color="from-blue-500 via-blue-600 to-cyan-600"
              delay={0}
            />
            <QuickActionButton
              icon={Smartphone}
              title="Android Control"
              description="Manage connected devices"
              color="from-emerald-500 via-green-600 to-teal-600"
              delay={0.1}
            />
            <QuickActionButton
              icon={MessageSquare}
              title="Chat with Claude"
              description="AI-powered conversations"
              color="from-purple-500 via-purple-600 to-pink-600"
              delay={0.2}
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card-ultra"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            <span className="text-gradient-primary">Recent Activity</span>
          </h2>
          <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto custom-scrollbar">
            {actionLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-dark-800/50 rounded-full flex items-center justify-center mb-4"
                >
                  <Activity className="w-8 h-8 text-dark-600" />
                </motion.div>
                <p className="text-dark-500 text-sm">No recent activity</p>
              </div>
            ) : (
              actionLogs.slice(0, 10).map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                  className="glass-effect-hover p-3 sm:p-4 rounded-xl group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary-400 transition-colors">
                        {log.action || 'Unknown action'}
                      </p>
                      <p className="text-xs text-dark-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Real-time Charts Section */}
      <SystemCharts />

      {/* Multi-Agent Intelligence Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="card-ultra relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/3 via-transparent to-purple-500/3" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              <span className="text-gradient-primary">Multi-Agent Intelligence</span>
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400">Microsoft Framework</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <AgentArchCard
              icon={Cpu}
              title="Orchestrator"
              description="Central coordinator for request flow and agent lifecycle"
              color="from-blue-500 to-cyan-600"
              status="Active"
              delay={0}
            />
            <AgentArchCard
              icon={Database}
              title="Agent Registry"
              description="Directory service for agent discovery and capability matching"
              color="from-emerald-500 to-teal-600"
              status="Active"
              delay={0.1}
            />
            <AgentArchCard
              icon={Layers}
              title="Specialized Agents"
              description="Linux, Android & Web agents with domain-specific tools"
              color="from-purple-500 to-indigo-600"
              status="3 Platforms"
              delay={0.2}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-dark-900/50 border border-white/5 flex-1">
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modular Architecture</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Priority Queue</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-Retry</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Real-time Events</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Microsoft 365 Integration - New Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card-ultra"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            <span className="text-gradient-primary">Microsoft 365 Business</span>
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">2 / 25 Licenses Used</span>
          </div>
        </div>

        {/* License Usage Info */}
        <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-400 mb-1">23 Available Licenses</h3>
              <p className="text-sm text-dark-400">
                Your Microsoft 365 Business plan includes 25 licenses with full access to all apps and services.
                Currently only 2 licenses are active. Invite more team members to maximize your subscription value.
              </p>
            </div>
          </div>
        </div>

        {/* Microsoft 365 Apps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <M365AppCard
            icon={Mail}
            title="Outlook"
            description="Professional email & calendar"
            color="from-blue-500 via-blue-600 to-cyan-600"
            link="https://outlook.office.com"
            delay={0}
          />
          <M365AppCard
            icon={Video}
            title="Teams"
            description="Chat, meetings & collaboration"
            color="from-purple-500 via-purple-600 to-indigo-600"
            link="https://teams.microsoft.com"
            delay={0.1}
          />
          <M365AppCard
            icon={FileText}
            title="Word, Excel, PowerPoint"
            description="Office productivity suite"
            color="from-amber-500 via-orange-600 to-red-600"
            link="https://office.com"
            delay={0.2}
          />
          <M365AppCard
            icon={Cloud}
            title="OneDrive"
            description="1TB cloud storage per user"
            color="from-cyan-500 via-blue-600 to-blue-700"
            link="https://onedrive.live.com"
            delay={0.3}
          />
          <M365AppCard
            icon={Calendar}
            title="Bookings"
            description="Appointment scheduling"
            color="from-emerald-500 via-teal-600 to-cyan-600"
            link="https://outlook.office.com/bookings"
            delay={0.4}
          />
          <M365AppCard
            icon={Shield}
            title="Admin Center"
            description="Manage users & licenses"
            color="from-rose-500 via-pink-600 to-purple-600"
            link="https://admin.microsoft.com"
            delay={0.5}
          />
        </div>

        {/* Setup Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            Quick Setup Guide
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SetupStep
              number="1"
              title="Add Users"
              description="Go to Admin Center → Users → Active users → Add user. Assign licenses to new team members."
              link="https://admin.microsoft.com/Adminportal/Home#/users"
            />
            <SetupStep
              number="2"
              title="Configure Teams"
              description="Set up channels, enable guest access, and configure meeting policies in Teams admin center."
              link="https://admin.teams.microsoft.com"
            />
            <SetupStep
              number="3"
              title="Setup Email"
              description="Configure custom domain for professional email addresses in Exchange admin center."
              link="https://admin.exchange.microsoft.com"
            />
            <SetupStep
              number="4"
              title="Security Settings"
              description="Enable MFA, conditional access, and data loss prevention in Security & Compliance center."
              link="https://security.microsoft.com"
            />
          </div>
        </div>

        {/* Quick Action Button */}
        <motion.a
          href="https://admin.microsoft.com"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-primary"
        >
          <Cloud className="w-5 h-5" />
          Open Microsoft 365 Admin Center
          <ExternalLink className="w-4 h-4" />
        </motion.a>
      </motion.div>

      {/* System Status - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card-ultra"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
          <span className="text-gradient-primary">System Status</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatusIndicator
            label="Claude API"
            status={connected ? 'Operational' : 'Disconnected'}
            isOnline={connected}
            delay={0}
          />
          <StatusIndicator
            label="Computer Use"
            status="Ready"
            isOnline={true}
            delay={0.1}
          />
          <StatusIndicator
            label="Android Bridge"
            status="Standby"
            isOnline={false}
            delay={0.2}
          />
        </div>
      </motion.div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, title, description, color, delay }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className="w-full glass-effect-hover p-3 sm:p-4 rounded-xl text-left group relative overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-center gap-3 sm:gap-4">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary-400 transition-colors truncate">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-dark-400 truncate">{description}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
        </motion.div>
      </div>
    </motion.button>
  );
}

function StatusIndicator({ label, status, isOnline, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-effect-hover p-4 rounded-xl group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-dark-400 group-hover:text-dark-300 transition-colors">
          {label}
        </span>
        <div className="relative">
          <motion.div
            animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-dark-600'} shadow-lg`}
          />
          {isOnline && (
            <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full pulse-ring" />
          )}
        </div>
      </div>
      <p className={`font-semibold text-sm sm:text-base ${isOnline ? 'text-emerald-400' : 'text-dark-500'
        }`}>
        {status}
      </p>
    </motion.div>
  );
}

function M365AppCard({ icon: Icon, title, description, color, link, delay }) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="glass-effect-hover p-4 rounded-xl group relative overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm group-hover:text-primary-400 transition-colors truncate">
              {title}
            </h3>
            <ExternalLink className="w-3 h-3 text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-xs text-dark-400">{description}</p>
        </div>
      </div>
    </motion.a>
  );
}

function SetupStep({ number, title, description, link }) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.01 }}
      className="glass-effect-hover p-4 rounded-xl group"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-400">{number}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm group-hover:text-primary-400 transition-colors">
              {title}
            </h4>
            <ExternalLink className="w-3 h-3 text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-dark-400">{description}</p>
        </div>
      </div>
    </motion.a>
  );
}

function AgentArchCard({ icon: Icon, title, description, color, status, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-effect-hover p-4 rounded-xl group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10`}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm group-hover:text-primary-400 transition-colors truncate">
              {title}
            </h3>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              {status}
            </span>
          </div>
          <p className="text-xs text-dark-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
