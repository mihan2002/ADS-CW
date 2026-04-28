import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';

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
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: password123
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
router.get('/:id', UserController.getById);

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
 *         description: Missing required fields or invalid age
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       500:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
router.post('/', UserController.create);

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
