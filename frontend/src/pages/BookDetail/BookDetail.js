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
import axios from "axios";
import BookDetailBreadCrumb from "../../components/BreadCrumb/BookDetailBreadCrumb";
import "./BookDetail.css";
import { AccountBalanceWallet, LocalShipping, Security, SupportAgent } from "@mui/icons-material";

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
    axios
      .get(`http://localhost:9999/book/${id}`)
      .then((response) => {
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

    const access_token = getToken();
    if (access_token) {
      axios
        .get("http://localhost:9999/user/wishlist", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => {
          if (response.data && response.data.wishlist) {
            const wishlistIds = response.data.wishlist.map((book) => book._id);
            setWishlist(wishlistIds);
            setInWishlist(wishlistIds.includes(id));
          }
        })
        .catch((error) =>
          console.error("Lỗi khi kiểm tra danh sách yêu thích:", error)
        );
    }
  }, [id]);

  const getToken = () => localStorage.getItem("access_token") || sessionStorage.getItem("access_token");


  const addNotification = (message, severity = "info") => {
    setNotifications((prev) => [
      ...prev,
      { id: new Date().getTime(), message, severity }
    ]);
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
    axios
      .get(`http://localhost:9999/book/category/${categoryId}`)
      .then((response) => {
        const filteredBooks = response.data
          .filter(book => book._id !== currentBookId)
          .slice(0, 4);
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

    const access_token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
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
      await axios.post(
        "http://localhost:9999/cart/add",
        { bookId: id, quantity },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

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
    console.log(bookId);
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
        await axios.delete(`http://localhost:9999/user/wishlist/${targetBookId}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

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
        await axios.post(
          `http://localhost:9999/user/wishlist/${targetBookId}`,
          {},
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

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

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: '#333' }} />,
      title: 'Free Delivery',
      subtitle: 'Orders over $500'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#333' }} />,
      title: 'Secure Payment',
      subtitle: '100% Secure Payment'
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 40, color: '#333' }} />,
      title: 'Money Back Guarantee',
      subtitle: 'Within 30 Days'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40, color: '#333' }} />,
      title: '24/7 Support',
      subtitle: 'Within 1 Business Day'
    }
  ];

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
              <Box className="quantity-selector">
                <Button
                  variant="text"
                  onClick={() => handleQuantityChange(-1)}
                  className="quantity-btn"
                  disabled={isOutOfStock}
                >
                  -
                </Button>
                <Box className="quantity-display">
                  {quantity}
                </Box>
                <Button
                  variant="text"
                  onClick={() => handleQuantityChange(1)}
                  className="quantity-btn"
                  disabled={isOutOfStock}
                >
                  +
                </Button>
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
            <Box>
              <Button
                variant="contained"
                onClick={handleAddToCart}
                className={`add-to-cart-btn2`}
              >
                Mua ngay
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
{/* 
      <Box 
        sx={{ 
          borderRadius: 2,
          padding: 3,
          border: '1px solid #e9ecef',
          mb: 4
        }}
      >
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {features.map((feature, index) => (
            <Grid size={{xs:12, sm:6, md:3}} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: '#333',
                      mb: 0.5,
                      lineHeight: 1.2
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: '0.875rem',
                      lineHeight: 1.4
                    }}
                  >
                    {feature.subtitle}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box> */}

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
                <Card className="related-product-card"   
                    onMouseEnter={() => handleMouseEnter(relatedBook._id)}
                    onMouseLeave={handleMouseLeave}
                    sx={{
                      boxShadow: "none",
                      border: "none",
                    }}>
                    {relatedBook.originalPrice > relatedBook.price && (
                      <Box className="related-product-sale-badge">
                        -{Math.round((1 - relatedBook.price / relatedBook.originalPrice) * 100)}%
                      </Box>
                    )}
                    {relatedBook.stock === 0 && (
                      <Box className="related-product-out-of-stock">
                        Hết hàng
                      </Box>
                    )}
                    {hoveredId === relatedBook._id && (
                      <Box className="related-product-wishlist-btn">
                      <IconButton
                        onClick={() => toggleWishlist(relatedBook._id)}
                        color={wishlist.includes(relatedBook._id) ? "error" : "default"}
                        size="small"
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </Box>
                    )}
                    <Link to={`/book/${relatedBook._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box className="related-product-image-wrapper">
                        <CardMedia
                          component="img"
                          image={relatedBook.images && relatedBook.images.length > 0 ? relatedBook.images[0] : ""}
                          alt={relatedBook.title}
                          className="related-product-image"
                        />
                      </Box>
                    </Link>
                  <CardContent className="related-product-content">
                    <Link to={`/book/${relatedBook._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography
                        className="related-product-title"
                      >
                        {relatedBook.title}
                      </Typography>
                    </Link>
                    <Box className="related-product-price-container">
                      <Typography variant="h6" className="related-product-price">
                        {relatedBook.price?.toLocaleString()}₫
                      </Typography>
                      {relatedBook.originalPrice > relatedBook.price && (
                        <Typography variant="body2" className="related-product-original-price">
                          {relatedBook.originalPrice?.toLocaleString()}₫
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
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