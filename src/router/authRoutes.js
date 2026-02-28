import express from 'express';
import {  isConnect, loginController,  verifyTwoFACodeController, verifyTokenController } from '../controller/authController.js';
import { authMiddleware } from '../middlware/authMiddlware.js';
import { rateLimit } from '../middlware/rateLimit.js';
import {  blockedCheckMiddleware } from '../middlware/blockedCheck.js';

const router = express.Router();

const BASE_URL="/api/auth/"

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion administrateur avec 2FA
 *     description: Authentifie un administrateur avec email/mot de passe et envoie un code 2FA par email
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@soluxury.com
 *                 description: Adresse email de l'administrateur
 *               password:
 *                 type: string
 *                 example: motDePasseSecurise123
 *                 description: Mot de passe de l'administrateur
 *     responses:
 *       200:
 *         description: Connexion réussie, code 2FA envoyé
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
 *                   example: Bienvenue dans votre compte
 *                 result:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/Admin'
 *                     token:
 *                       type: string
 *                       description: JWT temporaire pour la vérification 2FA
 *       409:
 *         description: Email ou mot de passe invalide
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
router.post(BASE_URL+"login",loginController)

/**
 * @swagger
 * /api/auth/verfieCode:
 *   post:
 *     summary: Vérification du code 2FA
 *     description: Vérifie le code OTP envoyé par email et active le compte administrateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *                 description: Code OTP à 6 chiffres reçu par email
 *     responses:
 *       200:
 *         description: Code validé avec succès
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
 *                   example: Code validé, admin activé
 *       400:
 *         description: Code invalide ou expiré
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
router.post(BASE_URL+"verfieCode",verifyTwoFACodeController);



/**
 * @swagger
 * /api/auth/isConnect:
 *   get:
 *     summary: Vérification de la connexion
 *     description: Vérifie si l'utilisateur est toujours connecté via son token JWT
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isConnect:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(BASE_URL+"isConnect",isConnect);

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     summary: Vérifier la validité d'un token JWT
 *     description: Retourne l'état de validité du token et le payload décodé si valide
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT à vérifier (optionnel si Authorization Bearer est utilisé)
 *     responses:
 *       200:
 *         description: Token valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 decoded:
 *                   type: object
 *             examples:
 *               success:
 *                 summary: Exemple de token valide
 *                 value:
 *                   success: true
 *                   valid: true
 *                   decoded:
 *                     id: 1
 *                     email: admin@soluxury.com
 *       400:
 *         description: Token manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing:
 *                 summary: Aucun token fourni
 *                 value:
 *                   success: false
 *                   message: Token manquant
 *       401:
 *         description: Token invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid:
 *                 summary: Signature invalide / expiré
 *                 value:
 *                   success: false
 *                   message: Token invalide
 */
router.post(BASE_URL+"verify-token", verifyTokenController);



export default router;
