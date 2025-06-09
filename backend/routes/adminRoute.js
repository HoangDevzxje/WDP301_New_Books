const express = require("express");
const { checkAuthorize } = require("../middleware/authMiddleware");

const adminBookController = require("../controllers/AdminBookController");


const router = express.Router();

//Quản lý sách
router.get("/books", checkAuthorize(["admin"]), adminBookController.getAllBooks);
router.get("/books/:id", checkAuthorize(["admin"]), adminBookController.getBookById);
router.post("/books", checkAuthorize(["admin"]), adminBookController.createBook);
router.put("/books/:id", checkAuthorize(["admin"]), adminBookController.updateBook);
router.delete("/books/:id", checkAuthorize(["admin"]), adminBookController.deleteBook);


//Quản lý danh mục sách
router.get("/categories", checkAuthorize(["admin"]), adminBookController.getAllCategories);
router.post("/categories", checkAuthorize(["admin"]), adminBookController.createCategory);
router.put("/categories/:id", checkAuthorize(["admin"]), adminBookController.updateCategory);
router.delete("/categories/:id", checkAuthorize(["admin"]), adminBookController.deleteCategory);


module.exports = router;
