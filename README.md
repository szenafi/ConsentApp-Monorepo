# ConsentApp Project

ConsentApp est une application permettant de gérer des consentements entre utilisateurs. Le projet comporte deux parties :

- **app-frontend** : l'application mobile React Native (Expo).
- **app-backend** : l'API Node.js/Express qui gère les utilisateurs, les consentements, les paiements Stripe et les notifications.

## Installation

Clonez le dépôt puis installez les dépendances de chaque partie :

```bash
git clone <URL-du-dépôt>
cd ConsentApp-Monorepo/app-backend
npm install
cd ../app-frontend
npm install
```

## Démarrage

Lancez d'abord le backend puis le frontend :

```bash
# Backend
cd app-backend
node server.js

# Frontend
cd ../app-frontend
npm start
```

## Fonctionnalités principales

- Authentification par email et Google
- Création et gestion des consentements
- Achats de crédits via Stripe
- Notifications en temps réel

