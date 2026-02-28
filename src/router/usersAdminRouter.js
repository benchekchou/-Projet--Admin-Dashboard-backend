import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
  ROLE_PERMISSIONS,
  ADMIN_ROLES,
} from "../middlware/authMiddlware.js";
import {
  createAdminController,
  getMyProfileAdminController,
  updateUserRoleController,
  blockAdminController,
  signupAdminController,
  listUsersAdminController,
  getLogByIdAdminController,
} from "../controller/userAdminController.js";

/**
 * @swagger
 * tags:
 *   - name: Gestion des utilisateurs admin
 *     description: API pour la gestion des administrateurs (création, profil, inscription)
 */

const router = Router();
const BASE_URL = "/api/admin";


/**
 * @swagger
 * /api/admin/createAdmin:
 *   post:
 *     summary: Créer un nouveau administrateur
 *     description: Crée un compte administrateur et envoie une invitation par email
 *     tags: [Gestion des utilisateurs admin]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newadmin@soluxury.com
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, manager, viewer]
 *                 example: manager
 *     responses:
 *       200:
 *         description: Administrateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post(
  BASE_URL + "/createAdmin",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.ADMIN_MANAGE),
  createAdminController
);

/**
 * @swagger
 * /api/admin/createAdminPublic:
 *   post:
 *     summary: Créer un administrateur (endpoint public)
 *     description: Crée un compte administrateur et envoie une invitation par email sans authentification JWT.
 *     tags: [Gestion des utilisateurs admin]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newadmin@soluxury.com
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, manager, viewer]
 *                 example: manager
 *     responses:
 *       200:
 *         description: Administrateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Un compte admin existe déjà pour cet email
 *       500:
 *         description: Erreur interne du serveur
 */
router.post(
  BASE_URL + "/createAdminPublic",
  createAdminController
);


/**
 * @swagger
 * /api/admin/profileAdmin:
 *   get:
 *     summary: Profil de l'administrateur connecté
 *     description: Récupère le profil complet de l'administrateur connecté avec ses logs
 *     tags: [Gestion des utilisateurs admin]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 profile:
 *                   $ref: '#/components/schemas/Admin'
 */
router.get(
  BASE_URL + "/profileAdmin",
  authMiddleware,
  authorizeRoles(ADMIN_ROLES),
  getMyProfileAdminController
);


/**
 * @swagger
 * /api/admin/admins/{id}/block:
 *   patch:
 *     summary: Bloquer/débloquer un administrateur
 *     description: Active/Désactive un administrateur (champ isActive)
 *     tags: [Gestion des utilisateurs admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'administrateur
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *     responses:
 *       200:
 *         description: Statut de l'administrateur modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch(
  `${BASE_URL}/admins/:id/block`,
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.ADMIN_MANAGE),
  blockAdminController
);

/**
 * @swagger
 * /api/admin/signupAdmin:
 *   post:
 *     summary: Finaliser l'inscription administrateur
 *     description: Définit le mot de passe et active le compte administrateur
 *     tags: [Gestion des utilisateurs admin]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: motDePasseSecurise123
 *     responses:
 *       200:
 *         description: Inscription finalisée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post(
  BASE_URL + "/signupAdmin",
  authMiddleware,
  authorizeRoles(ADMIN_ROLES),
  signupAdminController
);

/**
 * @swagger
 * /api/admin/usersAdmin:
 *   get:
 *     summary: Liste paginée des administrateurs
 *     description: Récupère la liste des administrateurs avec pagination
 *     tags: [Gestion des utilisateurs admin]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
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
 *     responses:
 *       200:
 *         description: Liste des administrateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get(
  BASE_URL + "/usersAdmin",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.ADMIN_MANAGE),
  listUsersAdminController
);



// /**
//  * @swagger
//  * /api/admin/logs:
//  *   get:
//  *     summary: Liste paginée des logs
//  *     description: Récupère les logs enregistrés avec pagination
//  *     tags: [Gestion des utilisateurs admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Numéro de page
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 20
//  *         description: Nombre d'éléments par page
//  *     responses:
//  *       200:
//  *         description: Liste des logs récupérée avec succès
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       idLog:
//  *                         type: integer
//  *                       status:
//  *                         type: string
//  *                       addIP:
//  *                         type: string
//  *                       createdAt:
//  *                         type: string
//  *                         format: date-time
//  *                 total:
//  *                   type: integer
//  *                 page:
//  *                   type: integer
//  *                 totalPages:
//  *                   type: integer
//  */
//  router.get(BASE_URL+"/logs", listLogsController)

/**
 * @swagger
 * /api/admin/logs/{id}:
 *   get:
 *     summary: Logs d'un administrateur par son ID
 *     description: Récupère tous les logs liés à un administrateur
 *     tags: [Gestion des utilisateurs admin]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'administrateur
 *     responses:
 *       200:
 *         description: Logs récupérés avec succès
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
 *                       id:
 *                         type: integer
 *                       admin_id:
 *                         type: integer
 *                       action:
 *                         type: string
 *                       entity_id:
 *                         type: integer
 *                       details:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
router.get(
  `${BASE_URL}/logs/:id`,
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.LOGS_VIEW),
  getLogByIdAdminController
);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Mettre à jour le rôle d'un administrateur
 *     description: Permet à un superadmin de changer le rôle d'un administrateur existant
 *     tags: [Gestion des utilisateurs admin]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'administrateur à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, manager, viewer]
 *                 example: manager
 *     responses:
 *       200:
 *         description: Rôle mis à jour avec succès
 *       400:
 *         description: Paramètres invalides
 *       403:
 *         description: Accès interdit pour les non superadmins
 *       404:
 *         description: Admin introuvable
 *       500:
 *         description: Erreur interne du serveur
 */
router.patch(
  `${BASE_URL}/users/:id/role`,
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.ADMIN_MANAGE),
  updateUserRoleController
);

export default router;
