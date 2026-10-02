import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from '../utils/network.js';
import { useSettings } from './SettingsContext.jsx';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeReceivers, setActiveReceivers] = useState([]);
  const [incomingTransfer, setIncomingTransfer] = useState(null);

  const { settings } = useSettings();

  useEffect(() => {
    const socketUrl = getApiBaseUrl();
    const newSocket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to AnySend Socket Server:', newSocket.id);
      setIsConnected(true);

      newSocket.emit('device:register', {
        deviceName: settings.deviceName || 'AnySend Device',
        deviceType: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        isReceiver: true
      });
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection retry:', err.message);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket Server');
      setIsConnected(false);
    });

    newSocket.on('receivers:list', (receivers) => {
      setActiveReceivers(receivers);
    });

    newSocket.on('transfer:incoming', (data) => {
      console.log('Incoming transfer request:', data);

      // Filter out transfers targeted to a different receiver socket
      if (data.transfer?.receiverSocketId && data.transfer.receiverSocketId !== newSocket.id) {
        console.log(`Ignoring incoming transfer ${data.transfer.id}: intended for receiver socket ${data.transfer.receiverSocketId}, but this socket is ${newSocket.id}`);
        return;
      }

      const isMyOwnTransfer = (data.transfer?.senderSocketId && data.transfer?.senderSocketId === newSocket.id) ||
        (data.transfer?.senderDevice && data.transfer?.senderDevice === (settings.deviceName || 'AnySend Device'));

      if (!isMyOwnTransfer) {
        setIncomingTransfer(data.transfer);
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('device:register', {
        deviceName: settings.deviceName || 'AnySend Device',
        deviceType: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        isReceiver: true
      });
    }
  }, [settings.deviceName, socket, isConnected]);

  const clearIncomingTransfer = () => {
    setIncomingTransfer(null);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      activeReceivers,
      incomingTransfer,
      clearIncomingTransfer
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
