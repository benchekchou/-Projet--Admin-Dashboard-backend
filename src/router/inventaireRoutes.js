import express from 'express';
import { authMiddleware } from '../middlware/authMiddlware.js';
import { getNftsController, getSlotsController } from '../controller/inventaireController.js';
import { blockedCheckMiddleware } from '../middlware/blockedCheck.js';
import { rateLimit } from '../middlware/rateLimit.js';

/**
 * @swagger
 * tags:
 *   - name: Inventaire utilisateur
 *     description: API pour la gestion de l'inventaire personnel des utilisateurs (NFTs et slots)
 */

const router=express.Router();

const BASE_URL="/api/inventory/"

/**
 * @swagger
 * /api/inventory/nfts:
 *   get:
 *     summary: NFTs de l'utilisateur connecté
 *     description: Récupère tous les NFTs associés aux wallets de l'utilisateur authentifié
 *     tags: [Inventaire utilisateur]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: NFTs de l'utilisateur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "nft_123456"
 *                     description: ID unique du NFT
 *                   ownerWallet:
 *                     type: string
 *                     example: "0x1234567890abcdef..."
 *                     description: Adresse du wallet propriétaire
 *                   tokenId:
 *                     type: integer
 *                     example: 42
 *                     description: ID du token sur la blockchain
 *                   rarity:
 *                     type: string
 *                     enum: [common, rare, epic, legendary]
 *                     example: "rare"
 *                     description: Niveau de rareté du NFT
 *                   name:
 *                     type: string
 *                     example: "Soluxury NFT #42"
 *                     description: Nom du NFT
 *                   image_url:
 *                     type: string
 *                     example: "https://api.soluxury.com/nft/42.jpg"
 *                     description: URL de l'image du NFT
 *                   attributes:
 *                     type: object
 *                     description: Attributs et métadonnées du NFT
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Date de création
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès bloqué : connexion suspecte détectée"
 *       429:
 *         description: Rate limit dépassé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur lors de la récupération des NFTs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve Nfts"
 */
router.get(BASE_URL+"nfts",authMiddleware,blockedCheckMiddleware,rateLimit,getNftsController);

/**
 * @swagger
 * /api/inventory/slots:
 *   get:
 *     summary: Slots de l'utilisateur connecté
 *     description: Récupère tous les slots ERC1155 associés aux wallets de l'utilisateur authentifié
 *     tags: [Inventaire utilisateur]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Slots de l'utilisateur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "order_123456"
 *                     description: ID de la commande/slot
 *                   buyerWallet:
 *                     type: string
 *                     example: "0x1234567890abcdef..."
 *                     description: Adresse du wallet acheteur
 *                   itemType:
 *                     type: string
 *                     example: "ERC1155"
 *                     description: Type d'item (ERC1155 pour les slots)
 *                   tokenId:
 *                     type: integer
 *                     example: 1
 *                     description: ID du token slot
 *                   quantity:
 *                     type: integer
 *                     example: 5
 *                     description: Quantité possédée
 *                   priceEth:
 *                     type: string
 *                     example: "0.5"
 *                     description: Prix payé en ETH
 *                   status:
 *                     type: string
 *                     enum: [pending, completed, cancelled]
 *                     example: "completed"
 *                     description: Statut de la commande
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date de création
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès bloqué : connexion suspecte détectée"
 *       429:
 *         description: Rate limit dépassé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur lors de la récupération des slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve Slots"
 */
router.get(BASE_URL+"slots",authMiddleware,blockedCheckMiddleware,rateLimit,getSlotsController);

export default router;