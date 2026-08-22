import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  BarChart3,
  CheckCircle,
  Play,
  Mail,
  Wallet,
  Key,
  Users,
  Gift,
  ScrollText,
  CreditCard,
  Wrench,
  Palette,
  Share2,
  Euro,
  Home,
  MessageSquare,
  Monitor,
  Smartphone,
  Brain,
  Database,
  ScanLine,
  QrCode,
  Sparkles,
  Settings,
  LogOut,
  Zap,
  Globe,
  Lock,
  Server,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const menuGroups = [
  {
    label: 'FINANS PROTECT & AUTOMATION',
    items: [
      { id: 'finansprotecthub', name: 'Finans Protect Hub', icon: Shield },
      { id: 'accounting', name: 'Счетоводство (Delta Pro)', icon: BarChart3 },
      { id: 'hardware_radar', name: 'RAM & Сторидж Радар', icon: Server },
      { id: 'wallesterdash', name: 'Dashboard', icon: BarChart3 },
      { id: 'eligibility', name: 'Eligibility Check', icon: CheckCircle },
      { id: 'signupflow', name: 'Signup Flow', icon: Play },
      { id: 'verification', name: 'Verification', icon: Mail },
      { id: 'adminpayouts', name: 'Payout Queue', icon: Wallet },
      { id: 'credentialvault', name: 'Credential Vault', icon: Key },
      { id: 'partners', name: 'Partners', icon: Users },
      { id: 'alternatives', name: 'Alternatives', icon: Gift },
      { id: 'actionlog', name: 'Action Log', icon: ScrollText },
      { id: 'wallesterapi', name: 'API & Cards', icon: CreditCard },
      { id: 'systemconfig', name: 'Config', icon: Wrench },
    ],
  },
  {
    label: 'MARKETING',
    items: [
      { id: 'aicreatives', name: 'AI Creatives', icon: Palette },
      { id: 'socialautomation', name: 'Social Media', icon: Share2 },
      { id: 'currency', name: 'Currency & Invest', icon: Euro },
      { id: 'landing', name: 'Landing Page', icon: Home },
    ],
  },
  {
    label: 'AI & CLUSTER AGENTS',
    items: [
      { id: 'chat', name: 'Claude Chat', icon: MessageSquare },
      { id: 'computer', name: 'Computer Control', icon: Monitor },
      { id: 'android', name: 'Android Control', icon: Smartphone },
      { id: 'multiagent', name: 'Multi-Agent Design', icon: Brain },
      { id: 'agentregistry', name: 'Agent Registry', icon: Database },
      { id: 'smartscan', name: 'Smart Scan', icon: ScanLine },
      { id: 'qrscanner', name: 'QR Scanner', icon: QrCode },
      { id: 'promptgen', name: 'Prompt Generator', icon: Sparkles },
      { id: 'settings', name: 'Settings', icon: Settings },
    ],
  },
];

export const Sidebar = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-full z-50 bg-[#080d1a] border-r border-white/10 flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-[#080d1a] rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                Open Balancer
              </span>
              <span className="text-[10px] text-cyan-400/90 font-medium">
                Finans Protect Engine
              </span>
            </motion.div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label={isOpen ? 'Свий менюто' : 'Разгъни менюто'}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {menuGroups.map((group, gIdx) => (
          <div key={group.label || gIdx} className="space-y-1">
            {isOpen && (
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  title={item.name}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } ${!isOpen ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'}`} />
                  {isOpen && <span className="truncate">{item.name}</span>}
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Status Bar */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-[#060a14]">
        {isOpen ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ENCRYPTED LINK</span>
              </span>
              <Lock className="w-3 h-3 text-emerald-400" />
            </div>

            <button
              onClick={() => setActivePage('finansprotecthub')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Reset View</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="ENCRYPTED LINK" />
            <button
              onClick={() => setActivePage('finansprotecthub')}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
              title="Reset View"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
