const router = require("express").Router();
const reviewController = require("../controllers/ReviewController");
const { checkAuthorize } = require("../middleware/authMiddleware");

// Tạo một đánh giá mới cho sách

// Lấy đánh giá của người dùng cho một cuốn sách
router.get("/user/:bookId", checkAuthorize(["user"]), reviewController.getUserReview);

router.post("/:bookId", checkAuthorize(["user"]), reviewController.createReview);

// Lấy tất cả đánh giá của một cuốn sách
router.get("/:bookId", reviewController.getReviewsByBook);

// Cập nhật đánh giá của người dùng
router.put("/update/:reviewId", checkAuthorize(["user"]), reviewController.updateReview);

// Xóa đánh giá của người dùng
router.delete("/delete/:reviewId", checkAuthorize(["user"]), reviewController.deleteReview);



module.exports = router;
