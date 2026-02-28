import express from "express";
import { authMiddleware, authorizeRoles, ROLE_PERMISSIONS } from "../middlware/authMiddlware.js";
import { activatePackController,deletePackController, addPackContentsController, addPackController, getActivePacksController, getPacksByIdController, updatePackContentController, updatePackController,deletePackContentController } from "../controller/packsControler.js";

/**
 * @swagger
 * tags:
 *   - name: Gestion des packs
 *     description: API pour la gestion des packs et de leur contenu
 */

const router = express.Router();

const BASE_URL="/api/admin/"

/**
 * @swagger
 * /api/admin/packs/addPack:
 *   post:
 *     summary: Créer un nouveau pack
 *     description: Crée un nouveau pack avec ses caractéristiques
 *     tags: [Gestion des packs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price_usd
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pack Premium
 *               description:
 *                 type: string
 *                 example: Pack contenant des NFTs rares
 *               price_usd:
 *                 type: number
 *                 example: 299.99
 *               image_url:
 *                 type: string
 *                 example: https://example.com/pack.jpg
 *               type:
 *                 type: string
 *                 enum: [bronze, silver, gold]
 *                 example: gold
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               limited_quantity:
 *                 type: integer
 *                 nullable: true
 *               bonus_threshold:
 *                 type: boolean
 *                 default: false
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       201:
 *         description: Pack créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Pack'
 */
router.post(
  BASE_URL + "packs/addPack",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_WRITE),
  addPackController
);

/**
 * @swagger
 * /api/admin/packs/addPackContent:
 *   post:
 *     summary: Ajouter du contenu à un pack
 *     description: Ajoute un élément (NFT, slot, boost) au contenu d'un pack
 *     tags: [Gestion des packs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pack_id
 *               - item_type
 *               - item_ref
 *             properties:
 *               pack_id:
 *                 type: integer
 *                 example: 1
 *               item_type:
 *                 type: string
 *                 enum: [slot, boost, nft, bonus]
 *                 example: nft
 *               item_ref:
 *                 type: integer
 *                 example: 123
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 example: 2
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Contenu ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post(
  BASE_URL + "packs/addPackContent",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_WRITE),
  addPackContentsController
);

/**
 * @swagger
 * /api/admin/packs/{id}/update:
 *   put:
 *     summary: Mettre à jour un pack
 *     description: Met à jour les informations d'un pack existant
 *     tags: [Gestion des packs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du pack
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price_usd:
 *                 type: number
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Pack mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put(
  BASE_URL + "packs/:id/update",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_WRITE),
  updatePackController
);

/**
 * @swagger
 * /api/admin/packs/{id}/activate:
 *   patch:
 *     summary: Activer un pack
 *     description: Active un pack pour le rendre disponible à l'achat
 *     tags: [Gestion des packs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du pack
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Pack activé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch(
  BASE_URL + "packs/:id/activate",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_WRITE),

  activatePackController
);

/**
 * @swagger
 * /api/admin/packs/pack-contents/{id}/update:
 *   put:
 *     summary: Mettre à jour le contenu d'un pack
 *     description: Met à jour un élément spécifique du contenu d'un pack
 *     tags: [Gestion des packs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du contenu de pack
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pack_id:
 *                 type: integer
 *               item_type:
 *                 type: string
 *                 enum: [slot, boost, nft, bonus]
 *               item_ref:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Contenu mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put(
  BASE_URL + "packs/:id/update",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_WRITE),

  updatePackContentController
);

/**
 * @swagger
 * /api/admin/packs/list:
 *   get:
 *     summary: Liste des packs (admin)
 *     description: Récupère la liste complète des packs actifs avec leurs contenus (vue admin)
 *     tags: [Gestion des packs]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Liste des packs récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Pack'
 *                       - type: object
 *                         properties:
 *                           pack_contents:
 *                             type: array
 *                             items:
 *                               type: object
 */
router.get(
  BASE_URL + "packs/list",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_READ),
  getActivePacksController
);

/**
 * @swagger
 * /api/admin/packs/{id}/details:
 *   get:
 *     summary: Détails d'un pack
 *     description: Récupère les détails complets d'un pack par son ID
 *     tags: [Gestion des packs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du pack
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Détails du pack récupérés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Pack'
 *                     - type: object
 *                       properties:
 *                         pack_contents:
 *                           type: array
 *                           items:
 *                             type: object
 *                         pack_purchases:
 *                           type: array
 *                           items:
 *                             type: object
 *       404:
 *         description: Pack non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "packs/:id/details",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_READ),

  getPacksByIdController
);

/**
 * @swagger
 * /api/admin/packs/{id}/delete:
 *   delete:
 *     summary: Supprimer un pack
 *     description: Supprime un pack et ses contenus associés
 *     tags: [Gestion des packs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du pack
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Pack supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Pack non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  BASE_URL + "packs/:id/delete",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_WRITE),
  deletePackController
);


/**
 * @swagger
 * /api/admin/packcontents/{id}/delete:
 *   delete:
 *     summary: Supprimer un contenu de pack
 *     description: Supprime un élément spécifique du contenu d'un pack
 *     tags: [Gestion des packs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du contenu de pack
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Contenu supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Contenu non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  BASE_URL + "packcontents/:id/delete",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.PACK_WRITE),
  deletePackContentController
);




export default router;
