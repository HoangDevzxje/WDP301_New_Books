const router = require("express").Router();
const bookController = require("../controllers/BookController");


/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API quản lý sách
 */


/**
 * @swagger
 * /books:
 *   get:
 *     summary: Lấy tất cả sách đang hoạt động
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Danh sách sách được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Lỗi server
 */
router.get("/", bookController.getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Lấy thông tin sách theo ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của sách
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin sách
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Không tìm thấy sách
 *       500:
 *         description: Lỗi server
 */
router.get("/:id", bookController.getBookById);

/**
 * @swagger
 * /books/category/{id}:
 *   get:
 *     summary: Lấy danh sách sách theo danh mục
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID danh mục sách
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách sách thuộc danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: Không tìm thấy sách
 *       500:
 *         description: Lỗi server
 */
router.get("/category/:id", bookController.getBookByCategory);

module.exports = router;