# 🏢 PME 360 - Plateforme d'Entraide pour PME

PME 360 est une plateforme complète de collaboration et d'entraide dédiée aux Petites et Moyennes Entreprises (PME). Elle permet aux entrepreneurs de se connecter, partager des opportunités d'affaires, organiser des événements, et accéder à une bibliothèque de ressources partagées.

## 🌟 Fonctionnalités Principales

### 👥 **Gestion des Utilisateurs**
- Système d'authentification sécurisé avec JWT
- Profils utilisateurs (PME, Consultant, Investisseur, Admin)
- Gestion des permissions et rôles

### 💬 **Système de Messagerie**
- Messagerie sécurisée entre utilisateurs
- Historique des conversations
- Interface intuitive et responsive

### 🏢 **Marketplace d'Opportunités**
- Publication d'opportunités d'affaires
- Système de candidatures
- Filtrage par type (Financement, Partenariat, Contrat, etc.)
- Suivi des candidatures

### 📅 **Gestion d'Événements**
- Organisation d'événements professionnels
- Système d'inscription
- Gestion de la capacité
- Événements virtuels et physiques

### 📚 **Bibliothèque de Ressources**
- Partage de documents et ressources
- Upload de fichiers avec validation
- Contenu premium et gratuit
- Système de tags et catégories

### 🔔 **Notifications Temps Réel**
- WebSocket pour les notifications instantanées
- Notifications navigateur
- Centre de notifications intégré

### 📊 **Analytics Avancés**
- Tableau de bord avec métriques clés
- Suivi de l'activité utilisateur
- Métriques de performance
- Rapports d'engagement

## 🛠️ Stack Technique

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de données**: SQLite avec Prisma ORM
- **Authentification**: JWT avec refresh tokens
- **Temps réel**: WebSocket
- **Upload**: Cloudinary CDN
- **Sécurité**: Rate limiting, validation, audit trails

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **État**: Context API
- **HTTP**: Fetch API avec intercepteurs
- **Notifications**: WebSocket + Browser Notifications

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn
- Git

### 1. Cloner le Repository
```bash
git clone https://github.com/[votre-username]/pme-360.git
cd pme-360
```

### 2. Installation Backend
```bash
cd pme-360-backend
npm install

# Générer la base de données
npx prisma generate
npx prisma db push

# Démarrer le serveur backend
npm run dev
```

Le backend sera disponible sur `http://localhost:3000`

### 3. Installation Frontend
```bash
cd ../pme-360-frontend
npm install

# Démarrer le serveur frontend
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

## 🔧 Configuration

### Variables d'Environnement Backend
Créer un fichier `.env` dans `pme-360-backend/`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Configuration Frontend
Le frontend se connecte automatiquement au backend sur `http://localhost:3000`.

## 📚 API Documentation

Une fois le backend démarré, la documentation Swagger est disponible sur:
`http://localhost:3000/api-docs`

### Endpoints Principaux
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/login` - Connexion
- `GET /users` - Liste des utilisateurs
- `GET /messages` - Messages utilisateur
- `GET /opportunities` - Opportunités d'affaires
- `GET /events` - Événements
- `GET /resources` - Ressources partagées
- `GET /notifications` - Notifications utilisateur

## 🧪 Tests

### Backend
```bash
cd pme-360-backend
npm test
```

### Frontend
```bash
cd pme-360-frontend
npm test
```

## 🚀 Déploiement

### Production avec Docker
```bash
# Build et démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d
```

### Variables d'Environnement Production
- Configurer PostgreSQL au lieu de SQLite
- Utiliser Redis pour le cache
- Configurer Nginx comme reverse proxy

## 📁 Structure du Projet

```
pme-360/
├── pme-360-backend/          # API Backend
│   ├── src/
│   │   ├── controllers/      # Contrôleurs API
│   │   ├── services/         # Logique métier
│   │   ├── middleware/       # Middlewares Express
│   │   ├── validation/       # Schémas Zod
│   │   └── prisma/          # Configuration base de données
│   ├── tests/               # Tests backend
│   └── docs/               # Documentation API
├── pme-360-frontend/        # Application React
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── utils/          # Utilitaires
│   └── public/             # Fichiers statiques
├── docker-compose.yml       # Configuration Docker
└── README.md               # Documentation
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème:
- Créer une issue sur GitHub
- Consulter la documentation API
- Vérifier les logs de l'application

## 🎯 Fonctionnalités Futures

- [ ] Application mobile (React Native)
- [ ] Intégration calendrier (Google Calendar/Outlook)
- [ ] Système de paiement intégré
- [ ] Chat vidéo intégré
- [ ] Machine learning pour les recommandations
- [ ] API publique pour intégrations tierces
- [ ] Support multi-langues
- [ ] Mode offline pour mobile

## 📊 Statistiques du Projet

- **Backend**: ~2000 lignes de TypeScript
- **Frontend**: ~3000 lignes de React/TypeScript  
- **Base de données**: 12 tables avec relations
- **API**: 25+ endpoints documentés
- **Fonctionnalités**: 8 modules principaux
- **Sécurité**: JWT, validation, rate limiting

---

Développé avec ❤️ pour la communauté des PME françaises.