import React, { useEffect, useRef, useState } from "react";
import {
  Typography,
  Box,
  Snackbar,
  Alert,
  IconButton,
  Grid,
  Container,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Tabs,
  Tab,
  Rating,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import BookDetailBreadCrumb from "../../components/BreadCrumb/BookDetailBreadCrumb";
import "./BookDetail.css";
import { getBookById, getBooksByCategory } from "../../services/BookService"
import { getWishlist, addToWishlist, deleteFromWishlist } from "../../services/WishlistService";
import { addToCart } from "../../services/CartService";
import BookCard from "../../components/BookCard/BookCard";
import FeedbackAndRating from "../../components/FeedbackAndRating/FeedbackAndRating";
import * as FeedbackService from "../../services/FeedbackService";
const BookDetail = ({ updateWishlistCount, updateCartData }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(
    localStorage.getItem("hasReviewed") === "true"
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [mainImg, setMainImg] = useState(null);

  const [slideDirection, setSlideDirection] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const fullDescRef = useRef(null);
  useEffect(() => {
    setLoading(true);
    getBookById(id).then((response) => {
      setBook(response.data);
      setMainImg(response.data.images[0]);
      setLoading(false);

      if (response.data.categories && response.data.categories.length > 0) {
        const categoryId = response.data.categories[0];
        fetchRelatedBooks(categoryId, response.data._id);
      }

      fetchReviews();
    })
      .catch((error) => {
        console.error("Lỗi khi lấy thông tin sách:", error);
        setLoading(false);
      });

    getWishlist().then((response) => {
      if (response.data && response.data.wishlist) {
        const wishlistIds = response.data.wishlist.map((book) => book._id);
        setWishlist(wishlistIds);
        setInWishlist(wishlistIds.includes(id));
      }
    })
      .catch((error) =>
        console.error("Lỗi khi kiểm tra danh sách yêu thích:", error)
      );
  }, [id]);

  const getToken = () => localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

  const fetchReviews = () => {
    FeedbackService.getAllFeedbacksForBook(id)
      .then((response) => {
        setReviews(response.data.feedbacks);
        setAverageRating(response.data.averageRating);

        const token = getToken();
        if (token) {
          FeedbackService.getUserFeedbackForBook(id).then((userReviewResponse) => {
            if (userReviewResponse.data && typeof userReviewResponse.data === 'object') {
              const userReview = userReviewResponse.data.book === id ? userReviewResponse.data : null;
              setUserReview(userReview);
              setHasReviewed(userReview ? true : false);
            } else {
              // console.error("Dữ liệu userReview không phải là đối tượng:", userReviewResponse.data);
              setHasReviewed(false);
            }
          })
            .catch((error) => { });
          setHasReviewed(false);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy đánh giá sách:", error);

      });
  };

  const addNotification = (message, severity = "info") => {
    setNotifications((prev) => [
      ...prev,
      { id: new Date().getTime(), message, severity }
    ]);
  };

  const handleViewMore = () => {
    const element = fullDescRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();
      const offsetTop = window.scrollY + rect.top;

      const screenHeight = window.innerHeight;
      const elementHeight = element.offsetHeight;

      const scrollTo = offsetTop - (screenHeight / 2) + (elementHeight / 2);

      window.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmitReview = async () => {
    const token = getToken();

    if (!token) {
      addNotification("Bạn cần đăng nhập để đánh giá.", "warning");
      return;
    }

    try {
      await FeedbackService.createFeedback(id, {
        rating,
        comment
      });

      localStorage.setItem("hasReviewed", "true");
      setShowReviewForm(false);
      setHasReviewed(true);
      setRating(1);
      setComment("");
      fetchReviews();

      addNotification("Đánh giá đã được gửi!", "success");

    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      addNotification("Lỗi khi gửi đánh giá. Vui lòng thử lại.", "error");
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleSubmitEdit = async () => {
    const token = getToken();

    if (!token) {
      addNotification("Bạn cần đăng nhập để chỉnh sửa đánh giá.", "warning");
      return;
    }

    try {
      const response = await FeedbackService.updateFeedback(editingReview._id, {
        rating: editingReview.rating,
        comment: editingReview.comment
      });

      if (response.status === 200) {
        fetchReviews();
        setEditingReview(null);
        addNotification("Đánh giá đã được cập nhật!", "success");
      }
    } catch (error) {
      console.error("Cập nhật thất bại:", error);
      addNotification("Cập nhật thất bại, vui lòng thử lại!", "error");
    }
  };

  const handleDelete = async (reviewId) => {
    const token = getToken();

    if (!token) {
      addNotification("Bạn cần đăng nhập để xóa đánh giá.", "warning");
      return;
    }

    try {
      const response = await FeedbackService.deleteFeedback(reviewId);

      if (response.status === 200) {
        if (userReview && userReview._id === reviewId) {
          setHasReviewed(false);
          localStorage.removeItem("hasReviewed");
        }
        fetchReviews();
        addNotification("Đánh giá đã được xóa!", "success");
      } else {
        addNotification("Xóa đánh giá không thành công!", "error");
      }
    } catch (error) {
      console.error("Xóa đánh giá thất bại:", error);
      addNotification("Xóa thất bại, vui lòng thử lại!", "error");
    }
  };

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };


  const fetchRelatedBooks = (categoryId, currentBookId) => {
    getBooksByCategory(categoryId).then((response) => {
      const filteredBooks = response.data
        .filter(book => book._id !== currentBookId)
        .slice(0, 5);
      setRelatedBooks(filteredBooks);
    })
      .catch((error) => {
        console.error("Lỗi khi lấy sách cùng loại:", error);
      });
  };

  const handleAddToCart = async () => {
    if (book.stock === 0) {
      return;
    }

    if (quantity > book.stock) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Không đủ sách trong kho. Chỉ còn ${book.stock} cuốn.`,
          severity: "error",
        },
      ]);
      return;
    }

    const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!access_token) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Vui lòng đăng nhập để thêm vào giỏ hàng",
          severity: "warning",
        },
      ]);
      return;
    }

    try {
      await addToCart({
        bookId: id,
        quantity: quantity,
      });

      if (typeof updateCartData === "function") {
        updateCartData();
      }

      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Đã thêm vào giỏ hàng",
          severity: "success",
        },
      ]);
    } catch (error) {
      console.error("Cart error:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Không thể thêm vào giỏ hàng",
          severity: "error",
        },
      ]);
    }
  };

  const handleMouseEnter = (bookId) => {
    setHoveredId(bookId);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  const toggleWishlist = async (bookId) => {
    const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!access_token) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Vui lòng đăng nhập để thêm vào yêu thích",
          severity: "warning",
        },
      ]);
      return;
    }

    try {
      const targetBookId = bookId || id;

      if (wishlist.includes(targetBookId)) {
        await deleteFromWishlist(targetBookId);

        setWishlist(prev => prev.filter(id => id !== targetBookId));
        if (targetBookId === id) setInWishlist(false);

        if (updateWishlistCount) {
          updateWishlistCount();
        }

        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Đã xóa khỏi danh sách yêu thích",
            severity: "success",
          },
        ]);
      } else {
        await addToWishlist(targetBookId);

        setWishlist(prev => [...prev, targetBookId]);
        if (targetBookId === id) setInWishlist(true);

        if (updateWishlistCount) {
          updateWishlistCount();
        }

        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Đã thêm vào danh sách yêu thích",
            severity: "success",
          },
        ]);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Không thể cập nhật danh sách yêu thích",
          severity: "error",
        },
      ]);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);

    if (book && book.stock > 0 && newQuantity > book.stock) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Số lượng không thể vượt quá ${book.stock} cuốn.`,
          severity: "warning",
        },
      ]);
      return;
    }

    setQuantity(newQuantity);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
   const handleCategoryClick2 = (categoryId) => {
    navigate("/shopAll", {
      state: { selectedCategoryId: categoryId },
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Typography>Đang tải...</Typography>
        </Box>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg" >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Typography>Không tìm thấy sách</Typography>
        </Box>
      </Container>
    );
  }

  const isOutOfStock = book.stock === 0;

  const handleImageChange = (newImage, newIndex) => {
    if (newIndex > currentImageIndex) {
      setSlideDirection('slide-right');
    } else if (newIndex < currentImageIndex) {
      setSlideDirection('slide-left');
    }

    setMainImg(newImage);
    setCurrentImageIndex(newIndex);


    setTimeout(() => {
      setSlideDirection('');
    }, 400);
  };


  return (
    <>
      <BookDetailBreadCrumb />
      <Container maxWidth={"xl"} className="book-detail-container">
        {/* Book detail */}
        <Grid container spacing={6} mb={6} className="bookdetail-container">
          {/* ảnh sách */}
          <Grid size={6} className="bookdetail-image-container">
            <Box>
              <img
                className={`bookdetail-image ${slideDirection}`}
                src={mainImg}
                style={{ width: "100%", height: 500, objectFit: "contain" }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {book.images.map((image, index) => (
                <Box key={index}>
                  <Box
                    component="img"
                    src={image}
                    onClick={() => handleImageChange(image, index)}
                    sx={{
                      width: 80,
                      height: 120,
                      objectFit: "cover",
                      cursor: "pointer",
                      border: mainImg === image ? "2px solid #333" : "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* thông tin tác giả  */}
          <Grid size={6} display={"flex"} flexDirection={"column"} justifyContent={"space-between"}>
            <Box className="bookdetail-title-container" display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
              <Box>
                <span className="bookdetail-title">
                  {book.title}
                </span>
              </Box>
              <Box>
                <span >
                  <Rating
                    value={averageRating}
                    precision={0.1}
                    readOnly
                    className="rating-stars"
                  />
                </span>

              </Box>
            </Box>

            <Box className="book-meta">
              <Box className="book-meta-left">
                <Typography variant="body2" className="book-meta-item">
                  Tác giả:{" "}
                  <Link className="book-meta-link">
                    {book.author}
                  </Link>
                </Typography>
                <Typography variant="body2">
                  Nhà xuất bản:{" "}
                  <Link className="book-meta-link">
                    {book.publisher}
                  </Link>
                </Typography>
              </Box>
            </Box>

            {/* Giá sản phẩm */}
            <Box className="price-container">
              <Typography variant="h4" className="current-price">
                {book.price?.toLocaleString()}₫
              </Typography>
              {book.originalPrice > book.price && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Typography variant="body1" className="original-price">
                    {book.originalPrice?.toLocaleString()}₫
                  </Typography>
                </Box>
              )}
            </Box>

            <Box className="stock-status">
              <Typography variant="caption">
                {isOutOfStock ? "Hết hàng" : "Còn hàng"}
              </Typography>
              {!isOutOfStock && (
                <Typography variant="caption">
                  ({book.stock} cuốn)
                </Typography>
              )}
            </Box>

            {/* sách Description */}
            <Typography variant="body2" gutterBottom className="book-description">
              {book.description}
            </Typography>
            <div onClick={handleViewMore} className="view-more">Xem thêm</div>
            {/* Thông tin sách */}
            <Box className="highlights-section">
              <Typography className="highlights-title">
                Thông tin sách
              </Typography>
              <Table className="highlights-table">
                <TableBody>
                  <TableRow>
                    <TableCell className="highlights-table-cell-bold">
                      Nhà phát hành:
                    </TableCell>
                    <TableCell className="highlights-table-cell">
                      {book.publisher || "IPM"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="highlights-table-cell-bold">
                      Hình thức bìa:
                    </TableCell>
                    <TableCell className="highlights-table-cell">
                      {book.cover || "Bìa mềm"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="highlights-table-cell-bold">
                      Số trang:
                    </TableCell>
                    <TableCell className="highlights-table-cell">
                      {book.totalPage || "160"} trang
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="highlights-table-cell-bold">
                      Kích thước:
                    </TableCell>
                    <TableCell className="highlights-table-cell">
                      {book.dimensions || "18 x 13 x 0.8 cm"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="highlights-table-cell-bold">
                      Độ tuổi:
                    </TableCell>
                    <TableCell className="highlights-table-cell">
                      {book.minAge || "18"}+
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="highlights-table-cell-bold">
                      Trọng lượng:
                    </TableCell>
                    <TableCell className="highlights-table-cell">
                      {book.weight || "180g"}g
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Số lượng và add to cart */}
            <Box className="quantity-container">
              <Box className="quantity-cart-container">
                <Box className="quantity-table">
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    size="small"
                    className="quantity-btn"
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography className="quantity-display">
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock}
                    size="small"
                    className="quantity-btn"
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`add-to-cart-btn ${isOutOfStock ? 'add-to-cart-btn-disabled' : 'add-to-cart-btn-enabled'}`}
                >
                  {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </Button>

                <Button
                  onClick={() => toggleWishlist(id)}
                  className="wishlist-action-btn"
                >
                  <FavoriteIcon sx={{ color: "#c49a6c" }} />
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* mô tả và đánh giá  */}
        <Box className="tabs-container">
          <Box >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="book details tabs"
              textColor="inherit"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'black',
                },
              }}
            >
              <Tab label="Mô tả sản phẩm" id="tab-0" />
              <Tab label="Đánh giá" id="tab-1" />
            </Tabs>
          </Box>
          <Box
            role="tabpanel"
            hidden={tabValue !== 0}
            id="tab-0"
            className="tab-panel"
            ref={fullDescRef}
          >
            {tabValue === 0 && (
              <Typography variant="body1" component="div" className="book-description-full">
                {book.description}
              </Typography>
            )}
          </Box>

          <FeedbackAndRating
            tabValue={tabValue}
            reviews={reviews}
            averageRating={averageRating}
            userReview={userReview}
            showReviewForm={showReviewForm}
            hasReviewed={hasReviewed}
            rating={rating}
            comment={comment}
            editingReview={editingReview}
            anchorEl={anchorEl}
            selectedReview={selectedReview}
            setEditingReview={setEditingReview}
            setRating={setRating}
            setComment={setComment}
            setShowReviewForm={setShowReviewForm}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleSubmitEdit={handleSubmitEdit}
            handleSubmitReview={handleSubmitReview}
          />
        </Box>

        {/* Sản phẩm liên quan */}
        <Box className="related-products-section" sx={{ border: "none", boxShadow: "none" }}>
          <Box className="related-products-header">
            <Typography variant="h5" className="related-products-title">
              Sản phẩm liên quan
            </Typography>

            {book.categories && book.categories.length > 0 && (
              <Typography 
                className="view-all-link"
                onClick={() => handleCategoryClick2(book.categories[0])}
              >
                Xem tất cả
                <span className="view-all-arrow">→</span>
              </Typography>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          {relatedBooks.length > 0 ? (
            <Grid container spacing={3} justifyContent="flex-start">
              {relatedBooks.map((relatedBook) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} key={relatedBook._id}>
                  <BookCard
                    book={relatedBook}
                    hoveredId={hoveredId}
                    wishlist={wishlist}
                    onHover={handleMouseEnter}
                    onLeave={handleMouseLeave}
                    toggleWishlist={toggleWishlist}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography className="no-related-products">
              Hiện chưa có sản phẩm cùng loại
            </Typography>
          )}
        </Box>

        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open
            autoHideDuration={2000}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            onClose={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
          >
            <Alert
              severity={notification.severity || "info"}
              onClose={() =>
                setNotifications((prev) =>
                  prev.filter((n) => n.id !== notification.id)
                )
              }
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Container>
    </>
  );
};
export default BookDetail;