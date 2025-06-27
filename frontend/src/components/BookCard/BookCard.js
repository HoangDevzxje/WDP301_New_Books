import React from "react";
import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CardMedia from "@mui/material/CardMedia";
import "./BookCard.css";

const BookCard = ({ book, hoveredId, wishlist, onHover, onLeave, toggleWishlist }) => {
  return (
    <Card
      onMouseEnter={() => onHover(book._id)}
      onMouseLeave={onLeave}
      className="book-card"
      sx={{ boxShadow: "none", border: "none" }}
    >
      <Box>
        {book.originalPrice > book.price && (
          <Box className="book-discount">
            -
            {Math.round((1 - book.price / book.originalPrice) * 100)}%
          </Box>
        )}

        {book.stock === 0 && <Box className="book-stock">Hết hàng</Box>}

        {(hoveredId === book._id || wishlist.includes(book._id)) && (
            <Box 
                className={`book-wishlist-btn ${hoveredId === book._id && !wishlist.includes(book._id) ? 'animate-in' : ''}`}
            >
                <IconButton onClick={() => toggleWishlist(book._id)} size="small">
                {wishlist.includes(book._id) ? (
                    <FavoriteIcon sx={{ color: "#c49a6c" }} />
                ) : (
                    <FavoriteBorderIcon />
                )}
                </IconButton>
            </Box>
        )}

        <Link to={`/book/${book._id}`} className="book-link">
          <Box className="book-imagecontainer">
            <CardMedia
              component="img"
              image={
                book.images && book.images.length > 0 ? book.images[0] : ""
              }
              alt={book.title}
              className="book-image2"
            />
          </Box>
        </Link>
      </Box>

      <CardContent className="book-content">
        <Link to={`/book/${book._id}`} className="book-link">
          <Typography className="book-title2">{book.title}</Typography>
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
  );
};

export default BookCard;
