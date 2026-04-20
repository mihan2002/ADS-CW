import { Router } from "express";
import { AlumniController, upload } from "../controllers/AlumniController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Alumni
 *     description: Alumni management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AlumniProfile:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           example: 1
 *         first_name:
 *           type: string
 *           example: John
 *         last_name:
 *           type: string
 *           example: Doe
 *         bio:
 *           type: string
 *           example: Software Engineer with 10 years of experience
 *         graduation_year:
 *           type: integer
 *           example: 2015
 *         degree:
 *           type: string
 *           example: Bachelor of Computer Science
 *         current_position:
 *           type: string
 *           example: Senior Software Engineer
 *         linkedin_url:
 *           type: string
 *           example: https://linkedin.com/in/johndoe
 *         profile_image_id:
 *           type: integer
 *           example: 1
 *         appearance_count:
 *           type: integer
 *           example: 0
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     Degree:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Bachelor of Science in Computer Science
 *         institution_name:
 *           type: string
 *           example: University of Example
 *         official_url:
 *           type: string
 *           example: https://university.edu/programs/cs
 *         completed_on:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *     
 *     Certification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: AWS Certified Solutions Architect
 *         provider:
 *           type: string
 *           example: Amazon Web Services
 *         course_url:
 *           type: string
 *           example: https://aws.amazon.com/certification/
 *         completed_on:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *     
 *     License:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Professional Engineer License
 *         awarding_body:
 *           type: string
 *           example: State Board of Engineering
 *         license_url:
 *           type: string
 *           example: https://engineering-board.gov/licenses
 *         completed_on:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *     
 *     ProfessionalCourse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Advanced Machine Learning
 *         provider:
 *           type: string
 *           example: Coursera
 *         course_url:
 *           type: string
 *           example: https://coursera.org/learn/machine-learning
 *         completed_on:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *     
 *     EmploymentHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         company:
 *           type: string
 *           example: Tech Corp
 *         job_title:
 *           type: string
 *           example: Senior Software Engineer
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         description:
 *           type: string
 *           example: Led a team of 5 developers
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

// ====================
// Alumni Profile Routes
// ====================

/**
 * @swagger
 * /api/alumni:
 *   get:
 *     summary: Get all alumni profiles
 *     tags: [Alumni]
 *     responses:
 *       200:
 *         description: Alumni profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AlumniProfile'
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get("/", AlumniController.getAllProfiles);

// ====================
// Slot Routes  (must be declared BEFORE /:userId to avoid param collision)
// ====================

/**
 * @swagger
 * /api/alumni/slots/tomorrow:
 *   get:
 *     summary: Get tomorrow's feature-day slot status
 *     description: |
 *       Returns whether tomorrow's featured-alumni slot is open or already
 *       assigned to a winner. `isOpen: true` means bids are still valid.
 *     tags: [Alumni]
 *     responses:
 *       200:
 *         description: Slot status retrieved successfully
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
 *                     date:
 *                       type: string
 *                       example: "2026-04-02"
 *                       description: Tomorrow's date in YYYY-MM-DD format
 *                     isOpen:
 *                       type: boolean
 *                       example: true
 *                       description: True if no winner has been selected yet
 *                     slot:
 *                       nullable: true
 *                       type: object
 *                       description: The feature_days record, or null if not yet created
 *                       properties:
 *                         id:
 *                           type: integer
 *                         day:
 *                           type: string
 *                           format: date
 *                         winner_user_id:
 *                           type: integer
 *                           nullable: true
 *                         winning_bid_id:
 *                           type: integer
 *                           nullable: true
 *                         selected_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get("/slots/tomorrow", AlumniController.getTomorrowSlot);

/**
 * @swagger
 * /api/alumni/{userId}:
 *   get:
 *     summary: Get complete alumni profile by user ID
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Alumni profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/AlumniProfile'
 *                     degrees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Degree'
 *                     certifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Certification'
 *                     licenses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/License'
 *                     professionalCourses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProfessionalCourse'
 *                     employmentHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EmploymentHistory'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:userId", AlumniController.getProfile);

/**
 * @swagger
 * /api/alumni/{userId}/profile:
 *   post:
 *     summary: Create or update alumni profile
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               bio:
 *                 type: string
 *                 example: Software Engineer with 10 years of experience
 *               graduation_year:
 *                 type: integer
 *                 example: 2015
 *               degree:
 *                 type: string
 *                 example: Bachelor of Computer Science
 *               current_position:
 *                 type: string
 *                 example: Senior Software Engineer
 *               linkedin_url:
 *                 type: string
 *                 example: https://linkedin.com/in/johndoe
 *     responses:
 *       200:
 *         description: Alumni profile updated successfully
 *       201:
 *         description: Alumni profile created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/:userId/profile", AlumniController.createOrUpdateProfile);

/**
 * @swagger
 * /api/alumni/{userId}/profile-image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPEG, PNG, GIF - max 5MB)
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: Invalid file or user ID
 *       404:
 *         description: Alumni profile not found
 *       500:
 *         description: Server error
 */
router.post(
	"/:userId/profile-image",
	upload.single("profileImage"),
	AlumniController.uploadProfileImage,
);

/**
 * @swagger
 * /api/alumni/{userId}/profile:
 *   delete:
 *     summary: Delete alumni profile
 *     description: Permanently deletes the alumni profile for the given user. All related sub-records (degrees, certifications, licenses, courses, employment history) are removed automatically via cascade.
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Alumni profile deleted successfully
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
 *                   example: Alumni profile deleted successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User or alumni profile not found
 *       500:
 *         description: Server error
 */
router.delete("/:userId/profile", AlumniController.deleteProfile);

// ====================
// Degree Routes
// ====================

/**
 * @swagger
 * /api/alumni/{userId}/degrees:
 *   post:
 *     summary: Add a degree
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - institution_name
 *             properties:
 *               title:
 *                 type: string
 *                 example: Bachelor of Science in Computer Science
 *               institution_name:
 *                 type: string
 *                 example: University of Example
 *               official_url:
 *                 type: string
 *                 example: https://university.edu/programs/cs
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *                 example: 2015-06-15T00:00:00.000Z
 *     responses:
 *       201:
 *         description: Degree added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/:userId/degrees", AlumniController.addDegree);

/**
 * @swagger
 * /api/alumni/{userId}/degrees/{degreeId}:
 *   put:
 *     summary: Update a degree
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Degree ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               institution_name:
 *                 type: string
 *               official_url:
 *                 type: string
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Degree updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Degree not found
 *       500:
 *         description: Server error
 */
router.put("/:userId/degrees/:degreeId", AlumniController.updateDegree);

/**
 * @swagger
 * /api/alumni/{userId}/degrees/{degreeId}:
 *   delete:
 *     summary: Delete a degree
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Degree ID
 *     responses:
 *       200:
 *         description: Degree deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Degree not found
 *       500:
 *         description: Server error
 */
router.delete("/:userId/degrees/:degreeId", AlumniController.deleteDegree);

// ====================
// Certification Routes
// ====================

/**
 * @swagger
 * /api/alumni/{userId}/certifications:
 *   post:
 *     summary: Add a certification
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - provider
 *             properties:
 *               name:
 *                 type: string
 *                 example: AWS Certified Solutions Architect
 *               provider:
 *                 type: string
 *                 example: Amazon Web Services
 *               course_url:
 *                 type: string
 *                 example: https://aws.amazon.com/certification/
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Certification added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/:userId/certifications", AlumniController.addCertification);

/**
 * @swagger
 * /api/alumni/{userId}/certifications/{certId}:
 *   put:
 *     summary: Update a certification
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: certId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               provider:
 *                 type: string
 *               course_url:
 *                 type: string
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Certification updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Certification not found
 *       500:
 *         description: Server error
 */
router.put(
	"/:userId/certifications/:certId",
	AlumniController.updateCertification,
);

/**
 * @swagger
 * /api/alumni/{userId}/certifications/{certId}:
 *   delete:
 *     summary: Delete a certification
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: certId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certification ID
 *     responses:
 *       200:
 *         description: Certification deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Certification not found
 *       500:
 *         description: Server error
 */
router.delete(
	"/:userId/certifications/:certId",
	AlumniController.deleteCertification,
);

// ====================
// License Routes
// ====================

/**
 * @swagger
 * /api/alumni/{userId}/licenses:
 *   post:
 *     summary: Add a license
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - awarding_body
 *             properties:
 *               name:
 *                 type: string
 *                 example: Professional Engineer License
 *               awarding_body:
 *                 type: string
 *                 example: State Board of Engineering
 *               license_url:
 *                 type: string
 *                 example: https://engineering-board.gov/licenses
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: License added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/:userId/licenses", AlumniController.addLicense);

/**
 * @swagger
 * /api/alumni/{userId}/licenses/{licenseId}:
 *   put:
 *     summary: Update a license
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: licenseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: License ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               awarding_body:
 *                 type: string
 *               license_url:
 *                 type: string
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: License updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: License not found
 *       500:
 *         description: Server error
 */
router.put("/:userId/licenses/:licenseId", AlumniController.updateLicense);

/**
 * @swagger
 * /api/alumni/{userId}/licenses/{licenseId}:
 *   delete:
 *     summary: Delete a license
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: licenseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: License ID
 *     responses:
 *       200:
 *         description: License deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: License not found
 *       500:
 *         description: Server error
 */
router.delete("/:userId/licenses/:licenseId", AlumniController.deleteLicense);

// ====================
// Professional Course Routes
// ====================

/**
 * @swagger
 * /api/alumni/{userId}/courses:
 *   post:
 *     summary: Add a professional course
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - provider
 *             properties:
 *               title:
 *                 type: string
 *                 example: Advanced Machine Learning
 *               provider:
 *                 type: string
 *                 example: Coursera
 *               course_url:
 *                 type: string
 *                 example: https://coursera.org/learn/machine-learning
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Professional course added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/:userId/courses", AlumniController.addProfessionalCourse);

/**
 * @swagger
 * /api/alumni/{userId}/courses/{courseId}:
 *   put:
 *     summary: Update a professional course
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               provider:
 *                 type: string
 *               course_url:
 *                 type: string
 *               completed_on:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Professional course updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Professional course not found
 *       500:
 *         description: Server error
 */
router.put(
	"/:userId/courses/:courseId",
	AlumniController.updateProfessionalCourse,
);

/**
 * @swagger
 * /api/alumni/{userId}/courses/{courseId}:
 *   delete:
 *     summary: Delete a professional course
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Professional course deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Professional course not found
 *       500:
 *         description: Server error
 */
router.delete(
	"/:userId/courses/:courseId",
	AlumniController.deleteProfessionalCourse,
);

// ====================
// Employment History Routes
// ====================

/**
 * @swagger
 * /api/alumni/{userId}/employment:
 *   post:
 *     summary: Add employment history
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company
 *               - job_title
 *               - start_date
 *             properties:
 *               company:
 *                 type: string
 *                 example: Tech Corp
 *               job_title:
 *                 type: string
 *                 example: Senior Software Engineer
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2020-01-01T00:00:00.000Z
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-12-31T00:00:00.000Z
 *               description:
 *                 type: string
 *                 example: Led a team of 5 developers
 *     responses:
 *       201:
 *         description: Employment history added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/:userId/employment", AlumniController.addEmploymentHistory);

/**
 * @swagger
 * /api/alumni/{userId}/employment/{employmentId}:
 *   put:
 *     summary: Update employment history
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: employmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               job_title:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employment history updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Employment history not found
 *       500:
 *         description: Server error
 */
router.put(
	"/:userId/employment/:employmentId",
	AlumniController.updateEmploymentHistory,
);

/**
 * @swagger
 * /api/alumni/{userId}/employment/{employmentId}:
 *   delete:
 *     summary: Delete employment history
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: employmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employment ID
 *     responses:
 *       200:
 *         description: Employment history deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Employment history not found
 *       500:
 *         description: Server error
 */
router.delete(
	"/:userId/employment/:employmentId",
	AlumniController.deleteEmploymentHistory,
);

// ====================
// Bid Routes
// ====================

/**
 * @swagger
 * /api/alumni/{userId}/bids:
 *   get:
 *     summary: Get bidding history
 *     description: Returns all bids placed by the user, ordered from newest to oldest.
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Bidding history retrieved successfully
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
 *                       user_id:
 *                         type: integer
 *                       amount:
 *                         type: string
 *                         example: "150.00"
 *                       status:
 *                         type: string
 *                         example: pending
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:userId/bids", AlumniController.getBiddingHistory);

/**
 * @swagger
 * /api/alumni/{userId}/bids/status:
 *   get:
 *     summary: Get my current bid status
 *     description: Returns the most recently placed bid for the user (regardless of status).
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Bid status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     amount:
 *                       type: string
 *                       example: "150.00"
 *                     status:
 *                       type: string
 *                       example: pending
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:userId/bids/status", AlumniController.getMyBidStatus);

/**
 * @swagger
 * /api/alumni/{userId}/bids:
 *   post:
 *     summary: Place a bid
 *     description: Places a new bid on behalf of the specified user. The bid is created with a "pending" status.
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 150.00
 *                 description: Bid amount (must be greater than 0)
 *     responses:
 *       201:
 *         description: Bid placed successfully
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
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     amount:
 *                       type: string
 *                       example: "150.00"
 *                     status:
 *                       type: string
 *                       example: pending
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: Bid placed successfully
 *       400:
 *         description: Invalid input (missing amount, non-positive value, or bad user ID)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/:userId/bids", AlumniController.placeBid);

/**
 * @swagger
 * /api/alumni/{userId}/bids/{bidId}:
 *   put:
 *     summary: Update a bid amount
 *     description: Updates the amount of a pending bid. Bids that are cancelled or won cannot be updated.
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bid ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 200.00
 *                 description: New bid amount (must be greater than 0)
 *     responses:
 *       200:
 *         description: Bid updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Bid not found
 *       409:
 *         description: Bid is not in pending status and cannot be updated
 *       500:
 *         description: Server error
 */
router.put("/:userId/bids/:bidId", AlumniController.updateBid);

/**
 * @swagger
 * /api/alumni/{userId}/bids/{bidId}/cancel:
 *   patch:
 *     summary: Cancel a bid
 *     description: Cancels a bid by setting its status to "cancelled". Already-cancelled bids return 409.
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bid ID
 *     responses:
 *       200:
 *         description: Bid cancelled successfully
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
 *                   example: Bid cancelled successfully
 *       400:
 *         description: Invalid user ID or bid ID
 *       404:
 *         description: Bid not found
 *       409:
 *         description: Bid is already cancelled
 *       500:
 *         description: Server error
 */
router.patch("/:userId/bids/:bidId/cancel", AlumniController.cancelBid);

// ====================
// Slot & Limit Routes
// ====================

/**
 * @swagger
 * /api/alumni/{userId}/appearance-count:
 *   get:
 *     summary: Get monthly and total appearance count
 *     description: |
 *       Returns how many times the specified user has won the featured-alumni
 *       slot in the current calendar month, plus their all-time total from
 *       `alumni_profiles.appearance_count`.
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Appearance count retrieved successfully
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
 *                     month:
 *                       type: string
 *                       example: "2026-04"
 *                       description: Current calendar month (YYYY-MM)
 *                     monthlyCount:
 *                       type: integer
 *                       example: 0
 *                       description: Wins in the current month
 *                     totalCount:
 *                       type: integer
 *                       example: 3
 *                       description: All-time cumulative appearance count
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:userId/appearance-count", AlumniController.getMonthlyAppearanceCount);

/**
 * @swagger
 * /api/alumni/{userId}/monthly-limit:
 *   get:
 *     summary: Check if user has reached their monthly bid/feature limit
 *     description: |
 *       Returns the monthly feature-day limit, the user's current count for
 *       this calendar month, whether the limit has been reached, and how
 *       many slots remain. The monthly cap is currently **1** appearance
 *       per calendar month per alumni.
 *     tags: [Alumni]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Monthly limit status retrieved successfully
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
 *                     month:
 *                       type: string
 *                       example: "2026-04"
 *                     currentCount:
 *                       type: integer
 *                       example: 0
 *                       description: Number of feature-day wins this month
 *                     limit:
 *                       type: integer
 *                       example: 1
 *                       description: Maximum allowed per calendar month
 *                     hasReachedLimit:
 *                       type: boolean
 *                       example: false
 *                     remainingSlots:
 *                       type: integer
 *                       example: 1
 *                       description: How many more times the user can win this month
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:userId/monthly-limit", AlumniController.checkMonthlyLimit);

export default router;
