import React, { useState, useEffect, useCallback } from "react";
import {
    Typography,
    Box,
    Snackbar,
    Alert,
    Container,
    CircularProgress,
    Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import "../Wishlist/Wishlist.css"; 
import {
  getWishlist,
  deleteFromWishlist
} from "../../services/WishlistService";
import BookCard from "../../components/BookCard/BookCard";


function Wishlist({ updateWishlistCount }) {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [wishlistId, setWishlistId] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);

    const verifyAuth = () => {
        const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!access_token) {
            setIsAuthenticated(false);
            localStorage.removeItem("access_token");
            localStorage.removeItem("userEmail");
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("userEmail");
            return null;
        }
        setIsAuthenticated(true);
        return access_token;
    };

    const fetchWishlist = useCallback(async () => {
        setLoading(true);
        const access_token = verifyAuth();
        if (!access_token) {
            setLoading(false);
            return;
        }

        try {
            const response = await getWishlist(); 
            const data = response.data;
            if (data && data.wishlist) {
                const wishlistBooks = data.wishlist;
                setWishlist(wishlistBooks);
                const wishlistId = wishlistBooks.map(book => book._id);
                setWishlistId(wishlistId);
                if (updateWishlistCount) {
                    updateWishlistCount(wishlistId.length);
                }
                setError(null);
            }
        } catch (err) {
            console.error("Wishlist fetch error:", err);
            if (err.response?.status === 401) {
            setIsAuthenticated(false);
            localStorage.clear();
            sessionStorage.clear();
            return;
            }
            setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }, [updateWishlistCount]);

    const removeFromWishlist = async (bookId) => {
        const access_token = verifyAuth();
        if (!access_token) {
            navigate("/account/login", { replace: true });
            return;
        }

        try {
            await deleteFromWishlist(bookId);

            const updatedWishlist = wishlist.filter(book => book._id !== bookId);
            setWishlist(updatedWishlist);

            if (updateWishlistCount) {
                updateWishlistCount(updatedWishlist.length);
            }

            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: 'Đã xóa sách khỏi danh sách yêu thích',
                severity: 'success'
            }]);
        } catch (err) {
            console.error('Remove from wishlist error:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("userEmail");
                sessionStorage.removeItem("access_token");
                sessionStorage.removeItem("userEmail");
                navigate("/account/login", { replace: true });
                return;
            }
            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: 'Không thể xóa sách khỏi danh sách yêu thích',
                severity: 'error'
            }]);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const WishlistContent = () => {
        if (loading) {
            return (
                <Box className="wishlist-loading-container">
                    <CircularProgress size={60} />
                </Box>
            );
        }
        
        if (!isAuthenticated) {
            return (
                <Box className="wishlist-empty-container">
                    <Typography variant="h5" gutterBottom className="wishlist-title">
                        Danh sách yêu thích của tôi
                    </Typography>
                    <Typography variant="body1" className="wishlist-auth-message">
                        Vui lòng{" "}
                        <Link to="/account/login" className="wishlist-link">
                            đăng nhập
                        </Link>
                        {" "}hoặc{" "}
                        <Link to="/account/register" className="wishlist-link">
                            đăng ký
                        </Link>
                        {" "}để có thể thêm thật nhiều sản phẩm vào yêu thích.
                    </Typography>
                </Box>
            );
        }

        if (error) {
            return (
                <Box className="wishlist-error-container">
                    <Typography color="error">{error}</Typography>
                </Box>
            );
        }

        if (wishlist.length === 0) {
            return (
                <Box className="wishlist-empty-container">
                    <Typography variant="h5" gutterBottom className="wishlist-title">
                        Danh sách yêu thích của tôi
                    </Typography>
                    <Typography variant="body1" className="wishlist-auth-message">
                        Bạn chưa có sản phẩm yêu thích,{" "}
                        <Link to="/" className="wishlist-link">
                            vào đây
                        </Link>
                        {' '}để thêm thật nhiều sản phẩm vào yêu thích nào.
                    </Typography>
                </Box>
            );
        }

        const handleMouseEnter = (bookId) => {
            setHoveredId(bookId);
        };

        const handleMouseLeave = () => {
            setHoveredId(null);
        };

        return (
            <Container maxWidth="xl" className="wishlist-container">
                <Box className="wishlist-header">
                    <Typography variant="h4" className="wishlist-main-title">
                        Danh sách yêu thích của tôi
                    </Typography>
                    <Typography variant="body2" className="wishlist-count">
                        {wishlist.length} sản phẩm
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {wishlist.slice(0, 10).map((book) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} key={book._id}>
                        <BookCard
                            book={book}
                            hoveredId={hoveredId}
                            wishlist={wishlistId}
                            onHover={handleMouseEnter}
                            onLeave={handleMouseLeave}
                            toggleWishlist={removeFromWishlist}
                        />
                        </Grid>
                    ))}
                </Grid>
                {wishlist.length > 10 && (
                    <Box className="wishlist-view-all">
                        <Link to="/wishlist" className="wishlist-view-all-link">
                            Xem tất cả {wishlist.length} sản phẩm
                        </Link>
                    </Box>
                )}
                <Box className="wishlist-footer">
                    <Typography variant="body2" className="wishlist-footer-text">
                        Bạn có thể xóa sản phẩm khỏi danh sách yêu thích bằng cách nhấn vào biểu tượng <FavoriteIcon fontSize="small" /> bên cạnh mỗi sản phẩm.
                    </Typography>
                </Box>
            </Container>
        );
    };

    return (
        <div>
            <WishlistContent />
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
        </div>
    );
}

export default Wishlist;