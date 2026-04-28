import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { requireAuth, requireRole, requireSelfOrRole } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Jane Doe
 *         age:
 *           type: integer
 *           example: 24
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *         password_hash:
 *           type: string
 *           example: $2b$10$examplehash
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           example: user
 *         is_email_verified:
 *           type: integer
 *           enum: [0, 1]
 *           example: 0
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         last_login_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         age:
 *           type: integer
 *           example: 22
 *         email:
 *           type: string
 *           format: email
 *           description: Must be a university email address
 *           example: john.doe@university.edu
 *         password:
 *           type: string
 *           description: Must contain an uppercase letter
 *           example: Password123!
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           example: user
 *           description: User role (defaults to 'user' if not provided)
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Updated Name
 *         age:
 *           type: integer
 *           example: 25
 *         email:
 *           type: string
 *           format: email
 *           example: updated@example.com
 *         password_hash:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           example: user
 *         is_email_verified:
 *           type: integer
 *           enum: [0, 1]
 *         last_login_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     ApiResponseUsers:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *
 *     ApiResponseUser:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *
 *     ApiResponseMessage:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: custom
 *         path:
 *           type: array
 *           items:
 *             type: string
 *           example: ["email"]
 *         message:
 *           type: string
 *           example: Email must be a university email address
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validation error
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValidationError'
 *           example:
 *             - code: custom
 *               path: ["email"]
 *               message: Email must be a university email address
 *             - code: custom
 *               path: ["password"]
 *               message: Password must contain an uppercase letter
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUsers'
 *       500:
 *         description: Failed to retrieve users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
// Registration remains public
router.post('/', UserController.create);

// Current user profile (authenticated)
router.get("/me", requireAuth, UserController.getMe);

// Protect user management endpoints
router.use(requireAuth, requireRole(["admin"]));

router.get('/', UserController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       400:
 *         description: Valid user ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       500:
 *         description: Failed to retrieve user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
router.get('/:id', requireAuth, requireSelfOrRole(["admin"]), UserController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       400:
 *         description: Validation error - invalid email or password format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseUser'
 *       400:
 *         description: Invalid user ID or invalid field value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       500:
 *         description: Failed to update user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
router.put('/:id', UserController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       400:
 *         description: Valid user ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       500:
 *         description: Failed to delete user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
router.delete('/:id', UserController.delete);

export default router;
