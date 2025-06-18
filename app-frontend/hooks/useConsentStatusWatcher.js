import React, { useEffect, useState } from 'react';
import { getConsentHistory } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useConsentNotifications } from './useConsentNotifications';

function ConsentStatusHandler({ consent, userId }) {
  useConsentNotifications(consent, userId);
  return null;
}

export default function ConsentStatusWatcher({ children }) {
  const { user } = useAuth();
  const [consents, setConsents] = useState([]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchConsents = async () => {
      try {
        const data = await getConsentHistory();
        const list = Array.isArray(data) ? data : data.consents || [];
        if (mounted) setConsents(list);
      } catch (e) {
        console.error('fetch consents', e);
      }
    };
    fetchConsents();
    const interval = setInterval(fetchConsents, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  return (
    <>
      {children}
      {consents.map((c) => (
        <ConsentStatusHandler key={c.id} consent={c} userId={user?.id} />
      ))}
    </>
  );
}
