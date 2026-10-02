import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [deviceInfo, setDeviceInfo] = useState({
    deviceName: 'AnySend Web Client',
    ip: '127.0.0.1',
    port: 5000,
    allAddresses: []
  });

  const [settings, setSettings] = useState({
    deviceName: 'AnySend Device',
    downloadFolder: './uploads',
    autoAccept: false,
    maxConcurrentTransfers: 5,
    theme: 'dark'
  });

  const [loading, setLoading] = useState(true);

  const fetchDeviceInfo = async () => {
    try {
      const res = await api.get('/device/info');
      if (res.data.success) {
        setDeviceInfo(res.data);
        if (res.data.settings) {
          setSettings(res.data.settings);
        }
      }
    } catch (err) {
      console.warn('Could not connect to AnySend backend server yet:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceInfo();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const res = await api.post('/device/settings', newSettings);
      if (res.data.success) {
        setSettings(res.data.settings);
        return { success: true };
      }
      return { success: false, error: 'Failed to update settings' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <SettingsContext.Provider value={{
      deviceInfo,
      settings,
      loading,
      fetchDeviceInfo,
      updateSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
