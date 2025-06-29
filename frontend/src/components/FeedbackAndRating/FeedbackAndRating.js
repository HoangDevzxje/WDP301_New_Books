import React from "react";
import {
  Box,
  Typography,
  Rating,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Edit, Delete } from "@mui/icons-material";
import "./FeedbackAndRating.css";

const FeedbackAndRating = ({
  tabValue,
  reviews,
  averageRating,
  userReview,
  showReviewForm,
  hasReviewed,
  rating,
  comment,
  editingReview,
  anchorEl,
  selectedReview,
  setEditingReview,
  setRating,
  setComment,
  setShowReviewForm,
  handleMenuOpen,
  handleMenuClose,
  handleEdit,
  handleDelete,
  handleSubmitEdit,
  handleSubmitReview,
}) => {
  return (
    <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" className="feedback-panel">
      {tabValue === 1 && reviews.length === 0 ? (
        <Typography className="no-reviews-message">
          Chưa có đánh giá nào cho sản phẩm này.
        </Typography>
      ) : (
        <>
          <Typography variant="h6" className="average-rating">
            Đánh giá trung bình:
            <span className="rating-display">
              <Rating
                value={averageRating}
                precision={0.1}
                readOnly
                className="rating-stars"
              />
            </span>
            <span className="rating-text">
              {averageRating.toFixed(1)} / 5
            </span>
          </Typography>

          {/* Render danh sách review */}
          {reviews.map((review) => (
            <Card key={review._id} className="review-card" variant="outlined">
              <CardContent className="review-card-content">
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography className="review-user-name">
                      {review.user.name}
                    </Typography>
                    <Typography className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
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
                
                <Rating 
                  value={review.rating} 
                  precision={0.1} 
                  readOnly 
                  size="small"
                  className="review-rating"
                />
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
                >
                  <MenuItem
                    onClick={() => {
                      handleEdit(review);
                      handleMenuClose();
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
                  >
                    <Delete fontSize="small" sx={{ mr: 1 }} />
                    Xóa
                  </MenuItem>
                </Menu>
              </CardContent>
            </Card>
          ))}

          {/* Form chỉnh sửa review */}
          {editingReview && (
            <Box className="edit-form">
              <Typography variant="h6" className="form-title">
                Chỉnh sửa đánh giá
              </Typography>
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
                  className="form-rating"
                />
              </Box>
              <Box className="form-field">
                <Typography className="form-label">
                  Nhận xét:
                </Typography>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      comment: e.target.value,
                    })
                  }
                  rows="4"
                  className="form-textarea"
                  placeholder="Viết nhận xét của bạn..."
                />
              </Box>
              <Box className="form-buttons">
                <Button
                  variant="outlined"
                  className="cancel-button"
                  onClick={() => setEditingReview(null)}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitEdit}
                  className="submit-button"
                  sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
                >
                  Lưu đánh giá
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Nút mở form đánh giá nếu user chưa đánh giá */}
      {!hasReviewed && (
        <Box className="review-button-container">
          <Button
            variant="outlined"
            onClick={() => setShowReviewForm(true)}
            className="review-button"
            sx={{ 
              borderColor: 'black', 
              color: 'black',
              '&:hover': { 
                backgroundColor: 'black', 
                color: 'white',
                borderColor: 'black'
              } 
            }}
          >
            Viết đánh giá
          </Button>
        </Box>
      )}
     
      {/* Form gửi đánh giá */}
      {showReviewForm && (
        <Box className="submit-form">
          <Typography variant="h6" className="form-title">
            Đánh giá sản phẩm
          </Typography>
          <Box className="form-field">
            <Typography className="form-label">
              Rating  của bạn:
            </Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              precision={1}
              className="form-rating"
            />
          </Box>
          <Box className="form-field">
            <Typography className="form-label">
              Nhận xét:
            </Typography>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="form-textarea"
              placeholder="Viết nhận xét của bạn..."
            />
          </Box>
          <Box className="form-buttons">
            <Button
              variant="outlined"
              className="cancel-button"
              onClick={() => setShowReviewForm(false)}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitReview}
              className="submit-button"
              sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}
            >
              Gửi đánh giá
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FeedbackAndRating;