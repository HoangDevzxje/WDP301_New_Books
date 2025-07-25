import React, { useEffect, useState } from 'react';
import { Typography, Paper, Box, Grid, Avatar, Stack, Snackbar, Alert } from '@mui/material';
import './BlogReview.css';
import * as ReviewService from '../../services/ReviewService';
import { useNavigate } from 'react-router-dom';
import BookCard from '../../components/BookCard/BookCard';
import { getWishlist, addToWishlist, deleteFromWishlist } from "../../services/WishlistService";
import * as BookService from '../../services/BookService';
const BlogReview = () => {
  const [reviews, setReviews] = useState([]);
  const [bookIds, setBookIds] = useState([]); 
  const [reviewedBooks, setReviewedBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await ReviewService.getReviews();
        setReviews(response.data);
        const sortedReviews = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const extractedBookIds = sortedReviews
          .map(review => review.bookId)
          .filter(bookId => bookId);
        const uniqueBookIds = extractedBookIds.filter((bookId, index, arr) => {
          const bookIdValue = bookId._id || bookId;
          return arr.findIndex(item => (item._id || item) === bookIdValue) === index;
        });

        setBookIds(uniqueBookIds);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchBooksAndWishlist = async () => {
      if (bookIds.length === 0) return;

      try {
        const bookPromises = bookIds.map(bookId => 
          BookService.getBookById(bookId._id || bookId)
        );
        
        const bookResponses = await Promise.allSettled(bookPromises);
        const reviewedBooks = bookResponses
          .filter(response => response.status === 'fulfilled')
          .map(response => response.value.data)
          .filter(book => book);
        setReviewedBooks(reviewedBooks);

        const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (access_token) {
          try {
            const wishlistResponse = await getWishlist();
            if (wishlistResponse.data && wishlistResponse.data.wishlist) {
              const wishlistIds = wishlistResponse.data.wishlist.map((book) => book._id);
              setWishlist(wishlistIds);
            }
          } catch (error) {
            console.error("Lỗi khi lấy danh sách yêu thích:", error);
          }
        }
      } catch (error) {
        console.error('Error fetching reviewed books:', error);
      }
    };

    fetchBooksAndWishlist();
  }, [bookIds]);

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

  const getBookIds = () => {
    return reviews
      .map(review => review.bookId)
      .filter(bookId => bookId)
      .filter((bookId, index, arr) => arr.indexOf(bookId) === index);
  };

  const handleClickReview = (id) => {
    navigate(`/reviewDetail/${id}`);
  };
  

  return (
    <Box className="blog-review-container">
      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 8 }}>
          {reviews.length > 0 && (
            <Paper
              className="main-review"
              sx={{
                backgroundImage: `url('${reviews[0]?.images?.[0]}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onClick={() => handleClickReview(reviews[0]._id)}
            >
              <Box className="overlay">
                <span className="featured-badge">Nổi bật</span>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="white"
                  mb={2}
                  sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}
                >
                  {reviews[0]?.title}
                </Typography>
                <Typography
                  component="div"
                  variant="body1"
                  color="white"
                  className="text-truncate-3"
                  sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: reviews[0]?.content }}
                />

                <Box className="author-info">
                  <Typography
                    variant="body2"
                    color="white"
                    sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    Tác giả: {reviews[0]?.adminId?.name}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          <Typography variant="h5" className="section-blog-title" sx={{ mt: 4, mb: 2 }}>
            Review sách mới nhất
          </Typography>
          <Grid container spacing={4}>
            {reviews.slice(1).map((review, i) => (
              <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Paper
                  className="review-card-new"
                  onClick={() => handleClickReview(review._id)}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Box
                    className="card-image"
                    sx={{
                      backgroundImage: `url('${review.images?.[0]}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />

                  <Box className="card-content">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="#1f2937"
                      sx={{
                        mb: 1,
                        fontSize: '1.2rem',
                        lineHeight: 1.6
                      }}
                    >
                      {review.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="#9ca3af"
                      className="text-truncate-2-dark"
                      sx={{
                        fontSize: '0.875rem',
                        mb: 2,
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: review.content }} />
                    </Typography>
                    <Typography
                      variant="caption"
                      color="#9ca3af"
                      sx={{
                        fontSize: '0.875rem',
                      }}
                    >
                      Tác giả: {review.adminId?.name}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <Box >
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12 }}>
                <Typography variant="h5" className="section-blog-title">
                  Những quyển sách được review
                </Typography>
              </Grid>
              {reviewedBooks.length > 0 ? (
                reviewedBooks.slice(0, 10).map((book) => (
                  <Grid item size={{ xs: 12, md: 6 }} key={book._id}>
                    <BookCard
                      book={book}
                      hoveredId={hoveredId}
                      wishlist={wishlist}
                      onHover={handleMouseEnter}
                      onLeave={handleMouseLeave}
                      toggleWishlist={toggleWishlist}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Chưa có sách nào được review
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default BlogReview;