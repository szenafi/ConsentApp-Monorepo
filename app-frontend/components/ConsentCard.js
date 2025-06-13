import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import { acceptConsent, refuseConsent } from '../utils/api';

// Fonction utilitaire pour le résumé dynamique
function getSummary(consent, userId) {
  const initiateur = consent.user?.firstName || 'Quelqu’un';
  const partenaire = consent.partner?.firstName || consent.partner?.email?.split('@')[0] || 'un contact';
  if (consent.status === 'PENDING') {
    if (userId === consent.userId) {
      return `En attente de la validation biométrique de ${partenaire}`;
    } else {
      return `${initiateur} attend ta validation biométrique !`;
    }
  }
  if (consent.status === 'ACCEPTED') {
    return `Bravo ! Toi et ${partenaire} avez validé le consentement par biométrie 🎉`;
  }
  if (consent.status === 'REFUSED') {
    return `Consentement refusé par ${userId === consent.partnerId ? 'toi' : partenaire}`;
  }
  return 'Statut inconnu';
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
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (value === null || value === undefined) {
    if (fieldName) {
      console.warn(`ConsentCard: valeur nulle ou indéfinie pour ${fieldName}`);
    }
    return '';
  }
  if (Array.isArray(value)) {
    if (fieldName) {
      console.warn(`ConsentCard: tableau inattendu pour ${fieldName}`, value);
    }
    return value.map(v => safeText(v)).join(', ');
  }
  if (typeof value === 'object') {
    if (fieldName) {
      console.warn(`ConsentCard: objet inattendu pour ${fieldName}`, value);
    }
    if (value.firstName) return value.firstName;
    if (value.email) return value.email.split('@')[0];
    return '[objet]';
  }
  if (fieldName) {
    console.warn(`ConsentCard: valeur inattendue pour ${fieldName} :`, value);
  }
  return String(value);
}

function isConsentValid(consent) {
  if (!consent || typeof consent !== 'object') return false;
  if (!consent.user || typeof consent.user !== 'object') return false;
  if (!consent.partner || typeof consent.partner !== 'object') return false;
  if (typeof consent.status !== 'string') return false;
  return true;
}

export default function ConsentCard({ consent, userId, onAccept, onRefuse }) {
  if (!isConsentValid(consent)) {
    console.error('ConsentCard: consent invalide', consent);
    return (
      <View style={{ padding: 16, backgroundColor: '#fee2e2', borderRadius: 10, margin: 8 }}>
        <Text style={{ color: '#b91c1c', fontWeight: 'bold' }}>Erreur : consentement mal formé</Text>
        <Text style={{ color: '#b91c1c', fontSize: 12 }}><Text>{JSON.stringify(consent)}</Text></Text>
      </View>
    );
  }

  const isInitiator = consent.userId === userId;
  const isPartner = consent.partnerId === userId;

  const statusColor =
    consent.status === 'PENDING' ? '#F59E42' :
    consent.status === 'ACCEPTED' ? '#22C55E' :
    consent.status === 'REFUSED' ? '#EF4444' : '#64748b';
  const statusIcon =
    consent.status === 'PENDING' ? 'hourglass-outline' :
    consent.status === 'ACCEPTED' ? 'checkmark-circle-outline' :
    consent.status === 'REFUSED' ? 'close-circle-outline' : 'help-circle-outline';

  // Correction : toujours string pour message
  const message = safeText(consent.message, 'message');
  const summary = safeText(getSummary(consent, userId), 'summary');

  // Correction : toujours string pour user/partner label
  const userLabel = safeText(getAvatarLabel(isInitiator, consent.user, 'Moi'), 'userLabel');
  const partnerLabel = safeText(getAvatarLabel(isPartner, consent.partner, 'Partenaire'), 'partnerLabel');

  function handleAccept(consent, onAccept) {
    LocalAuthentication.authenticateAsync({ promptMessage: 'Validez avec votre empreinte digitale' })
      .then(result => {
        if (!result.success) throw new Error('Validation biométrique requise');
        return acceptConsent(consent.id);
      })
      .then(() => {
        if (onAccept) onAccept(consent);
      })
      .catch(err => {
        alert(err.message || 'Erreur lors de l’acceptation du consentement');
      });
  }

  function handleRefuse(consent, onRefuse) {
    LocalAuthentication.authenticateAsync({ promptMessage: 'Validez avec votre empreinte digitale' })
      .then(result => {
        if (!result.success) throw new Error('Validation biométrique requise');
        return refuseConsent(consent.id);
      })
      .then(() => {
        if (onRefuse) onRefuse(consent);
      })
      .catch(err => {
        alert(err.message || 'Erreur lors du refus du consentement');
      });
  }

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>  
      {/* Affiche l'emoji et le type s'ils existent */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {!!consent.emoji && <Text style={styles.emoji}><Text>{safeText(consent.emoji, 'emoji')}</Text></Text>}
        {!!consent.type && <Text style={styles.type}><Text>{safeText(consent.type, 'type')}</Text></Text>}
      </View>
      {/* Ligne avatars + état */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: consent.user?.avatarUrl || consent.user?.photoUrl || consent.user?.photo || 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.avatarLabel}><Text>{userLabel}</Text></Text>
        </View>
        <View style={styles.lineWithIcon}>
          <View style={styles.line} />
          <View style={styles.stateIconCircle}>
            <Ionicons name={statusIcon} size={26} color={statusColor} />
          </View>
          <View style={styles.line} />
        </View>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: consent.partner?.avatarUrl || consent.partner?.photoUrl || consent.partner?.photo || 'https://randomuser.me/api/portraits/women/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.avatarLabel}><Text>{partnerLabel}</Text></Text>
        </View>
      </View>

      {/* Bloc résumé/message/date */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}><Text>{summary}</Text></Text>
        {/* Correction : n'affiche le message QUE si c'est une string non vide */}
        {typeof message === 'string' && message.trim() !== '' && message !== 'N/A' && (
          <Text style={styles.messageText}><Text>{`💬 "${message}"`}</Text></Text>
        )}
        <Text style={styles.dateText}><Text>{`🗓️ ${formatDate(consent.createdAt)}`}</Text></Text>
      </View>

      {/* Boutons d'action selon statut */}
      {consent.status === 'PENDING' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonAccept]} onPress={() => handleAccept(consent, onAccept)}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionTextAccept}><Text>Accepter</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonRefuse]} onPress={() => handleRefuse(consent, onRefuse)}>
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionTextRefuse}><Text>Refuser</Text></Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // --- Social Feed Style ---
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 26,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: '#6366f1',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    alignItems: 'stretch',
    borderWidth: 1.7,
    borderColor: '#e0e7ff',
    minHeight: 120,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    marginBottom: 22,
    marginTop: 0,
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
    marginBottom: 2,
    backgroundColor: '#e0e7ff',
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
    alignSelf: 'stretch',
    borderWidth: 1.2,
    borderColor: '#e0e7ff',
    shadowColor: '#6366f1',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    marginLeft: 0,
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 3 },
  },
  actionButtonAccept: {
    backgroundColor: '#6366f1', // couleur principale
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginLeft: 0,
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 3 },
  },
  actionButtonRefuse: {
    backgroundColor: '#e5e7eb', // gris doux
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginLeft: 0,
    elevation: 2,
    shadowColor: '#6366f1',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
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
// --- Social Feed Style END ---
});