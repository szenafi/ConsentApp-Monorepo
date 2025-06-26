// /ConsentApp/utils/biometric.js
import { useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkBiometricSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  };

  const authenticate = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    const biometricSupported = await checkBiometricSupport();
    if (!biometricSupported) {
      setIsAuthenticated(true); // Pas de biométrie disponible, on passe
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Vérifiez votre identité',
      fallbackLabel: 'Utiliser le mot de passe',
    });

    setIsAuthenticated(result.success);
    return result.success;
  };

  const login = async (token) => {
    await SecureStore.setItemAsync('authToken', token);
    setIsAuthenticated(true); // Met à jour l’état après connexion réussie
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, authenticate, login, logout };
};