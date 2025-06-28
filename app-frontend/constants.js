// ConsentAPP/app-frontend/constants.js

// URL de base de votre backend (sans suffixe)
// Permet de surcharger l'URL du backend via une variable d'environnement
// EXPO_PUBLIC_API_BASE_URL pour Expo (voir README).
import Constants from 'expo-constants';

// Détermine l'URL de base du backend.
// 1. Si EXPO_PUBLIC_API_BASE_URL est défini, on l'utilise.
// 2. Sinon, en développement, on essaie d'utiliser l'IP de l'ordinateur
//    (via expoConfig.hostUri) sur le port 8080.
// 3. À défaut, on tombe sur l'instance Render publique.
//    (nommée "consentapp-monorepo" dans render.yaml)
let fallbackBase = 'https://consentapp-monorepo.onrender.com';
if (
  !process.env.EXPO_PUBLIC_API_BASE_URL &&
  process.env.EXPO_USE_LOCAL_BACKEND === 'true'
) {
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost) {
    fallbackBase = `http://${devHost}:8080`;
  }
}

// Base définie par l'environnement ou fallback
const rawBase = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBase;

// Nettoie l'URL en supprimant un éventuel suffixe /api ou un slash final
let sanitizedBase = rawBase.replace(/\/$/, '');
if (sanitizedBase.endsWith('/api')) {
  sanitizedBase = sanitizedBase.slice(0, -4);
}

export const API_BASE_URL = sanitizedBase;

// URL de l’API (préfixe /api)
export const API_URL = `${API_BASE_URL}/api`;

// Clé Stripe publiable (peut être surchargée par EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY)
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51P5rcLA5nUL3grmuCdq4ktxeMp9RE7nKYRvcl4f7sYRfvyXBbS1bUg515Cni9MoeIlEg9Vo9YXxaAx5rhr2huM2b00Q5x9Dmli';

// Placeholder pour les avatars si l'utilisateur n'a pas de photo
export const DEFAULT_AVATAR = 'https://placehold.co/100x100?text=Avatar';

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#F5A623',
  success: '#34C759',
  danger: '#FF3B30',
  background: '#F7F7F7',
  text: '#333333',
};

export const SIZES = {
  padding: 16,
  radius: 12,
  fontSmall: 14,
  fontMedium: 16,
  fontLarge: 20,
};
