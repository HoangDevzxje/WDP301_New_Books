import React, { useEffect, useRef, useState } from "react";
import "./HomePage.css";
import {
  Typography,
  Box,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Grid,
  Container,
  Button,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";

import BookCard from "../../components/BookCard/BookCard";
import { getBooks } from "../../services/BookService";
import { getWishlist, addToWishlist, deleteFromWishlist } from "../../services/WishlistService";
import * as CategoryService from "../../services/CategoryService";
const HomePage = ({ updateWishlistCount, updateCartData }) => {
  const [books, setBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await CategoryService.getCategories();
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = 300;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchCategories();
    getBooks().then(async (response) => {
        const bookData = response.data.map((book) => ({
          ...book,
          price: book.price,
          originalPrice: book.originalPrice,
        }));
          setBooks(bookData);
          setIsLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách sách:", error);
        setIsLoading(false);
      });

    const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (access_token) {
      getWishlist().then((response) => {
          if (response.data && response.data.wishlist) {
            const wishlistIds = response.data.wishlist.map((book) => book._id);
            setWishlist(wishlistIds);
           console.log("Wishlist IDs:", wishlistIds);
          }
        })
        .catch((error) =>
          console.error("Lỗi khi lấy danh sách yêu thích:", error)
        );
      }
  }, []);

  const toggleWishlist = async (bookId) => {
    const access_token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
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
      if (wishlist.includes(bookId)) {
        await deleteFromWishlist(bookId);

        setWishlist((prev) => prev.filter((id) => id !== bookId));
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
        await addToWishlist(bookId);

        setWishlist((prev) => [...prev, bookId]);
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

  const handleMouseEnter = (bookId) => {
    setHoveredId(bookId);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  return (
    <Box className="homepage-container">
      <Box className="banner-container">
        <Box className="banner-content">
          <Typography variant="h1" className="banner-title">
            Khám phá thế giới sách đầy màu sắc
          </Typography>

          <Typography variant="h5" className="banner-subtitle">
            Hơn 10,000 đầu sách với nhiều thể loại đa dạng đang chờ bạn khám phá
          </Typography>

          <Button
            component={Link}
            to="/books"
            variant="contained"
            size="large"
            className="banner-button"
          >
            Mua sắm ngay
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" className="main-container">
        <Typography
          variant="h3"
          sx={{ mt: 2, mb: 4 }}
          className="bestseller-title"
        >
          Best Sellers
        </Typography>

        <Box className="books-grid-container">
          {isLoading ? (
            <Typography className="loading-text">Đang tải...</Typography>
          ) : (
            <Grid container spacing={4}>
              {books.slice(0, 10).map((book) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} key={book._id}>
                  <BookCard
                    book={book}
                    hoveredId={hoveredId}
                    wishlist={wishlist}
                    onHover={handleMouseEnter}
                    onLeave={handleMouseLeave}
                    toggleWishlist={toggleWishlist}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {notifications.map((notification) => (
            <Snackbar
              key={notification.id}
              open
              autoHideDuration={3000}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              onClose={() => setNotifications(prev =>
                  prev.filter(n => n.id !== notification.id)
              )}
            >
            <Alert                
                severity={notification.severity || 'info'}                
                onClose={() => setNotifications(prev =>                
                prev.filter(n => n.id !== notification.id)
                )}                   
            >
              {notification.message}
             </Alert>
             </Snackbar>
          ))}
      </Container>

      <Box className="blog-section">
        <Box className="blog-image-container">
          <img
            src="https://i.pinimg.com/736x/cc/24/07/cc2407d15782f286ce11973e25c3a848.jpg"
            alt="sample"
            className="blog-image"
          />
        </Box>

        <Box className="blog-content">
          <Typography variant="h4" className="blog-title">
            Blog
          </Typography>
          <Typography variant="body1" className="blog-text">
            Khu vực Blog là nơi độc giả có thể chia sẻ cảm nhận, đánh giá sách
            đã đọc, cũng như khám phá nhiều góc nhìn thú vị từ cộng đồng yêu
            sách. Người dùng có thể đăng bài review sách, tương tác bằng cách{" "}
            <b>thả tim</b> và <b>bình luận</b> để tạo nên một không gian thảo
            luận sôi động và tích cực.
          </Typography>

          <Button variant="contained" className="blog-button">
            Khám phá ngay
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" className="categories-section">
        <Typography variant="h3" className="bestseller-title">
          Thể loại sách
        </Typography>

        <Box className="categories-container">
          <IconButton
            onClick={() => handleScroll("left")}
            className="icon-button"
          >
            <ArrowBackIos />
          </IconButton>

          <Box ref={scrollRef} className="categories-scroll">
            {categories.map((category) => (
              <Card key={category._id} className="category-card">
                <CardMedia
                  component="img"
                  height="250"
                  image="https://i.pinimg.com/736x/47/c1/88/47c1880a9ca02b67d5911862f757336d.jpg"
                  alt="Paella dish"
                />
                <CardContent className="category-content">
                  <Typography className="category-name">
                    {category.name}
                  </Typography>
                  <Typography className="category-description">
                    {category.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button className="category-button" variant="contained">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          <IconButton
            onClick={() => handleScroll("right")}
            className="icon-button"
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
