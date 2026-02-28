# 👤 Module Utilisateur – Soluxury

**Auteur : Mouhsine Naghach (Développeur Full stack Soluxury)**  
**Version : 1.0 – Le 24 Septembre 2025**  

## 🚀 Description
Ce module gère la gestion des utilisateurs et administrateurs dans l’application **Soluxury Dashboard Admin**.  
Il inclut :
- Listing des utilisateurs avec pagination
- Blocage/déblocage d’un utilisateur
- Récupération des détails d’un utilisateur (packs, slots, rewards, NFTs)
- Récupération des NFTs liés à un utilisateur
- Création d’un administrateur avec invitation par email
- Finalisation d’inscription administrateur (mot de passe sécurisé)

---

## 📌 Routes disponibles
### 1. `GET /api/admin/users`
- Retourne la liste paginée des utilisateurs.

**Query params :**
- `page` (default: 1)
- `limit` (default: 10)

**Réponse :**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
   "data": [
        {
            "id": "e967",
            "email": "email@gmail.com",
            "emailVerifiedAt": "2025-08-06T12:35:49.000Z",
            "displayName": "dusplayNamr",
            "country": "Maroc",
            "isBlock": false,
            "createdAt": "2025-08-20T13:15:38.866Z",
            "updatedAt": "2025-08-20T13:18:04.587Z",
            "last_processus_bonus": null,
            "pack_purchases": [],
            "user_rewards": [],
            "wallet": [
                {
                    "id": "17556957388644a5efe16-edbf-4bd1-a64e-0089f78de648",
                    "address": "0xkdj48d466TRJ54fef",
                    "userId": "e967",
                    "isPrimary": true,
                    "createdAt": "2025-08-20T13:15:38.866Z"
                }
            ]
        },
        ....
    ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

---

### 2. `PATCH /api/admin/users/:id/block`
- Bloque ou débloque un utilisateur.

**Réponse (succès) :**
```json
{ "success": true, "message": "✅ User has been blocked" }
```

---

### 3. `GET /api/admin/users/:id/details`
- Récupère le profil complet d’un utilisateur :
  - Wallets
  - Achats de packs + contenu
  - Slots et commandes
  - Récompenses
  - NFTs associés

**Réponse :**
```json
{
  "succes": true,
  "allDetailUser": {
    "id": "U123",
    "email": "user@example.com",
    "wallet": [{ "id": "W1", "address": "0x123..." }],
    "pack_purchases": [ ... ],
    "user_slots": [ ... ],
    "user_rewards": [ ... ],
    "nfts": [ ... ]
  }
}
```

---

### 4. `GET /api/admin/users/:id/user_nfts`
- Récupère uniquement les NFTs associés aux wallets de l’utilisateur.

**Réponse :**
```json
{
  "succes": true,
  "nftsUser": [
    { "id": "NFT123", "ownerWallet": "0x123..." }
  ]
}
```

---

### 5. `POST /api/admin/users/createAdmin`
- Crée un nouveau compte admin **(sans mot de passe)**.
- Envoie un email avec un lien d’invitation sécurisé.

**Body attendu :**
```json
{
  "email": "newadmin@example.com",
  "role": "manager"
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": "Admin créé avec succès. Email envoyé.",
  "data": { "id": "A123", "email": "newadmin@example.com", "role": "manager" }
}
```

---

### 6. `POST /api/admin/users/signupAdmin`
- Finalise l’inscription d’un administrateur en définissant son mot de passe.

**Body attendu :**
```json
{
  "password": "motDePasseSécurisé123"
}
```

**Réponse (succès) :**
```json
{
  "status": 200,
  "success": true,
  "message": "Inscription finalisée. Vous pouvez maintenant vous connecter."
}
```

---

## ⚙️ Services principaux

### ✅ listUsersService(page, limit)
- Retourne liste paginée des utilisateurs + total.

### ✅ blockUserService(id)
- Toggle `isBlock` (bloque/débloque).

### ✅ getUserDetails(userId)
- Retourne détails complets (wallet, packs, slots, rewards, NFTs).

### ✅ getNFTsUsers(userId)
- Retourne uniquement les NFTs associés.

### ✅ createAdminService({ email, role })
- Crée un admin sans mot de passe.
- Génère un lien d’invitation (24h).

### ✅ signUpService(data)
- Finalise inscription admin avec mot de passe hashé (bcrypt).

---

## 🔒 Sécurité intégrée
- Authentification requise via **JWT** (`authMiddleware`).
- Mot de passe admin hashé avec **bcrypt**.
- Invitation sécurisée avec **token unique** (24h).

---

## 📘 Stack utilisée
- **Express.js** (API REST)
- **Prisma** (ORM)
- **bcryptjs** (hash mot de passe)
- **JWT** (authentification)
- **nodemailer** (email invitation)

---
