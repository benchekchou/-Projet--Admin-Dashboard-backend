import { Router } from "express";
import {
  getDetailUserController,
  listUsersController,
  nftsUserController,
  blockUserController,
} from "../controller/userController.js";
import { authMiddleware, authorizeRoles, ROLE_PERMISSIONS } from "../middlware/authMiddlware.js";

/**
 * @swagger
 * tags:
 *   - name: Gestion des utilisateurs
 *     description: API pour la gestion des utilisateurs et administrateurs
 */

const router = Router();
const BASE_URL = "/api/admin/users";

router.get(
  BASE_URL,
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.USER_READ),
  listUsersController
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Liste paginée des utilisateurs
 *     description: Récupère la liste des utilisateurs avec pagination
 *     tags: [Gestion des utilisateurs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
/**
 * @swagger
 * /api/admin/users/{id}/details:
 *   get:
 *     summary: Détails complets d'un utilisateur
 *     description: Récupère le profil complet d'un utilisateur (wallets, packs, slots, NFTs, récompenses)
 *     tags: [Gestion des utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur récupérés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:
 *                   type: boolean
 *                   example: true
 *                 allDetailUser:
 *                   $ref: '#/components/schemas/User'
 */
router.get(
  BASE_URL + "/:id/details",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.USER_READ),
  getDetailUserController
);

/**
 * @swagger
 * /api/admin/users/{id}/user_nfts:
 *   get:
 *     summary: NFTs d'un utilisateur
 *     description: Récupère tous les NFTs associés aux wallets de l'utilisateur
 *     tags: [Gestion des utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: NFTs de l'utilisateur récupérés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:
 *                   type: boolean
 *                   example: true
 *                 nftsUser:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get(
  BASE_URL + "/:id/user_nfts",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.USER_READ),
  nftsUserController
);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   patch:
 *     summary: Bloquer ou débloquer un utilisateur
 *     description: Alterne le statut actif d'un utilisateur (bloqué ou débloqué)
 *     tags: [Gestion des utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *     responses:
 *       200:
 *         description: Statut de l'utilisateur mis à jour
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch(
  `${BASE_URL}/:id/block`,
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.USER_WRITE),
  blockUserController
);



// router.get(BASE_URL+"/profileAdmin",getMyProfileAdminController)

export default router;
