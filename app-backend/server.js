// /ConsentApp/app-backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient, Prisma } = require('@prisma/client');
const { z } = require('zod');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CryptoJS = require('crypto-js');
const { OAuth2Client } = require('google-auth-library');

// Initialisation de l'application et Prisma
const app = express();
const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
  },
  log: ['error'],
});

// Configuration CORS
// En phase de développement on autorise toutes les origines. Il est préférable
// d'ajuster cette liste via la variable d'environnement CORS_ORIGIN en
// production.
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));

// Middleware pour le webhook Stripe (doit être avant express.json())
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('Webhook Stripe reçu:', event.type);
  } catch (err) {
    console.error('Erreur de vérification du webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userId = parseInt(paymentIntent.metadata.userId, 10);
      const quantity = parseInt(paymentIntent.metadata.packQuantity, 10);

      if (isNaN(userId) || isNaN(quantity)) {
        console.error('Metadata invalide:', paymentIntent.metadata);
        return res.status(400).json({ message: 'Metadata invalide' });
      }

      // Mise à jour du packQuantity après un paiement réussi
      const updatedPack = await prisma.$transaction(async (tx) => {
        const pack = await tx.packConsentement.findUnique({ where: { userId } });
        if (pack) {
          return await tx.packConsentement.update({
            where: { userId },
            data: { quantity: pack.quantity + quantity, purchasedAt: new Date() },
          });
        } else {
          return await tx.packConsentement.create({
            data: { userId, quantity, purchasedAt: new Date() },
          });
        }
      });
      console.log(`Pack mis à jour pour userId ${userId} après paiement:`, updatedPack);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Erreur traitement webhook:', error.message);
    res.status(500).json({ message: 'Erreur webhook', error: error.message });
  }
});

// Middleware JSON et urlencoded pour les autres routes (après le webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de validation Zod
const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    console.error('Erreur validation Zod:', error);
    res.status(400).json({ message: 'Erreur de validation', errors: error.errors });
  }
};

// Schémas Zod
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  photoUrl: z.string().optional().nullable(),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const consentSchema = z.object({
  partnerEmail: z.string().email(),
  consentData: z.object({
    message: z.string(),
    dateTime: z.string().optional().nullable(), // Accepte null ou une string
    emoji: z.string().optional(), // Ajouté pour wizard moderne
    type: z.string().optional(),  // Ajouté pour wizard moderne
  }),
});
const packPaymentSchema = z.object({
  quantity: z.number().int().positive(),
});

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log('Aucun token fourni dans la requête:', req.path, 'Headers:', req.headers);
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Erreur JWT:', err.message, 'Token:', token, 'Path:', req.path);
      return res.status(403).json({ message: 'Token invalide' });
    }
    console.log('Token valide pour', req.path, 'Utilisateur:', user);
    req.user = user;
    next();
  });
};

// Fonctions de chiffrement
const encrypt = (data) => CryptoJS.AES.encrypt(data, process.env.AES_SECRET_KEY).toString();
const decrypt = (ciphertext) => CryptoJS.AES.decrypt(ciphertext, process.env.AES_SECRET_KEY).toString(CryptoJS.enc.Utf8);

// Routes d'authentification
// Route d'inscription acceptant l'upload optionnel d'une photo de profil.
// Accepte également des données JSON classiques pour une meilleure
// compatibilité avec d'anciennes versions du frontend.
// Problème principal : l'erreur Zod indique que `email` et `password` sont undefined.
// Le code backend est bien écrit pour accepter du `multipart/form-data`, donc l'erreur vient du frontend.
// Cependant, voici quelques ajustements de robustesse à appliquer au backend.

// Correction recommandée : ajout d'une vérification plus stricte de la présence des champs requis 
// avant la validation Zod (optionnel mais améliore les logs)

// --- MODIFICATION LÀ OÙ SE TROUVE LA ROUTE POST /api/auth/signup ---

app.post('/api/auth/signup', async (req, res) => {
  console.log("🚀 Tentative de signup reçue !");
console.log("📦 Données reçues:", req.body);
console.log("🔑 JWT_SECRET défini ?", !!process.env.JWT_SECRET);
console.log("📸 Photo URL:", req.body.photoUrl);
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: 'Champs requis manquants',
        errors: [
          !req.body.email ? { path: ['email'], message: 'Requis' } : null,
          !req.body.password ? { path: ['password'], message: 'Requis' } : null,
        ].filter(Boolean),
      });
    }

    const parsed = signupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        password: hashedPassword,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
        photoUrl: parsed.photoUrl ?? null,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        photoUrl: user.photoUrl ?? '',
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Erreur de validation', errors: error.errors });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// --- FIN DE LA MODIFICATION ---



app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentative de login avec :', { email, password });
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, firstName: true, lastName: true },
    });
    if (!user) {
      console.log('Utilisateur non trouvé :', email);
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Mot de passe incorrect pour :', email);
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login réussi pour :', email, 'Token généré :', token);
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName ?? '', lastName: user.lastName ?? '' } });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Token Google manquant' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name,
          lastName: family_name,
          photoUrl: picture,
          password: '', // Pas de mot de passe pour les utilisateurs Google
          googleId: payload.sub
        },
        select: { id: true, email: true, firstName: true, lastName: true }
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }
    });
  } catch (error) {
    console.error('Erreur authentification Google:', error);
    res.status(500).json({ message: 'Erreur lors de l\'authentification Google', error: error.message });
  }
});

// Route pour récupérer les informations utilisateur
app.get('/api/user/info', authenticateToken, async (req, res) => {
  try {
    const [user, pack] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, firstName: true, lastName: true, dateOfBirth: true, photoUrl: true, stripeCustomerId: true, isSubscribed: true, subscriptionEndDate: true, score: true, badges: true, createdAt: true, updatedAt: true },
      }),
      prisma.packConsentement.findUnique({ where: { userId: req.user.id }, select: { quantity: true } }),
    ]);

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const response = {
      user: {
        ...user,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
        photoUrl: user.photoUrl ?? '',
        subscriptionEndDate: user.subscriptionEndDate?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      packQuantity: pack?.quantity ?? 0,
    };
    console.log('Réponse /user/info pour userId', req.user.id, ':', response);
    res.json(response);
  } catch (error) {
    console.error('Erreur user/info:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Nouvelle route pour récupérer les contacts de l'utilisateur
app.get('/api/user/contacts', authenticateToken, async (req, res) => {
  try {
    // Exemple simple : retourne tous les utilisateurs sauf l'utilisateur courant
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, email: true, firstName: true, lastName: true, photoUrl: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des contacts', error: error.message });
  }
});

/**
 * NOUVELLE ROUTE MODERNE DE RECHERCHE PARTENAIRE / AUTO-COMPLÉTION
 * Recherche sur prénom, nom, email, max 15 résultats, insensible à la casse.
 * Utilisable depuis le front pour search bar, auto-completion, etc.
 */
app.get('/api/user/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    console.log('[RECHERCHE] Utilisateur connecté:', req.user.id, '| Query:', query);

    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.json([]);
    }
    const results = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, email: true, firstName: true, lastName: true, photoUrl: true },
      take: 15,
      orderBy: { firstName: 'asc' }
    });
    console.log('[RECHERCHE] Résultats trouvés:', results.length);
    res.json(results);
  } catch (error) {
    console.error('Erreur recherche partenaire:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche', error: error.message });
  }
});


// Route pour créer un consentement (sécurisée et champs forcés)
app.post('/api/consent', authenticateToken, validate(consentSchema), async (req, res) => {
  try {
    const { partnerEmail, consentData } = req.body;
    const [partner, user, userPack] = await Promise.all([
      prisma.user.findUnique({ where: { email: partnerEmail }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: req.user.id } }),
      prisma.packConsentement.findUnique({ where: { userId: req.user.id } }),
    ]);
    if (!partner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }
    if (!user.isSubscribed && (!userPack || userPack.quantity <= 0)) {
      return res.status(400).json({ message: 'Aucun consentement disponible' });
    }
    const paymentStatus = user.isSubscribed ? 'COMPLETED' : 'PENDING';
    const encryptedData = encrypt(JSON.stringify(consentData));
    // Ajout des champs emoji et type dans la création du consentement
    const consent = await prisma.$transaction(async (tx) => {
      if (!user.isSubscribed && userPack) {
        await tx.packConsentement.update({
          where: { userId: req.user.id },
          data: { quantity: userPack.quantity - 1 },
        });
      }
      return await tx.consent.create({
        data: {
          userId: req.user.id,
          partnerId: partner.id,
          encryptedData: encryptedData,
          status: 'PENDING',
          paymentStatus,
          message: typeof consentData.message === 'string' ? consentData.message : '',
          createdAt: new Date(),
          emoji: typeof consentData.emoji === 'string' ? consentData.emoji : '',
          type: typeof consentData.type === 'string' ? consentData.type : '',
        },
      });
    });
    res.status(201).json({ message: 'Consentement créé', consentId: consent.id });
  } catch (error) {
    console.error('Erreur consent:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Nouvelle route : historique des consentements pour l'utilisateur connecté
app.get('/api/consent/history', authenticateToken, async (req, res) => {
  try {
    const consents = await prisma.consent.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { partnerId: req.user.id }
        ],
        deletedByInitiator: false,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        status: true,
        userId: true,
        partnerId: true,
        message: true,
        emoji: true,
        type: true,
        // encryptedData: true, // Ne pas exposer
        user: { select: { firstName: true, lastName: true, email: true, photoUrl: true } },
        partner: { select: { firstName: true, lastName: true, email: true, photoUrl: true } },
      },
    });

    // Sécurisation des champs dynamiques
    const safeConsents = consents.map(c => ({
      ...c,
      message: typeof c.message === 'string' ? c.message : '',
      emoji: typeof c.emoji === 'string' ? c.emoji : '',
      type: typeof c.type === 'string' ? c.type : '',
      user: {
        ...c.user,
        firstName: typeof c.user?.firstName === 'string' ? c.user.firstName : '',
        lastName: typeof c.user?.lastName === 'string' ? c.user.lastName : '',
        email: typeof c.user?.email === 'string' ? c.user.email : '',
        photoUrl: typeof c.user?.photoUrl === 'string' ? c.user.photoUrl : '',
      },
      partner: {
        ...c.partner,
        firstName: typeof c.partner?.firstName === 'string' ? c.partner.firstName : '',
        lastName: typeof c.partner?.lastName === 'string' ? c.partner.lastName : '',
        email: typeof c.partner?.email === 'string' ? c.partner.email : '',
        photoUrl: typeof c.partner?.photoUrl === 'string' ? c.partner.photoUrl : '',
      }
    }));

    res.json(safeConsents);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'historique", error: error.message });
  }
});

// Route pour supprimer un consentement
app.delete('/api/consent/:id', authenticateToken, async (req, res) => {
  try {
    const consentId = parseInt(req.params.id, 10);
    const consent = await prisma.consent.findUnique({ where: { id: consentId }, select: { userId: true } });
    if (!consent || consent.userId !== req.user.id) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    await prisma.consent.update({
      where: { id: consentId },
      data: { deletedByInitiator: true },
    });
    res.json({ message: 'Consentement supprimé' });
  } catch (error) {
    console.error('Erreur delete consent:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Routes pour accepter/refuser un consentement
app.put('/api/consent/:id/accept-partner', authenticateToken, async (req, res) => {
  try {
    const consentId = parseInt(req.params.id, 10);
    const consent = await prisma.consent.findUnique({ where: { id: consentId }, select: { partnerId: true } });
    if (!consent || consent.partnerId !== req.user.id) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    await prisma.consent.update({
      where: { id: consentId },
      data: { status: 'ACCEPTED', partnerConfirmed: true },
    });
    res.json({ message: 'Consentement accepté' });
  } catch (error) {
    console.error('Erreur accept consent:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.put('/api/consent/:id/refuse-partner', authenticateToken, async (req, res) => {
  try {
    const consentId = parseInt(req.params.id, 10);
    const consent = await prisma.consent.findUnique({ where: { id: consentId }, select: { partnerId: true } });
    if (!consent || consent.partnerId !== req.user.id) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    await prisma.consent.update({
      where: { id: consentId },
      data: { status: 'REFUSED', partnerConfirmed: false },
    });
    res.json({ message: 'Consentement refusé' });
  } catch (error) {
    console.error('Erreur refuse consent:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.put('/api/consent/:id/confirm-biometric', authenticateToken, async (req, res) => {
  try {
    const consentId = parseInt(req.params.id, 10);
    const { userId } = req.body;

    const consent = await prisma.consent.findUnique({
      where: { id: consentId },
      select: { userId: true, partnerId: true, initiatorConfirmed: true, partnerConfirmed: true, biometricValidated: true },
    });

    if (!consent) {
      return res.status(404).json({ message: 'Consentement non trouvé' });
    }

    const isInitiator = consent.userId === userId;
    const isPartner = consent.partnerId === userId;

    if (!isInitiator && !isPartner) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    const updateData = {};
    if (isInitiator) {
      updateData.initiatorConfirmed = true;
    } else if (isPartner) {
      updateData.partnerConfirmed = true;
    }

    // Si les deux parties ont confirmé, marquer la validation biométrique comme complète
    const bothConfirmed = (isInitiator && consent.partnerConfirmed) || (isPartner && consent.initiatorConfirmed);
    if (bothConfirmed) {
      updateData.biometricValidated = true;
      updateData.biometricValidatedAt = new Date();
    }

    const updatedConsent = await prisma.consent.update({
      where: { id: consentId },
      data: updateData,
    });



    res.json({ message: 'Validation biométrique enregistrée' });
  } catch (error) {
    console.error('Erreur confirm-biometric:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


// Route pour créer un PaymentIntent (avec mise à jour temporaire)
app.post('/api/packs/payment-sheet', authenticateToken, validate(packPaymentSchema), async (req, res) => {
  try {
    const { quantity } = req.body;
    const amountInCents = quantity === 1 ? 100 : 1000; // 1€ pour 1, 10€ pour 10

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, stripeCustomerId: true },
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: req.user.id },
        data: { stripeCustomerId },
      });
      console.log(`Nouveau client Stripe créé pour userId ${req.user.id}:`, stripeCustomerId);
    }

    // Mise à jour temporaire de quantity (à supprimer une fois le webhook corrigé)
    const updatedPack = await prisma.$transaction(async (tx) => {
      const pack = await tx.packConsentement.findUnique({ where: { userId: req.user.id } });
      if (pack) {
        return await tx.packConsentement.update({
          where: { userId: req.user.id },
          data: { quantity: pack.quantity + quantity, purchasedAt: new Date() },
        });
      } else {
        return await tx.packConsentement.create({
          data: { userId: req.user.id, quantity, purchasedAt: new Date() },
        });
      }
    });
    console.log(`Mise à jour temporaire quantity pour userId ${req.user.id} :`, updatedPack);

    const [ephemeralKey, paymentIntent] = await Promise.all([
      stripe.ephemeralKeys.create({ customer: stripeCustomerId }, { apiVersion: '2022-11-15' }),
      stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        customer: stripeCustomerId,
        automatic_payment_methods: { enabled: true },
        metadata: { userId: req.user.id.toString(), packQuantity: quantity.toString() },
      }),
    ]);

    const response = {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: stripeCustomerId,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    };
    console.log(`PaymentIntent créé pour userId ${req.user.id}, quantité: ${quantity}:`, response);
    res.json(response);
  } catch (error) {
    console.error('Erreur payment-sheet:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Routes de test
app.get('/test-db', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ take: 1, select: { id: true, email: true } });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur test-db:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.get('/test-stripe', async (req, res) => {
  try {
    const customers = await stripe.customers.list({ limit: 1 });
    res.json({ success: true, customers });
  } catch (error) {
    console.error('Erreur test-stripe:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} à ${new Date().toISOString()}`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
