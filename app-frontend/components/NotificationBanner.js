// /ConsentApp/app-frontend/components/NotificationBanner.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { COLORS, SIZES } from '../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function NotificationBanner({ notifications, onMarkAllRead }) {
  const [visible, setVisible] = React.useState(true);
  const timerRef = useRef();

  useEffect(() => {
    if (notifications.length > 0) {
      setVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 6000); // auto-dismiss après 6s
    }
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [notifications]);

  const playSound = async () => {
    try {
      const audioSource = require('../assets/sounds/notification.ogg');
      if (!audioSource) return;
      const sound = new Audio.Sound();
      await sound.loadAsync(audioSource);
      await sound.playAsync();
    } catch (error) {}
  };

  if (notifications.length === 0 || !visible) return null;

  // Message fun et personnalisé selon le type de notif
  const notification = notifications[0];
  const safeText = (val) => {
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (val === null || val === undefined) return '';
    try { return JSON.stringify(val); } catch { return 'N/A'; }
  };
  const getFunMessage = (notification) => {
    if (!notification) return '';
    const { type, sender, receiver, consentId } = notification;
    switch (type) {
      case 'CONSENT_REQUEST':
        return `🎉 ${safeText(sender?.firstName) || 'Quelqu’un'} t’invite à donner ton consentement !`;
      case 'BIOMETRIC_CONFIRMATION':
        return `🔒 ${safeText(sender?.firstName) || 'Ton partenaire'} attend ta validation biométrique pour #${safeText(consentId)} !`;
      case 'CONSENT_ACCEPTED':
        return `✅ Bravo ${safeText(receiver?.firstName) || ''} ! Consentement validé à 100% !`;
      case 'CONSENT_REFUSED':
        return `❌ Oups, la demande de ${safeText(sender?.firstName) || 'un contact'} a été refusée.`;
      default:
        return safeText(notification.message) || 'Nouvelle notification !';
    }
  };

  return (
    <Animated.View style={styles.toastContainer}>
      <View style={styles.toastContent}>
        <LottieView
          source={require('../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.toastIcon}
        />
        <Text style={styles.toastMessage}>{getFunMessage(notification)}</Text>
        <TouchableOpacity style={styles.toastButton} onPress={() => setVisible(false)}>
          <Ionicons name="close" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toastButton} onPress={onMarkAllRead}>
          <Ionicons name="checkmark-done" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    width: '100%',
    paddingHorizontal: 0,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    minWidth: 220,
    maxWidth: 420,
    width: '92%',
    alignSelf: 'center',
  },
  toastIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  toastMessage: {
    flex: 1,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'left',
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  toastButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});