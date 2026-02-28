import express from "express";
import {
  authMiddleware,
  authorizeRoles,
  ROLE_PERMISSIONS,
} from "../middlware/authMiddlware.js";
import { upload, uploadMiddlware } from "../middlware/upload.js";
import {
  deleteMediaController,
  getAllMediasController,
  updateMediaController,
  getMediaByIdController,
  uploadMediaController,
} from "../controller/mediasController.js";

/**
 * @swagger
 * tags:
 *   - name: Gestion des médias
 *     description: API pour la gestion des fichiers multimédias (images et vidéos)
 */

const router = express.Router();

const BASE_URL="/api/admin/media/";

/**
 * @swagger
 * /api/admin/media/upload/{type}/{order_index}:
 *   post:
 *     summary: Télécharger un fichier média
 *     description: Télécharge un fichier image ou vidéo avec un type et un ordre spécifiés
 *     tags: [Gestion des médias]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [image, videos]
 *         description: Type de média (image pour carousel, videos pour vidéos)
 *       - in: path
 *         name: order_index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index d'ordre pour l'affichage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - file
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nom lisible du média
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier à télécharger (max 50MB, formats supportés - images- jpeg, png, gif, webp, vidéos- mp4, mpeg)
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *     responses:
 *       200:
 *         description: Fichier téléchargé avec succès
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
 *                   example: "File uploaded successfully"
 *                 media:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *                       example: "http://localhost:5000/uploads/1735123456789-123456789.jpg"
 *                       description: URL complète du média
 *                     type:
 *                       type: string
 *                     order_index:
 *                       type: integer
 *       400:
 *         description: Aucun fichier fourni ou type non supporté
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
 *                   example: "Type de fichier non autorisé (image/vidéo uniquement)."
 *       500:
 *         description: Erreur lors du téléchargement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  BASE_URL + "upload/:type/:order_index",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.MEDIA_WRITE),
  uploadMiddlware("file"),
  uploadMediaController
);

/**
 * @swagger
 * /api/admin/media/update/{id}/{type}/{order_index}:
 *   put:
 *     summary: Mettre à jour un fichier média
 *     description: Remplace un fichier média existant par un nouveau fichier
 *     tags: [Gestion des médias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du média à mettre à jour
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [image, videos]
 *         description: Type de média
 *       - in: path
 *         name: order_index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Nouvel index d'ordre
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - file
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nouveau nom du média
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Nouveau fichier de remplacement
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *     responses:
 *       200:
 *         description: Fichier mis à jour avec succès
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
 *                   example: "File updated successfully"
 *                 media:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *                       example: "http://localhost:5000/uploads/1735123456789-123456789.jpg"
 *                     type:
 *                       type: string
 *                     order_index:
 *                       type: integer
 *       400:
 *         description: Aucun fichier fourni
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur lors de la mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  BASE_URL + "update/:id/:type/:order_index",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.MEDIA_WRITE),
  uploadMiddlware("file"),
  updateMediaController
);

/**
 * @swagger
 * /api/admin/media/delete/{id}:
 *   delete:
 *     summary: Supprimer un fichier média
 *     description: Supprime un fichier média du système et du stockage
 *     tags: [Gestion des médias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du média à supprimer
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *     responses:
 *       200:
 *         description: Fichier supprimé avec succès
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
 *                   example: "File deleted successfully"
 *       500:
 *         description: Erreur lors de la suppression
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Media not found in database"
 */
router.delete(
  BASE_URL + "delete/:id",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.MEDIA_WRITE),
  deleteMediaController
);

/**
 * @swagger
 * /api/admin/media/carousel:
 *   get:
 *     summary: Récupérer les images du carousel
 *     description: Récupère toutes les images destinées au carousel, triées par ordre d'affichage
 *     tags: [Gestion des médias]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Images du carousel récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 medias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Bannière d'accueil"
 *                       url:
 *                         type: string
 *                         example: "http://localhost:5000/uploads/image1.jpg"
 *                         description: URL complète de l'image
 *                       type:
 *                         type: string
 *                         example: "image"
 *                       order_index:
 *                         type: integer
 *                         example: 1
 *                         description: Ordre d'affichage
 *       500:
 *         description: Erreur lors de la récupération
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "carousel",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.MEDIA_READ),
  getAllMediasController
);

/**
 * @swagger
 * /api/admin/media/videos:
 *   get:
 *     summary: Récupérer les vidéos
 *     description: Récupère toutes les vidéos stockées, triées par ordre d'affichage
 *     tags: [Gestion des médias]
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Vidéos récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 medias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Teaser lancement"
 *                       url:
 *                         type: string
 *                         example: "http://localhost:5000/uploads/video1.mp4"
 *                         description: URL complète de la vidéo
 *                       type:
 *                         type: string
 *                         example: "videos"
 *                       order_index:
 *                         type: integer
 *                         example: 1
 *                         description: Ordre d'affichage
 *       500:
 *         description: Erreur lors de la récupération
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "videos",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.MEDIA_READ),
  getAllMediasController
  
);

/**
 * @swagger
 * /api/admin/media/videos/{id}:
 *   get:
 *     summary: Récupérer une vidéo par son ID
 *     description: Récupère une vidéo spécifique par son ID
 *     tags: [Gestion des médias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la vidéo à récupérer
 *     security:
 *       - bearerAuth: []
 *     x-roles-allowed:
 *       - superadmin
 *       - admin
 *       - manager
 *       - viewer
 *     responses:
 *       200:
 *         description: Vidéo récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 media:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Teaser lancement"
 *                     url:
 *                       type: string
 *                       example: "http://localhost:5000/uploads/video1.mp4"
 *                       description: URL complète de la vidéo
 *                     type:
 *                       type: string
 *                       example: "videos"
 *                     order_index:
 *                       type: integer
 *                       example: 1
 *                       description: Ordre d'affichage
 *       500:
 *         description: Erreur lors de la récupération
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  BASE_URL + "videos/:id",
  authMiddleware,
  authorizeRoles(ROLE_PERMISSIONS.MEDIA_READ),
  getMediaByIdController
);


export default router;
