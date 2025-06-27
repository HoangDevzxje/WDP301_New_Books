import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  IconButton,
  Grid,
  CardContent,
  Container,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import axios from "axios";
import BookDetailBreadCrumb from "../../components/BreadCrumb/BookDetailBreadCrumb";
import "./BookDetail.css";
import { AccountBalanceWallet, LocalShipping, Security, SupportAgent } from "@mui/icons-material";
import {getBookById,getBooksByCategory} from "../../services/BookService"
import {getWishlist, addToWishlist, deleteFromWishlist} from "../../services/WishlistService";
import {addToCart} from "../../services/CartService";
import BookCard from "../../components/BookCard/BookCard";
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
    console.log("Access Token:", access_token);
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

        if (typeof updateWishlistCount === "function") {
          updateWishlistCount((prev) => prev - 1);
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

        if (typeof updateWishlistCount === "function") {
          updateWishlistCount((prev) => prev + 1);
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
      <Container maxWidth="lg">
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
              className="bookdetail-image"
              src={mainImg}
              style={{ width: "100%", height: 500, objectFit: "contain" }}/>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {book.images.map((image, index) => (
              <Box key={index}>
                <Box
                  component="img"
                  src={image}
                  onClick={() => setMainImg(image)}
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
          <span className="bookdetail-title">
            {book.title} 
          </span>

          <Box className="book-meta">
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

          {/* Giá sản phẩm */}
          <Box className="price-container">
            <Typography  variant="h4" className="current-price">
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

          {/* Thông tin sách */}
          <Box className="highlights-section">
            <Typography className="highlights-title">
              Highlights
            </Typography>
            <Table className="highlights-table">
              <TableBody>
                <TableRow>
                  <TableCell className="highlights-table-cell-bold">
                    Nhà phát hành
                  </TableCell>
                  <TableCell className="highlights-table-cell">
                    {book.publisher || "IPM"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="highlights-table-cell-bold">
                    Hình thức bìa
                  </TableCell>
                  <TableCell className="highlights-table-cell">
                    {book.cover || "Bìa mềm"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="highlights-table-cell-bold">
                    Số trang
                  </TableCell>
                  <TableCell className="highlights-table-cell">
                    {book.totalPage || "160"} trang
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="highlights-table-cell-bold">
                    Kích thước
                  </TableCell>
                  <TableCell className="highlights-table-cell">
                    {book.dimensions || "18 x 13 x 0.8 cm"} 
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="highlights-table-cell-bold">
                    Độ tuổi
                  </TableCell>
                  <TableCell className="highlights-table-cell">
                   {book.minAge || "18"}+ 
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="highlights-table-cell-bold">
                    Trọng lượng
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
                <FavoriteIcon sx={{ color: "black" }} />
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* mô tả và đánh giá  */}
      <Box className="tabs-container">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
        >
          {tabValue === 0 && (
            <Typography variant="body1" component="div">
              {book.description}
            </Typography>
          )}
        </Box>

      </Box>

      {/* Sản phẩm liên quan */}
      <Box className="related-products-section" sx={{ border:"none", boxShadow:"none"}}>
        <Box className="related-products-header">
          <Typography variant="h5" className="related-products-title">
            Sản phẩm liên quan
          </Typography>

          {book.categories && book.categories.length > 0 && (
            <Link
              to={`/category/${book.categories[0]}`}
              className="view-all-link"
            >
              Xem tất cả
              <span className="view-all-arrow">→</span>
            </Link>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        {relatedBooks.length > 0 ? (
          <Grid container spacing={3} justifyContent="flex-start">
            {relatedBooks.map((relatedBook) => (
              <Grid size={{xs:12, sm:6, md:4, xl:2.4}} key={relatedBook._id}>
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