# 📖 Documentation Swagger - Soluxury Dashboard Admin API

## 🚀 Intégration terminée

La documentation Swagger a été intégrée avec succès dans votre projet Soluxury Dashboard Admin. 

## 📋 Ce qui a été ajouté

### 1. **Configuration Swagger** (`src/config/swagger.js`)
- Configuration complète OpenAPI 3.0
- Définition des schémas réutilisables (User, Pack, Slot, Admin, etc.)
- Configuration de l'authentification JWT Bearer
- Serveurs de développement et production

### 2. **Intégration serveur** (`src/server.js`)
- Route `/api-docs` pour accéder à l'interface Swagger UI
- Import et configuration des specs Swagger

### 3. **Documentation des routes**
Routes documentées avec annotations Swagger complètes :

#### 🔐 **Authentification** (`/api/auth/*`)
- `POST /api/auth/login` - Connexion avec 2FA
- `POST /api/auth/verfieCode` - Vérification code OTP
- `GET /api/auth/isConnect` - Vérification connexion

#### 👥 **Gestion des utilisateurs** (`/api/admin/users/*`)
- `GET /api/admin/users` - Liste paginée des utilisateurs
- `PATCH /api/admin/users/{id}/block` - Bloquer/débloquer utilisateur
- `GET /api/admin/users/{id}/details` - Détails complets utilisateur
- `GET /api/admin/users/{id}/user_nfts` - NFTs d'un utilisateur
- `POST /api/admin/users/createAdmin` - Créer administrateur
- `POST /api/admin/users/signupAdmin` - Finaliser inscription admin
- `GET /api/admin/users/profileAdmin` - Profil admin connecté

#### 📦 **Gestion des packs** (`/api/packs/*`)
- `POST /api/packs/admin/addPack` - Créer nouveau pack
- `POST /api/packs/admin/addPackContent` - Ajouter contenu pack
- `PUT /api/packs/admin/{id}/update` - Mettre à jour pack
- `PATCH /api/packs/admin/{id}/activate` - Activer pack
- `PUT /api/packs/admin/pack-contents/{id}/update` - Mettre à jour contenu
- `GET /api/packs/admin/list` - Liste packs (admin)
- `GET /api/packs/{id}/details` - Détails d'un pack

#### 📊 **Statistiques** (`/api/admin/stats/*`)
- `GET /api/admin/stats/` - Statistiques globales
- `GET /api/admin/stats/packs` - Stats globales packs
- `GET /api/admin/stats/packs/{id}` - Stats pack spécifique
- `GET /api/admin/stats/slots` - Stats globales slots
- `GET /api/admin/stats/slots/{id}` - Stats slot spécifique

## 🎯 Comment utiliser

### 1. **Démarrer le serveur**
```bash
npm start
```

### 2. **Accéder à la documentation**
Ouvrez votre navigateur et allez sur :
```
http://localhost:5000/api-docs
```

### 3. **Authentification dans Swagger**
1. Cliquez sur le bouton **"Authorize"** 🔒
2. Entrez votre token JWT au format : `Bearer YOUR_JWT_TOKEN`
3. Testez les routes protégées

## 🔧 Fonctionnalités Swagger

### ✅ **Interface interactive**
- Testez directement les API depuis l'interface
- Voir les réponses en temps réel
- Validation automatique des schémas

### ✅ **Schémas définis**
- `User` - Modèle utilisateur complet
- `Admin` - Modèle administrateur
- `Pack` - Modèle pack avec prix USD/ETH
- `Slot` - Modèle slot avec niveaux
- `Wallet` - Modèle portefeuille crypto
- `Error` - Modèle erreur standardisé
- `SuccessResponse` - Modèle succès standardisé
- `PaginatedResponse` - Modèle réponse paginée

### ✅ **Authentification JWT**
- Support Bearer Token
- Routes protégées identifiées
- Documentation des niveaux d'accès

### ✅ **Validation des données**
- Schémas de requête détaillés
- Types de données spécifiés
- Exemples pour chaque champ

## 🛠️ Maintenance

### Ajouter de nouvelles routes
1. Ajoutez les annotations Swagger dans le fichier de route :
```javascript
/**
 * @swagger
 * /api/votre-route:
 *   get:
 *     summary: Description courte
 *     description: Description détaillée
 *     tags: [Nom du tag]
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotreSchema'
 */
```

### Ajouter de nouveaux schémas
1. Modifiez `src/config/swagger.js`
2. Ajoutez votre schéma dans `components.schemas`

## 🚨 Dépendances requises

Les packages suivants sont déjà installés :
```json
{
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1"
}
```

## 📱 Environnements supportés

- **Développement** : `http://localhost:5000/api-docs`
- **Production** : `https://api.soluxury.com/api-docs`

## 🎨 Personnalisation

L'interface Swagger peut être personnalisée en modifiant les options dans `src/config/swagger.js` :
- Titre et description
- Logo et couleurs
- Serveurs disponibles
- Schémas de sécurité

---

**🎉 Documentation Swagger prête à l'emploi !**

Votre API Soluxury Dashboard Admin est maintenant complètement documentée et testable via l'interface Swagger interactive.