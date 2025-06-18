ConsentApp Project

ConsentApp est une application permettant de gérer des consentements entre utilisateurs. Le projet comporte deux parties :

app-frontend : l'application mobile React Native (Expo).

app-backend : l'API Node.js/Express qui gère les utilisateurs, les consentements et les paiements Stripe.

Installation

Clonez le dépôt puis installez les dépendances de chaque partie :

git clone <URL-du-dépôt>
cd ConsentApp-Monorepo/app-backend
npm install
cd ../app-frontend
npm install

Démarrage

Lancez d'abord le backend puis le frontend :

# Backend
cd app-backend
node server.js

# Frontend
cd ../app-frontend
npm start

Fonctionnalités principales

Authentification par email et Google

Création et gestion des consentements

Achats de crédits via Stripe

Structure du projet

ConsentApp-Monorepo/
├── app-frontend/        # Application mobile (React Native + Expo)
│   ├── app/             # Routes (Expo Router)
│   ├── components/      # Composants UI réutilisables
│   ├── screens/         # Écrans principaux (Login, Dashboard, etc.)
│   ├── assets/          # Images, Lottie animations, icônes
│   └── README.md        # Documentation spécifique mobile
│
├── app-backend/         # API Express (Node.js)
│   ├── routes/          # Routes API (auth, consent, stripe, etc.)
│   ├── controllers/     # Logique métier
│   ├── models/          # Modèles Mongoose (MongoDB)
│   ├── config/          # Variables d'environnement, connexions
│   └── README.md        # Documentation spécifique backend
│
└── README.md            # (ce fichier) Présentation globale du projet

Dépendances principales

Frontend

React Native (via Expo)

Expo Router

React Navigation

Firebase Authentication

Stripe (via expo-stripe-payments)

Lottie pour animations

Backend

Express.js

MongoDB (via Mongoose)

Stripe

dotenv

jsonwebtoken

nodemailer

Variables d’environnement à configurer

Backend (.env à la racine de app-backend)

PORT=5000
MONGO_URI=<votre-URI-MongoDB>
JWT_SECRET=<votre-clé-secrète>
STRIPE_SECRET_KEY=<clé-secrète-stripe>

Frontend (.env dans app-frontend)


# Utilisé côté mobile
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<clé-publiable-stripe>

L'endpoint `/api/auth/signup` accepte aussi bien un corps JSON classique
qu'un `multipart/form-data` lorsqu'une photo est envoyée.

Tests

À mettre en place prochainement

Actuellement :

❌ npm test à la racine : package.json inexistant

❌ npm test dans app-backend : script de test manquant

❌ npm test dans app-frontend : script de test manquant

Limitations

Certaines requêtes réseau (Lottie/icons) peuvent être bloquées si l’environnement n’a pas accès à Internet :

assets10.lottiefiles.com

img.icons8.com

En cas d’erreur « Network Error » lors de l’inscription, assurez‑vous que
`EXPO_PUBLIC_API_BASE_URL` pointe vers une adresse accessible par votre
émulateur ou votre téléphone.

Auteurs

🧐 Chef de projet : Said Zenafi

💻 Développement : à compléter

Licence

Ce projet est sous licence MIT.