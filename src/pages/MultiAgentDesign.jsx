import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Network,
  Shield,
  Layers,
  GitBranch,
  Users,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle,
  Zap,
  Eye,
  Lock,
  RefreshCw,
  Server,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Target,
  Workflow,
  Box,
  Plug,
  Activity,
  AlertTriangle,
  BarChart3,
  Settings,
  FileCode,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const architectureComponents = [
  {
    id: 'orchestrator',
    title: 'Orchestrator (Semantic Kernel & Node Master)',
    icon: Workflow,
    color: 'from-blue-600 to-cyan-600',
    description: 'Централна координация за управление на заявките, маршрутизация, запазване на контекста и жизнен цикъл на отговорите.',
    wallestarMapping: 'OrchestrationManager.js - Event-emitter архитектура с опашка за задачи и управление на жизнения цикъл на агентите.',
    details: [
      'Маршрутизира входящите заявки към специализирани клъстерни агенти',
      'Поддържа контекста на диалога между отделните модули',
      'Управлява жизнения цикъл на отговорите от инициализация до завършване',
      'Имплементира стратегии за повторен опит и автоматичен fallback'
    ]
  },
  {
    id: 'classifier',
    title: 'Classifier (NLU / SLM / LLM Router)',
    icon: Brain,
    color: 'from-purple-600 to-indigo-600',
    description: 'Анализира потребителските намерения и определя маршрутизацията: NLU > SLM > LLM според нивата на увереност.',
    wallestarMapping: 'Claude AI интеграция през /api/claude/chat със Sonnet 4.5 за класификация на задачи.',
    details: [
      'Многостепенна класификация: NLU за прости команди, SLM за средни, LLM за комплексни задачи',
      'Confidence scoring за надеждност на маршрутизацията',
      'Динамично регулиране на праговете според домейна',
      'Ескалация при ниска сигурност'
    ]
  },
  {
    id: 'registry',
    title: 'Agent Registry & Node Discovery',
    icon: Database,
    color: 'from-emerald-600 to-teal-600',
    description: 'Директория, поддържаща метаданни, възможности и оперативен статус на агентите с модули за валидация.',
    wallestarMapping: 'Карта на агентите в OrchestrationManager - проследява agentId, платформа, статус и метрики.',
    details: [
      'Откриване на агенти и съпоставяне на възможности (Capabilities)',
      'Мониторинг на състоянието и проследяване на натоварването',
      'Управление на съвместимостта и версиите',
      'Съхранение на конфигурации в реално време'
    ]
  },
  {
    id: 'supervisor',
    title: 'Supervisor Agent (Task Decomposer)',
    icon: Eye,
    color: 'from-amber-600 to-orange-600',
    description: 'Специализиран координатор, декомпозиращ сложни задачи на подзадачи, делегирани на целеви агенти.',
    wallestarMapping: 'Методите processQueue() и executeTask() извършват декомпозиция, разпределение и синтез.',
    details: [
      'Декомпозиция на комплексни бизнес задачи в атомарни подзадачи',
      'Интелигентно делегиране към специализирани изпълнители',
      'Синтез и агрегация на крайните резултати',
      'Координация и разрешаване на конфликти между агенти'
    ]
  },
  {
    id: 'specialized',
    title: 'Specialized Domain Agents',
    icon: Cpu,
    color: 'from-rose-600 to-red-600',
    description: 'Домейн-фокусирани агенти с независими инструменти за изпълнение на Linux, Android и Web задачи.',
    wallestarMapping: 'Мултиплатформени агенти: Linux (xdotool), Android (ADB), Web (Playwright browser).',
    details: [
      'Домейн-специфични знания и библиотеки от инструменти',
      'Независими ядки за паралелно изпълнение',
      'Изолирани памети за оперативен контекст',
      'Платформено-специфични драйвери'
    ]
  },
  {
    id: 'mcp',
    title: 'Integration Layer & MCP Mesh',
    icon: Plug,
    color: 'from-indigo-600 to-violet-600',
    description: 'Стандартизира връзките между агентите и външните инструменти чрез Model Context Protocol.',
    wallestarMapping: 'Socket.io WebSocket слой + Express REST API рутове осигуряват комуникация между нодовете.',
    details: [
      'Model Context Protocol за унификация на инструментите',
      'Единен API интерфейс за външни услуги и бази данни',
      'Канали в реално време за мигновена телеметрия',
      'Плъгин архитектура за неограничено разширение'
    ]
  }
];

const designPrinciples = [
  {
    title: 'Domain Specialization',
    icon: Target,
    color: 'text-cyan-400',
    description: 'Всеки агент се фокусира върху конкретни домейни, вместо да обобщава всички функции.',
    implementation: 'Linux, Android и Web агенти със специализирани инструменти'
  },
  {
    title: 'Modularity & Extensibility',
    icon: Box,
    color: 'text-emerald-400',
    description: 'Нови агенти се интегрират безпроблемно през регистъра без прекъсване на работния процес.',
    implementation: 'Динамична регистрация през registerAgent() API'
  },
  {
    title: 'Scalability & Parallelism',
    icon: Layers,
    color: 'text-purple-400',
    description: 'Хоризонтално мащабиране през клъстера с приоритетни опашки за изпълнение.',
    implementation: 'Конфигурируеми паралелни задачи (1-20) с опашка с приоритет'
  },
  {
    title: 'Resilience & Fallbacks',
    icon: Shield,
    color: 'text-amber-400',
    description: 'Грешка в единичен агент не блокира системата; оркестраторът прилага автоматични резервни стратегии.',
    implementation: 'Автоматичен повторен опит (до 3 пъти) с таймаут управление'
  },
  {
    title: 'Security & Access Control',
    icon: Lock,
    color: 'text-rose-400',
    description: 'Валидация на входните данни, ролеви достъп, одитни логове и пълна изолация.',
    implementation: 'CORS, CSP хедъри, API валидация и изолирано изпълнение'
  },
  {
    title: 'Operational Telemetry',
    icon: RefreshCw,
    color: 'text-blue-400',
    description: 'Непрекъснат мониторинг на здравето, проследяване на токени и контрол на състоянието.',
    implementation: 'Health endpoints, n8n webhook мониторинг и PM2 мениджмънт'
  }
];

export default function MultiAgentDesign() {
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('architecture');
  const [expandedPrinciple, setExpandedPrinciple] = useState(null);

  const tabs = [
    { id: 'architecture', label: 'Архитектура', icon: Network },
    { id: 'principles', label: 'Дизайн Принципи', icon: BookOpen },
    { id: 'deployment', label: 'Модели на Деплой', icon: Server },
    { id: 'mapping', label: 'SSOT Интеграция', icon: GitBranch }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Multi-Agent Intelligence Architecture</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Архитектурна рамка за проектиране на мащабируеми мулти-агентни системи, интегрирани в Open Balancer.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Microsoft Framework Review
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Architecture Tab */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Architecture Flow Diagram Bento */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Архитектурна Схема на Потока на Данни</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Input Layer */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">1. Входящ Слой (Input)</span>
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Потребителски Заявки</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Claude Chat, Computer Use, OCR SmartScan</p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">NLU Класификатор</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Разпознаване на намерения и маршрутизация</p>
                </div>
              </div>

              {/* Orchestration Layer */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">2. Оркестрация (Core)</span>
                <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Orchestration Manager</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Централен координатор на контекста</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-300 block">Registry</span>
                    <span className="text-[9px] text-slate-400">Каталог с агенти</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-300 block">Supervisor</span>
                    <span className="text-[9px] text-slate-400">Декомпозиция</span>
                  </div>
                </div>
              </div>

              {/* Execution Layer */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">3. Изпълнение (Nodes)</span>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Linux Worker</span>
                    <span className="text-[10px] font-mono text-slate-400">xdotool</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Android Node</span>
                    <span className="text-[10px] font-mono text-slate-400">ADB</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Web Browser</span>
                    <span className="text-[10px] font-mono text-slate-400">Playwright</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Component Bento Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {architectureComponents.map((component) => {
              const Icon = component.icon;
              const isExpanded = expandedComponent === component.id;

              return (
                <div
                  key={component.id}
                  onClick={() => setExpandedComponent(isExpanded ? null : component.id)}
                  className={`rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border transition-all cursor-pointer shadow-xl ${
                    isExpanded ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${component.color} flex items-center justify-center shadow-md border border-white/20 shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white tracking-tight">{component.title}</h3>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>

                      <p className="text-xs text-slate-300 mb-3">{component.description}</p>

                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-cyan-300 font-mono leading-tight">{component.wallestarMapping}</span>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                          {component.details.map((detail, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Principles Tab */}
      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designPrinciples.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${principle.color}`} />
                  <h3 className="text-sm font-bold text-white">{principle.title}</h3>
                </div>
                <p className="text-xs text-slate-300">{principle.description}</p>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-cyan-300 font-mono flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{principle.implementation}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deployment Tab */}
      {activeTab === 'deployment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-cyan-400/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Модулен Монолит (Текуща Архитектура)</h3>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Активен</span>
            </div>
            <p className="text-xs text-slate-300">
              Всички оркестрационни модули и агенти работят в оптимизирана единична среда за минимална латентност.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Минимална латентност при обмен на данни между нодовете</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Опростено разгръщане и поддръжка през Cloudflare edge</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Микросървиси (Бъдещо Мащабиране)</h3>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Планиран</span>
            </div>
            <p className="text-xs text-slate-300">
              Изолирано изпълнение на агентите като независими контейнери в разпределен клъстер.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Независимо хоризонтално мащабиране на натоварени агенти</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Пълна изолация на ресурсите и грешките</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Tab */}
      {activeTab === 'mapping' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">SSOT Съответствие и Покритие</h2>
          <div className="space-y-3">
            {[
              { component: 'Orchestrator Core', file: 'server/orchestration/OrchestrationManager.js', coverage: 95 },
              { component: 'Claude AI Classifier', file: 'server/routes/claude.js', coverage: 90 },
              { component: 'Agent Registry Catalog', file: 'src/pages/AgentRegistry.jsx', coverage: 100 },
              { component: 'Mobile & OS Drivers', file: 'src/pages/AndroidControl.jsx, ComputerControl.jsx', coverage: 95 },
              { component: 'MCP Integration Mesh', file: 'server/socket/handlers.js', coverage: 85 }
            ].map((m) => (
              <div key={m.component} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{m.component}</span>
                    <span className="text-[10px] font-mono text-slate-400">{m.file}</span>
                  </div>
                  <span className="font-mono font-bold text-cyan-300">{m.coverage}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: `${m.coverage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

