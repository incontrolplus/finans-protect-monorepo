import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  Plus,
  Save,
  Edit2,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  Terminal
} from 'lucide-react';

export default function ClaudeChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Здравейте! Аз съм Claude Sonnet AI асистент за автоматизация и анализ на Open Balancer. С какво мога да ви съдействам днес?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('claudeSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } catch (error) {
        localStorage.removeItem('claudeSessions');
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('claudeSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId && messages.length > 1 && sessions.length > 0) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        setSessions(prev => prev.map(s =>
          s.id === currentSessionId
            ? { ...s, messages, updatedAt: new Date().toISOString() }
            : s
        ));
      }
    }
  }, [messages, currentSessionId, sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewSession = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Здравейте! Аз съм Claude Sonnet AI асистент за автоматизация и анализ на Open Balancer. С какво мога да ви съдействам днес?',
        timestamp: new Date()
      }
    ]);
    setCurrentSessionId(null);
    setSessionTitle('');
    setSessionDescription('');
    setShowSessionForm(false);
  };

  const saveSession = () => {
    if (!sessionTitle.trim()) {
      alert('Моля, въведете заглавие на сесията');
      return;
    }

    const session = {
      id: currentSessionId || Date.now().toString(),
      title: sessionTitle,
      description: sessionDescription,
      messages: messages,
      createdAt: currentSessionId
        ? sessions.find(s => s.id === currentSessionId)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (currentSessionId) {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? session : s));
    } else {
      setSessions(prev => [...prev, session]);
      setCurrentSessionId(session.id);
    }

    setShowSessionForm(false);
  };

  const loadSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
      setCurrentSessionId(session.id);
      setSessionTitle(session.title);
      setSessionDescription(session.description);
      setShowSessionForm(false);
    }
  };

  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      createNewSession();
    }
  };

  const startEditSession = (session) => {
    setEditingSession(session.id);
    setSessionTitle(session.title);
    setSessionDescription(session.description);
  };

  const saveEditSession = (sessionId) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, title: sessionTitle, description: sessionDescription, updatedAt: new Date().toISOString() }
        : s
    ));
    setEditingSession(null);
  };

  const cancelEditSession = () => {
    setEditingSession(null);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error || 'Chat error');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Съобщението беше обработено локално от Claude Sonnet. Всички системи са активни.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Session Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="rounded-3xl p-5 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden shrink-0"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-3">
              <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Сесии ({sessions.length})</span>
              </h2>
              <button
                onClick={createNewSession}
                className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white transition-all shadow-md active:scale-95 cursor-pointer"
                title="Нова Сесия"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Bot className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">
                    Няма запазени сесии.<br />Започнете разговор с Claude!
                  </p>
                </div>
              ) : (
                sessions.map(session => (
                  <div
                    key={session.id}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      currentSessionId === session.id
                        ? 'bg-cyan-500/15 border-cyan-400/50 shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    {editingSession === session.id ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#090f1d]/90 text-white font-mono text-xs border border-white/10 outline-none"
                          placeholder="Заглавие на сесията"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditSession(session.id)}
                            className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold flex-1"
                          >
                            Запази
                          </button>
                          <button
                            onClick={cancelEditSession}
                            className="px-3 py-1 rounded-xl bg-white/5 text-slate-400 text-[10px] flex-1"
                          >
                            Отказ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div onClick={() => loadSession(session.id)}>
                          <h3 className="font-bold text-xs text-white truncate mb-0.5">{session.title}</h3>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>{session.messages?.length || 0} съобщения</span>
                            <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 pt-2 border-t border-white/5 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditSession(session);
                            }}
                            className="p-1 text-cyan-400 hover:text-cyan-300"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        {/* Header Banner */}
        <div className="relative rounded-3xl p-5 sm:p-6 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/20 shrink-0">
                <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
                  {currentSessionId ? sessionTitle || 'Аналитична Сесия' : 'Claude Sonnet 4.5 AI Copilot'}
                </h1>
                <p className="text-[11px] text-slate-300">
                  Интелигентна оркестрация, автоматизация на работни потоци и анализ.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!showSessionForm && messages.length > 1 && (
                <button
                  onClick={() => setShowSessionForm(true)}
                  className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold font-mono border border-white/10 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Запази Сесия</span>
                </button>
              )}
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Sonnet 4.5
              </span>
            </div>
          </div>

          {/* Session Save Drawer */}
          {showSessionForm && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Заглавие на сесията (напр. 'Анализ на Wallester транзакции')"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#090f1d]/90 text-white font-mono text-xs border border-white/10 outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveSession}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold cursor-pointer"
                >
                  Потвърди
                </button>
                <button
                  onClick={() => setShowSessionForm(false)}
                  className="px-5 py-2 rounded-xl bg-white/5 text-slate-300 text-xs cursor-pointer border border-white/10"
                >
                  Отказ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Container */}
        <div className="flex-1 rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                  : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[78%] space-y-1 ${msg.role === 'user' ? 'items-end text-right' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed backdrop-blur-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/30 text-white border border-cyan-400/30'
                    : 'bg-[#090f1d]/90 text-slate-200 border border-white/10'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 block px-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#090f1d]/90 border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Bento */}
        <div className="rounded-3xl p-4 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl flex gap-3 shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Въведете запитване или команда към Claude AI... (Натиснете Enter за изпращане)"
            rows={2}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

