import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Send,
  Brain,
  Sparkles,
  Globe,
  FileText,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Trash2,
  RotateCcw,
  Zap,
  MessageSquare,
  ScanLine,
  Lightbulb
} from 'lucide-react';

export default function ClaudeExtensionPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Claude, your AI assistant in the browser. I can help you with:\n\n- Answering questions about any topic\n- Analyzing and summarizing web pages\n- Writing and editing text\n- Code assistance\n- And much more!\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('claude-sonnet-4-5-20250929');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const res = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();

      if (data.success || data.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response || data.message || 'I received your message but could not generate a response.'
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I apologize, but I encountered an issue: ${data.error || 'Unknown error'}. Please check that the API key is configured.`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Connection error: ${error.message}. Please ensure the server is running.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. How can I help you?'
    }]);
    setShowQuickActions(true);
  };

  const quickAction = (prompt) => {
    setInput(prompt);
    setShowQuickActions(false);
  };

  const panelClass = isFullscreen
    ? 'fixed inset-0 z-[100]'
    : 'fixed right-0 top-0 bottom-0 w-full max-w-md z-[100]';

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={panelClass}
    >
      <div className="h-full flex flex-col bg-dark-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold">Claude for Browsers</h2>
                <p className="text-xs text-dark-400">Anthropic AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-all"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={clearChat}
                className="p-2 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-xs bg-dark-800 border border-white/10 rounded-lg px-3 py-1.5 text-dark-300 flex-1"
            >
              <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
              <option value="claude-haiku-4-5-20250929">Claude Haiku 4.5</option>
            </select>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Connected
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-primary-500/20 border border-primary-500/30 rounded-2xl rounded-br-sm'
                  : 'bg-dark-800/80 border border-white/5 rounded-2xl rounded-bl-sm'
              } p-3`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Brain className="w-3 h-3 text-violet-400" />
                    <span className="text-xs text-violet-400 font-medium">Claude</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                {msg.role === 'assistant' && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => copyMessage(msg.content, idx)}
                      className="text-dark-500 hover:text-dark-300 transition-all p-1"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-dark-800/80 border border-white/5 rounded-2xl rounded-bl-sm p-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-400 font-medium">Claude</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                  <span className="text-sm text-dark-400">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && messages.length <= 1 && (
          <div className="px-4 pb-2 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton
                icon={Globe}
                label="Summarize page"
                onClick={() => quickAction('Summarize the current web page I\'m viewing')}
              />
              <QuickActionButton
                icon={FileText}
                label="Explain text"
                onClick={() => quickAction('Explain the selected text in simple terms')}
              />
              <QuickActionButton
                icon={Lightbulb}
                label="Brainstorm ideas"
                onClick={() => quickAction('Help me brainstorm ideas for ')}
              />
              <QuickActionButton
                icon={ScanLine}
                label="Analyze content"
                onClick={() => quickAction('Analyze the content and key points of ')}
              />
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask Claude anything..."
                rows={1}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:border-primary-500/50 transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="btn-primary p-3 rounded-xl disabled:opacity-40"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </div>
          <p className="text-xs text-dark-500 mt-2 text-center">
            Powered by Anthropic Claude API
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-effect p-3 rounded-lg text-left hover:bg-white/10 transition-all flex items-center gap-2"
    >
      <Icon className="w-4 h-4 text-primary-400 shrink-0" />
      <span className="text-xs text-dark-300">{label}</span>
    </motion.button>
  );
}
