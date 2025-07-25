import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse
} from '@mui/material';
import {
  MoreVert,
  Reply,
  ThumbUpOutlined,
  Edit,
  Delete,
} from '@mui/icons-material';

// Import ReviewService đã có sẵn
import * as ReviewService from '../../services/ReviewService';

const Comments = ({ reviewId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const getCurrentUser = () => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  const currentUser = getCurrentUser();
  const isLoggedIn = !!(localStorage.getItem("access_token") || sessionStorage.getItem("access_token"));

  // ✅ FIX: Sử dụng ReviewService thay vì fetch trực tiếp
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await ReviewService.getCommentsByReviewId(reviewId);

      // ✅ FIX: Xử lý response data đúng cách
      if (response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]); // Set empty array nếu có lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reviewId) {
      fetchComments();
    }
  }, [reviewId]);

  // ✅ FIX: Sử dụng ReviewService.postComment
  const handlePostComment = async () => {
    if (!newComment.trim() || !isLoggedIn) return;

    try {
      setLoading(true);
      const response = await ReviewService.postComment(reviewId, newComment);

      if (response.status === 201) {
        setNewComment('');
        // Refresh comments sau khi tạo thành công
        await fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      // Có thể thêm notification ở đây
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Sử dụng ReviewService.deleteComment
  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    try {
      setLoading(true);
      const response = await ReviewService.deleteComment(selectedComment._id);

      if (response.status === 200) {
        await fetchComments(); // Refresh comments
        setDeleteDialog(false);
        setSelectedComment(null);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Thêm function edit comment (cần thêm vào ReviewService)
  const handleEditComment = async () => {
    if (!editingComment || !editText.trim()) return;

    try {
      setLoading(true);
      // Cần thêm updateComment function vào ReviewService
      const response = await fetch(`/comment/${editingComment._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token") || sessionStorage.getItem("access_token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: editText
        })
      });

      if (response.ok) {
        setEditingComment(null);
        setEditText('');
        await fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const startEdit = () => {
    setEditingComment(selectedComment);
    setEditText(selectedComment.content);
    handleMenuClose();
  };

  const startDelete = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const toggleExpanded = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canModifyComment = (comment) => {
    return currentUser && (
      currentUser._id === comment.userId?._id ||
      currentUser.role === 'admin'
    );
  };

  // ✅ FIX: Thêm loading state
  if (loading && comments.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Đang tải bình luận...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#c49a6c' }}>
        Bình luận ({comments.length})
      </Typography>

      {isLoggedIn ? (
        <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 40, height: 40 }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </Avatar>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handlePostComment}
              disabled={!newComment.trim() || loading}
              sx={{
                borderRadius: '12px',
                bgcolor: '#c49a6c',
                '&:hover': {
                  bgcolor: '#b8896a',
                },
              }}
            >
              {loading ? 'Đang gửi...' : 'Đăng bình luận'}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', textAlign: 'center' }}>
          <Typography color="text.secondary">
            Vui lòng đăng nhập để bình luận
          </Typography>
        </Paper>
      )}

      <Box sx={{ space: 2 }}>
        {comments.map((comment) => (
          <Paper key={comment._id} sx={{ p: 3, mb: 2, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {comment.userId?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {comment.userId?.name || 'Người dùng ẩn danh'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(comment.createdAt)}
                    {comment.updatedAt !== comment.createdAt && ' (đã chỉnh sửa)'}
                  </Typography>
                </Box>
              </Box>

              {canModifyComment(comment) && (
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, comment)}
                >
                  <MoreVert />
                </IconButton>
              )}
            </Box>

            {editingComment?._id === comment._id ? (
              <Box sx={{ ml: 7, mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleEditComment}
                    disabled={loading}
                    sx={{ bgcolor: '#c49a6c' }}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ ml: 7, mb: 2, whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </Typography>
            )}

            <Box sx={{ ml: 7, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                size="small"
                startIcon={<ThumbUpOutlined />}
                sx={{ color: 'text.secondary', textTransform: 'none' }}
              >
                Thích
              </Button>
              <Button
                size="small"
                startIcon={<Reply />}
                sx={{ color: 'text.secondary', textTransform: 'none' }}
                onClick={() => setReplyingTo(comment._id)}
              >
                Trả lời
              </Button>
            </Box>

            <Collapse in={replyingTo === comment._id}>
              <Box sx={{ ml: 7, mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: '8px' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Viết phản hồi..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained" sx={{ bgcolor: '#c49a6c' }}>
                    Trả lời
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    Hủy
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        ))}

        {comments.length === 0 && !loading && (
          <Paper sx={{ p: 4, borderRadius: '12px', textAlign: 'center' }}>
            <Typography color="text.secondary">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Typography>
          </Paper>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={startEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={startDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa bình luận</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteComment}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Comments;