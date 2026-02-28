import express from "express";
import {
  getGlobalStatsController,
  getStatistiquePacksController,
  getStatistiqueSlotsController,
} from "../controller/statistiqueController.js";
import { authMiddleware, authorizeRoles, ROLE_PERMISSIONS } from "../middlware/authMiddlware.js";
/**
 * @swagger
 * tags:
 *   - name: Statistiques
 *     description: API pour les statistiques et métriques globales
 */

const router = express.Router();

const BASE_URL = "/api/admin/stats/"

/**
 * @swagger
 * /api/admin/stats/:
 *   get:
 *     summary: Statistiques globales
 *     description: Récupère les métriques globales du système (utilisateurs, packs, slots, revenus)
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Statistiques globales récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 150
 *                     totalSlots:
 *                       type: integer
 *                       example: 5
 *                     totalPacks:
 *                       type: integer
 *                       example: 3
 *                     packsAcheter:
 *                       type: integer
 *                       example: 45
 *                     slotsAcheter:
 *                       type: integer
 *                       example: 120
 *                     nftsMinter:
 *                       type: integer
 *                       example: 89
 *                     totalNFTs:
 *                       type: integer
 *                       example: 1000
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         usd:
 *                           type: number
 *                           example: 15750.50
 *                         eth:
 *                           type: number
 *                           example: 3.245
 */
router.get(
  BASE_URL,
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.STATS_ACCESS),
  getGlobalStatsController
);

/**
 * @swagger
 * /api/admin/stats/packs/{id}:
 *   get:
 *     summary: Statistiques d'un pack spécifique
 *     description: Récupère les statistiques détaillées d'un pack par son ID
 *     tags: [Statistiques]
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
 *         description: Statistiques du pack récupérées
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
 *                     type: object
 *                     properties:
 *                       packId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       priceUsd:
 *                         type: number
 *                       totalPurchased:
 *                         type: integer
 *                       revenueUSD:
 *                         type: number
 *                       revenueETH:
 *                         type: number
 *       404:
 *         description: Pack non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "packs/:id",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.STATS_ACCESS),
  getStatistiquePacksController
);

/**
 * @swagger
 * /api/admin/stats/packs:
 *   get:
 *     summary: Statistiques globales des packs
 *     description: Récupère les statistiques de tous les packs avec détails par type
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Statistiques des packs récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPurchased:
 *                       type: integer
 *                       example: 45
 *                     totalRevenueUSD:
 *                       type: number
 *                       example: 12500.75
 *                     totalRevenueETH:
 *                       type: number
 *                       example: 2.856
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           packId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [bronze, silver, gold]
 *                           totalPurchased:
 *                             type: integer
 *                           revenueUSD:
 *                             type: number
 *                           revenueETH:
 *                             type: number
 */
router.get(
  BASE_URL + "packs",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.STATS_ACCESS),
  getStatistiquePacksController
);

/**
 * @swagger
 * /api/admin/stats/slots:
 *   get:
 *     summary: Statistiques globales des slots
 *     description: Récupère les statistiques de tous les types de slots
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Statistiques des slots récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 8500.00
 *                     totalRevenueETH:
 *                       type: number
 *                       example: 1.945
 *                     totalPurchased:
 *                       type: integer
 *                       example: 120
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           slotTypeId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           level:
 *                             type: integer
 *                           basePriceUsd:
 *                             type: number
 *                           totalPurchased:
 *                             type: integer
 *                           activeCount:
 *                             type: integer
 *                           availableCount:
 *                             type: integer
 *                           lockedCount:
 *                             type: integer
 *                           archivedCount:
 *                             type: integer
 *                           revenueUSD:
 *                             type: number
 *                           revenueETH:
 *                             type: number
 */
router.get(
  BASE_URL + "slots",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.STATS_ACCESS),
  getStatistiqueSlotsController
);

/**
 * @swagger
 * /api/admin/stats/slots/{id}:
 *   get:
 *     summary: Statistiques d'un type de slot spécifique
 *     description: Récupère les statistiques détaillées d'un type de slot par son ID
 *     tags: [Statistiques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type de slot
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Statistiques du slot récupérées
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
 *                     type: object
 *                     properties:
 *                       slotTypeId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       level:
 *                         type: integer
 *                       basePriceUsd:
 *                         type: number
 *                       totalPurchased:
 *                         type: integer
 *                       activeCount:
 *                         type: integer
 *                       availableCount:
 *                         type: integer
 *                       revenueUSD:
 *                         type: number
 *                       revenueETH:
 *                         type: number
 *       404:
 *         description: Slot non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "slots/:id",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.STATS_ACCESS),
  getStatistiqueSlotsController
);

export default router;
