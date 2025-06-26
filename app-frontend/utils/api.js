import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_BASE_URL } from '../constants';

// Instance principale pour les routes sous /api
// Timeout augmenté pour gérer le cold start de l'API hébergée sur Render
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Instance pour les routes racines (e.g. /test-db)
const rootApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Intercepteur : injecte le token dans chaque requête API
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Erreur lors de la récupération du token dans SecureStore :', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ----------- FONCTIONS UTILISATEUR ET AUTH -----------

// Connexion utilisateur
export async function login({ email, password }) {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // { token, user }
  } catch (error) {
    if (error.response?.data?.message?.toLowerCase().includes('invalid credentials')) {
      throw new Error('Invalid credentials');
    } else {
      throw new Error(error.response?.data?.message || 'Erreur lors de la connexion');
    }
  }
}

// ✅ Inscription avec photo (FormData)
export async function signupWithPhoto({
  email,
  password,
  firstName,
  lastName,
  dateOfBirth,
  photoUrl,
}) {
  const payload = {
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    photoUrl,
  };

  try {
    // Remplace localhost par l'IP de l'ordinateur si nécessaire
    let signupUrl = `${API_URL}/auth/signup`;
    if (signupUrl.includes('localhost')) {
      const host = Constants.expoConfig?.hostUri?.split(':')[0];
      if (host) {
        signupUrl = signupUrl.replace('localhost', host);
      }
    }

    const response = await axios.post(signupUrl, payload, {
      timeout: 60000,
    });

    const { token, user } = response.data;
    await SecureStore.setItemAsync('authToken', token);
    return { token, user };
  } catch (error) {
    console.error('Erreur signupWithPhoto:', error.message);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Erreur lors de l’inscription');
    } else {
      throw new Error('Erreur réseau ou timeout');
    }
  }
}

// Infos utilisateur connecté
export async function fetchUserInfo(passedToken) {
  try {
    if (passedToken) {
      api.defaults.headers.common.Authorization = `Bearer ${passedToken}`;
    }
    const res = await api.get('/user/info', { timeout: 60000 });
    return res.data;
  } catch (error) {
    console.error('fetchUserInfo', error.message);
    throw new Error('Impossible de récupérer les infos utilisateur');
  }
}

// Mise à jour du profil
export async function updateProfile(data) {
  const res = await api.put('/user/profile', data);
  return res.data;
}

// Recherche utilisateur
export async function searchUsers(q) {
  const res = await api.get(`/user/search?query=${encodeURIComponent(q)}`);
  return res.data;
}

// ----------- CONSENTEMENTS -----------

export async function getConsentCharter() {
  const res = await api.get('/consent/charter');
  return res.data;
}

export async function createConsent(payload) {
  const res = await api.post('/consent', payload);
  return res.data;
}

export async function acceptConsent(consentId) {
  const res = await api.put(`/consent/${consentId}/accept-partner`);
  return res.data;
}

export async function refuseConsent(consentId) {
  const res = await api.put(`/consent/${consentId}/refuse-partner`);
  return res.data;
}

export async function confirmConsentBiometric(consentId, userId) {
  const res = await api.put(`/consent/${consentId}/confirm-biometric`, { userId });
  return res.data;
}

export async function getConsentHistory() {
  const res = await api.get('/consent/history');
  return res.data;
}

// ----------- PAIEMENT -----------

export async function createPaymentSheet(quantity) {
  try {
    const response = await api.post('/packs/payment-sheet', { quantity });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la création du Payment Sheet');
  }
}

// ----------- TEST -----------

export async function testDB() {
  const res = await rootApi.get('/test-db');
  return res.data;
}

// ----------- EXPORTS -----------

export default api;
export { api, rootApi };
