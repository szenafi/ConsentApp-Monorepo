import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchUnreadNotifications,
  markNotificationsAsRead,
  markNotificationAsRead,
} from '../utils/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const data = await fetchUnreadNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    try {
      await markNotificationsAsRead(notifications.map((n) => n.id));
      setNotifications([]);
    } catch (err) {
      console.error('Erreur markAllAsRead:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Erreur markAsRead:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, loadNotifications, markAllAsRead, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
