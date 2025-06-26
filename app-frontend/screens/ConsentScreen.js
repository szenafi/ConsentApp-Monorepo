// /ConsentApp/screens/ConsentScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth as useBiometricAuth } from '../utils/biometric'; // Importer le hook de biometric.js
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants';
import { api } from '../utils/api';
import { useRouter } from 'expo-router';

export default function ConsentScreen() {
  const [partnerEmail, setPartnerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { authenticate } = useBiometricAuth(); // Utiliser le hook biometric
  const router = useRouter();

  const handleCreateConsent = async () => {
    if (!partnerEmail || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    // Validation biométrique OBLIGATOIRE avant envoi
    const authSuccess = await authenticate();
    if (!authSuccess) {
      Alert.alert(
        'Biométrie requise',
        'Vous devez valider avec votre empreinte digitale pour envoyer une demande de consentement.'
      );
      return;
    }
    await sendConsentRequest();
  };

  const sendConsentRequest = async () => {
    setLoading(true);
    const partnerName = partnerEmail.split('@')[0];
    try {
      const consentData = { message, dateTime: dateTime || "" };
      await api.post('/api/consent', { partnerEmail, consentData });
      router.replace({ pathname: '/dashboard', params: { celebrate: '1', partnerName } });
    } catch (error) {
      const serverMessage = error.response?.data?.error || '';
      if (serverMessage.includes('prisma.notification.create')) {
        console.warn('Notification error ignored:', serverMessage);
        router.replace({ pathname: '/dashboard', params: { celebrate: '1', partnerName } });
      } else {
        console.error('Erreur lors de la création du consentement :', error.response?.data || error.message);
        Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création du consentement');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un Consentement</Text>
      <TextInput
        style={styles.input}
        placeholder="Email du partenaire"
        value={partnerEmail}
        onChangeText={setPartnerEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Message (ex. : détails du consentement)"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Date et heure (optionnel, ex. : 2025-04-03 18:00)"
        value={dateTime}
        onChangeText={setDateTime}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateConsent} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Envoyer la demande'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontLarge,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontMedium,
    color: '#fff',
  },
});