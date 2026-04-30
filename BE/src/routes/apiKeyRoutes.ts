import { Router } from "express";
import { ApiKeyController } from "../controllers/ApiKeyController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { csrfProtection } from "../middleware/csrf.js";

const router = Router();

/**
 * @swagger
 * /api/api-keys/csrf:
 *   get:
 *     summary: Get CSRF token
 *     description: Retrieve a CSRF token required for mutation operations (accessible to all authenticated users)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSRF token issued successfully
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
 *                     csrfToken:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: CSRF token issued
 *       401:
 *         description: Unauthorized
 */
router.get("/csrf", requireAuth, csrfProtection, (req, res) => {
  const token = (req as any).csrfToken?.();
  res.status(200).json({ success: true, data: { csrfToken: token }, message: "CSRF token issued" });
});

// All routes below require admin role
router.use(requireAuth, requireRole(["admin"]));

/**
 * @swagger
 * /api/api-keys:
 *   get:
 *     summary: List all API keys
 *     description: Retrieve a list of all API keys (Admin only)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
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
 *                       clientName:
 *                         type: string
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *                   example: API keys retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.get("/", ApiKeyController.list);

/**
 * @swagger
 * /api/api-keys:
 *   post:
 *     summary: Create a new API key
 *     description: Generate a new API key with specified permissions (Admin only)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-csrf-token
 *         required: true
 *         schema:
 *           type: string
 *         description: CSRF token obtained from /api/api-keys/csrf
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *             properties:
 *               clientName:
 *                 type: string
 *                 description: Name of the client/application using this API key
 *                 example: Mobile App
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permissions to grant
 *                 example: []
 *     responses:
 *       201:
 *         description: API key created successfully
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
 *                     id:
 *                       type: integer
 *                     clientName:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *                       description: The generated API key (only shown once)
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: API key created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required or invalid CSRF token
 *       500:
 *         description: Internal server error
 */
router.post("/", csrfProtection, ApiKeyController.create);

/**
 * @swagger
 * /api/api-keys/{apiKeyId}:
 *   delete:
 *     summary: Revoke an API key
 *     description: Revoke/delete an existing API key (Admin only)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the API key to revoke
 *       - in: header
 *         name: x-csrf-token
 *         required: true
 *         schema:
 *           type: string
 *         description: CSRF token obtained from /api/api-keys/csrf
 *     responses:
 *       200:
 *         description: API key revoked successfully
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
 *                   example: API key revoked
 *       400:
 *         description: Invalid API key ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required or invalid CSRF token
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:apiKeyId", csrfProtection, ApiKeyController.revoke);

export default router;

