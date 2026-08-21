import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);

  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    newSocket.on('screen-frame', (data) => {
      setScreenStream(data);
    });

    newSocket.on('action-broadcast', (data) => {
      setActionLogs(prev => [data, ...prev].slice(0, 100)); // Keep last 100 logs
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const startScreenStream = (interval = 1000) => {
    if (socket) {
      socket.emit('start-screen-stream', { interval });
    }
  };

  const stopScreenStream = () => {
    if (socket) {
      socket.emit('stop-screen-stream');
    }
  };

  const logAction = (action) => {
    if (socket) {
      socket.emit('action-log', action);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        screenStream,
        actionLogs,
        startScreenStream,
        stopScreenStream,
        logAction
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
