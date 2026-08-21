import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Server, Workflow, Zap, Cloud, Code } from 'lucide-react';

const platforms = [
  {
    name: 'GitHub',
    description: 'Source code & repositories',
    url: 'https://github.com/Wallesters-org',
    icon: Github,
    color: 'from-gray-700 to-gray-900',
    enabled: true
  },
  {
    name: 'Hostinger',
    description: 'Hosting & domains',
    url: 'https://hpanel.hostinger.com',
    icon: Server,
    color: 'from-purple-500 to-purple-700',
    enabled: true
  },
  {
    name: 'n8n',
    description: 'Workflow automation',
    url: 'https://n8n.io',
    icon: Workflow,
    color: 'from-pink-500 to-pink-700',
    enabled: true
  },
  {
    name: 'ContextStream',
    description: 'Context management',
    url: 'https://contextstream.io',
    icon: Code,
    color: 'from-cyan-500 to-cyan-700',
    enabled: true
  },
  {
    name: 'Claude Console',
    description: 'Anthropic dashboard',
    url: 'https://console.anthropic.com',
    icon: Zap,
    color: 'from-amber-500 to-amber-700',
    enabled: true
  },
  {
    name: 'Azure Portal',
    description: 'Cloud infrastructure',
    url: 'https://portal.azure.com',
    icon: Cloud,
    color: 'from-blue-500 to-blue-700',
    enabled: false
  }
];

export default function PlatformLinks() {
  const handlePlatformClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {platforms.filter(p => p.enabled).map((platform, index) => {
        const Icon = platform.icon;
        return (
          <motion.button
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePlatformClick(platform.url)}
            className="glass-effect p-4 rounded-xl hover:bg-white/10 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{platform.name}</h3>
                  <ExternalLink className="w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors" />
                </div>
                <p className="text-sm text-dark-400">{platform.description}</p>
                <p className="text-xs text-dark-500 mt-1 truncate">{platform.url}</p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
