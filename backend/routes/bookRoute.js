const router = require("express").Router();
const bookController = require("../controllers/BookController");

router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.get("/category/:id", bookController.getBookByCategory);

module.exports = router;