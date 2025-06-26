import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import ConsentToast from '../components/notifications/ConsentToast';
import ConsentModal from '../components/notifications/ConsentModal';
import NotificationBanner from '../components/notifications/NotificationBanner';
import SafeLottieView from '../components/SafeLottieView';
import { useNotificationSettings } from '../context/NotificationSettingsContext';
import { ConsentMessages } from '../lib/notifications/messages';

const SUCCESS_SOUND_URL = 'https://raw.githubusercontent.com/anars/blank-audio/master/1-second-of-silence.mp3';
const ERROR_SOUND_URL = 'https://raw.githubusercontent.com/anars/blank-audio/master/1-second-of-silence.mp3';

const ConsentNotificationContext = createContext(null);

export const ConsentNotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [banner, setBanner] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  const hideToast = () => setToast(null);
  const hideModal = () => setModal(null);

  return (
    <ConsentNotificationContext.Provider value={{ setToast, setModal, setBanner, setCelebrate }}>
      {children}
      {toast && <ConsentToast message={toast} onHide={hideToast} />}
      {banner && <NotificationBanner message={banner} onHide={() => setBanner(null)} />}
      {modal && (
        <ConsentModal
          visible={!!modal}
          message={modal.message}
          onAccept={modal.onAccept}
          onRefuse={modal.onRefuse}
          onClose={hideModal}
        />
      )}
      {celebrate && (
        <SafeLottieView
          source={require('../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          onAnimationFinish={() => setCelebrate(false)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
    </ConsentNotificationContext.Provider>
  );
};

export const useConsentNotifications = (consent, currentUserId, actions = {}) => {
  const { silent } = useNotificationSettings();
  const { setToast, setModal, setBanner, setCelebrate } = useContext(ConsentNotificationContext);
  const prevStatus = useRef(consent?.status);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!consent || !consent.status) return;
    if (prevStatus.current === consent.status) return;

    const partnerName =
      currentUserId === consent.userId
        ? consent.partner?.firstName || 'ton partenaire'
        : consent.user?.firstName || 'ce contact';

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      switch (consent.status) {
        case 'DRAFT':
          triggerToast(ConsentMessages.draft());
          break;

        case 'PENDING':
          if (currentUserId === consent.userId) {
            triggerBanner(ConsentMessages.pendingSent(partnerName));
          } else if (currentUserId === consent.partnerId) {
            setModal({
              message: ConsentMessages.pendingReceived(partnerName),
              onAccept: actions.onAccept,
              onRefuse: actions.onRefuse,
            });
          }
          break;

        case 'ACCEPTED':
          triggerToast(ConsentMessages.accepted(partnerName));
          if (!silent) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          playSound({ uri: SUCCESS_SOUND_URL });
          setCelebrate(true);
          break;

        case 'REFUSED':
          triggerToast(ConsentMessages.refused(partnerName));
          if (!silent) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          playSound({ uri: ERROR_SOUND_URL });
          break;

        case 'REVOKED':
          triggerToast(ConsentMessages.revoked(partnerName));
          if (!silent) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;

        case 'EXPIRED':
          triggerBanner(ConsentMessages.expired(partnerName));
          break;
      }

      prevStatus.current = consent.status;
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [consent?.status]);

  const triggerToast = (msg) => {
    setToast(null);
    setTimeout(() => setToast(msg), 10);
  };

  const triggerBanner = (msg) => {
    setBanner(null);
    setTimeout(() => setBanner(msg), 10);
  };

  const playSound = async (module) => {
    if (silent) return;
    try {
      const { sound } = await Audio.Sound.createAsync(module);
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (err) {
      console.warn('Erreur de lecture sonore :', err);
    }
  };
};

export const useConsentNotificationContext = () => useContext(ConsentNotificationContext);
