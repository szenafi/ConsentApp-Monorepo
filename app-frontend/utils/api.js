import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_BASE_URL } from '../constants';

// Instance principale pour les routes sous /api
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Instance pour les routes racines (e.g. /test-db)
const rootApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : injecte le token dans chaque requête API (instance api)
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
    console.error('Erreur Axios :', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// ----------- FONCTIONS UTILISATEUR ET AUTH -----------

// Test la connexion DB (route racine)
export async function testDB() {
  const res = await rootApi.get('/test-db');
  return res.data;
}

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

// Inscription utilisateur
export async function signup({ firstName, lastName, email, password }) {
  const payload = { firstName, email, password };
  if (lastName) payload.lastName = lastName;
  try {
    const res = await api.post('/auth/signup', payload);
    return res.data; // { token, user }
  } catch (error) {
    if (error.response?.data?.error?.includes('Unique constraint failed')) {
      throw new Error("Cet email est déjà utilisé. Veuillez en choisir un autre.");
    } else if (error.response?.data?.message?.includes('validation')) {
      throw new Error("Certains champs sont manquants ou invalides.");
    } else {
      throw new Error(error.response?.data?.message || 'Erreur lors de l’inscription');
    }
  }
}

// Infos utilisateur connecté
export async function fetchUserInfo(passedToken) {
  if (passedToken) {
    api.defaults.headers.common.Authorization = `Bearer ${passedToken}`;
  }
  const res = await api.get('/user/info');
  return res.data;
}

// Mise à jour du profil
export async function updateProfile(data) {
  const res = await api.put('/user/profile', data);
  return res.data;
}

// ----------- RECHERCHE UTILISATEUR MODERNE -----------
export async function searchUsers(q) {
  const res = await api.get(`/user/search?query=${encodeURIComponent(q)}`);
  console.log("Résultat de la recherche API :", res.data); // log utile
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

// Accepter un consentement (PARTENAIRE)
export async function acceptConsent(consentId) {
  const res = await api.put(`/consent/${consentId}/accept-partner`);
  return res.data;
}

// Refuser un consentement (PARTENAIRE)
export async function refuseConsent(consentId) {
  const res = await api.put(`/consent/${consentId}/refuse-partner`);
  return res.data;
}

// Confirmer biométriquement (INITIATEUR OU PARTENAIRE)
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

// ----------- EXPORTS -----------

export default api;
export { api, rootApi };
