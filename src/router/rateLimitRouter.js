import express from "express";
import { authMiddleware } from "../middlware/authMiddlware.js";
import { rateLimit } from "../middlware/rateLimit.js";

/**
 * @swagger
 * tags:
 *   - name: Tests et monitoring
 *     description: API pour tester les limites de taux et le monitoring
 */

const router = express.Router();

/**
 * @swagger
 * /api/pingCompte:
 *   get:
 *     summary: Test de rate limiting pour compte authentifié
 *     description: Endpoint de test pour vérifier les limites de taux par compte authentifié. Limité à 10 requêtes par 5 minutes par IP/compte.
 *     tags: [Tests et monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test réussi - Rate limit OK
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
 *                   example: "API OK ✅"
 *                 ip:
 *                   type: string
 *                   example: "192.168.1.100"
 *                   description: Adresse IP du client
 *                 account:
 *                   type: string
 *                   example: "0x123...abc"
 *                   description: Adresse du compte/wallet authentifié
 *       429:
 *         description: Rate limit dépassé
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
 *                   enum: 
 *                     - "Vous êtes temporairement bloqué pour abus 🚫"
 *                     - "IP et compte bloqués (trop de requêtes en 5min)"
 *                     - "Sous-réseau [subnet] bloqué (abus multi-comptes)"
 *                   example: "Vous êtes temporairement bloqué pour abus 🚫"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/api/pingCompte",authMiddleware,rateLimit, (req, res) => {
  res.json({
    success: true,
    message: "API OK ✅",
    ip: req.ip,
    account: req.info?.address || "N/A"
  });
});

export default router;
