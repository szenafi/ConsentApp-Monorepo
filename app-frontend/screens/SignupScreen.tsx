import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ToastAndroid, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { API_URL, COLORS, SIZES } from '../constants';
import { useRouter } from 'expo-router';
import ImagePickerInput from '../components/forms/ImagePickerInput';
import DatePickerInput from '../components/forms/DatePickerInput';
import PasswordInput from '../components/forms/PasswordInput';
import { registerSchema } from '../lib/validation/registerSchema';
import { differenceInYears } from 'date-fns';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    try {
      const parsed = registerSchema.parse({
        email,
        password,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ?? undefined,
        photo: photo ?? undefined,
      });

      if (parsed.dateOfBirth && differenceInYears(new Date(), parsed.dateOfBirth) < 18) {
        throw new Error('Vous devez avoir au moins 18 ans');
      }

      const formData = new FormData();
      formData.append('email', parsed.email);
      formData.append('password', parsed.password);
      formData.append('firstName', parsed.firstName);
      if (parsed.lastName) formData.append('lastName', parsed.lastName);
      if (parsed.dateOfBirth) formData.append('dateOfBirth', parsed.dateOfBirth.toISOString());
      if (photo) {
        const name = photo.split('/').pop() || 'photo.jpg';
        formData.append('photo', { uri: photo, name, type: 'image/jpeg' } as any);
      }

      const response = await axios.post(`${API_URL}/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Erreur inconnue lors de l’inscription');
      }

      await SecureStore.setItemAsync('authToken', token);

      // Auto-login
      try {
        await login(email, password);
        ToastAndroid.show('Inscription réussie', ToastAndroid.SHORT);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        router.replace('/dashboard');
      } catch (loginError) {
        ToastAndroid.show('Inscription ok, connexion impossible', ToastAndroid.SHORT);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erreur lors de l’inscription :', error?.response?.data || error.message);
      const message =
        error?.response?.status === 409
          ? 'Email déjà utilisé'
          : error.message || 'Erreur lors de l’inscription';
      ToastAndroid.show(message, ToastAndroid.SHORT);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <ImagePickerInput value={photo} onChange={setPhoto} />
      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <DatePickerInput value={dateOfBirth} onChange={setDateOfBirth} />
      <PasswordInput value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>S’inscrire</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLoginNavigation}>
        <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
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
    borderRadius: 20,
    marginBottom: SIZES.padding,
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontMedium,
    color: '#fff',
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});