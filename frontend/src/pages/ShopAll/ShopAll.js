import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Grid,
    Checkbox,
    Paper,
    FormGroup,
    FormControlLabel,
    CircularProgress,
    Radio,
    RadioGroup,
    Button,
    Divider,
    Snackbar,
    Alert,
} from "@mui/material";
import "./ShopAll.css";
import BookCard from "../../components/BookCard/BookCard";
import * as BookService from "../../services/BookService";
import * as CategoryService from "../../services/CategoryService";
import * as WishlistService from "../../services/WishlistService";
const ShopAll = ({ updateWishlistCount, updateCartData }) => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("query");
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [sortOption, setSortOption] = useState("default");
    const [itemToShow, setItemToShow] = useState(15);
    const [displayedBooks, setDisplayedBooks] = useState([]);
    const loadBooks = 8;
    const [hoveredId, setHoveredId] = useState(null);

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    useEffect(() => {
        let sortedBooks = [...filteredBooks];
        switch (sortOption) {
            case "priceAsc":
                sortedBooks.sort((a, b) => a.price - b.price);
                break;
            case "priceDesc":
                sortedBooks.sort((a, b) => b.price - a.price);
                break;
            case "titleAsc":
                sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "titleDesc":
                sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        setDisplayedBooks(sortedBooks);
    }, [sortOption]);
    
    const fetchCategories = async () => {
            try {
                const response = await CategoryService.getCategories();
                if (response.data && Array.isArray(response.data)) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể tải danh mục", severity: "error" }]);
            }
        };

    const fetchBooks = async () => {
        setIsLoading(true);
        try {
            const response = await BookService.getBooks();
            setBooks(response.data);
            setFilteredBooks(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sách:", error);
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể tải danh sách sách", severity: "error" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWishlist = async() => {
        try {
            const response = await WishlistService.getWishlist();
            const wishlistIds = response.data.wishlist.map(item => item._id);
            
            setWishlist(wishlistIds);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách yêu thích:", error)
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể tải danh sách yêu thích", severity: "error" }]);
        }
    }
           
    useEffect(() => {
        fetchCategories();
        fetchBooks();
        fetchWishlist();
        console.log("wislist", wishlist);
    }, []);

    useEffect(() => {
        let filtered = books;

        if (query) {
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (selectedCategories.length > 0) {
            filtered = filtered.filter(book =>
                book.categories && book.categories.some(categoryId => selectedCategories.includes(categoryId))
            );
        }

        setFilteredBooks(filtered);
        setDisplayedBooks(filtered.slice(0, itemToShow));
    }, [query, selectedCategories, books, itemToShow]);

    useEffect(() => {
        setItemToShow(15);
    }, [selectedCategories]);

    const loadMore = () => {
        setItemToShow(prev => prev + loadBooks);
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const toggleWishlist = async (bookId) => {
        const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!access_token) {
            setNotifications(prev => [...prev, { id: Date.now(), message: "Vui lòng đăng nhập để thêm vào yêu thích", severity: "warning" }]);
            return;
        }

        try {
            if (wishlist.includes(bookId)) {
                await WishlistService.deleteFromWishlist(bookId);
                setWishlist(prev => prev.filter(id => id !== bookId));
                if (updateWishlistCount) updateWishlistCount(prev => prev - 1);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Đã xóa khỏi danh sách yêu thích", severity: "success" }]);
            } else {
                await WishlistService.addToWishlist(bookId);
                setWishlist(prev => [...prev, bookId]);
                if (updateWishlistCount) updateWishlistCount(prev => prev + 1);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Đã thêm vào danh sách yêu thích", severity: "success" }]);
            }
        } catch (error) {
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể cập nhật danh sách yêu thích", severity: "error" }]);
        }
    };

    const handleMouseEnter = (bookId) => {
        setHoveredId(bookId);
    };

    const handleMouseLeave = () => {
        setHoveredId(null);
    };

    return (
    <>
        <Divider className="book-search-divider" />
        <Box maxWidth="2xl" className="book-search-container">
            <Grid container className="book-search-grid-container">
                <Grid size={2} className="categories-filter">
                <Paper className="categories-paper">
                    <Typography variant="h4" className="search-results-title">
                        Danh mục
                    </Typography>

                    {isLoading ? (
                    <Box className="categories-loading">
                        <CircularProgress size={24} />
                    </Box>
                    ) : categories.length > 0 ? (
                    <FormGroup className="categories-form-group">
                        {categories.map((category) => (
                        <FormControlLabel
                            key={category._id}
                            control={
                            <Checkbox
                                checked={selectedCategories.includes(category._id)}
                                onChange={() => handleCategoryChange(category._id)}
                                className="category-checkbox"
                            />
                            }
                            label={
                                <Typography className="category-label">{category.name}</Typography>
                            }
                        />
                        ))}
                    </FormGroup>
                    ) : (
                        <Typography variant="body2" className="no-categories-text">Không có danh mục nào.</Typography>
                    )}

                    <Divider className="categories-divider" />

                    <Box>
                        <RadioGroup value={sortOption} onChange={handleSortChange}>
                            <FormControlLabel
                            value="default"
                            control={<Radio className="sort-radio" />}
                            label="Mặc định"
                             className="sort-label"
                            />
                            <FormControlLabel
                            value="priceAsc"
                            control={<Radio className="sort-radio" />}
                            label="Giá thấp đến cao"
                             className="sort-label"
                            />
                            <FormControlLabel
                            value="priceDesc"
                            control={<Radio className="sort-radio" />}
                            label="Giá cao đến thấp"
                             className="sort-label"
                            />
                            <FormControlLabel
                            value="titleAsc"
                            control={<Radio className="sort-radio" />}
                            label="Tên A-Z"
                             className="sort-label"
                            />
                            <FormControlLabel
                            value="titleDesc"
                            control={<Radio className="sort-radio" />}
                            label="Tên Z-A"
                             className="sort-label"
                            />
                        </RadioGroup>
                    </Box>
                </Paper>
                </Grid>

                <Grid size={10} className="books-section">
                     <Typography variant="h4" className="search-results-title">
                        Sách dành cho bạn
                    </Typography>

                    <Divider className="books-divider" sx={{ marginBottom: 2 }} />

                    {isLoading ? (
                        <Box className="books-loading">
                            <CircularProgress />
                        </Box>
                    ) : filteredBooks.length > 0 ? (
                        <Grid container className="books-grid" spacing={4}>
                            {displayedBooks.map((book) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} key={book._id}>
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
                    ) : (
                        <Typography className="no-books-text">Không tìm thấy sách phù hợp.</Typography>
                    )}

                    <Box className="load-more-container">
                    {displayedBooks.length < filteredBooks.length && (
                        <Button
                            variant="contained"
                            onClick={loadMore}
                            className="load-more-button"
                        >
                            Xem thêm {filteredBooks.length - displayedBooks.length} sản phẩm
                        </Button>
                    )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
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
    </>
);
};

export default ShopAll;