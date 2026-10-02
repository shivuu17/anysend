import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { generateCoolDeviceName } from '../utils/nameGenerator.js';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Generate a cool unique device name for this webapp load
  const [sessionCoolName] = useState(() => {
    const savedCustom = localStorage.getItem('anysend_custom_device_name');
    if (savedCustom) return savedCustom;
    return generateCoolDeviceName();
  });

  const [deviceInfo, setDeviceInfo] = useState({
    deviceName: sessionCoolName,
    ip: '127.0.0.1',
    port: 5000,
    allAddresses: []
  });

  const [settings, setSettings] = useState({
    deviceName: sessionCoolName,
    autoAccept: false,
    maxConcurrentTransfers: 5,
    theme: 'dark'
  });

  const [loading, setLoading] = useState(true);

  const fetchDeviceInfo = async () => {
    try {
      const res = await api.get('/device/info');
      if (res.data.success) {
        setDeviceInfo(prev => ({
          ...res.data,
          deviceName: settings.deviceName || sessionCoolName
        }));
        if (res.data.settings) {
          setSettings(prev => ({
            ...prev,
            ...res.data.settings,
            deviceName: prev.deviceName || sessionCoolName
          }));
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
      if (newSettings.deviceName) {
        localStorage.setItem('anysend_custom_device_name', newSettings.deviceName);
      }
      const res = await api.post('/device/settings', newSettings);
      if (res.data.success) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
        return { success: true };
      }
      return { success: false, error: 'Failed to update settings' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const generateNewCoolName = () => {
    const newName = generateCoolDeviceName();
    setSettings(prev => ({ ...prev, deviceName: newName }));
    localStorage.setItem('anysend_custom_device_name', newName);
    return newName;
  };

  return (
    <SettingsContext.Provider value={{
      deviceInfo,
      settings,
      loading,
      fetchDeviceInfo,
      updateSettings,
      generateNewCoolName
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
