import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, Activity, Bot, Cpu, Database,
  Globe, Key, Play, Search, Server, Wifi, Zap, X, RefreshCw,
  ExternalLink, FileText, RotateCcw
} from 'lucide-react';
import { GlassCard, GlassCardContent } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Quick Stats Data
const stats = [
  { icon: Bot, label: 'Агенти', value: '3 активни', status: 'online', emoji: '🤖' },
  { icon: Zap, label: 'n8n', value: '11/100 active', status: 'healthy', emoji: '⚡' },
  { icon: Database, label: 'Supabase', value: '17 таблици', status: 'connected', emoji: '💾' },
  { icon: Globe, label: 'Airtop', value: '0 сесии', status: 'ready', emoji: '🌐' },
];

// Activity Feed Data with priority levels and suggested actions
const activities = [
  {
    time: '14:32', type: 'success', priority: 'low',
    message: 'Молти health check OK', icon: CheckCircle2,
    actions: [{ label: 'Виж детайли', action: 'view-health' }],
  },
  {
    time: '14:28', type: 'info', priority: 'medium',
    message: 'n8n Wallester workflow triggered', icon: Zap,
    actions: [
      { label: 'Виж workflow', action: 'view-workflow' },
      { label: 'Логове', action: 'view-logs' },
    ],
  },
  {
    time: '14:15', type: 'warning', priority: 'medium',
    message: 'KeePassXC credential accessed', icon: Key,
    actions: [
      { label: 'Виж кой', action: 'audit-access' },
      { label: 'Ротирай', action: 'rotate-cred' },
    ],
  },
  {
    time: '14:02', type: 'info', priority: 'low',
    message: 'Airtop session terminated gracefully', icon: Globe,
    actions: [{ label: 'Нова сесия', action: 'new-session' }],
  },
  {
    time: '13:45', type: 'error', priority: 'critical',
    message: 'VPS High CPU Alert: 87%', icon: AlertTriangle,
    actions: [
      { label: 'Рестарт сервис', action: 'restart-service' },
      { label: 'SSH Connect', action: 'ssh' },
      { label: 'Виж процеси', action: 'view-processes' },
    ],
  },
  {
    time: '13:30', type: 'success', priority: 'low',
    message: 'Supabase sync completed', icon: Database,
    actions: [{ label: 'Виж данни', action: 'view-data' }],
  },
  {
    time: '13:12', type: 'info', priority: 'low',
    message: 'GitHub push detected: main branch', icon: Activity,
    actions: [
      { label: 'Виж commit', action: 'view-commit' },
      { label: 'Deploy', action: 'deploy' },
    ],
  },
  {
    time: '12:58', type: 'success', priority: 'low',
    message: 'Memory maintenance completed', icon: Cpu,
    actions: [{ label: 'Доклад', action: 'view-report' }],
  },
];

// Quick Actions with priority (ordered by importance)
const quickActions = [
  { label: 'Run Workflow', icon: Zap, color: 'warning', priority: 'high', description: 'Стартирай n8n workflow' },
  { label: 'Нов Task', icon: Play, color: 'primary', priority: 'high', description: 'Създай нова задача' },
  { label: 'Нова Airtop Сесия', icon: Globe, color: 'accent', priority: 'medium', description: 'Стартирай browser сесия' },
  { label: 'Get Credential', icon: Key, color: 'accent', priority: 'medium', description: 'Достъп до credentials' },
  { label: 'n8n Status', icon: Activity, color: 'success', priority: 'low', description: 'Провери n8n здравето' },
  { label: 'Search Skills', icon: Search, color: 'primary', priority: 'low', description: 'Търси в skills каталога' },
];

// Tailscale Mesh Nodes
const meshNodes = [
  { name: 'Mac Air', ip: '100.91.86.110', type: 'laptop' },
  { name: 'Linux', ip: '100.104.164.115', type: 'server' },
  { name: 'VPS', ip: '72.61.154.188', type: 'cloud' },
  { name: 'Supabase', ip: 'cloud', type: 'database' },
];

const statusColors = {
  online: 'text-success',
  healthy: 'text-success',
  connected: 'text-primary',
  ready: 'text-accent',
};

const activityColors = {
  success: 'text-success border-success/30',
  info: 'text-primary border-primary/30',
  warning: 'text-warning border-warning/30',
  error: 'text-destructive border-destructive/30',
};

const priorityBadge = {
  critical: { label: 'CRITICAL', className: 'bg-destructive/20 text-destructive border border-destructive/40 animate-pulse' },
  medium: { label: 'WARN', className: 'bg-warning/20 text-warning border border-warning/40' },
  low: { label: '', className: '' },
};

export default function OCDashboard() {
  const [expandedActivity, setExpandedActivity] = useState(null);

  const handleQuickAction = (action) => {
    toast.success(`${action.label}`, {
      description: action.description,
    });
  };

  const handleActivityAction = (activity, actionItem) => {
    toast.info(`${actionItem.label}`, {
      description: `${activity.message}`,
    });
    setExpandedActivity(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="h-full" hover>
              <GlassCardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.emoji}</span>
                  <div className={`flex items-center gap-1 text-xs ${statusColors[stat.status]}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {stat.status}
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <GlassCard className="h-full">
            <GlassCardContent className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Лента на Активността
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <button
                      onClick={() => setExpandedActivity(expandedActivity === index ? null : index)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border bg-secondary/20 transition-all hover:bg-secondary/40 cursor-pointer ${activityColors[activity.type]} ${activity.priority === 'critical' ? 'ring-1 ring-destructive/50' : ''}`}
                    >
                      <activity.icon className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        {activity.priority !== 'low' && priorityBadge[activity.priority] && (
                          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${priorityBadge[activity.priority].className}`}>
                            {priorityBadge[activity.priority].label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                    </button>

                    {/* Expanded actions */}
                    <AnimatePresence>
                      {expandedActivity === index && activity.actions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 mt-2 ml-8 mb-1">
                            {activity.actions.map((actionItem, ai) => (
                              <Button
                                key={ai}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-border/50 hover:bg-primary/10 hover:border-primary/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivityAction(activity, actionItem);
                                }}
                              >
                                {actionItem.label}
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-full">
            <GlassCardContent className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                Бързи Действия
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.priority === 'high' ? 'default' : 'outline'}
                    className={`w-full justify-start gap-3 h-auto py-3 ${
                      action.priority === 'high'
                        ? 'bg-primary/20 border border-primary/40 hover:bg-primary/30 text-foreground'
                        : 'border-border/50 hover:bg-secondary/30'
                    }`}
                    onClick={() => handleQuickAction(action)}
                  >
                    <action.icon className={`w-5 h-5 ${
                      action.priority === 'high' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{action.label}</span>
                      <span className="text-[11px] text-muted-foreground">{action.description}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* Tailscale Mesh Network */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard>
          <GlassCardContent className="p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-accent" />
              Tailscale Mesh Network
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 py-6">
              {meshNodes.map((node, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-2 relative">
                      <Server className="w-8 h-8 text-primary" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{node.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{node.ip}</span>
                  </div>
                  {index < meshNodes.length - 1 && (
                    <div className="hidden sm:flex items-center">
                      <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                      <span className="text-muted-foreground mx-1">↔</span>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-accent to-primary relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                          animate={{ x: ['100%', '-100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}
