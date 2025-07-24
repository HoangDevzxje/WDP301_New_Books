import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Button,
  Chip,
  Rating,
  Avatar,
  IconButton,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  BookmarkBorder
} from '@mui/icons-material';
import './ReviewDetail.css';
import * as ReviewService from '../../services/ReviewService';
import * as BookService from '../../services/BookService';
import { getWishlist, addToWishlist, deleteFromWishlist } from "../../services/WishlistService";
import BookCard from '../../components/BookCard/BookCard';
import Comments from '../../components/CommentReview/Comments'; // Import Comments component

const ReviewDetail = ({ updateWishlistCount, updateCartData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviewedBook, setReviewedBook] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for BookCard functionality (similar to HomePage)
  const [notifications, setNotifications] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reviewResponse = await ReviewService.getReviewById(id);
        setReview(reviewResponse.data);
        if (reviewResponse.data.bookId) {
          const bookResponse = await BookService.getBookById(reviewResponse.data.bookId._id);
          setReviewedBook(bookResponse.data);
        }

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
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
        await addToWishlist(bookId);
        setWishlist((prev) => [...prev, bookId]);
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

  const handleMouseEnter = (bookId) => {
    setHoveredId(bookId);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="100%" height={200} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (!review) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6">Không tìm thấy bài review</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item size={{ xs: 12, md: 9 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="#c49a6c" fontWeight={"bold"} sx={{ mb: 1 }}>
              Chi tiết bài Review
            </Typography>

            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              {review.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48 }}>
                  {review.adminId?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {review.adminId?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleLike} color={isLiked ? "error" : "default"}>
                  {isLiked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton>
                  <BookmarkBorder />
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {review.tags?.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" size="small" />
              ))}
            </Box>
          </Box>

          <Paper
            sx={{
              backgroundImage: `url('${review.images?.[0]}')`,
              borderRadius: '10px',
              height: '400px',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mb: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                p: 3,
                color: 'white'
              }}
            >
              {reviewedBook && (
                <Typography variant="h6">
                  Review: {reviewedBook.title}
                </Typography>
              )}
            </Box>
          </Paper>

          <div className="fullscreen-body">
            <div
              className="fullscreen-html-content"
              dangerouslySetInnerHTML={{
                __html: review?.content || "",
              }}
            />
          </div>

          <Comments reviewId={id} />
        </Grid>

        <Grid item size={{ xs: 12, md: 3 }} >
          <Box className="review-book-card">
            {reviewedBook && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#c49a6c' }}>
                  Sách được review
                </Typography>
                <BookCard
                  book={reviewedBook}
                  hoveredId={hoveredId}
                  wishlist={wishlist}
                  onHover={handleMouseEnter}
                  onLeave={handleMouseLeave}
                  toggleWishlist={toggleWishlist}
                />
              </Box>
            )}

            {relatedBooks.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: '16px' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Sách liên quan
                </Typography>

                <Grid container spacing={2}>
                  {relatedBooks.map((book) => (
                    <Grid item xs={12} key={book._id}>
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

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2, borderRadius: '12px' }}
                  onClick={() => navigate('/shopAll')}
                >
                  Xem thêm sách khác
                </Button>
              </Paper>
            )}
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
    </Container>
  );
};

export default ReviewDetail;