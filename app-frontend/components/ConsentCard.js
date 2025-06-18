import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { acceptConsent, refuseConsent } from '../utils/api';
import { useConsentNotifications } from '../hooks/useConsentNotifications';

function getSummary(consent, userId) {
  const initiateur = consent.user?.firstName || 'Quelqu’un';
  const partenaire = consent.partner?.firstName || consent.partner?.email?.split('@')[0] || 'un contact';
  const otherName = userId === consent.partnerId ? initiateur : partenaire;

  switch (consent.status) {
    case 'DRAFT':
      return `🇺 "Je consens à avoir une relation sexuelle avec ${otherName}."`;
    case 'PENDING':
      if (userId === consent.userId) {
        return `🎯 En route ! Il ne manque plus que la validation de ${partenaire} pour confirmer ce consentement.`;
      }
      if (userId === consent.partnerId) {
        return `📬 ${initiateur} souhaite officialiser un moment avec toi. 🔐 À toi de confirmer ou de refuser ce consentement.`;
      }
      return `Consentement en attente de la validation de ${partenaire}.`;
    case 'ACCEPTED':
      return `🎉 C’est officiel ! Vous avez tous les deux validé ce consentement par empreinte biométrique.`;
    case 'REFUSED':
      if (userId === consent.userId) {
        return `❌ ${partenaire} a choisi de ne pas confirmer ce consentement. 💡 Tu peux en discuter ensemble si besoin, ou créer une nouvelle demande plus tard.`;
      }
      if (userId === consent.partnerId) {
        return '❌ Tu as refusé cette demande.';
      }
      return 'Consentement refusé.';
    default:
      return 'Statut inconnu';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

function getAvatarLabel(isCurrentUser, userObj, fallback) {
  if (!userObj || typeof userObj !== 'object') return fallback;
  if (userObj.firstName && userObj.firstName !== '') return userObj.firstName;
  if (isCurrentUser) return 'Vous';
  if (userObj.email) return userObj.email.split('@')[0];
  return fallback;
}

function safeText(value, fieldName = '') {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(v => safeText(v)).join(', ');
  if (typeof value === 'object') {
    if (value.firstName) return value.firstName;
    if (value.email) return value.email.split('@')[0];
    return '[objet]';
  }
  return String(value);
}

function isConsentValid(consent) {
  return consent && typeof consent === 'object' &&
         consent.user && typeof consent.user === 'object' &&
         consent.partner && typeof consent.partner === 'object' &&
         typeof consent.status === 'string';
}

export default function ConsentCard({ consent, userId, onAccept, onRefuse }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const valid = isConsentValid(consent);
  const isInitiator = valid && consent.userId === userId;
  useConsentNotifications(valid ? consent : null, userId, { onAccept: handleAccept, onRefuse: handleRefuse });
  useEffect(() => {
    if (!valid) return;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, valid]);
  if (!valid) {
    return (
      <View style={{ padding: 16, backgroundColor: '#fee2e2', borderRadius: 10, margin: 8 }}>
        <Text style={{ color: '#b91c1c', fontWeight: 'bold' }}>Erreur : consentement mal formé</Text>
        <Text style={{ color: '#b91c1c', fontSize: 12 }}>{JSON.stringify(consent)}</Text>
      </View>
    );
  }
  const isPartner = consent.partnerId === userId;
  const statusColor =
    consent.status === 'PENDING' ? '#F59E42' :
    consent.status === 'ACCEPTED' ? '#22C55E' :
    consent.status === 'REFUSED' ? '#EF4444' : '#64748b';
  const statusIcon =
    consent.status === 'PENDING' ? 'hourglass-outline' :
    consent.status === 'ACCEPTED' ? 'checkmark-circle-outline' :
    consent.status === 'REFUSED' ? 'close-circle-outline' : 'help-circle-outline';

  let message = safeText(consent.message, 'message');
  const summary = safeText(getSummary(consent, userId), 'summary');

  const defaultPattern = /^Je consens à avoir une relation sexuelle avec /i;
  if (defaultPattern.test(message)) {
    const initiateur = consent.user?.firstName || 'Quelqu’un';
    const partenaire = consent.partner?.firstName || consent.partner?.email?.split('@')[0] || 'un contact';
    const otherName = userId === consent.partnerId ? initiateur : partenaire;
    message = `Je consens à avoir une relation sexuelle avec ${otherName}.`;
  }

  const userLabel = safeText(getAvatarLabel(isInitiator, consent.user, 'Moi'), 'userLabel');
  const partnerLabel = safeText(getAvatarLabel(isPartner, consent.partner, 'Partenaire'), 'partnerLabel');


  function handleAccept() {
    LocalAuthentication.authenticateAsync({ promptMessage: 'Validez avec votre empreinte digitale' })
      .then(result => {
        if (!result.success) throw new Error('Validation biométrique requise');
        return acceptConsent(consent.id);
      })
      .then(() => onAccept && onAccept(consent))
      .catch(err => alert(err.message || 'Erreur lors de l’acceptation du consentement'));
  }

  function handleRefuse() {
    LocalAuthentication.authenticateAsync({ promptMessage: 'Validez avec votre empreinte digitale' })
      .then(result => {
        if (!result.success) throw new Error('Validation biométrique requise');
        return refuseConsent(consent.id);
      })
      .then(() => onRefuse && onRefuse(consent))
      .catch(err => alert(err.message || 'Erreur lors du refus du consentement'));
  }


  return (
    <>
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {!!consent.emoji && <Text style={styles.emoji}>{safeText(consent.emoji)}</Text>}
        {!!consent.type && <Text style={styles.type}>{safeText(consent.type)}</Text>}
      </View>

      <View style={styles.avatarRow}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: consent.user?.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.avatar} />
          <Text style={styles.avatarLabel}>{userLabel}</Text>
        </View>
        <View style={styles.lineWithIcon}>
          <View style={styles.line} />
          <View style={styles.stateIconCircle}>
            <Ionicons name={statusIcon} size={26} color={statusColor} />
          </View>
          <View style={styles.line} />
        </View>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: consent.partner?.avatarUrl || 'https://randomuser.me/api/portraits/women/32.jpg' }} style={styles.avatar} />
          <Text style={styles.avatarLabel}>{partnerLabel}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>{summary}</Text>
        {message && message.trim() !== '' && message !== 'N/A' && (
          <Text style={styles.messageText}>{`💬 "${message}"`}</Text>
        )}
        <Text style={styles.dateText}>{`🗓️ ${formatDate(consent.createdAt)}`}</Text>
      </View>

      {consent.status === 'PENDING' && isPartner && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonAccept]} onPress={handleAccept}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionTextAccept}>Accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonRefuse]} onPress={handleRefuse}>
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionTextRefuse}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 26,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: '#6366f1',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    borderWidth: 1.7,
    borderColor: '#e0e7ff',
    marginBottom: 22,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  avatarContainer: {
    alignItems: 'center',
    width: 72,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#6366f1',
    backgroundColor: '#e0e7ff',
    marginBottom: 2,
  },
  avatarLabel: {
    fontSize: 15,
    color: '#6366f1',
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 2,
  },
  lineWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    height: 2,
    backgroundColor: '#e0e7ff',
    flex: 1,
  },
  stateIconCircle: {
    borderWidth: 2.5,
    borderRadius: 24,
    padding: 7,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderColor: '#6366f1',
  },
  summaryRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1.2,
    borderColor: '#e0e7ff',
  },
  summaryText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#22223b',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 3,
    shadowColor: '#6366f1',
  },
  actionButtonAccept: {
    backgroundColor: '#6366f1',
  },
  actionButtonRefuse: {
    backgroundColor: '#e5e7eb',
  },
  actionTextAccept: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  actionTextRefuse: {
    color: '#6366f1',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
