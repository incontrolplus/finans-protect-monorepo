import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import Header from './components/Header';
import { RevenueWarRoomBento } from './components/RevenueWarRoomBento';
import { EikVerificationWidget } from './components/EikVerificationWidget';
import { SubdomainsMeshMonitor } from './components/SubdomainsMeshMonitor';
import { AccountingTelemetryBento } from './components/AccountingTelemetryBento';
import { ClusterHardwareRadarBento } from './components/ClusterHardwareRadarBento';
import { useSupabaseRealtimeScorecard } from './hooks/useSupabaseRealtimeScorecard';

// Extended Platform Pages
import WallesterDashboard from './pages/WallesterDashboard';
import EligibilityChecker from './pages/EligibilityChecker';
import SignupFlow from './pages/SignupFlow';
import VerificationPipeline from './pages/VerificationPipeline';
import AdminPayouts from './pages/AdminPayouts';
import CredentialVault from './pages/CredentialVault';
import PartnerManagement from './pages/PartnerManagement';
import AlternativeOffers from './pages/AlternativeOffers';
import ActionLog from './pages/ActionLog';
import WallesterAPI from './pages/WallesterAPI';
import SystemConfig from './pages/SystemConfig';
import AICreatives from './pages/AICreatives';
import SocialAutomation from './pages/SocialAutomation';
import CurrencyConverter from './pages/CurrencyConverter';
import LandingPage from './pages/LandingPage';
import ClaudeChat from './pages/ClaudeChat';
import ComputerControl from './pages/ComputerControl';
import AndroidControl from './pages/AndroidControl';
import MultiAgentDesign from './pages/MultiAgentDesign';
import AgentRegistry from './pages/AgentRegistry';
import SmartScan from './pages/SmartScan';
import QRScanner from './pages/QRScanner';
import PromptGenerator from './pages/PromptGenerator';
import Settings from './pages/Settings';
import OwnerDetail from './pages/OwnerDetail';
import { 
  Shield, 
  Activity, 
  CreditCard, 
  Server, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Lock, 
  Globe, 
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<string>('finansprotecthub');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  const { scorecard, cards, businesses, loading, error, isLive, refresh } = useSupabaseRealtimeScorecard();

  const handlePageSelect = (pageId: string) => {
    setActivePage(pageId);
    setMobileDrawerOpen(false);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'finansprotecthub':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Hub Welcome & Status Banner */}
            <div className="bg-gradient-to-r from-[#0d1527] via-[#111e38] to-[#091124] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      Open Balancer Cluster SSOT
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      100.83.83.8 Live Mesh
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Финансов Контролен Център &amp; B2B Автоматизация
                  </h1>
                  <p className="text-sm text-slate-400 max-w-2xl mt-1">
                    Цялостна система за валидация по Търговския регистър (Mod 11), издаване на Visa Platinum карти и мулти-нод клъстерно управление.
                  </p>
                </div>

                {/* Subdomain Quick Links Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://dashboard.openbalancer.com"
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <span>📊 SSOT Dashboard</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://n8n.openbalancer.com"
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <span>n8n Engine</span>
                  </a>
                  <a
                    href="https://infisical.openbalancer.com"
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <span>Infisical KMS</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 1. B2B Verification Engine */}
            <section id="sec-verify" className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  1. B2B ПРОВЕРКА &amp; ОНБОРДИНГ ПОРТАЛ
                </span>
              </div>
              <EikVerificationWidget />
            </section>

            {/* 2. Real-Time Revenue War Room */}
            <section id="sec-warroom" className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  2. REVENUE WAR ROOM &amp; LIVE ISSUED CARDS
                </span>
              </div>
              <RevenueWarRoomBento
                scorecard={scorecard}
                cards={cards}
                businesses={businesses}
                loading={loading}
                error={error}
                isLive={isLive}
                onRefresh={refresh}
              />
            </section>

            {/* 3. Microinvest Delta Pro Accounting Telemetry & VAT Radar */}
            <section id="sec-accounting" className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  3. СЧЕТОВОДНА ТЕЛЕМЕТРИЯ • MICROINVEST DELTA PRO SSOT (278K ОБОРОТ &amp; НАП ДДС)
                </span>
              </div>
              <AccountingTelemetryBento />
            </section>

            {/* 4. Cluster Hardware & Storage Fleet Radar */}
            <section id="sec-hardware" className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  4. КЛЪСТЕРЕН СТОРИДЖ &amp; ХАРДУЕРЕН РАДАР (RAM &amp; DISK FLEET SSOT)
                </span>
              </div>
              <ClusterHardwareRadarBento />
            </section>

            {/* 5. Subdomains Mesh Monitor */}
            <section id="sec-mesh" className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  5. OPEN BALANCER MESH INFRASTRUCTURE &amp; EDGE HEALTH
                </span>
              </div>
              <SubdomainsMeshMonitor />
            </section>
          </div>
        );
      case 'hardware_radar':
      case 'cluster_hardware':
        return <ClusterHardwareRadarBento />;
      case 'accounting':
      case 'accounting_telemetry':
        return <AccountingTelemetryBento />;
      case 'wallesterdash':
        return <WallesterDashboard />;
      case 'eligibility':
        return <EligibilityChecker />;
      case 'signupflow':
        return <SignupFlow />;
      case 'verification':
        return <VerificationPipeline />;
      case 'adminpayouts':
        return <AdminPayouts />;
      case 'credentialvault':
        return <CredentialVault />;
      case 'partners':
        return <PartnerManagement />;
      case 'alternatives':
        return <AlternativeOffers />;
      case 'actionlog':
        return <ActionLog />;
      case 'wallesterapi':
        return <WallesterAPI />;
      case 'systemconfig':
        return <SystemConfig />;
      case 'aicreatives':
        return <AICreatives />;
      case 'socialautomation':
        return <SocialAutomation />;
      case 'currency':
        return <CurrencyConverter />;
      case 'landing':
        return <LandingPage />;
      case 'chat':
        return <ClaudeChat />;
      case 'computer':
        return <ComputerControl />;
      case 'android':
        return <AndroidControl />;
      case 'multiagent':
        return <MultiAgentDesign />;
      case 'agentregistry':
        return <AgentRegistry />;
      case 'smartscan':
        return <SmartScan />;
      case 'qrscanner':
        return <QRScanner />;
      case 'promptgen':
        return <PromptGenerator />;
      case 'settings':
        return <Settings />;
      case 'ownerdetail':
        return (
          <OwnerDetail
            ownerId={selectedOwnerId}
            onBack={() => setActivePage('wallesterdash')}
          />
        );
      default:
        return (
          <div className="p-8 text-center bg-[#0e1626] rounded-2xl border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Избраната страница се зарежда...</h2>
            <button
              onClick={() => setActivePage('finansprotecthub')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
            >
              Върни се към Finans Protect Hub
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Critical Dark Background Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d1c38]/40 via-[#080c14] to-[#04060a]" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activePage={activePage}
          setActivePage={handlePageSelect}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden"
            >
              <Sidebar
                activePage={activePage}
                setActivePage={handlePageSelect}
                isOpen={true}
                setIsOpen={() => setMobileDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Top Header */}
        <Header
          toggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileDrawerOpen(!mobileDrawerOpen);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          sidebarOpen={sidebarOpen}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/10 bg-[#060a12] py-6 px-6 sm:px-8 mt-12 text-center sm:text-left">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Open Balancer</span>
              <span>•</span>
              <span>Finans Protect Suite v2.5 (Canonical SSOT)</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://dashboard.openbalancer.com" className="hover:text-cyan-400 transition-colors">
                SSOT Monitor
              </a>
              <a href="https://openbalancer.com" className="hover:text-cyan-400 transition-colors">
                Официален Сайт
              </a>
              <span>Поверителност &amp; Сигурност</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
