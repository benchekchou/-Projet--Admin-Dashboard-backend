## RBAC – Implémentation 2025-10-13

Cette mise à jour introduit un contrôle d’accès par rôle uniformisé sur l’ensemble des routes d’administration.

### Middleware & helpers

| Fichier | Description |
| --- | --- |
| `src/middlware/authMiddlware.js` | • Centralise la liste canonique des rôles (`ADMIN_ROLES`).<br>• Déclare les groupes de permissions (`ROLE_PERMISSIONS`) alignés sur la matrice produit.<br>• `authMiddleware` vérifie désormais systématiquement le JWT et attache `req.info.normalizedRole`.<br>• Nouveau helper `authorizeRoles(...roles)` qui bloque l’accès si le rôle n’est pas autorisé. |

### Routes sécurisées

Chaque route admin appelle maintenant `authMiddleware` puis `authorizeRoles`. Les rôles retenus reprennent la matrice fournie :

| Module | Fichier(s) | Rôles autorisés |
| --- | --- | --- |
| Packs (création/édition) | `src/router/packsRouter.js` | `superadmin`, `admin` |
| Packs (lecture) | `src/router/packsRouter.js` | Tous les rôles authentifiés |
| Slots (CRUD) | `src/router/slotsRouter.js` | `superadmin`, `admin` (lecture ouverte) |
| Utilisateurs (lecture) | `src/router/usersRouter.js` | Tous les rôles |
| Utilisateurs (blocage) | `src/router/usersRouter.js` | `superadmin`, `admin` |
| Récompenses | `src/router/rewardsRouter.js` | `superadmin`, `admin` |
| Médias (upload/update/delete) | `src/router/mediaRouter.js` | `superadmin`, `admin`, `manager` (lecture ouverte) |
| Statistiques | `src/router/statistiqueRouter.js` | Tous les rôles |
| Gestion des admins | `src/router/usersAdminRouter.js` | Supervision strictement `superadmin` (sauf profil/signup) |

Les commentaires Swagger de chaque route incluent désormais une extension `x-roles-allowed` ainsi que le bloc `security` pour refléter ces exigences dans la documentation générée.

### Tests

Un test Jest (`tests/permissions.test.js`) vérifie les combinaisons rôle ↔ permission pour les principaux groupes (`PACK_WRITE`, `MEDIA_WRITE`, `ADMIN_MANAGE`, etc.). Le script `npm test` a été ajusté pour lancer Jest en environnement ESM.

### Points d’attention

* Le middleware doit précéder **toutes** les routes protégées (`authMiddleware`, puis `authorizeRoles(...)`).
* Pour autoriser un nouveau cas d’usage, étendre `ROLE_PERMISSIONS` et réutiliser `authorizeRoles` plutôt que coder une vérification ad hoc.
* Les consommateurs de l’API peuvent lire le champ Swagger `x-roles-allowed` afin d’afficher ou masquer les actions côté UI. 
