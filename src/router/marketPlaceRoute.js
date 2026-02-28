import express from 'express';
import { authMiddleware } from '../middlware/authMiddlware.js';
import { getMarketplaceCatalogController, getMarketplaceStatsController, statistiqueNFtsController } from '../controller/marketplacecontroller.js';
import { rateLimit } from '../middlware/rateLimit.js';
import { blockedCheckMiddleware } from '../middlware/blockedCheck.js';

/**
 * @swagger
 * tags:
 *   - name: Marketplace NFT
 *     description: API pour la gestion et les statistiques du marketplace NFT
 */

const router = express.Router();

const BASE_URL="/api/marketplace/";

/**
 * @swagger
 * /api/marketplace/catalog:
 *   get:
 *     summary: Catalogue du marketplace
 *     description: Récupère les informations du catalogue NFT (prix, stock, répartition par rareté)
 *     tags: [Marketplace NFT]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catalogue récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 priceWei:
 *                   type: string
 *                   example: "1000000000000000000"
 *                   description: Prix en Wei (basé sur le dernier ordre complété)
 *                 sold:
 *                   type: integer
 *                   example: 245
 *                   description: Nombre de NFTs vendus
 *                 remainingTotal:
 *                   type: integer
 *                   example: 755
 *                   description: Nombre de NFTs restants
 *                 rarityBreakdown:
 *                   type: object
 *                   properties:
 *                     common:
 *                       type: integer
 *                       example: 500
 *                       description: Nombre de NFTs communs
 *                     rare:
 *                       type: integer
 *                       example: 300
 *                       description: Nombre de NFTs rares
 *                     epic:
 *                       type: integer
 *                       example: 150
 *                       description: Nombre de NFTs épiques
 *                     legendary:
 *                       type: integer
 *                       example: 50
 *                       description: Nombre de NFTs légendaires
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès bloqué
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit dépassé
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
router.get(BASE_URL+'catalog',authMiddleware,blockedCheckMiddleware,rateLimit,getMarketplaceCatalogController);

/**
 * @swagger
 * /api/marketplace/stats:
 *   get:
 *     summary: Statistiques du marketplace
 *     description: Récupère les statistiques de vente du marketplace (volume, nombre de ventes, répartition par rareté)
 *     tags: [Marketplace NFT]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: integer
 *                   example: 245
 *                   description: Nombre total de ventes
 *                 volumeEth:
 *                   type: string
 *                   example: "125.456"
 *                   description: Volume total en ETH
 *                 perRarity:
 *                   type: object
 *                   properties:
 *                     common:
 *                       type: object
 *                       properties:
 *                         sales:
 *                           type: integer
 *                           example: 150
 *                         volumeEth:
 *                           type: string
 *                           example: "45.200"
 *                     rare:
 *                       type: object
 *                       properties:
 *                         sales:
 *                           type: integer
 *                           example: 75
 *                         volumeEth:
 *                           type: string
 *                           example: "50.150"
 *                     epic:
 *                       type: object
 *                       properties:
 *                         sales:
 *                           type: integer
 *                           example: 15
 *                         volumeEth:
 *                           type: string
 *                           example: "25.100"
 *                     legendary:
 *                       type: object
 *                       properties:
 *                         sales:
 *                           type: integer
 *                           example: 5
 *                         volumeEth:
 *                           type: string
 *                           example: "5.006"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès bloqué
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit dépassé
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
router.get(BASE_URL+'stats',authMiddleware,blockedCheckMiddleware,rateLimit,getMarketplaceStatsController);

/**
 * @swagger
 * /api/marketplace/statistiqueNfts:
 *   get:
 *     summary: Statistiques globales des NFTs
 *     description: Récupère les statistiques générales des NFTs (total, vendus, restants)
 *     tags: [Marketplace NFT]
 *     security: []
 *     responses:
 *       200:
 *         description: Statistiques NFTs récupérées avec succès
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
 *                     total:
 *                       type: integer
 *                       example: 1000
 *                       description: Nombre total de NFTs dans la collection
 *                     sold:
 *                       type: integer
 *                       example: 245
 *                       description: Nombre de NFTs vendus (avec propriétaire)
 *                     remaining:
 *                       type: integer
 *                       example: 755
 *                       description: Nombre de NFTs encore disponibles
 *                 message:
 *                   type: string
 *                   example: "Statistique NFTs retrieved successfully"
 *       500:
 *         description: Erreur lors de la récupération des statistiques
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
 *                   example: "Failed to fetch statistique NFTs"
 *                 error:
 *                   type: string
 *                   description: Message d'erreur détaillé
 */
router.get(BASE_URL+"statistiqueNfts",statistiqueNFtsController);

export default router;