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
  Rating,
  Button,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import axiosInstance from "../../utils/axiosInstance";
import {
  ArrowBackIos,
  ArrowForwardIos,
  NoEncryption,
} from "@mui/icons-material";

const HomePage = ({ updateWishlistCount, updateCartData }) => {
  const [books, setBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const bannerImages = [
    {
      id: 1,
      imageUrl: "/27081.jpg",
      link: "/",
      alt: "Summer Reading Promotion",
    },
    {
      id: 2,
      imageUrl: "/270812.jpg",
      link: "/",
      alt: "New Releases",
    },
    {
      id: 3,
      imageUrl: "/270813.jpg",
      link: "/",
      alt: "Bestsellers Collection",
    },
  ];

  const fetchBookRatings = async (bookList) => {
    try {
      const ratingPromises = bookList.map((book) =>
        axios
          .get(`http://localhost:9999/reviews/${book._id}`)
          .then((response) => ({
            bookId: book._id,
            averageRating: response.data.averageRating || 0,
          }))
          .catch(() => ({
            bookId: book._id,
            averageRating: 0,
          }))
      );

      const ratingsResults = await Promise.all(ratingPromises);

      const ratingsMap = {};
      ratingsResults.forEach((result) => {
        ratingsMap[result.bookId] = result.averageRating;
      });

      const booksWithRatings = bookList.map((book) => ({
        ...book,
        averageRating: ratingsMap[book._id] || 0,
      }));

      return booksWithRatings;
    } catch (error) {
      console.error("Error fetching book ratings:", error);
      return bookList.map((book) => ({
        ...book,
        averageRating: book.averageRating || 0,
      }));
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        "http://localhost:9999/category/"
      );
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
    // Fetch books
    axiosInstance
      .get("http://localhost:9999/book/")
      .then(async (response) => {
        const bookData = response.data.map((book) => ({
          ...book,
          price: book.price,
          originalPrice: book.originalPrice,
        }));

        // Method 1: If the book data already includes average ratings
        if (bookData.length > 0 && bookData[0].averageRating !== undefined) {
          setBooks(bookData);
          setIsLoading(false);
        }
        // Method 2: Fetch ratings separately for each book
        else {
          const booksWithRatings = await fetchBookRatings(bookData);
          setBooks(booksWithRatings);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách sách:", error);
        setIsLoading(false);
      });

    // Fetch wishlist
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      axiosInstance
        .get("http://localhost:9999/user/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data && response.data.wishlist) {
            const wishlistIds = response.data.wishlist.map((book) => book._id);
            setWishlist(wishlistIds);
          }
        })
        .catch((error) =>
          console.error("Lỗi khi lấy danh sách yêu thích:", error)
        );
    }
  }, []);

  const NextArrow = (props) => {
    const { onClick } = props;
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: "absolute",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
          bgcolor: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.9)",
          },
        }}
      >
        <NavigateNextIcon />
      </IconButton>
    );
  };

  const PrevArrow = (props) => {
    const { onClick } = props;
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: "absolute",
          left: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
          bgcolor: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.9)",
          },
        }}
      >
        <NavigateBeforeIcon />
      </IconButton>
    );
  };

  // Slider settings
  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  const toggleWishlist = async (bookId) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
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
        // Remove from wishlist
        await axios.delete(`http://localhost:9999/user/wishlist/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
        // Add to wishlist
        await axios.post(
          `http://localhost:9999/user/wishlist/${bookId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
              Hơn 10,000 đầu sách với nhiều thể loại đa dạng đang chờ bạn khám
              phá
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
        <Typography variant="h3" sx={{ mt: 2, mb: 4 }} className="bestseller-title">
          Best Sellers
        </Typography>

        <Box className="books-grid-container" >
          {isLoading ? (
            <Typography className="loading-text">Đang tải...</Typography>
          ) : (
            <Grid container spacing={4} >
              {books.slice(0, 10).map((book) => (
                <Grid size={{xs:12, sm:6, md:4, xl:2.4}} key={book._id}>
                  <Card
                    onMouseEnter={() => handleMouseEnter(book._id)}
                    onMouseLeave={handleMouseLeave}
                    className="book-card"
                      sx={{
                        boxShadow: 'none',      
                        border: 'none',          
                      }}  
                  >
                    <Box>
                      {book.originalPrice > book.price && (
                        <Box className="book-discount">
                          -
                          {Math.round(
                            (1 - book.price / book.originalPrice) * 100
                          )}
                          %
                        </Box>
                      )}
                      {book.stock === 0 && (
                        <Box className="book-stock">
                          Hết hàng
                        </Box>
                      )}

                      {hoveredId === book._id && (
                        <Box  className="book-wishlist-btn">
                          <IconButton
                            onClick={() => toggleWishlist(book._id)}
                            color={
                              wishlist.includes(book._id) ? "error" : "default"
                            }
                            size="small"
                           
                          >
                            <FavoriteIcon />
                          </IconButton>
                        </Box>
                       
                      )}

                      <Link
                        to={`/book/${book._id}`}
                        className="book-link"
                      >
                        <Box className="book-imagecontainer">
                          <CardMedia
                            component="img"
                            image={
                              book.images && book.images.length > 0
                                ? book.images[0]
                                : ""
                            }
                            alt={book.title}
                            className="book-image"
                          />
                        </Box>
                      </Link>
                    </Box>
                    <CardContent className="book-content">
                      <Link
                        to={`/book/${book._id}`}
                        className="book-link"
                      >
                        <Typography 
                          className="book-title2"
                        >
                          {book.title}
                        </Typography>
                      </Link>
                      <Box className="book-price-container">
                        {book.originalPrice > book.price && (
                          <Typography variant="body2" className="book-original-price">
                            {book.originalPrice.toLocaleString()}₫
                          </Typography>
                        )}
                        <Typography variant="h6" className="book-price">
                          {book.price.toLocaleString()}₫
                        </Typography>
                      
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
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
            <Alert severity={notification.severity || "info"}>
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
          <IconButton onClick={() => handleScroll("left")} 
          className="icon-button">
            <ArrowBackIos />
          </IconButton>

          <Box
            ref={scrollRef}
            className="categories-scroll"
          >
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
                  <Button className="category-button" variant="contained" >Learn More</Button>
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
