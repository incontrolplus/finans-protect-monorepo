import React, { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext({
  socket: null,
  connected: false,
  screenStream: null,
  actionLogs: [],
  startScreenStream: () => {},
  stopScreenStream: () => {},
  logAction: () => {}
});

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(true);
  const [screenStream, setScreenStream] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);

  useEffect(() => {
    // Graceful socket simulation if local daemon is running
    try {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        import('socket.io-client').then(({ io }) => {
          const newSocket = io('http://localhost:3000', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 3
          });

          newSocket.on('connect', () => setConnected(true));
          newSocket.on('disconnect', () => setConnected(false));
          newSocket.on('screen-frame', (data) => setScreenStream(data));
          newSocket.on('action-broadcast', (data) => {
            setActionLogs(prev => [data, ...prev].slice(0, 100));
          });

          setSocket(newSocket);
        }).catch(() => {
          setConnected(false);
        });
      }
    } catch {
      setConnected(false);
    }
  }, []);

  const startScreenStream = (interval = 1000) => {
    if (socket) socket.emit('start-screen-stream', { interval });
  };

  const stopScreenStream = () => {
    if (socket) socket.emit('stop-screen-stream');
  };

  const logAction = (action) => {
    if (socket) socket.emit('action-log', action);
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
  return context || {
    socket: null,
    connected: false,
    screenStream: null,
    actionLogs: [],
    startScreenStream: () => {},
    stopScreenStream: () => {},
    logAction: () => {}
  };
}

export default SocketContext;
