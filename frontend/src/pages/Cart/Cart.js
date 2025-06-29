import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "@mui/material";
import { Link } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import './Cart.css';
import { getCart, addToCart, removeFromCart, updateCart } from "../../services/CartService";

function Cart({ updateCartData }) {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const response = await getCart();
      setCartItems(response.data.cartItems);

      if (updateCartData) {
        updateCartData();
      }
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [updateCartData]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleIncrease = async (id) => {
    const updatedItem = cartItems.find((item) => item.book._id === id);
    if (updatedItem) {
      try {
        await updateCart({ bookId: id, quantity: updatedItem.quantity + 1 });
        fetchCart();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }
  };

  const handleDecrease = async (id) => {
    const updatedItem = cartItems.find((item) => item.book._id === id);
    if (updatedItem && updatedItem.quantity > 1) {
      try {
        await updateCart({ bookId: id, quantity: updatedItem.quantity - 1 });
        fetchCart();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    } else {
      handleRemove(id);
    }
  };

  const handleRemove = async (id) => {
    try {
      const response = await removeFromCart(id);

      if (response.data && response.data.message) {
        setMessage(response.data.message);
        setOpenSnackbar(true);
      }

      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);

      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.book.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="cart-container">
      <Container maxWidth="xl">
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success">
            {message}
          </Alert>
        </Snackbar>

        {loading ? (
          <Box className="loading-container">
            <CircularProgress size={60} className="loading-spinner" />
            <Typography variant="body1" className="loading-text">
              Đang tải giỏ hàng...
            </Typography>
          </Box>
        ) : cartItems.length === 0 ? (
          <Box className="empty-cart">
            <ShoppingBagOutlinedIcon className="empty-cart-icon" />
            <Typography variant="h6" className="empty-cart-text">
              Không có sản phẩm nào trong giỏ hàng của bạn
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              className="continue-shopping-btn"
            >
              Tiếp tục mua hàng
            </Button>
          </Box>
        ) : (
          <Box className="cart-content">
            <Box className="cart-items-section">
              <Box className="wishlist-header">
                <Typography variant="h4" className="wishlist-main-title">
                    Giỏ hàng của bạn
                 </Typography>
                 <Typography variant="body2" className="wishlist-count">
                    {cartItems.length} sản phẩm
                 </Typography>
              </Box>                     
              
              <Card className="cart-table-card">
                <CardContent className="cart-table-content">
                  <Table className="cart-table">
                    <TableHead>
                      <TableRow className="cart-table-header">
                        <TableCell className="table-header-cell">Sản phẩm</TableCell>
                        <TableCell align="center" className="table-header-cell">Đơn giá</TableCell>
                        <TableCell align="center" className="table-header-cell">Số lượng</TableCell>
                        <TableCell align="center" className="table-header-cell">Tổng giá</TableCell>
                        <TableCell align="center" className="table-header-cell"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.book._id} className="cart-table-row">
                          <TableCell className="product-cell">
                            <Box className="product-info">
                              <Link to={`/book/${item.book._id}`} className="product-image-link">
                                <img
                                  src={item.book.images}
                                  alt={item.book.title}
                                  className="product-image"
                                />
                              </Link>
                              <Box className="product-details">
                                <Link
                                  to={`/book/${item.book._id}`}
                                  className="product-title"
                                >
                                  {item.book.title}
                                </Link>
                                {item.book.author && (
                                  <Typography variant="body2" className="product-author">
                                    Tác giả: {item.book.author}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell align="center" className="price-cell">
                            <Typography className="unit-price">
                              {item.book.price.toLocaleString()}₫
                            </Typography>
                          </TableCell>

                          <TableCell align="center" className="quantity-cell">
                            <Box className="quantity-controls-table">
                              <IconButton 
                                onClick={() => handleDecrease(item.book._id)}
                                size="small"
                                className="quantity-btn-table"
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography className="quantity-display-table">
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                onClick={() => handleIncrease(item.book._id)}
                                size="small"
                                className="quantity-btn-table"
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>

                          <TableCell align="center" className="total-cell">
                            <Box className="total-price-container">
                              <Typography className="total-price">
                                {(item.book.price * item.quantity).toLocaleString()}₫
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" className="action-cell">
                             <IconButton 
                                onClick={() => handleRemove(item.book._id)}
                                className="remove-btn-table"
                                title="Xóa sản phẩm"
                              >
                                <DeleteIcon />
                              </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>

            <Box className="cart-summary-section">
              <Card className="summary-card">
                <CardContent>
                  <Typography variant="h6" className="summary-title">
                    Tóm tắt đơn hàng
                  </Typography>
                  
                  <Divider className="summary-divider" />
                  
                  <Box className="summary-row">
                    <Typography className="summary-label">
                      Tạm tính ({totalItems} sản phẩm):
                    </Typography>
                    <Typography className="summary-value">
                      {totalAmount.toLocaleString()}₫
                    </Typography>
                  </Box>

                  <Box className="summary-row">
                    <Typography className="summary-label">
                      Phí vận chuyển:
                    </Typography>
                    <Typography className="summary-value free-shipping">
                      Miễn phí
                    </Typography>
                  </Box>

                  <Box className="summary-row total-row">
                    <Typography className="total-label">
                      Tổng cộng:
                    </Typography>
                    <Typography className="total-value">
                      {totalAmount.toLocaleString()}₫
                    </Typography>
                  </Box>

                  <Box className="checkout-actions">
                    <Button
                      component={Link}
                      to="/checkout"
                      variant="contained"
                      fullWidth
                      className="checkout-btn"
                    >
                      Tiến hành thanh toán
                    </Button>
                    
                    <Button 
                      component={Link} 
                      to="/" 
                      variant="outlined" 
                      fullWidth
                      className="continue-btn"
                    >
                      Tiếp tục mua hàng
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Container>
    </div>
  );
}

export default Cart;