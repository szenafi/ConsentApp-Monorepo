import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import ConsentToast from '../components/notifications/ConsentToast';
import ConsentModal from '../components/notifications/ConsentModal';
import { useNotificationSettings } from '../context/NotificationSettingsContext';
import { ConsentMessages } from '../lib/notifications/messages';

const SUCCESS_SOUND_URL =
  'https://raw.githubusercontent.com/anars/blank-audio/master/1-second-of-silence.mp3';
const ERROR_SOUND_URL =
  'https://raw.githubusercontent.com/anars/blank-audio/master/1-second-of-silence.mp3';

const ConsentNotificationContext = createContext();

export const ConsentNotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  const hideToast = () => setToast(null);
  const hideModal = () => setModal(null);

  return (
    <ConsentNotificationContext.Provider value={{ setToast, setModal }}>
      {children}
      {toast && <ConsentToast message={toast} onHide={hideToast} />}
      {modal && (
        <ConsentModal
          visible={!!modal}
          message={modal.message}
          onAccept={modal.onAccept}
          onRefuse={modal.onRefuse}
          onClose={hideModal}
        />
      )}
    </ConsentNotificationContext.Provider>
  );
};

export const useConsentNotifications = (consent, currentUserId, actions = {}) => {
  const { silent } = useNotificationSettings();
  const { setToast, setModal } = useContext(ConsentNotificationContext);
  const prevStatus = useRef(consent?.status);

  useEffect(() => {
    if (!consent || !consent.status) return;
    if (prevStatus.current === consent.status) return;
    const partnerName = currentUserId === consent.userId
      ? consent.partner?.firstName || 'ton partenaire'
      : consent.user?.firstName || 'ce contact';
    switch (consent.status) {
      case 'DRAFT':
        triggerToast(ConsentMessages.draft());
        break;
      case 'PENDING':
        if (currentUserId === consent.userId) {
          triggerToast(ConsentMessages.pendingSent(partnerName));
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
        break;
      case 'REFUSED':
        triggerToast(ConsentMessages.refused(partnerName));
        if (!silent) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        playSound({ uri: ERROR_SOUND_URL });
        break;
    }
    prevStatus.current = consent.status;
  }, [consent?.status]);

  const triggerToast = (msg) => setToast(msg);

  const playSound = async (module) => {
    if (silent) return;
    try {
      const { sound } = await Audio.Sound.createAsync(module);
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch {}
  };
};
