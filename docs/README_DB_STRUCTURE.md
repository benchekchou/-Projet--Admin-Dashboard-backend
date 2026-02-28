**Auteur : hamza benchekchou (Développeur Full stack Soluxury)**  
**Version : 1.0 – Le 15 October 2025**  
# Structure de la base de donnees

## Vue d'ensemble
- Base MySQL administree via Prisma (`prisma/schema.prisma`).
- Les modeles couvrent cinq domaines: identite utilisateur, economie (packs, slots, recompenses), ressources blockchain, contenus media et administration.
- Les relations utilisent des cles etrangeres explicites; les creations et dates sont pilotees par `@default(now())` et `@updatedAt` pour garder l'historique.

## Domaines fonctionnels

### Identite et portefeuilles
- `user`: represente le compte principal (e-mail optionnel, indicateurs de blocage, horodatages). Relations avec `wallet`, `pack_purchases`, `user_rewards` et `user_slots`.
- `wallet`: stocke les adresses reliees a un utilisateur (`userId` nullable pour accepter des portefeuilles orphelins). `isPrimary` permet de marquer l'adresse principale.
- `wallet_connections`: journalise les connexions utilisateurs par adresse IP avec un statut (`pending`, `approved`, etc.).
- `nonce`: valeurs a usage unique pour verifier la possession d'un portefeuille; champ `expiresAt` impose une duree de validite.
- `loogs`: table de traces techniques (IP source et statut) utile pour les audits de securite.

### Ressources blockchain et marketplace
- `nft`: reference les NFT connus (contrat, `chainId`, `tokenId`, rarete, `metadataUri`, bloc de dernier passage). La cle composite (`contract`, `chainId`, `tokenId`) assure l'unicite on-chain.
- `transaction`: enregistre les transactions observees avec leur `txHash`, type, comptes source/destination et metadonnees de bloc.
- `order`: represente les ordres d'achat (`buyerWallet`, prix en ETH, type d'article, reference d'article et statut). Lie a `user_slots` via `source_ordre_id`.
- `syncstate`: memorise le dernier bloc traite pour la synchronisation blockchain.

### Packs, contenus et slots
- `packs`: catalogue des packs vendus (nom, description, prix USD, visuel, statut, type).
- `pack_contents`: liste les items inclus dans chaque pack (`item_type`, `item_ref`, quantite). Relation forte vers `packs`.
- `pack_purchases`: historique d'achat (utilisateur, pack, quantite, total USD, transaction associee) avec references vers `packs` et `user`.
- `slots`: definitions des types de slots (niveau, prix de base, disponibilite, options de revente).
- `user_slots`: slots attribues aux utilisateurs (source achat ou ordre, statut, NFT lie, timestamps). Reference `order` et `slots`.

### Recompenses et progression
- `user_rewards`: rewards individuelles (type, valeur optionnelle, statut `claimed`). Supprime en cascade avec l'utilisateur.

### Contenus media
- `medias`: stocke les medias exposes par l'API (nom, URL, type, ordre d'affichage, reference metier).

### Administration
- `admins`: comptes administrateurs (username/email uniques, role, 2FA, etats actifs).
- `admin_logs`: traces d'action admin (administrateur, action, entite cible, details). Supprimable en cascade lorsque l'admin est retire.

## Structure detaillee des tables

### Identite et portefeuilles

#### Table: user
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | String | @id | Identifiant primaire utilisateur (UUID ou adresse). |
| email | String? | @unique | Courriel optionnel pour la connexion traditionnelle. |
| emailVerifiedAt | DateTime? | | Horodatage de verification email. |
| displayName | String? | | Nom affiche dans l'interface. |
| country | String? | | Pays declare par l'utilisateur. |
| isBlock | Boolean | @default(false) | Indique si l'utilisateur est bloque. |
| createdAt | DateTime | @default(now()) | Date de creation du compte. |
| updatedAt | DateTime | @default(now()) @updatedAt | Date de mise a jour automatique. |
| last_processus_bonus | DateTime? | @db.DateTime(0) | Derniere execution du processus bonus. |
Relations Prisma: `pack_purchases`, `user_rewards`, `user_slots`, `wallet`.

#### Table: wallet
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | String | @id | Identifiant du portefeuille. |
| address | String | @unique | Adresse blockchain unique. |
| userId | String? | | FK optionnelle vers `user`. |
| isPrimary | Boolean | @default(true) | Marque l'adresse principale. |
| createdAt | DateTime | @default(now()) | Date d'enregistrement du wallet. |
Relations Prisma: `user`. Index: `@@index([userId])`.

#### Table: wallet_connections
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Cle primaire auto-incrementee. |
| wallet | String | @db.VarChar(255) | Adresse de wallet utilisee. |
| ip | String | @db.VarChar(50) | Adresse IP observee. |
| status | String | @default("pending") @db.VarChar(20) | Etat de la connexion (pending, approved, etc.). |
| created_at | DateTime? | @default(now()) @db.DateTime(0) | Horodatage de creation. |

#### Table: nonce
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | BigInt | @id @default(autoincrement()) @db.UnsignedBigInt | Identifiant unique. |
| wallet | String | | Adresse associee au nonce. |
| value | String | @unique | Valeur de nonce a usage unique. |
| expiresAt | DateTime | | Date d'expiration. |
| usedAt | DateTime? | | Date d'utilisation si consomme. |

#### Table: loogs
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| idLog | Int | @id @default(autoincrement()) | Identifiant de log. |
| addIP | String | @db.VarChar(30) | Adresse IP source. |
| status | String | @db.VarChar(250) | Message ou statut enregistre. |
| createdAt | DateTime | @default(now()) @db.DateTime(0) | Horodatage de creation. |

### Ressources blockchain et marketplace

#### Table: nft
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant interne du NFT. |
| contract | String | | Adresse du contrat. |
| chainId | Int | | Identifiant de la chaine. |
| tokenId | String | | Identifiant de token. |
| ownerWallet | String? | | Wallet proprietaire si connu. |
| rarity | String | | Rarete interne. |
| level | Int | @default(1) | Niveau du NFT. |
| metadataUri | String | | Lien vers les metadonnees. |
| lastSeenBlock | Int | | Dernier bloc analyse. |
| lastTxHash | String? | | Derniere transaction observee. |
| createdAt | DateTime | @default(now()) | Date d'enregistrement. |
| updatedAt | DateTime | @default(now()) @updatedAt | Mise a jour automatique. |
Contraintes: `@@unique([contract, chainId, tokenId])`.

#### Table: transaction
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | String | @id | Identifiant interne de transaction. |
| txHash | String | @unique | Hash unique sur la chaine. |
| type | String | | Type fonctionnel. |
| from | String | | Adresse source. |
| to | String | | Adresse destination. |
| contract | String | | Contrat implique. |
| chainId | Int | | Chaine concernee. |
| tokenId | String? | | Token implique. |
| blockNum | Int | | Numero de bloc. |
| blockTime | DateTime | | Heure du bloc. |

#### Table: order
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | String | @id | Identifiant de commande. |
| buyerWallet | String | | Adresse acheteuse. |
| priceEth | Decimal | @db.Decimal(38, 18) | Prix en ETH. |
| txHash | String? | @unique | Transaction associee. |
| itemType | order_itemType | | Type d'article. |
| itemRef | Int? | | Reference d'article (slot, pack, etc.). |
| tokenId | String? | | Token vise si applicable. |
| rarity | String? | | Rarete cible. |
| status | String | | Statut de la commande. |
| createdAt | DateTime | @default(now()) | Date de creation. |
Relations Prisma: `user_slots`.

#### Table: syncstate
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(1) | Identifiant unique (singleton). |
| lastBlock | Int | | Dernier bloc traite. |
| updatedAt | DateTime | @default(now()) @db.Timestamp(0) | Derniere mise a jour. |

### Packs, contenus et slots

#### Table: packs
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant du pack. |
| name | String | @db.VarChar(255) | Nom marketing. |
| description | String? | @db.Text | Description detaillee. |
| price_usd | Decimal | @db.Decimal(10, 2) | Prix catalogue USD. |
| image_url | String? | @db.Text | Illustration. |
| is_active | Boolean? | @default(true) | Disponibilite commerciale. |
| limited_quantity | Int? | | Limite de stock. |
| bonus_threshold | Boolean? | @default(false) | Active le bonus special. |
| created_at | DateTime? | @default(now()) @db.DateTime(0) | Date de creation. |
| updated_at | DateTime? | @default(now()) @db.DateTime(0) | Derniere mise a jour. |
| type | packs_type | | Segment (bronze, silver, gold). |
Relations Prisma: `pack_contents`, `pack_purchases`.

#### Table: pack_contents
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant de contenu. |
| pack_id | Int | | FK vers `packs`. |
| item_type | pack_contents_item_type | | Nature de l'item (slot, boost, etc.). |
| item_ref | Int | | Reference de l'item. |
| quantity | Int? | @default(1) | Quantite incluse. |
| created_at | DateTime? | @default(now()) @db.DateTime(0) | Date de creation. |
| updated_at | DateTime? | @default(now()) @db.DateTime(0) | Derniere mise a jour. |
Relations Prisma: `packs`. Index: `@@index([pack_id])`.

#### Table: pack_purchases
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant d'achat. |
| user_id | String | | FK vers `user`. |
| pack_id | Int | | FK vers `packs`. |
| quantity | Int? | @default(1) | Quantite achetee. |
| total_usd | Decimal | @db.Decimal(10, 2) | Montant total USD. |
| tx_hash | String | @unique @db.VarChar(255) | Transaction associee. |
| purchased_at | DateTime? | @default(now()) @db.DateTime(0) | Date d'achat. |
| updated_at | DateTime? | @default(now()) @db.DateTime(0) | Derniere mise a jour. |
| used_in_rewards | Int | @default(0) @db.TinyInt | Utilisation pour des rewards. |
Relations Prisma: `packs`, `user`. Index: `@@index([pack_id])`, `@@index([user_id])`.

#### Table: slots
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant du slot type. |
| level | Int | @db.TinyInt | Niveau du slot. |
| name | String | @db.VarChar(255) | Nom lisible. |
| base_price_usd | Decimal | @db.Decimal(10, 2) | Prix de base. |
| image_url | String? | @db.Text | Visuel associe. |
| is_active | Boolean? | @default(true) | Indique si le slot est actif. |
| is_sellable | Boolean? | @default(false) | Autorise la revente. |
| created_at | DateTime? | @default(now()) @db.DateTime(0) | Date de creation. |
| updated_at | DateTime? | @default(now()) @db.DateTime(0) | Derniere mise a jour. |
Relations Prisma: `user_slots`.

#### Table: user_slots
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant du slot utilisateur. |
| user_id | String | | FK vers `user`. |
| slot_type_id | Int | | FK vers `slots`. |
| status | user_slots_status? | @default(available) | Etat du slot pour l'utilisateur. |
| bound_nft_id | Int? | | Reference eventuelle de NFT lie. |
| source_purchase_id | Int? | | FK vers `pack_purchases`. |
| source_ordre_id | String? | | FK vers `order`. |
| idempotency_key | String? | @db.VarChar(250) | Cle d'idempotence pour operations critiques. |
| acquired_at | DateTime | @default(now()) @db.DateTime(0) | Date d'acquisition. |
| updated_at | DateTime | @default(now()) @db.DateTime(0) | Derniere mise a jour. |
Relations Prisma: `slots`, `user`, `order`. Index: `@@index([source_purchase_id])`, `@@index([slot_type_id])`, `@@index([source_ordre_id])`, `@@index([user_id])`.

### Recompenses et progression

#### Table: user_rewards
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant du reward. |
| user_id | String | | FK vers `user`. |
| reward_type | user_rewards_reward_type | | Type de reward (nft, boost, early_access). |
| reward_value | String? | @db.VarChar(255) | Valeur ou reference de reward. |
| claimed | Boolean? | @default(false) | Indique si le reward est reclame. |
| generated_at | DateTime? | @default(now()) @db.DateTime(0) | Date de generation. |
| updated_at | DateTime? | @default(now()) @db.DateTime(0) | Derniere mise a jour. |
Relations Prisma: `user`. Index: `@@index([user_id])`.

### Contenus media

#### Table: medias
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant media. |
| name | String | @db.VarChar(100) | Nom du media. |
| url | String | @db.VarChar(255) | URL publique. |
| type | String? | @db.VarChar(100) | Typologie (image, video, etc.). |
| order_index | Int | | Ordre d'affichage. |
| createdAt | DateTime? | @default(now()) @db.DateTime(0) | Date de creation. |
| ref | String? | | Reference metier. |

### Administration

#### Table: admins
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant admin. |
| username | String | @unique @db.VarChar(100) | Identifiant unique. |
| email | String | @unique @db.VarChar(100) | Email unique. |
| password_hash | String? | @db.VarChar(255) | Hash du mot de passe. |
| role | admins_role | @default(viewer) | Role RBAC. |
| isActive | Boolean | @default(false) | Active ou non. |
| twofa_secret | String? | @db.VarChar(255) | Secret 2FA chiffrable. |
| twofa_secret_createdAt | DateTime? | @default(now()) @db.DateTime(0) | Date de generation du secret. |
| created_at | DateTime | @default(now()) @db.DateTime(0) | Date de creation. |
| updated_at | DateTime | @default(now()) @db.DateTime(0) | Derniere mise a jour. |
Relations Prisma: `admin_logs`.

#### Table: admin_logs
| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | Int | @id @default(autoincrement()) | Identifiant du log. |
| admin_id | Int | | FK vers `admins`. |
| action | String | @db.VarChar(255) | Action effectuee. |
| entity_id | Int? | | Identifiant cible. |
| details | String? | @db.Text | Informations detaillees. |
| created_at | DateTime | @default(now()) @db.DateTime(0) | Date d'enregistrement. |
Relations Prisma: `admins`. Index: `@@index([action])`, `@@index([admin_id])`.

## Relations clefs
- `user` 1-* `wallet` (cascade sur suppression) pour rattacher plusieurs portefeuilles a un compte.
- `packs` 1-* `pack_contents` et 1-* `pack_purchases` pour differencier definition et achat.
- `user` 1-* `user_slots` et `user_rewards` pour suivre la progression individuelle.
- `order` 1-* `user_slots` (optionnel) pour lier l'acquisition d'un slot a une transaction precise.
- `admins` 1-* `admin_logs` afin d'auditer toutes les actions internes.

## Enumerations
- `pack_contents_item_type`: `slot`, `boost`, `nft`, `bonus`.
- `user_rewards_reward_type`: `nft`, `boost`, `early_access`.
- `packs_type`: `bronze`, `silver`, `gold`.
- `user_slots_status`: `available`, `active`, `locked`, `archived`.
- `order_itemType`: `slot`, `boost`, `nft`, `bonus`, `pack`.
- `admins_role`: `superadmin`, `admin`, `manager`, `viewer`.

## Bonnes pratiques pour les evolutions
- Mettre a jour ce fichier a chaque modification de schema Prisma afin de conserver un referentiel documentaire fiable.
- Verifier qu'une suppression ou modification de relation respecte les contraintes Prisma (`onDelete`, `onUpdate`).
- Synchroniser les enumerations avec l'application (validators, DTO, front) avant toute migration pour eviter les incoherences.
