const express = require("express");
const { checkAuthorize } = require("../middleware/authMiddleware");
const { uploadMultiple } = require("../config/cloudinary");
const adminController = require("../controllers/AdminController");
const adminBookController = require("../controllers/AdminBookController");
const adminFeedbackController = require("../controllers/AdminFeedbackController");
const adminDiscountController = require("../controllers/AdminDiscountController");
const router = express.Router();

//Quản lý user
router.get("/users", checkAuthorize(["admin"]), adminController.getAllUsers);
router.get(
  "/users/:id",
  checkAuthorize(["admin"]),
  adminController.getUserById
);
router.put("/users/:id", checkAuthorize(["admin"]), adminController.updateUser);
router.put(
  "/users/:id/change-status",
  checkAuthorize(["admin"]),
  adminController.changeStatusUser
);
//Quản lý sách
router.get(
  "/books",
  checkAuthorize(["admin"]),
  adminBookController.getAllBooks
);
router.get(
  "/books/:id",
  checkAuthorize(["admin"]),
  adminBookController.getBookById
);
router.post(
  "/books",
  checkAuthorize(["admin"]),
  uploadMultiple, // middleware upload ảnh
  adminBookController.createBook
);

router.put(
  "/books/:id",
  checkAuthorize(["admin"]),
  uploadMultiple, // hỗ trợ cập nhật ảnh mới
  adminBookController.updateBook
);
router.delete(
  "/books/:id",
  checkAuthorize(["admin"]),
  adminBookController.deleteBook
);

//Quản lý danh mục sách
router.get(
  "/categories",
  checkAuthorize(["admin"]),
  adminBookController.getAllCategories
);
router.post(
  "/categories",
  checkAuthorize(["admin"]),
  adminBookController.createCategory
);
router.put(
  "/categories/:id",
  checkAuthorize(["admin"]),
  adminBookController.updateCategory
);
router.delete(
  "/categories/:id",
  checkAuthorize(["admin"]),
  adminBookController.deleteCategory
);

//Quản lý đánh giá và xếp hạng
router.get(
  "/feedbacks",
  checkAuthorize(["admin"]),
  adminFeedbackController.getAllFeedbacks
);
router.delete(
  "/feedbacks/:feedbackId",
  checkAuthorize(["admin"]),
  adminFeedbackController.deleteFeedback
);
router.get(
  "/books/:id/feedbacks",
  checkAuthorize(["admin"]),
  adminFeedbackController.getFeedbacksByBook
);
router.get(
  "/users/:id/feedbacks",
  checkAuthorize(["admin"]),
  adminFeedbackController.getFeedbacksByUser
);

//Quản lý discount
router.get(
  "/discounts",
  checkAuthorize(["admin"]),
  adminDiscountController.getAllDiscounts
);
router.get(
  "/discounts/:id",
  checkAuthorize(["admin"]),
  adminDiscountController.getDiscountById
);
router.post(
  "/discounts",
  checkAuthorize(["admin"]),
  adminDiscountController.createDiscount
);
router.put(
  "/discounts/:id",
  checkAuthorize(["admin"]),
  adminDiscountController.updatedDiscount
);
router.put(
  "/discounts/:id/change-status",
  checkAuthorize(["admin"]),
  adminDiscountController.changeStatusDiscount
);


module.exports = router;
