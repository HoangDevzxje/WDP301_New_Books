const router = require("express").Router();
const addressController = require("../controllers/AddressController");
const { checkAuthorize } = require("../middleware/authMiddleware");


/**
 * @swagger
 * tags:
 *   name: Address
 *   description: API quản lý địa chỉ người dùng
 */

/**
 * @swagger
 * /address:
 *   get:
 *     summary: Lấy danh sách địa chỉ của người dùng hiện tại
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách địa chỉ người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       500:
 *         description: Lỗi server
 */
router.get("/", checkAuthorize(["user"]), addressController.getMyAddresses);

/**
 * @swagger
 * /address:
 *   post:
 *     summary: Thêm địa chỉ mới cho người dùng
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - provinceName
 *               - districtName
 *               - wardName
 *             properties:
 *               address:
 *                 type: string
 *               provinceName:
 *                 type: string
 *               districtName:
 *                 type: string
 *               wardName:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Đã thêm địa chỉ mới
 *       500:
 *         description: Lỗi server
 */
router.post("/", checkAuthorize(["user"]), addressController.addAddress);

/**
 * @swagger
 * /address/{addressId}:
 *   put:
 *     summary: Cập nhật thông tin địa chỉ
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: ID của địa chỉ cần cập nhật
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               provinceName:
 *                 type: string
 *               districtName:
 *                 type: string
 *               wardName:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Đã cập nhật địa chỉ
 *       404:
 *         description: Không tìm thấy địa chỉ
 *       500:
 *         description: Lỗi server
 */
router.put("/:addressId", checkAuthorize(["user"]), addressController.updateAddress);

/**
 * @swagger
 * /address/{addressId}/set-default:
 *   put:
 *     summary: Đặt địa chỉ làm mặc định
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của địa chỉ cần đặt làm mặc định
 *     responses:
 *       200:
 *         description: Đã đặt địa chỉ làm mặc định
 *       404:
 *         description: Không tìm thấy địa chỉ
 *       500:
 *         description: Lỗi server
 */
router.put("/:addressId/set-default", checkAuthorize(["user"]), addressController.setDefaultAddress);

/**
 * @swagger
 * /address/{addressId}:
 *   delete:
 *     summary: Xóa địa chỉ người dùng
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của địa chỉ cần xóa
 *     responses:
 *       200:
 *         description: Đã xóa địa chỉ
 *       404:
 *         description: Không tìm thấy địa chỉ
 *       500:
 *         description: Lỗi server
 */
router.delete("/:addressId", checkAuthorize(["user"]), addressController.deleteAddress);


module.exports = router;