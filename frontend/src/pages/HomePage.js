import React, { useEffect, useRef, useState } from "react";
import "../styles/HomePage.css";
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
} from "@mui/material";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import axiosInstance from "../utils/axiosInstance";
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
    <Box sx={{ maxWidth: "100%", margin: "0 auto" }}>
      <Box
        sx={{
          maxWidth: "100%",
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          height: { xs: "60vh", md: "70vh" },
          backgroundColor: "#f5f5f5",
          mb: 4,
        }}
      >
        {/* Main Banner */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(to right, #3a1c0d, #6e3b1a, #3a1c0d)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Central content */}
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              color: "white",
              px: 2,
              maxWidth: "800px",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Khám phá thế giới sách đầy màu sắc
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1rem", md: "1.5rem" },
                mb: 4,
                fontWeight: 300,
              }}
            >
              Hơn 10,000 đầu sách với nhiều thể loại đa dạng đang chờ bạn khám
              phá
            </Typography>

            <Button
              component={Link}
              to="/books"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#C49A6C",
                color: "white",
                px: 6,
                py: 1.5,
                fontSize: "1.1rem",
                borderRadius: "4px",
                "&:hover": {
                  bgcolor: "#b2855b",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(196, 154, 108, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Mua sắm ngay
            </Button>
          </Box>

          {/* Decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              zIndex: 1,
            }}
          />
        </Box>

        {/* Featured books floating shelf */}
        <Box
          sx={{
            position: "absolute",
            bottom: "0px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            maxWidth: "1000px",
            height: "120px",
            backgroundColor: "#3a1c0d",
            borderRadius: "4px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: 2,
          }}
        >
          {books.slice(0, 5).map((book) => (
            <Box
              key={book._id}
              sx={{
                mx: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-15px)",
                },
              }}
            >
              <Link to={`/book/${book._id}`}>
                <Box
                  component="img"
                  src={book.images?.[0] || ""}
                  alt={book.title}
                  sx={{
                    height: "100px",
                    width: "auto",
                    maxWidth: "80px",
                    objectFit: "cover",
                    borderRadius: "2px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    border: "2px solid #fff",
                  }}
                />
              </Link>
            </Box>
          ))}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          variant="h3"
          sx={{
            mt: 6,
            mb: 6,
            textAlign: "center",
            position: "relative",
            "&:after": {
              content: '""',
              display: "block",
              width: "120px",
              height: "2px",
              backgroundColor: "#C49A6C",
              margin: "5px auto 0",
              borderRadius: "2px",
            },
          }}
        >
          Best Sellers
        </Typography>
        <Box
          sx={{ margin: "10px auto", backgroundColor: "#fff" }}
          textAlign="center"
        >
          {isLoading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <Grid container spacing={2}>
              {books.slice(0, 12).map((book) => (
                <Grid key={book._id}>
                  <Card
                    onMouseEnter={() => handleMouseEnter(book._id)}
                    onMouseLeave={handleMouseLeave}
                    sx={{
                      position: "relative",
                      border: "1px solid rgb(255, 255, 255)",
                      transition:
                        "transform 0.3s, border-color 0.3s, box-shadow 0.3s",
                      boxShadow: "none",
                      p: 2,
                      "&:hover": {
                        borderColor: "#C49A6C",
                        transform: "scale(1.05)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                        zIndex: 10,
                      },
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      {book.originalPrice > book.price && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 10,
                            width: "38px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            zIndex: 2,
                          }}
                        >
                          -
                          {Math.round(
                            (1 - book.price / book.originalPrice) * 100
                          )}
                          %
                        </Box>
                      )}
                      {book.stock === 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            bgcolor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            zIndex: 2,
                          }}
                        >
                          Hết hàng
                        </Box>
                      )}

                      {hoveredId === book._id && (
                        <IconButton
                          onClick={() => toggleWishlist(book._id)}
                          color={
                            wishlist.includes(book._id) ? "error" : "default"
                          }
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 30,
                            right: 22,
                            bgcolor: "rgba(255, 255, 255, 0.8)",
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.9)",
                            },
                            zIndex: 2,
                          }}
                        >
                          <FavoriteIcon />
                        </IconButton>
                      )}

                      <Link
                        to={`/book/${book._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "200px",
                            height: "250px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                            mt: 2,
                            mx: "auto",
                            backgroundColor: "#fff",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={
                              book.images && book.images.length > 0
                                ? book.images[0]
                                : ""
                            }
                            alt={book.title}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              cursor: "pointer",
                            }}
                          />
                        </Box>
                      </Link>
                    </Box>
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "180px",
                        padding: "15px 0",
                        "&:last-child": { paddingBottom: 0 },
                      }}
                    >
                      <Link
                        to={`/book/${book._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Typography
                          gutterBottom
                          variant="h6"
                          sx={{
                            fontSize: "1rem",
                            textAlign: "left",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "50px",
                            cursor: "pointer",
                            marginBottom: "5px",
                            paddingBottom: "5px",
                          }}
                        >
                          {book.title}
                        </Typography>
                      </Link>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            textAlign: "left",
                            marginTop: "2px",
                          }}
                        >
                          {book.price.toLocaleString()}₫
                        </Typography>
                        {book.originalPrice > book.price && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: "line-through",
                              color: "gray",
                              fontSize: "0.75rem",
                            }}
                          >
                            {book.originalPrice.toLocaleString()}₫
                          </Typography>
                        )}
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

      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "center",
          padding: 2,
          marginTop: 15,
          backgroundColor: "#F8F4F0",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
          }}
        >
          <img
            src="https://i.pinimg.com/736x/cc/24/07/cc2407d15782f286ce11973e25c3a848.jpg"
            alt="sample"
            style={{ width: "70%", height: "auto", borderRadius: "10px" }}
          />
        </Box>

        <Box sx={{ flex: 1, padding: 10 }}>
          <Typography
            variant="h4"
            sx={{ color: "#C49A6C", fontWeight: "bold" }}
          >
            Blog
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            Khu vực Blog là nơi độc giả có thể chia sẻ cảm nhận, đánh giá sách
            đã đọc, cũng như khám phá nhiều góc nhìn thú vị từ cộng đồng yêu
            sách. Người dùng có thể đăng bài review sách, tương tác bằng cách{" "}
            <b>thả tim</b> và <b>bình luận</b> để tạo nên một không gian thảo
            luận sôi động và tích cực.
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#C49A6C",
              color: "#fff",
              marginTop: 2,
              "&:hover": {
                backgroundColor: "#b2855b",
              },
            }}
          >
            Khám phá ngay
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: "69%", mx: "auto", mt: 10 }}>
        <Typography variant="h3" sx={{ color: "#C49A6C", fontWeight: "bold" }}>
          Thể loại sách
        </Typography>

        <Box
          sx={{ display: "flex", alignItems: "center", position: "relative" }}
        >
          <IconButton onClick={() => handleScroll("left")}>
            <ArrowBackIos />
          </IconButton>

          <Box
            ref={scrollRef}
            sx={{
              overflowX: "hidden",
              display: "flex",
              gap: 3,
              padding: 2,
              flexGrow: 1,
              mb: 10,
            }}
          >
            {categories.map((category) => (
              <Card
                key={category._id}
                sx={{
                  width: "250px",
                  flex: "0 0 auto",
                  cursor: "pointer",
                  padding: "15px",
                  backgroundColor: "#F8F4F0",
                  boxShadow: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transform: "scale(1.05)",
                    transition: "transform 0.3s ease-in-out",
                  },
                }}
              >
                <Box>
                  <img
                    src="https://i.pinimg.com/736x/47/c1/88/47c1880a9ca02b67d5911862f757336d.jpg"
                    alt={category.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      overflow: "hidden",
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Typography>{category.description}</Typography>
                </CardContent>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#C49A6C",
                    color: "#fff",
                    marginTop: 2,
                    "&:hover": {
                      backgroundColor: "#b2855b",
                    },
                  }}
                >
                  Khám phá ngay
                </Button>
              </Card>
            ))}
          </Box>

          <IconButton onClick={() => handleScroll("right")}>
            <ArrowForwardIos />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
