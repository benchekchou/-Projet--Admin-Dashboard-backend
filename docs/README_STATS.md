# 📊 Module Statistiques – Soluxury

**Auteur : Mouhsine Naghach (Développeur Full stack Soluxury)**  
**Version : 1.0 – Le 24 Septembre 2025**  


## 🚀 Description
Ce module fournit des statistiques globales et détaillées sur les utilisateurs, packs et slots.  
Il permet aux administrateurs de suivre les achats, revenus générés (USD & ETH), ainsi que l’état des slots et packs.

---

## 📌 Routes disponibles

### 1. `GET /api/admin/stats/`
- Retourne les statistiques globales.

**Réponse (succès) :**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "totalSlots": 3,
    "totalPacks": 3,
    "packsAcheter": 23,
    "slotsAcheter": 27,
    "nftsMinter": 8,
    "totalNFTs": 25,
    "revenue": {
      "usd": 751.52,
      "eth": 0.17990783410138247
    }
  }
}
```

---

### 2. `GET /api/admin/stats/packs`
- Retourne les statistiques globales de tous les packs.

**Réponse (succès) :**
```json
{
  "success": true,
  "data": {
    "totalPurchased": 23,
    "totalRevenueUSD": 751.52,
    "totalRevenueETH": 0.17988414955239598,
    "details": [
      {
        "packId": 1,
        "name": "Pack Bronze",
        "type": "bronze",
        "priceUsd": 300,
        "totalPurchased": 5,
        "revenueUSD": 51.13,
        "revenueETH": 0.012238498731389727
      },
      {
        "packId": 2,
        "name": "Pack Argent",
        "type": "silver",
        "priceUsd": 580,
        "totalPurchased": 6,
        "revenueUSD": 250.03,
        "revenueETH": 0.05984728804634017
      },
      {
        "packId": 3,
        "name": "Pack Or",
        "type": "gold",
        "priceUsd": 810,
        "totalPurchased": 12,
        "revenueUSD": 450.36,
        "revenueETH": 0.10779836277466609
      }
    ]
  }
}
```

---

### 3. `GET /api/admin/stats/packs/:id`
- Retourne les statistiques détaillées d’un pack spécifique.

**Réponse (succès) :**
```json
{
  "success": true,
  "data": [
    {
      "packId": 1,
      "name": "Pack Bronze",
      "type": "bronze",
      "priceUsd": 300,
      "totalPurchased": 5,
      "revenueUSD": 51.13,
      "revenueETH": 0.012238498731389727
    }
  ]
}
```

**Réponse (erreur) :**
```json
{ "success": false, "message": "pack not found" }
```

---

### 4. `GET /api/admin/stats/slots`
- Retourne les statistiques globales de tous les slots.

**Réponse (succès) :**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 7460,
    "totalRevenueETH": 1.7895953979091002,
    "totalPurchased": 27,
    "details": [
      {
        "slotTypeId": 1,
        "name": "Slot Premium",
        "level": 1,
        "basePriceUsd": 120,
        "totalPurchased": 15,
        "activeCount": 6,
        "availableCount": 9,
        "lockedCount": 0,
        "archivedCount": 0,
        "revenueUSD": 1800,
        "revenueETH": 0.43180586008530564
      },
      {
        "slotTypeId": 2,
        "name": "Slot Niveau 2",
        "level": 2,
        "basePriceUsd": 330,
        "totalPurchased": 2,
        "activeCount": 0,
        "availableCount": 2,
        "lockedCount": 0,
        "archivedCount": 0,
        "revenueUSD": 660,
        "revenueETH": 0.15832881536461207
      },
      {
        "slotTypeId": 3,
        "name": "Slot Niveau 3",
        "level": 3,
        "basePriceUsd": 500,
        "totalPurchased": 10,
        "activeCount": 4,
        "availableCount": 6,
        "lockedCount": 0,
        "archivedCount": 0,
        "revenueUSD": 5000,
        "revenueETH": 1.1994607224591824
      }
    ]
  }
}
```

---

### 5. `GET /api/admin/stats/slots/:id`
- Retourne les statistiques d’un type de slot spécifique.

**Réponse (succès) :**
```json
{
  "success": true,
  "data": [
    {
      "slotTypeId": 2,
      "name": "Slot Niveau 2",
      "level": 2,
      "basePriceUsd": 330,
      "totalPurchased": 2,
      "activeCount": 0,
      "availableCount": 2,
      "lockedCount": 0,
      "archivedCount": 0,
      "revenueUSD": 660,
      "revenueETH": 0.15832881536461207
    }
  ]
}
```

**Réponse (erreur) :**
```json
{ "success": false, "message": "Slot not found" }
```

---

## ⚙️ Services principaux

### ✅ getGlobalStats()
- Calcule les métriques globales : utilisateurs, packs, slots, NFTs, revenus.

### ✅ statistiquePacksService(packId?)
- Si `packId` présent → statistiques d’un pack spécifique.
- Sinon → statistiques globales sur tous les packs.

### ✅ statistiqueSlotsService(slotId?)
- Si `slotId` présent → statistiques d’un slot spécifique.
- Sinon → statistiques globales sur tous les slots.

---

## 🔒 Sécurité intégrée
- Accès restreint aux administrateurs (via `authMiddleware` dans production).
- Validation des IDs packs/slots.

---

## 📘 Stack utilisée
- **Express.js** (API REST)
- **Prisma** (ORM)
- **MySQL/PostgreSQL**
- **ETH & USD conversion utils** (si implémenté en backend)

---

