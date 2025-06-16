import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { consentMessages } from '../lib/notifications/messages';
import { showConsentToast } from '../components/notifications/ConsentToast';

export default function useConsentNotifications(consent: any, isInitiator = true) {
  const [lastStatus, setLastStatus] = useState(consent?.status);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!consent || !consent.status) return;
    if (consent.status === lastStatus) return;
    setLastStatus(consent.status);

    switch (consent.status) {
      case 'DRAFT':
        showConsentToast(consentMessages.DRAFT(consent));
        break;
      case 'PENDING':
        if (isInitiator) {
          showConsentToast(consentMessages.PENDING_INITIATOR(consent));
        } else {
          setModalVisible(true);
        }
        break;
      case 'ACCEPTED':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSound();
        showConsentToast(consentMessages.ACCEPTED(consent), 'success');
        break;
      case 'REFUSED':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showConsentToast(consentMessages.REFUSED(consent), 'error');
        break;
      default:
        break;
    }
  }, [consent?.status, isInitiator]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/notification.ogg')
      );
      await sound.playAsync();
    } catch {}
  };

  return { modalVisible, setModalVisible };
}
