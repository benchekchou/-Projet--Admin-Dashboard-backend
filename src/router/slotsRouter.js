import express from "express";
import {
  addSlotController,
  deleteSlotController,
  updateSlotController,
  getAllSlotsController,
  activateSlotController,
} from "../controller/slotsController.js";
import { authMiddleware, authorizeRoles, ROLE_PERMISSIONS } from "../middlware/authMiddlware.js";
/**
 * @swagger
 * tags:
 *   - name: Gestion des slots
 *     description: API pour la gestion des slots et niveaux
 */

const router = express.Router();

const BASE_URL = "/api/admin/"

/**
 * @swagger
 * /api/admin/slots/addSlot:
 *   post:
 *     summary: Créer un nouveau slot
 *     description: Crée un nouveau type de slot avec ses caractéristiques
 *     tags: [Gestion des slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - name
 *               - base_price_usd
 *             properties:
 *               level:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 example: 2
 *                 description: Niveau du slot (1, 2 ou 3)
 *               name:
 *                 type: string
 *                 example: "Slot Premium Niveau 2"
 *                 description: Nom du slot
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/slot.jpg"
 *                 description: URL de l'image du slot
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Slot actif ou non
 *               is_sellable:
 *                 type: boolean
 *                 default: false
 *                 description: Slot vendable ou non
 *               base_price_usd:
 *                 type: number
 *                 example: 199.99
 *                 description: Prix de base en USD
 *               type:
 *                 type: string
 *                 example: "premium"
 *                 description: Type de slot
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       201:
 *         description: Slot créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slot ajouté avec succès."
 *                 data:
 *                   $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflit - slot similaire existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  BASE_URL + "slots/addSlot",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.SLOT_WRITE),
  addSlotController
);

/**
 * @swagger
 * /api/admin/slots/{id}/update:
 *   put:
 *     summary: Mettre à jour un slot
 *     description: Met à jour les informations d'un slot existant
 *     tags: [Gestion des slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du slot à mettre à jour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Niveau du slot
 *               name:
 *                 type: string
 *                 description: Nom du slot
 *               image_url:
 *                 type: string
 *                 description: URL de l'image
 *               is_active:
 *                 type: boolean
 *                 description: Statut actif
 *               is_sellable:
 *                 type: boolean
 *                 description: Vendable ou non
 *               base_price_usd:
 *                 type: number
 *                 description: Prix de base en USD
 *               type:
 *                 type: string
 *                 description: Type de slot
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Slot mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Slot mis à jour avec succès"
 *                 slot:
 *                   $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Données invalides ou ID introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  BASE_URL + "slots/:id/update",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.SLOT_WRITE),
  updateSlotController
);

/**
 * @swagger
 * /api/admin/slots/{id}/delete:
 *   delete:
 *     summary: Supprimer un slot
 *     description: Supprime définitivement un slot du système
 *     tags: [Gestion des slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du slot à supprimer
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Slot supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "✅ Slot supprimé avec succès."
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Slot non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Aucun slot trouvé avec cet ID"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  BASE_URL + "slots/:id/delete",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.SLOT_WRITE),
  deleteSlotController
);



/**
 * @swagger
 * /api/admin/slots/list:
 *   get:
 *     summary: Récupérer la liste de tous les slots
 *     description: Retourne tous les slots existants avec leurs informations complètes
 *     tags: [Gestion des slots]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Liste des slots récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Slot'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "slots/list",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.SLOT_READ),
  getAllSlotsController
);



/**
 * @swagger
 * /api/admin/slots/{id}/activate:
 *   patch:
 *     summary: Activer un slot
 *     description: Active un slot pour le rendre disponible
 *     tags: [Gestion des slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du slot à activer
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Slot activé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Slot activé avec succès"
 *       404:
 *         description: Slot non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  BASE_URL + "slots/:id/activate",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.SLOT_WRITE),
  activateSlotController
);

export default router;
