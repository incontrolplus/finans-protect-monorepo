import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader, Sparkles, Plus, Save, Edit2, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

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
      content: 'Hello! I\'m Claude, your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('claudeSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } catch (error) {
        console.error('Failed to load sessions from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('claudeSessions');
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('claudeSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto-save current session
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
        content: 'Hello! I\'m Claude, your AI assistant. How can I help you today?',
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
      alert('Please enter a session title');
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
    if (confirm('Are you sure you want to delete this session?')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        createNewSession();
      }
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
    if (currentSessionId !== sessionId) {
      setSessionTitle('');
      setSessionDescription('');
    }
  };

  const cancelEditSession = () => {
    setEditingSession(null);
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession) {
      setSessionTitle(currentSession.title);
      setSessionDescription(currentSession.description);
    } else {
      setSessionTitle('');
      setSessionDescription('');
    }
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
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
        isError: true
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
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Session Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 card flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-700">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                Sessions
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={createNewSession}
                className="btn-primary p-2"
                title="New Session"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {sessions.length === 0 ? (
                <p className="text-dark-500 text-sm text-center py-8">
                  No saved sessions yet.<br />Start chatting and save your conversation!
                </p>
              ) : (
                sessions.map(session => (
                  <motion.div
                    key={session.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSessionId === session.id
                        ? 'bg-primary-500/20 border border-primary-500/30'
                        : 'bg-dark-800/50 hover:bg-dark-700/50'
                    }`}
                  >
                    {editingSession === session.id ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="input-field text-sm w-full"
                          placeholder="Session title"
                          autoFocus
                        />
                        <textarea
                          value={sessionDescription}
                          onChange={(e) => setSessionDescription(e.target.value)}
                          className="input-field text-xs w-full resize-none h-16"
                          placeholder="Description (optional)"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditSession(session.id)}
                            className="btn-primary text-xs py-1 px-3 flex-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditSession}
                            className="btn-secondary text-xs py-1 px-3 flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div onClick={() => loadSession(session.id)}>
                          <h3 className="font-semibold text-sm mb-1">{session.title}</h3>
                          {session.description && (
                            <p className="text-xs text-dark-400 mb-2 line-clamp-2">{session.description}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-dark-500">
                            <span>{session.messages.length} messages</span>
                            <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 pt-2 border-t border-dark-700">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditSession(session);
                            }}
                            className="text-primary-400 hover:text-primary-300 p-1"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Sidebar Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-6 top-24 z-10 btn-secondary p-2 rounded-full"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </motion.button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {currentSessionId ? sessionTitle || 'Untitled Session' : 'Chat with Claude'}
              </h1>
              <p className="text-dark-400 text-sm">
                {currentSessionId && sessionDescription 
                  ? sessionDescription 
                  : 'Powered by Claude Sonnet 4.5'}
              </p>
            </div>
            <div className="flex gap-2">
              {!showSessionForm && messages.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSessionForm(true)}
                  className="btn-secondary px-4 py-2 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {currentSessionId ? 'Update' : 'Save'} Session
                </motion.button>
              )}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-primary-400" />
              </motion.div>
            </div>
          </div>

          {/* Session Save Form */}
          {showSessionForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-dark-700 space-y-3"
            >
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Session title (required)"
                className="input-field w-full"
                autoFocus
              />
              <textarea
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                placeholder="Session description (optional)"
                className="input-field w-full resize-none h-20"
              />
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveSession}
                  className="btn-primary px-6 py-2"
                >
                  Save Session
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSessionForm(false)}
                  className="btn-secondary px-6 py-2"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Messages */}
        <div className="flex-1 card overflow-y-auto mb-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message content */}
                <div className={`flex-1 ${message.role === 'user' ? 'items-end' : ''} flex flex-col`}>
                  <div className={`glass-effect p-4 rounded-lg max-w-2xl ${
                    message.role === 'user' ? 'bg-primary-500/20' : ''
                  } ${message.isError ? 'bg-red-500/20 border border-red-500/30' : ''}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-xs text-dark-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="glass-effect p-4 rounded-lg">
                <div className="flex gap-2">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-primary-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-primary-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-primary-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              className="input-field flex-1 resize-none h-20"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="btn-primary h-20 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
