import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Rating,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Divider,
  Grid,
  Avatar,
  TextField,
  Alert
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit,
  Delete,
  Star,
  StarBorder
} from '@mui/icons-material';
import { blackList, badWords } from '@vnphu/vn-badwords';
import './FeedbackAndRating.css';

const FeedbackAndRating = ({ 
  reviews, 
  averageRating, 
  userReview, 
  hasReviewed,
  tabValue,
  rating,
  comment,
  editingReview,
  showReviewForm,
  anchorEl,
  selectedReview,
  setRating,
  setComment,
  setEditingReview,
  setShowReviewForm,
  handleSubmitReview,
  handleSubmitEdit,
  handleMenuOpen,
  handleMenuClose,
  handleEdit,
  handleDelete
}) => {
  const [badWordsWarning, setBadWordsWarning] = React.useState('');
  const [editBadWordsWarning, setEditBadWordsWarning] = React.useState('');

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  reviews.forEach(review => {
    const roundedRating = Math.round(review.rating);
    if (roundedRating >= 1 && roundedRating <= 5) {
      ratingDistribution[roundedRating]++;
    }
  });

  const totalReviews = reviews.length;
  const containsBadWords = (text) => {
    const lowerText = text.toLowerCase();
    return blackList.some(bad => lowerText.includes(bad));
  };

  const validateComment = (text) => {
    if (!text.trim()) {
      return { isValid: false, message: 'Vui lòng nhập nhận xét' };
    }

    if (containsBadWords(text)) {
      return {
        isValid: false,
        message: 'Nhận xét chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa nội dung.'
      };
    }
    
    return { isValid: true, message: '' };
  };

  const handleValidatedSubmitReview = () => {
    const validation = validateComment(comment);
    
    if (!validation.isValid) {
      setBadWordsWarning(validation.message);
      return;
    }
    
    setBadWordsWarning('');
    handleSubmitReview();
  };

  const handleValidatedSubmitEdit = () => {
    if (!editingReview) return;
    
    const validation = validateComment(editingReview.comment);
    
    if (!validation.isValid) {
      setEditBadWordsWarning(validation.message);
      return;
    }
    
    setEditBadWordsWarning('');
    handleSubmitEdit();
  };

  const handleCommentChange = (value) => {
    setComment(value);
    
    if (badWordsWarning) {
      setBadWordsWarning('');
    }
  };

  const handleEditCommentChange = (value) => {
    setEditingReview({
      ...editingReview,
      comment: value,
    });
    
    if (editBadWordsWarning) {
      setEditBadWordsWarning('');
    }
  };

  return (
    <Box 
      role="tabpanel" 
      hidden={tabValue !== 1} 
      id="tabpanel-1" 
      className="feedback-panel"
    >
      {tabValue === 1 && (
        <>
          {reviews.length === 0 ? (
            <Box className="no-reviews-container">
              <StarBorder className="no-reviews-icon" />
              <Typography variant="h6" className="no-reviews-title">
                Chưa có đánh giá nào
              </Typography>
              <Typography className="no-reviews-subtitle">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid size={4}>
                <Card className="styled-rating" sx={{ position: 'sticky', top: '80px' }}>
                  <CardContent className="rating-overview-content">
                    <Typography variant="h6" className="overview-title">
                      Đánh giá sản phẩm
                    </Typography>
                    
                    <Box className="average-rating-display">
                      <Typography variant="h2" className="average-rating-number">
                        {averageRating.toFixed(1)}
                      </Typography>
                      <Box className="average-rating-stars">
                        <Rating
                          value={averageRating}
                          precision={0.1}
                          readOnly
                          size="large"
                          className="rating-stars"
                        />
                        <Typography className="total-reviews">
                          {totalReviews} đánh giá
                        </Typography>
                      </Box>
                    </Box>

                    <Divider className="gradient-divider" />

                    <Box className="rating-distribution">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <Box key={star} className="rating-row">
                          <Box className="rating-row-label">
                            <Typography variant="body2">
                              {star}
                            </Typography>
                            <Star fontSize="small" className="star-icon" />
                          </Box>
                          <Box className="rating-progress-container">
                            <LinearProgress
                              variant="determinate"
                              value={totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}
                              className="rating-progress"
                            />
                          </Box>
                          <Typography variant="body2" className="rating-count">
                            {ratingDistribution[star]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{xs:12 , md:8}}>
                <Box className="reviews-section">
                  <Typography variant="h6" className="reviews-title">
                    Bình luận từ khách hàng
                  </Typography>
                  
                  <Box className="reviews-list">
                    {reviews.map((review) => (
                      <Card key={review._id} className="styled-card" variant="outlined">
                        <CardContent className="review-card-content">
                          <Box className="review-header">
                            <Box className="review-user-info">
                              <Avatar className="user-avatar">
                                {review.user?.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box className="user-details">
                                <Typography className="review-user-name">
                                  {review.user?.name}
                                </Typography>
                                <Typography className="review-date">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </Typography>
                              </Box>
                            </Box>
                            {userReview && userReview._id === review._id && (
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, review)}
                                className="review-menu-button"
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>

                          <Box className="review-rating-wrapper">
                            <Rating
                              value={review.rating}
                              precision={0.1}
                              readOnly
                              size="small"
                              className="rating-stars"
                            />
                          </Box>

                          <Typography className="review-comment">
                            {review.comment}
                          </Typography>

                          <Menu
                            anchorEl={anchorEl}
                            open={
                              Boolean(anchorEl) &&
                              selectedReview &&
                              selectedReview._id === review._id
                            }
                            onClose={handleMenuClose}
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            PaperProps={{
                              elevation: 4,
                              sx: {
                                borderRadius: '8px',
                                minWidth: '160px',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <MenuItem
                              onClick={() => {
                                handleEdit(review);
                                handleMenuClose();
                              }}
                              sx={{
                                '&:hover': {
                                  backgroundColor: '#f5f5f5'
                                }
                              }}
                            >
                              <Edit fontSize="small" sx={{ mr: 1 }} />
                              Chỉnh sửa
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                handleDelete(review._id);
                                handleMenuClose();
                              }}
                              sx={{
                                '&:hover': {
                                  backgroundColor: '#f5f5f5'
                                }
                              }}
                            >
                              <Delete fontSize="small" sx={{ mr: 1}} />
                              Xóa
                            </MenuItem>
                          </Menu>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {editingReview && (
            <Box className="review-form-container">
              <Typography variant="h6" className="form-title">
                Chỉnh sửa đánh giá
              </Typography>
              
              {editBadWordsWarning && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {editBadWordsWarning}
                </Alert>
              )}
              
              <Box className="form-field">
                <Typography className="form-label">
                  Đánh giá của bạn:
                </Typography>
                <Rating
                  value={editingReview.rating}
                  onChange={(e, newValue) =>
                    setEditingReview({ ...editingReview, rating: newValue })
                  }
                  precision={1}
                  className="rating-stars"
                />
              </Box>
              <Box className="form-field">
                <Typography className="form-label">
                  Nhận xét:
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  value={editingReview.comment}
                  onChange={(e) => handleEditCommentChange(e.target.value)}
                  placeholder="Viết nhận xét của bạn..."
                  fullWidth
                  className="review-textarea"
                  error={!!editBadWordsWarning}
                />
              </Box>
              <Box className="form-buttons">
                <Button
                  variant="outlined"
                  className="cancel-button"
                  onClick={() => {
                    setEditingReview(null);
                    setEditBadWordsWarning('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  className="review-button"
                  onClick={handleValidatedSubmitEdit}
                >
                  Lưu đánh giá
                </Button>
              </Box>
            </Box>
          )}

          {!hasReviewed && !editingReview && !showReviewForm && (
            <Box className="review-button-container">
              <Button
                variant="contained"
                className="review-button"
                onClick={() => setShowReviewForm(true)}
              >
                Viết đánh giá
              </Button>
            </Box>
          )}

          {showReviewForm && (
            <Box className="review-form-container">
              <Typography variant="h6" className="form-title">
                Đánh giá sản phẩm
              </Typography>
              
              {badWordsWarning && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {badWordsWarning}
                </Alert>
              )}
              
              <Box className="form-field">
                <Typography className="form-label">
                  Đánh giá của bạn:
                </Typography>
                <Rating
                  value={rating}
                  onChange={(e, newValue) => setRating(newValue)}
                  precision={1}
                  className="rating-stars"
                />
              </Box>
              <Box className="form-field">
                <Typography className="form-label">
                  Nhận xét:
                </Typography>
                <TextField  
                  multiline
                  rows={4}
                  value={comment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="Viết nhận xét của bạn..."
                  fullWidth
                  className="review-textarea"
                  error={!!badWordsWarning}
                />
              </Box>
              <Box className="form-buttons">
                <Button
                  className="cancel-button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setBadWordsWarning('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  className="review-button"
                  onClick={handleValidatedSubmitReview}
                >
                  Gửi đánh giá
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default FeedbackAndRating;