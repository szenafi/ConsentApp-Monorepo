ConsentApp Project

ConsentApp est une application permettant de gérer des consentements entre utilisateurs. Le projet comporte deux parties :

app-frontend : l'application mobile React Native (Expo).

app-backend : l'API Node.js/Express qui gère les utilisateurs, les consentements, les paiements Stripe et les notifications.

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

Notifications en temps réel

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

Frontend (.env dans app-frontend ou directement dans app/config.js selon ton approche)

API_URL=http://localhost:5000
STRIPE_PUBLISHABLE_KEY=<clé-publiable-stripe>

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

Auteurs

🧐 Chef de projet : Said Zenafi

💻 Développement : à compléter

Licence

Ce projet est sous licence MIT.