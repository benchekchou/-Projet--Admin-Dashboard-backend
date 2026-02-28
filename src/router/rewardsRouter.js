import express from "express";
import { authMiddleware, authorizeRoles, ROLE_PERMISSIONS } from "../middlware/authMiddlware.js";
import { getAllRewardsController } from "../controller/rewardsController.js";

/**
 * @swagger
 * tags:
 *   - name: Gestion des récompenses
 *     description: API pour la gestion des récompenses utilisateurs
 */

const router = express.Router();

const BASE_URL="/api/admin/"

/**
 * @swagger
 * /api/admin/rewards/user-rewards/list:
 *   get:
 *     summary: Liste de toutes les récompenses
 *     description: Récupère la liste complète de toutes les récompenses accordées aux utilisateurs
 *     tags: [Gestion des récompenses]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Liste des récompenses récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la récompense
 *                       reward_type:
 *                         type: string
 *                         enum: [nft, boost, early_access]
 *                         description: Type de récompense
 *                       user_id:
 *                         type: string
 *                         description: ID de l'utilisateur bénéficiaire
 *                       status:
 *                         type: string
 *                         description: Statut de la récompense
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Date de création
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           displayName:
 *                             type: string
 *       400:
 *         description: Erreur de requête
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
router.get(
  BASE_URL + "rewards/user-rewards/list",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.REWARD_MANAGE),
  getAllRewardsController
);

/**
 * @swagger
 * /api/admin/rewards/user-rewards/give-nft:
 *   get:
 *     summary: Liste des récompenses NFT
 *     description: Récupère la liste des récompenses de type NFT uniquement
 *     tags: [Gestion des récompenses]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Liste des récompenses NFT récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la récompense NFT
 *                       reward_type:
 *                         type: string
 *                         example: "nft"
 *                         description: Type de récompense (NFT)
 *                       user_id:
 *                         type: string
 *                         description: ID de l'utilisateur bénéficiaire
 *                       nft_id:
 *                         type: string
 *                         description: ID du NFT récompensé
 *                       status:
 *                         type: string
 *                         enum: [pending, claimed, expired]
 *                         description: Statut de la récompense NFT
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Date de création
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           displayName:
 *                             type: string
 *       400:
 *         description: Type de récompense non disponible
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
 *                   example: "type n'est pas disponible"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "rewards/user-rewards/give-nft",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.REWARD_MANAGE),
  getAllRewardsController
);

export default router;
