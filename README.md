# PME 360 Backend API

![PME 360 Logo](https://img.shields.io/badge/PME-360-blue)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![Express](https://img.shields.io/badge/Express-4.21%2B-lightgrey)
![Prisma](https://img.shields.io/badge/Prisma-6.13%2B-indigo)

API complète pour la plateforme PME 360 - Écosystème d'entraide pour PME.

## 🚀 Fonctionnalités

### 🔐 Authentification & Sécurité
- **JWT Authentication** : Tokens d'accès et de rafraîchissement
- **Rate Limiting** : Protection contre les attaques DoS
- **Helmet Security** : Headers de sécurité HTTP
- **Attack Detection** : Détection automatique des tentatives malveillantes
- **Validation Zod** : Validation stricte de toutes les entrées
- **Audit Logging** : Traçabilité complète des actions

### 👥 Gestion des Utilisateurs
- **Profils Multi-Types** : STARTUP, EXPERT, MENTOR, INVESTOR, etc.
- **Authentification sécurisée** : Hash bcrypt, validation email
- **Gestion des profils** : Mise à jour, recherche, filtrage
- **Système de permissions** : Contrôle d'accès par rôles

### 💬 Système de Messagerie
- **Messages privés** : Communication entre utilisateurs
- **Types de messages** : TEXT, FILE, IMAGE, DOCUMENT
- **Conversations** : Historique des échanges
- **Notifications temps réel** : WebSocket intégré

### 🏢 Marketplace d'Opportunités
- **Types d'opportunités** : FUNDING, TALENT, SERVICE, PARTNERSHIP
- **Candidatures** : Système de postulation complet
- **Filtres avancés** : Localisation, budget, type, etc.
- **Matching intelligent** : Recommandations personnalisées

### 📅 Événements & Webinaires
- **Événements variés** : CONFERENCE, WORKSHOP, NETWORKING, MEETUP
- **Inscriptions** : Gestion des participants
- **Format hybride** : Présentiel et en ligne
- **Notifications** : Rappels automatiques

### 📚 Bibliothèque de Ressources
- **Types de ressources** : GUIDE, TEMPLATE, TOOL, ARTICLE, VIDEO
- **Upload sécurisé** : Intégration Cloudinary
- **Catégorisation** : Tags et filtres
- **Accès premium** : Ressources payantes

### 🔔 Notifications Temps Réel
- **WebSocket** : Notifications instantanées
- **Types multiples** : MESSAGE, CONNECTION_REQUEST, etc.
- **Préférences** : Personnalisation par utilisateur
- **Historique** : Suivi des notifications

### 📊 Analytics & Métriques
- **Métriques utilisateurs** : Activité, engagement
- **Statistiques plateforme** : KPIs globaux
- **Tendances** : Analyse temporelle
- **Tableaux de bord** : Interface admin

### 📁 Gestion des Fichiers
- **Upload sécurisé** : Validation MIME, taille
- **Stockage cloud** : Intégration Cloudinary
- **Images responsives** : Génération automatique
- **Gestion des quotas** : Limites par utilisateur

### 🔍 Monitoring & Santé
- **Health Checks** : Surveillance système complète
- **Métriques performance** : CPU, mémoire, disque
- **Alertes automatiques** : Seuils configurables
- **Logs structurés** : Winston + rotation

## 🏗️ Architecture Technique

### Stack Technologique
- **Runtime** : Node.js 20+
- **Framework** : Express.js 4.21+
- **Langage** : TypeScript 5.0+
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **ORM** : Prisma 6.13+
- **Authentification** : JWT + bcrypt
- **Validation** : Zod
- **Tests** : Jest + Supertest
- **Documentation** : Swagger/OpenAPI
- **Logging** : Winston
- **Upload** : Cloudinary
- **WebSocket** : ws

### Structure du Projet
```
src/
├── config/          # Configuration (DB, Redis, Logger, Swagger)
├── controllers/     # Contrôleurs HTTP
├── middleware/      # Middleware (Auth, Security, Validation)
├── services/        # Logique métier
├── utils/           # Utilitaires (JWT, Password)
├── validation/      # Schémas Zod
├── types/           # Types TypeScript
└── routes/          # Routes Express

tests/
├── auth.test.ts     # Tests d'authentification
├── services.test.ts # Tests des services
├── utils.test.ts    # Tests des utilitaires
└── setup.ts         # Configuration des tests
```

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 20+ et npm
- SQLite (développement) ou PostgreSQL (production)
- Compte Cloudinary (pour les uploads)

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd pme-360-backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Générer le client Prisma
npm run prisma:generate

# Configurer la base de données
npm run prisma:push
npm run prisma:seed

# Démarrer en développement
npm run dev
```

### Variables d'Environnement
```bash
# Application
NODE_ENV=development
PORT=3000

# Base de données
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 🧪 Tests

### Exécution des Tests
```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage

# Tests verbeux
npm run test:verbose
```

### Structure des Tests
- **Tests d'authentification** : Registration, login, JWT
- **Tests de services** : Logique métier, base de données
- **Tests d'utilitaires** : JWT, hachage de mots de passe
- **Tests d'intégration** : Endpoints HTTP complets

## 📖 Documentation API

### Swagger UI
Une fois le serveur démarré, accédez à la documentation interactive :
- **URL** : http://localhost:3000/docs
- **JSON** : http://localhost:3000/swagger.json

### Endpoints Principaux

#### 🔐 Authentification
```
POST   /api/v1/auth/register     # Inscription
POST   /api/v1/auth/login        # Connexion
GET    /api/v1/auth/profile      # Profil utilisateur
POST   /api/v1/auth/refresh      # Rafraîchir le token
POST   /api/v1/auth/logout       # Déconnexion
```

#### 👥 Utilisateurs
```
GET    /api/v1/users             # Liste des utilisateurs
GET    /api/v1/users/:id         # Profil utilisateur
PUT    /api/v1/users/me          # Mettre à jour son profil
POST   /api/v1/users/connect     # Demande de connexion
```

#### 💬 Messages
```
GET    /api/v1/messages          # Mes messages
POST   /api/v1/messages          # Envoyer un message
GET    /api/v1/messages/:id      # Détails d'un message
PUT    /api/v1/messages/:id/read # Marquer comme lu
```

#### 🏢 Opportunités
```
GET    /api/v1/opportunities     # Liste des opportunités
POST   /api/v1/opportunities     # Créer une opportunité
GET    /api/v1/opportunities/:id # Détails d'une opportunité
POST   /api/v1/opportunities/:id/apply # Postuler
```

#### 📅 Événements
```
GET    /api/v1/events            # Liste des événements
POST   /api/v1/events            # Créer un événement
GET    /api/v1/events/:id        # Détails d'un événement
POST   /api/v1/events/:id/register # S'inscrire
```

#### 📚 Ressources
```
GET    /api/v1/resources         # Liste des ressources
POST   /api/v1/resources         # Créer une ressource
GET    /api/v1/resources/:id     # Détails d'une ressource
POST   /api/v1/resources/:id/view # Marquer comme vue
```

#### 🔔 Notifications
```
GET    /api/v1/notifications     # Mes notifications
POST   /api/v1/notifications     # Créer une notification
PUT    /api/v1/notifications/:id/read # Marquer comme lue
DELETE /api/v1/notifications/:id # Supprimer
```

## 🛠️ Scripts NPM

```bash
npm run build         # Compiler TypeScript
npm run start         # Démarrer en production
npm run dev           # Démarrer en développement
npm run test          # Exécuter les tests
npm run test:coverage # Tests avec couverture
npm run lint          # Linter le code
npm run prisma:studio # Interface Prisma
npm run prisma:push   # Pousser le schéma DB
npm run prisma:seed   # Seeder la DB
npm run docker:up     # Démarrer les services Docker
npm run clean         # Nettoyer le build
```

## 📊 Métriques & Performance

### Rate Limiting
- **Global** : 100 requêtes / 15 minutes
- **Auth** : 5 tentatives / 15 minutes
- **Upload** : 10 fichiers / minute
- **Messages** : 20 messages / minute
- **Analytics** : 10 requêtes / 5 minutes

### Quotas Fichiers
- **Avatar** : 5MB max, formats : JPG, PNG, WebP
- **Documents** : 10MB max, formats : PDF, DOC, DOCX
- **Images** : 5MB max, formats : JPG, PNG, WebP, GIF

### Performance
- **Réponse moyenne** : < 200ms
- **Base de données** : < 100ms
- **Upload fichiers** : < 2s (5MB)
- **WebSocket** : < 50ms latence

## 🔒 Sécurité

### Mesures Implémentées
- **Helmet** : Headers de sécurité HTTP
- **CORS** : Cross-Origin Resource Sharing configuré
- **Rate Limiting** : Protection DoS/DDoS
- **Input Validation** : Zod schemas sur tous les endpoints
- **SQL Injection** : Protection Prisma ORM
- **XSS Protection** : Sanitisation des entrées
- **JWT Security** : Tokens signés et expiration
- **Password Hashing** : bcrypt avec salt
- **File Upload** : Validation MIME et taille
- **Audit Logging** : Traçabilité complète

### Headers de Sécurité
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)
- Referrer-Policy

## 🤝 Contribution

### Workflow de Développement
1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Développer avec tests
4. Commit avec messages conventionnels
5. Push et créer une Pull Request

### Standards de Code
- **TypeScript** : Types stricts activés
- **ESLint** : Règles strictes
- **Tests** : Couverture > 80%
- **Documentation** : Swagger pour tous les endpoints
- **Sécurité** : Audit de toutes les entrées

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Documentation** : http://localhost:3000/docs
- **Issues** : GitHub Issues
- **Email** : support@pme360.com

---

**PME 360** - Écosystème d'entraide pour PME 🚀