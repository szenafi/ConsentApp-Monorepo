import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_BASE_URL } from '../constants';

// Instance principale pour les routes sous /api
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Instance pour les routes racines (e.g. /test-db)
const rootApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
export async function signupWithPhoto({ email, password, firstName, lastName, dateOfBirth, photo }) {
  const formData = new FormData();

  formData.append('email', email);
  formData.append('password', password);
  if (firstName) formData.append('firstName', firstName);
  if (lastName) formData.append('lastName', lastName);
  if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);

  if (photo && photo.uri) {
    formData.append('photo', {
      uri: photo.uri,
      name: photo.fileName || 'photo.jpg',
      type: photo.type || 'image/jpeg',
    });
  }

  try {
    const response = await axios.post(`${API_URL}/auth/signup`, formData, {
      headers: {
        // Ne surtout pas définir Content-Type ici !
        Accept: 'application/json',
      },
      timeout: 30000,
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
