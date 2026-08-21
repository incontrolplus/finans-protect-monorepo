import { useState } from 'react';
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
  FileCode
} from 'lucide-react';

const architectureComponents = [
  {
    id: 'orchestrator',
    title: 'Orchestrator (Semantic Kernel)',
    icon: Workflow,
    color: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/10',
    description: 'Central coordination managing request flow, routing, context preservation, and response lifecycle.',
    wallestarMapping: 'OrchestrationManager.js - Event-emitter based architecture with task queue and agent lifecycle management.',
    details: [
      'Routes incoming requests to appropriate specialized agents',
      'Maintains conversation context across agent interactions',
      'Manages response lifecycle from initiation to completion',
      'Implements retry strategies and fallback mechanisms'
    ]
  },
  {
    id: 'classifier',
    title: 'Classifier (NLU/SLM/LLM)',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/10',
    description: 'Understands user inputs and determines appropriate routing using a tiered approach: NLU > SLM > LLM based on certainty levels.',
    wallestarMapping: 'Claude AI integration via /api/claude/chat with Sonnet model for intelligent task classification.',
    details: [
      'Tiered classification: NLU for simple intents, SLM for moderate, LLM for complex',
      'Confidence scoring to determine routing certainty',
      'Dynamic threshold adjustment based on domain',
      'Fallback escalation when certainty is low'
    ]
  },
  {
    id: 'registry',
    title: 'Agent Registry',
    icon: Database,
    color: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-500/10',
    description: 'Directory service maintaining agent metadata, capabilities, and operational status with discovery, validation, and storage modules.',
    wallestarMapping: 'agents Map in OrchestrationManager - tracks agentId, platform, capabilities, status, and performance metrics.',
    details: [
      'Agent discovery and capability matching',
      'Health monitoring and status tracking',
      'Version management and compatibility checks',
      'Metadata storage for agent configurations'
    ]
  },
  {
    id: 'supervisor',
    title: 'Supervisor Agent',
    icon: Eye,
    color: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/10',
    description: 'Optional specialized coordinator that decomposes complex tasks into subtasks delegated to specialized agents, then synthesizes results.',
    wallestarMapping: 'processQueue() and executeTask() methods handle task decomposition, agent assignment, and result aggregation.',
    details: [
      'Complex task decomposition into subtasks',
      'Intelligent delegation to specialized agents',
      'Result synthesis and aggregation',
      'Cross-agent coordination and conflict resolution'
    ]
  },
  {
    id: 'specialized',
    title: 'Specialized Agents',
    icon: Cpu,
    color: 'from-rose-500 to-red-500',
    bgGlow: 'bg-rose-500/10',
    description: 'Domain-focused agents with dedicated LLM/SLM cores, specialized toolsets, and memory systems.',
    wallestarMapping: 'Multi-platform agents: Linux (xdotool), Android (ADB), Web (browser automation) - each with specific capabilities.',
    details: [
      'Domain-specific knowledge and toolsets',
      'Independent LLM/SLM cores per agent',
      'Isolated memory systems for context',
      'Platform-specific execution capabilities'
    ]
  },
  {
    id: 'mcp',
    title: 'Integration Layer & MCP Server',
    icon: Plug,
    color: 'from-indigo-500 to-violet-500',
    bgGlow: 'bg-indigo-500/10',
    description: 'Standardizes connections between agents and external tools using Model Context Protocol.',
    wallestarMapping: 'Socket.io WebSocket layer + Express API routes provide standardized inter-agent and external tool communication.',
    details: [
      'Model Context Protocol for tool standardization',
      'Unified API interface for external services',
      'Real-time WebSocket communication channels',
      'Plugin architecture for extensibility'
    ]
  }
];

const designPrinciples = [
  {
    title: 'Domain Specialization',
    icon: Target,
    color: 'text-blue-400',
    description: 'Each agent focuses on specific domains rather than generalizing across all functions.',
    implementation: 'Linux, Android, Web platform agents with specific capabilities'
  },
  {
    title: 'Modularity & Extensibility',
    icon: Box,
    color: 'text-emerald-400',
    description: 'New agents integrate seamlessly through registration without redeploying existing components.',
    implementation: 'Dynamic agent registration via registerAgent() API'
  },
  {
    title: 'Scalability',
    icon: Layers,
    color: 'text-purple-400',
    description: 'Horizontal expansion across domains; agents run locally or remotely with supervisors managing clusters.',
    implementation: 'Configurable maxConcurrentTasks (1-20) with priority queue'
  },
  {
    title: 'Resilience',
    icon: Shield,
    color: 'text-amber-400',
    description: 'Failures in individual agents don\'t cascade; orchestrator implements retry strategies and fallback mechanisms.',
    implementation: 'Automatic retry (up to 3x) with timeout handling (5min default)'
  },
  {
    title: 'Security',
    icon: Lock,
    color: 'text-rose-400',
    description: 'Input validation, role-based access control, logging, data isolation, and rate limiting.',
    implementation: 'CORS, CSP headers, API validation, sandboxed execution'
  },
  {
    title: 'Operational Resilience',
    icon: RefreshCw,
    color: 'text-cyan-400',
    description: 'Continuous health monitoring, token tracking, automated retry, and version control.',
    implementation: 'Health endpoints, n8n monitoring webhooks, PM2 process management'
  }
];

const deploymentModels = [
  {
    title: 'Modular Monolith',
    subtitle: 'Current Wallestars Architecture',
    icon: Server,
    color: 'from-blue-500 to-cyan-600',
    isActive: true,
    pros: [
      'Self-contained with orchestrator and agents as modules',
      'Low-latency inter-agent communication',
      'Simplified deployment and debugging',
      'Shared memory and state management'
    ],
    cons: [
      'Limited independent scaling per agent',
      'Single point of deployment',
      'Memory constraints for large agent pools'
    ]
  },
  {
    title: 'Microservices',
    subtitle: 'Future Scalability Path',
    icon: Globe,
    color: 'from-purple-500 to-indigo-600',
    isActive: false,
    pros: [
      'Independent deployment per agent service',
      'Granular scaling based on demand',
      'Technology diversity per service',
      'Isolated failure domains'
    ],
    cons: [
      'Increased network latency',
      'Complex service discovery',
      'Distributed state management overhead',
      'Higher operational complexity'
    ]
  }
];

const caseStudies = [
  {
    company: 'ContraForce',
    domain: 'Cybersecurity',
    color: 'from-blue-500 to-cyan-500',
    icon: Shield,
    description: 'Multi-tenant, multi-agent platform enabling MSSPs to scale security operations.',
    results: [
      '3x customer capacity per analyst',
      '2x incident investigation capability',
      'Multi-tenant security operations at scale'
    ],
    relevance: 'Parallels Wallestars multi-platform orchestration for automated security tasks.'
  },
  {
    company: 'Stemtology',
    domain: 'Medical Research',
    color: 'from-emerald-500 to-teal-500',
    icon: Activity,
    description: 'RAG agents accelerating osteoarthritis treatment discovery.',
    results: [
      '50% timeline reduction expected',
      '90%+ predictive accuracy target',
      'Accelerated research workflows'
    ],
    relevance: 'Demonstrates multi-agent pattern for complex analysis - applicable to Smart Scan workflows.'
  },
  {
    company: 'SolidCommerce',
    domain: 'Retail Automation',
    color: 'from-amber-500 to-orange-500',
    icon: BarChart3,
    description: 'Merchant assistance leveraging Azure AI Search and Function Apps.',
    results: [
      'Automated data retrieval and response generation',
      'Merchant approval workflows',
      'Multi-source data aggregation'
    ],
    relevance: 'Similar to Wallestars task queue pattern with approval and result synthesis.'
  }
];

export default function MultiAgentDesign() {
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('architecture');
  const [expandedPrinciple, setExpandedPrinciple] = useState(null);

  const tabs = [
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'principles', label: 'Design Principles', icon: BookOpen },
    { id: 'deployment', label: 'Deployment Models', icon: Server },
    { id: 'cases', label: 'Case Studies', icon: Globe },
    { id: 'mapping', label: 'WALLTO Mapping', icon: GitBranch }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-ultra relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Microsoft Framework Review
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                WALLTO Integration
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
              Multi-Agent Intelligence Design
            </h1>
            <p className="text-dark-400 text-sm sm:text-base">
              Architecture framework for designing scalable multi-agent systems - mapped to Wallestars Control Center
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/10"
          >
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"
        />
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'glass-effect-hover text-dark-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <motion.div
            key="architecture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* System Architecture Diagram */}
            <div className="card-ultra">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                <span className="text-gradient-primary">System Architecture Overview</span>
              </h2>

              {/* Visual Flow Diagram */}
              <div className="relative p-4 rounded-xl bg-dark-900/50 border border-white/5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Input Layer */}
                  <div className="space-y-3">
                    <div className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Input Layer</div>
                    <div className="glass-effect rounded-xl p-4 border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-sm">User Requests</span>
                      </div>
                      <p className="text-xs text-dark-400">Chat, Computer Use, Smart Scan, QR Scanner</p>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-dark-500 rotate-90 md:rotate-0" />
                    </div>
                    <div className="glass-effect rounded-xl p-4 border-l-4 border-purple-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-sm">Classifier</span>
                      </div>
                      <p className="text-xs text-dark-400">NLU/SLM/LLM intent detection & routing</p>
                    </div>
                  </div>

                  {/* Orchestration Layer */}
                  <div className="space-y-3">
                    <div className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Orchestration Layer</div>
                    <div className="glass-effect rounded-xl p-4 border-2 border-indigo-500/50 bg-indigo-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Workflow className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-sm">Orchestrator</span>
                      </div>
                      <p className="text-xs text-dark-400">Central coordinator - request flow & context</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass-effect rounded-lg p-3 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-1 mb-1">
                          <Database className="w-3 h-3 text-emerald-400" />
                          <span className="font-semibold text-xs">Registry</span>
                        </div>
                        <p className="text-xs text-dark-500">Agent catalog</p>
                      </div>
                      <div className="glass-effect rounded-lg p-3 border-l-4 border-amber-500">
                        <div className="flex items-center gap-1 mb-1">
                          <Eye className="w-3 h-3 text-amber-400" />
                          <span className="font-semibold text-xs">Supervisor</span>
                        </div>
                        <p className="text-xs text-dark-500">Task decomp</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-dark-500 rotate-90 md:rotate-0" />
                    </div>
                  </div>

                  {/* Execution Layer */}
                  <div className="space-y-3">
                    <div className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Execution Layer</div>
                    <div className="space-y-2">
                      {[
                        { name: 'Linux Agent', color: 'border-blue-500', icon: '🖥️', desc: 'xdotool, screenshots' },
                        { name: 'Android Agent', color: 'border-emerald-500', icon: '📱', desc: 'ADB automation' },
                        { name: 'Web Agent', color: 'border-purple-500', icon: '🌐', desc: 'Browser tasks' }
                      ].map((agent) => (
                        <div key={agent.name} className={`glass-effect rounded-lg p-3 border-l-4 ${agent.color}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{agent.icon}</span>
                            <div>
                              <span className="font-semibold text-xs">{agent.name}</span>
                              <p className="text-xs text-dark-500">{agent.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="glass-effect rounded-lg p-3 border-l-4 border-violet-500">
                      <div className="flex items-center gap-2">
                        <Plug className="w-3 h-3 text-violet-400" />
                        <div>
                          <span className="font-semibold text-xs">MCP / Integration Layer</span>
                          <p className="text-xs text-dark-500">Socket.io + REST APIs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Layer */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="text-center text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Storage & State Layer</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="glass-effect rounded-lg p-3 text-center">
                      <Database className="w-4 h-4 text-dark-400 mx-auto mb-1" />
                      <span className="text-xs font-medium">Conversation History</span>
                    </div>
                    <div className="glass-effect rounded-lg p-3 text-center">
                      <Settings className="w-4 h-4 text-dark-400 mx-auto mb-1" />
                      <span className="text-xs font-medium">Agent State</span>
                    </div>
                    <div className="glass-effect rounded-lg p-3 text-center">
                      <FileCode className="w-4 h-4 text-dark-400 mx-auto mb-1" />
                      <span className="text-xs font-medium">Registry Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {architectureComponents.map((component, index) => {
                const Icon = component.icon;
                const isExpanded = expandedComponent === component.id;

                return (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-interactive cursor-pointer"
                    onClick={() => setExpandedComponent(isExpanded ? null : component.id)}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 bg-gradient-to-br ${component.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-sm sm:text-base">{component.title}</h3>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-dark-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-dark-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-dark-400 mb-2">{component.description}</p>

                        {/* Wallestar Mapping Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
                          <Zap className="w-3 h-3 text-primary-400 flex-shrink-0" />
                          <span className="text-xs text-primary-300">{component.wallestarMapping}</span>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 space-y-2"
                            >
                              {component.details.map((detail, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-dark-300">{detail}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Design Principles Tab */}
        {activeTab === 'principles' && (
          <motion.div
            key="principles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="card-ultra">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span className="text-gradient-primary">Core Design Principles</span>
              </h2>
              <p className="text-dark-400 text-sm mb-6">
                Foundational principles from Microsoft's multi-agent framework mapped to Wallestars implementation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designPrinciples.map((principle, index) => {
                  const Icon = principle.icon;
                  const isExpanded = expandedPrinciple === index;

                  return (
                    <motion.div
                      key={principle.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -3 }}
                      onClick={() => setExpandedPrinciple(isExpanded ? null : index)}
                      className="glass-effect-hover rounded-xl p-5 cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className={`w-6 h-6 ${principle.color}`} />
                          <h3 className="font-bold text-sm">{principle.title}</h3>
                        </div>
                        <p className="text-xs text-dark-400 mb-3">{principle.description}</p>

                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-dark-900/50 border border-white/5">
                          <Zap className="w-3 h-3 text-primary-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-primary-300">{principle.implementation}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Security Deep Dive */}
            <div className="card-ultra">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-400" />
                <span className="text-gradient-primary">Security & Governance</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-dark-300">Security Controls</h3>
                  {[
                    'Input validation and sanitization',
                    'Role-based access control (RBAC)',
                    'Comprehensive logging and audit trails',
                    'Data isolation and encryption at rest',
                    'Rate limiting and abuse detection'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span className="text-xs text-dark-400">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-dark-300">Governance Framework</h3>
                  {[
                    'Agent versioning with state machine transitions',
                    'CI/CD pipelines for agent deployment',
                    'Continuous evaluation and quality metrics',
                    'Impact assessment for upstream changes',
                    'Production environment isolation'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-dark-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Deployment Models Tab */}
        {activeTab === 'deployment' && (
          <motion.div
            key="deployment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deploymentModels.map((model, index) => {
                const Icon = model.icon;
                return (
                  <motion.div
                    key={model.title}
                    initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`card-ultra relative overflow-hidden ${model.isActive ? 'ring-2 ring-indigo-500/50' : ''}`}
                  >
                    {model.isActive && (
                      <div className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Active
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${model.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{model.title}</h3>
                        <p className="text-xs text-dark-400">{model.subtitle}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Advantages
                        </h4>
                        <div className="space-y-1.5">
                          {model.pros.map((pro, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                              <span className="text-xs text-dark-300">{pro}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Trade-offs
                        </h4>
                        <div className="space-y-1.5">
                          {model.cons.map((con, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                              <span className="text-xs text-dark-300">{con}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Evolution Path */}
            <div className="card-ultra">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <span className="text-gradient-primary">Evolution Strategy</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                {[
                  { phase: 'Phase 1', title: 'Modular Monolith', desc: 'Current: Single Node.js process with Express + Socket.io', status: 'active', color: 'border-emerald-500 bg-emerald-500/5' },
                  { phase: 'Phase 2', title: 'Service Extraction', desc: 'Extract agent execution into independent workers', status: 'planned', color: 'border-blue-500 bg-blue-500/5' },
                  { phase: 'Phase 3', title: 'Full Microservices', desc: 'Independent deployment with message queue orchestration', status: 'future', color: 'border-purple-500 bg-purple-500/5' }
                ].map((phase, index) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className={`flex-1 rounded-xl p-4 border-l-4 ${phase.color}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-dark-400">{phase.phase}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        phase.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        phase.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {phase.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{phase.title}</h4>
                    <p className="text-xs text-dark-400">{phase.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Case Studies Tab */}
        {activeTab === 'cases' && (
          <motion.div
            key="cases"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="card-ultra">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span className="text-gradient-primary">Real-World Implementations</span>
              </h2>
              <p className="text-dark-400 text-sm mb-6">
                Enterprise case studies demonstrating multi-agent patterns and their relevance to Wallestars.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {caseStudies.map((study, index) => {
                const Icon = study.icon;
                return (
                  <motion.div
                    key={study.company}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ y: -5 }}
                    className="card-ultra group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${study.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold">{study.company}</h3>
                          <span className="text-xs text-dark-400">{study.domain}</span>
                        </div>
                      </div>

                      <p className="text-sm text-dark-300 mb-4">{study.description}</p>

                      <div className="space-y-2 mb-4">
                        <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Key Results</h4>
                        {study.results.map((result, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="text-xs text-dark-300">{result}</span>
                          </div>
                        ))}
                      </div>

                      <div className="px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
                        <div className="flex items-start gap-2">
                          <Zap className="w-3 h-3 text-primary-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-primary-300">{study.relevance}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* WALLTO Mapping Tab */}
        {activeTab === 'mapping' && (
          <motion.div
            key="mapping"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Implementation Status */}
            <div className="card-ultra">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <span className="text-gradient-primary">WALLTO / Wallestars - Microsoft Framework Mapping</span>
              </h2>
              <p className="text-dark-400 text-sm mb-6">
                How the current Wallestars Control Center maps to Microsoft's multi-agent intelligence framework.
              </p>

              <div className="space-y-4">
                {[
                  {
                    framework: 'Orchestrator',
                    wallestar: 'OrchestrationManager.js',
                    status: 'implemented',
                    file: 'server/orchestration/OrchestrationManager.js',
                    coverage: 85,
                    details: 'EventEmitter-based with task queue, priority scheduling, concurrent execution management'
                  },
                  {
                    framework: 'Classifier',
                    wallestar: 'Claude AI Integration',
                    status: 'partial',
                    file: 'server/routes/claude.js',
                    coverage: 60,
                    details: 'Claude Sonnet for chat classification; needs tiered NLU/SLM approach for efficiency'
                  },
                  {
                    framework: 'Agent Registry',
                    wallestar: 'agents Map + API Routes',
                    status: 'implemented',
                    file: 'server/routes/orchestration.js',
                    coverage: 75,
                    details: 'Dynamic registration, status tracking, capability matching; needs versioning and approval workflows'
                  },
                  {
                    framework: 'Supervisor Agent',
                    wallestar: 'processQueue() + executeTask()',
                    status: 'partial',
                    file: 'server/orchestration/OrchestrationManager.js',
                    coverage: 50,
                    details: 'Basic task-to-agent matching; needs complex task decomposition and result synthesis'
                  },
                  {
                    framework: 'Specialized Agents',
                    wallestar: 'Linux / Android / Web Agents',
                    status: 'implemented',
                    file: 'src/pages/ (multiple)',
                    coverage: 80,
                    details: 'Platform-specific agents with dedicated tools (xdotool, ADB, browser); isolated execution'
                  },
                  {
                    framework: 'MCP / Integration Layer',
                    wallestar: 'Socket.io + Express REST',
                    status: 'partial',
                    file: 'server/socket/handlers.js',
                    coverage: 55,
                    details: 'WebSocket for real-time events, REST for CRUD; needs MCP protocol standardization'
                  },
                  {
                    framework: 'Storage Layer',
                    wallestar: 'In-Memory + localStorage',
                    status: 'basic',
                    file: 'Multiple',
                    coverage: 40,
                    details: 'In-memory task/agent state; chat history in localStorage; needs persistent storage (Supabase planned)'
                  }
                ].map((mapping, index) => (
                  <motion.div
                    key={mapping.framework}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect-hover rounded-xl p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-sm">{mapping.framework}</span>
                          <ArrowRight className="w-4 h-4 text-dark-500" />
                          <span className="text-sm text-primary-400">{mapping.wallestar}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            mapping.status === 'implemented' ? 'bg-emerald-500/20 text-emerald-400' :
                            mapping.status === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {mapping.status}
                          </span>
                        </div>
                        <p className="text-xs text-dark-400 mb-2">{mapping.details}</p>
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3 h-3 text-dark-500" />
                          <span className="text-xs text-dark-500 font-mono">{mapping.file}</span>
                        </div>
                      </div>
                      <div className="sm:w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-dark-400">Coverage</span>
                          <span className="text-xs font-semibold">{mapping.coverage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-dark-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mapping.coverage}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                            className={`h-full rounded-full ${
                              mapping.coverage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                              mapping.coverage >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div className="card-ultra">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <span className="text-gradient-primary">Implementation Roadmap</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    priority: 'High',
                    color: 'border-rose-500 bg-rose-500/5',
                    items: [
                      'Add tiered classifier (NLU before LLM)',
                      'Implement persistent storage with Supabase',
                      'Add agent versioning and state machines',
                      'Build approval workflow for agent registration'
                    ]
                  },
                  {
                    priority: 'Medium',
                    color: 'border-amber-500 bg-amber-500/5',
                    items: [
                      'Implement MCP protocol for tool standardization',
                      'Add task decomposition in Supervisor agent',
                      'Build comprehensive audit logging',
                      'Add health monitoring dashboard'
                    ]
                  },
                  {
                    priority: 'Low',
                    color: 'border-blue-500 bg-blue-500/5',
                    items: [
                      'Migrate to microservices architecture',
                      'Add rate limiting per agent/user',
                      'Implement cross-agent memory sharing',
                      'Build agent marketplace/catalog'
                    ]
                  },
                  {
                    priority: 'Research',
                    color: 'border-purple-500 bg-purple-500/5',
                    items: [
                      'Evaluate Azure AI for managed agent hosting',
                      'Explore Semantic Kernel integration',
                      'Test multi-model agent strategies',
                      'Benchmark latency for microservices transition'
                    ]
                  }
                ].map((group) => (
                  <div key={group.priority} className={`rounded-xl p-4 border-l-4 ${group.color}`}>
                    <h3 className="font-semibold text-sm mb-3">{group.priority} Priority</h3>
                    <div className="space-y-2">
                      {group.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-dark-400 mt-1.5 flex-shrink-0" />
                          <span className="text-xs text-dark-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Reference */}
            <div className="card-ultra">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Source Reference</h3>
                  <p className="text-xs text-dark-400 mb-2">
                    This analysis is based on Microsoft's "Designing Multi-Agent Intelligence" framework,
                    adapted for the Wallestars / WALLTO Control Center architecture.
                  </p>
                  <a
                    href="https://developer.microsoft.com/blog/designing-multi-agent-intelligence"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Read the original article
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
