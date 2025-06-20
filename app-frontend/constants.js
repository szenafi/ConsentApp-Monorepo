// ConsentAPP/app-frontend/constants.js

// URL de base de votre backend (sans suffixe)
// Permet de surcharger l'URL du backend via une variable d'environnement
// EXPO_PUBLIC_API_BASE_URL pour Expo (voir README).
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://app-backend-h0p5.onrender.com';

// URL de l’API (préfixe /api)
export const API_URL = `${API_BASE_URL}/api`;

// Clé Stripe publiable (peut être surchargée par EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY)
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51P5rcLA5nUL3grmuCdq4ktxeMp9RE7nKYRvcl4f7sYRfvyXBbS1bUg515Cni9MoeIlEg9Vo9YXxaAx5rhr2huM2b00Q5x9Dmli';

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
