# 🔐 Module Authentification – Soluxury

**Auteur : Mouhsine Naghach (Développeur Full stack Soluxury)**  
**Version : 1.0 – Le 24 Septembre 2025**  

## 🚀 Description
Ce module gère l’authentification sécurisée avec mot de passe + 2FA (OTP email).
Il repose sur **Express.js + Prisma + JWT + 2FA**.

## 📌 Routes

### 1. `POST /api/auth/login`
- Vérifie email + mot de passe.
- Génère et envoie un code OTP (2FA).
- Retourne un **JWT temporaire**.

**Body attendu :**
```json
{
  "email": "admin@example.com",
  "password": "monMotDePasse"
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": "Bienvenue dans votre compte",
  "result": {
    "user": {
      "id": 1,
      "username": "superadmin",
      "email": "admin@example.com",
      "role": "superadmin"
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2. `POST /api/auth/verfieCode`
- Vérifie le code OTP (hash + expiration).
- Active l’utilisateur.

**Body attendu :**
```json
{ "code": "123456" }
```

**Réponse (succès) :**
```json
{ "success": true, "message": "Code validé, admin activé" }
```


### 4. `GET /api/auth/isConnect`
- Vérifie la validité du JWT.

**Réponse :**
```json
{ "isConnect": true }
```

---

## ⚙️ Services principaux

### ✅ loginService({ email, password })
- Vérifie email + mot de passe (bcrypt).
- Envoie OTP par email.
- Retourne un JWT temporaire.

### ✅ sendTwoFACode(email)
- Génère code OTP (6 chiffres).
- Hash avec SHA256.
- Enregistre en DB + envoie email.

### ✅ verifyTwoFACode(email, code)
- Vérifie hash + expiration (5 min).
- Active utilisateur.

### ✅ getProfile(userID)
- Retourne profil complet (avec wallets).

---

## 🔒 Sécurité intégrée
- JWT signé (stateless)
- 2FA OTP obligatoire
- Rate limiting anti-bruteforce
- Password hashé (bcrypt)
- OTP hashé (SHA256)

---

## 📌 Exemple séquence complète
1. `POST /login` → envoie OTP
2. `POST /verfieCode` → vérifie code
3. `GET /profile` → retourne profil
4. `GET /isConnect` → vérifie connexion

---

## 📘 Stack utilisée
- **Express.js** (API REST)
- **Prisma** (ORM)
- **bcryptjs** (hash)
- **crypto** (OTP hash)
- **nodemailer** (email OTP)

---
