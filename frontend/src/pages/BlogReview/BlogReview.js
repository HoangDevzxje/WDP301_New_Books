import React, { useEffect, useState } from 'react';
import { Typography, Paper, Box, Grid, Avatar, Stack } from '@mui/material';
import './BlogReview.css';
import * as ReviewService from '../../services/ReviewService';
import * as BookService from '../../services/BookService';
import { useNavigate } from 'react-router-dom';

const BlogReview = () => {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await ReviewService.getReviews();
        setReviews(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

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
                >
                  <Box 
                    className="card-image"
                    sx={{ 
                      backgroundImage: `url('${review.images?.[0]}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
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
          <Paper className="popular-box">
            <Typography variant="h6" mb={2} sx={{ fontWeight: 'bold', borderBottom: '2px solid #c49a6c', paddingBottom: '18px' }}>
               Bài viết nổi bật
            </Typography>
            {[
              { title: 'Atomic Habits', desc: 'Xây dựng thói quen tốt, phá bỏ thói quen xấu' },
              { title: 'Deep Work', desc: 'Làm việc hiệu quả trong thời đại xao nhãng' },
              { title: 'The Alchemist', desc: 'Cuộc hành trình tìm kiếm ước mơ' }
            ].map((book, i) => (
              <Box key={i} className="popular-item">
                <Box className="popular-item-index">
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                    {i + 1}
                    </Typography>
                </Box>
               <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {book.title}
                    </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  {book.desc}
                </Typography>
               </Box>
                
              </Box>
            ))}
          </Paper>

          <Paper className="hot-lesson-box">
            <Typography variant="h6" mb={2} sx={{ fontWeight: 'bold', borderBottom: '2px solid #c49a6c', paddingBottom: '18px'   }}>
               Các sách hot
            </Typography>
            {[
              'Atomic Habits: 1% mỗi ngày',
              'Think Fast and Slow: Tư duy nhanh chậm',
              'The 7 Habits: 7 thói quen hiệu quả'
            ].map((lesson, i) => (
              <Box key={i} className="lesson-item">
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  💡 {lesson}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BlogReview;