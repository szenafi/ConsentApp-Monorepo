import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { API_URL, COLORS, SIZES } from '../constants';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    try {
      const payload = { email, password, firstName };
      if (lastName) payload.lastName = lastName;

      // 1. Inscription
      const response = await axios.post(`${API_URL}/auth/signup`, payload);
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Erreur inconnue lors de l’inscription');
      }

      await SecureStore.setItemAsync('authToken', token);

      // 2. Auto-login
      try {
        await login(email, password);
        Alert.alert('Succès', 'Inscription et connexion réussies !');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        router.replace('/dashboard');
      } catch (loginError) {
        Alert.alert('Inscription réussie', "Connexion impossible après inscription. Veuillez vous connecter manuellement.");
        router.replace('/login');
      }

    } catch (error) {
      console.error('Erreur lors de l’inscription :', error?.response?.data || error.message);
      if (error?.response?.data?.error?.includes('Unique constraint failed')) {
        Alert.alert('Erreur', "Cet email est déjà utilisé. Veuillez en choisir un autre.");
      } else if (
        error?.response?.data?.message?.toLowerCase().includes('validation')
      ) {
        Alert.alert('Erreur', "Certains champs sont manquants ou invalides.");
      } else if (error?.response?.data?.message) {
        Alert.alert('Erreur', error.response.data.message);
      } else {
        Alert.alert('Erreur', error.message || 'Erreur lors de l’inscription');
      }
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
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Inscription...' : 'S’inscrire'}</Text>
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
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
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
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});
