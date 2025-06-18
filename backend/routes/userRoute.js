const router = require("express").Router();
const userController = require("../controllers/UserController");
const { checkAuthorize } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API người dùng
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Lấy thông tin hồ sơ người dùng hiện tại
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Không được ủy quyền
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/profile", checkAuthorize(["user"]), userController.getMyProfile);


module.exports = router;