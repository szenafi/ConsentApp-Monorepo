import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const NotificationSettingsContext = createContext();

export const NotificationSettingsProvider = ({ children }) => {
  const [silent, setSilent] = useState(false);

  useEffect(() => {
    (async () => {
      const val = await SecureStore.getItemAsync('silentMode');
      setSilent(val === 'true');
    })();
  }, []);

  const toggleSilent = async () => {
    const newVal = !silent;
    setSilent(newVal);
    await SecureStore.setItemAsync('silentMode', newVal ? 'true' : 'false');
  };

  return (
    <NotificationSettingsContext.Provider value={{ silent, toggleSilent }}>
      {children}
    </NotificationSettingsContext.Provider>
  );
};

export const useNotificationSettings = () => useContext(NotificationSettingsContext);
