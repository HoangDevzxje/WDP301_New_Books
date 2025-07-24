import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
    Slider,
    TextField,
    InputAdornment,
    Collapse,
    IconButton,
} from "@mui/material";
import { ExpandMore, ExpandLess, Search } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import "./ShopAll.css";
import BookCard from "../../components/BookCard/BookCard";
import * as BookService from "../../services/BookService";
import * as CategoryService from "../../services/CategoryService";
import * as WishlistService from "../../services/WishlistService";
import { SearchIcon } from "lucide-react";

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
    const [selectedFilter, setSelectedFilter] = useState("");
    
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [tempPriceRange, setTempPriceRange] = useState([0, 1000000]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000000);
    
    const [authors, setAuthors] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [authorSearchTerm, setAuthorSearchTerm] = useState("");
    const [showAllAuthors, setShowAllAuthors] = useState(false);
    
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        authors: true,
        sort: true
    });

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
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
            
            const uniqueAuthors = [...new Set(response.data.map(book => book.author).filter(Boolean))];
            setAuthors(uniqueAuthors.sort());
            
            const prices = response.data.map(book => book.price).filter(price => price !== undefined);
            const minBookPrice = Math.min(...prices);
            const maxBookPrice = Math.max(...prices);
            
            setMinPrice(minBookPrice);
            setMaxPrice(maxBookPrice);
            setPriceRange([minBookPrice, maxBookPrice]);
            setTempPriceRange([minBookPrice, maxBookPrice]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sách:", error);
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể tải danh sách sách", severity: "error" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilter = async (type) => {
        setIsLoading(true);
        try {
            let response;

            switch (type) {
                case "all":
                    response = await BookService.getBooks();
                    break;
                case "best-sellers":
                    response = await BookService.getBestSellers();
                    break;
                case "big-sale":
                    response = await BookService.getSalesBook();
                    break;
                case "new-release":
                case "new-releases": // Thêm case này để xử lý cả hai tên
                    response = await BookService.getNewBook();
                    break;
                default:
                    response = await BookService.getBooks();
            }

            setBooks(response.data);
            setFilteredBooks(response.data);
            setSelectedFilter(type);
            
            const uniqueAuthors = [...new Set(response.data.map(book => book.author).filter(Boolean))];
            setAuthors(uniqueAuthors.sort());
            
            const prices = response.data.map(book => book.price).filter(price => price !== undefined);
            if (prices.length > 0) {
                const minBookPrice = Math.min(...prices);
                const maxBookPrice = Math.max(...prices);
                setMinPrice(minBookPrice);
                setMaxPrice(maxBookPrice);
                setPriceRange([minBookPrice, maxBookPrice]);
                setTempPriceRange([minBookPrice, maxBookPrice]);
            }
        } catch (error) {
            console.error("Lỗi khi lọc sách:", error);
            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: "Không thể tải dữ liệu",
                severity: "error"
            }]);
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
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể tải danh sách yêu thích", severity: "error" }]);
        }
    }

    // Khởi tạo dữ liệu ban đầu
    useEffect(() => {
        fetchCategories();
        fetchWishlist();
        
        // Kiểm tra nếu có filter từ navigation
        const filterFromState = location.state?.selectedFilter;
        if (filterFromState) {
            handleFilter(filterFromState);
        } else {
            fetchBooks();
        }
    }, []);

    // Xử lý khi location.state thay đổi (navigation từ trang khác)
    useEffect(() => {
        if (location.state?.selectedFilter) {
            handleFilter(location.state.selectedFilter);
        }
    }, [location.state?.selectedFilter]);

    // Xử lý khi location.state có selectedCategoryId
    useEffect(() => {
        if (location.state?.selectedCategoryId) {
            setSelectedCategories([location.state.selectedCategoryId]); 
        }
    }, [location.state?.selectedCategoryId]);

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

        filtered = filtered.filter(book => 
            book.price >= priceRange[0] && book.price <= priceRange[1]
        );

        if (selectedAuthors.length > 0) {
            filtered = filtered.filter(book =>
                selectedAuthors.includes(book.author)
            );
        }

        setFilteredBooks(filtered);
        setDisplayedBooks(filtered.slice(0, itemToShow));
    }, [query, selectedCategories, selectedAuthors, priceRange, books, itemToShow]);

    useEffect(() => {
        setItemToShow(15);
    }, [selectedCategories, selectedAuthors, priceRange]);

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

    const handleAuthorChange = (author) => {
        setSelectedAuthors(prev => {
            if (prev.includes(author)) {
                return prev.filter(a => a !== author);
            } else {
                return [...prev, author];
            }
        });
    };

    const handlePriceChange = (event, newValue) => {
        setTempPriceRange(newValue);
    };

    const handlePriceCommit = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleMinPriceChange = (event) => {
        const value = parseInt(event.target.value) || 0;
        if (value <= tempPriceRange[1]) {
            setTempPriceRange([value, tempPriceRange[1]]);
            setPriceRange([value, tempPriceRange[1]]);
        }
    };

    const handleMaxPriceChange = (event) => {
        const value = parseInt(event.target.value) || maxPrice;
        if (value >= tempPriceRange[0]) {
            setTempPriceRange([tempPriceRange[0], value]);
            setPriceRange([tempPriceRange[0], value]);
        }
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedAuthors([]);
        setPriceRange([minPrice, maxPrice]);
        setTempPriceRange([minPrice, maxPrice]);
        setAuthorSearchTerm("");
        setSortOption("default");
        setNotifications(prev => [...prev, { 
            id: Date.now(), 
            message: "Đã bỏ chọn tất cả bộ lọc", 
            severity: "success" 
        }]);
    };

    const filteredAuthors = authors.filter(author =>
        author.toLowerCase().includes(authorSearchTerm.toLowerCase())
    );

    const displayedAuthors = showAllAuthors ? filteredAuthors : filteredAuthors.slice(0, 10);

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
                if (updateWishlistCount) updateWishlistCount();
                setNotifications(prev => [...prev, { id: Date.now(), message: "Đã xóa khỏi danh sách yêu thích", severity: "success" }]);
            } else {
                await WishlistService.addToWishlist(bookId);
                setWishlist(prev => [...prev, bookId]);
                if (updateWishlistCount) updateWishlistCount();
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

    const hasActiveFilters = selectedCategories.length > 0 || selectedAuthors.length > 0 || 
                           priceRange[0] !== minPrice || priceRange[1] !== maxPrice;

    return (
        <>
            <Divider className="book-search-divider" />
            <Box maxWidth="2xl" className="book-search-container">
                <Grid container className="book-search-grid-container">
                    <Grid size={2} className="categories-filter">
                        <Paper className="categories-paper">
                            <Typography variant="h4" className="search-results-title">
                                Lọc Sản Phẩm
                            </Typography>
                        
                            <Divider className="categories-divider" />

                            {hasActiveFilters && (
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={clearAllFilters}
                                    sx={{ mb: 2, width: '100%' }}
                                >
                                    Bỏ chọn tất cả
                                </Button>
                            )}

                            <Box>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        mb: 1
                                    }}
                                    onClick={() => toggleSection('categories')}
                                >
                                    <Typography variant="h6">Danh mục</Typography>
                                    <IconButton size="small">
                                        {expandedSections.categories ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Box>

                                <Collapse in={expandedSections.categories}>
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
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" className="category-label">
                                                            {category.name}
                                                        </Typography>
                                                    }
                                                />
                                            ))}
                                        </FormGroup>
                                    ) : (
                                        <Typography variant="body2" className="no-categories-text">
                                            Không có danh mục nào.
                                        </Typography>
                                    )}
                                </Collapse>
                            </Box>

                            <Divider className="categories-divider" />

                            <Box>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        mb: 1
                                    }}
                                    onClick={() => toggleSection('price')}
                                >
                                    <Typography variant="h6">Giá</Typography>
                                    <IconButton size="small">
                                        {expandedSections.price ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Box>

                                <Collapse in={expandedSections.price}>
                                    <Box sx={{ px: 1 }}>
                                        <Slider
                                            value={tempPriceRange}
                                            onChange={handlePriceChange}
                                            onChangeCommitted={handlePriceCommit}
                                            valueLabelDisplay="auto"
                                            min={minPrice}
                                            max={maxPrice}
                                            valueLabelFormat={(value) => `${value.toLocaleString()}đ`}
                                            sx={{ mb: 2, color: '#c49a6c' }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <TextField
                                                size="small"
                                                label="Từ"
                                                type="number"
                                                value={tempPriceRange[0]}
                                                onChange={handleMinPriceChange}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">đ</InputAdornment>,
                                                }}
                                                sx={{ 
                                                    flex: 1,
                                                    '& .MuiInputLabel-root': {
                                                        fontSize: '0.75rem'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '0.75rem'
                                                    }
                                                }}
                                            />
                                            <TextField
                                                size="small"
                                                label="Đến"
                                                type="number"
                                                value={tempPriceRange[1]}
                                                onChange={handleMaxPriceChange}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">đ</InputAdornment>,
                                                }}
                                                sx={{ 
                                                    flex: 1,
                                                    '& .MuiInputLabel-root': {
                                                        fontSize: '0.75rem'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '0.75rem'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>

                            <Divider className="categories-divider" />

                            <Box>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        mb: 1
                                    }}
                                    onClick={() => toggleSection('authors')}
                                >
                                    <Typography variant="h6">Tác giả</Typography>
                                    <IconButton size="small">
                                        {expandedSections.authors ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Box>

                                <Collapse in={expandedSections.authors}>
                                    <Box>
                                        <TextField
                                        size="small"
                                        placeholder="Tìm tác giả..."
                                        value={authorSearchTerm}
                                        onChange={(e) => setAuthorSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                            ),
                                            endAdornment: authorSearchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                size="small"
                                                onClick={() => setAuthorSearchTerm("")}
                                                edge="end"
                                                >
                                                <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                            ),
                                        }}
                                        sx={{ width: '100%', mb: 1 }}
                                        />

                                        
                                        <FormGroup className="categories-form-group">
                                            {displayedAuthors.map((author) => (
                                                <FormControlLabel
                                                    key={author}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedAuthors.includes(author)}
                                                            onChange={() => handleAuthorChange(author)}
                                                            className="category-checkbox"
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                                            {author}
                                                        </Typography>
                                                    }
                                                />
                                            ))}
                                        </FormGroup>
                                        
                                        {filteredAuthors.length > 10 && (
                                            <Button
                                                size="small"
                                                onClick={() => setShowAllAuthors(!showAllAuthors)}
                                                sx={{ fontSize: '0.75rem', color: '#c2894cff' , textTransform: 'none' }}
                                            >
                                                {showAllAuthors ? 
                                                    `Hiển thị ít hơn` : 
                                                    `Hiển thị thêm ${filteredAuthors.length - 10} tác giả`
                                                }
                                            </Button>
                                        )}
                                    </Box>
                                </Collapse>
                            </Box>

                            <Divider className="categories-divider" />

                            <Box>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        mb: 1
                                    }}
                                    onClick={() => toggleSection('sort')}
                                >
                                    <Typography variant="h6">Sắp xếp</Typography>
                                    <IconButton size="small">
                                        {expandedSections.sort ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Box>

                                <Collapse in={expandedSections.sort}>
                                    <RadioGroup value={sortOption} onChange={handleSortChange}>
                                        <FormControlLabel
                                            value="default"
                                            control={<Radio className="sort-radio" size="small" />}
                                            label={<Typography variant="body2">Mặc định</Typography>}
                                            className="sort-label"
                                        />
                                        <FormControlLabel
                                            value="priceAsc"
                                            control={<Radio className="sort-radio" size="small" />}
                                            label={<Typography variant="body2">Giá thấp đến cao</Typography>}
                                            className="sort-label"
                                        />
                                        <FormControlLabel
                                            value="priceDesc"
                                            control={<Radio className="sort-radio" size="small" />}
                                            label={<Typography variant="body2">Giá cao đến thấp</Typography>}
                                            className="sort-label"
                                        />
                                        <FormControlLabel
                                            value="titleAsc"
                                            control={<Radio className="sort-radio" size="small" />}
                                            label={<Typography variant="body2">Tên A-Z</Typography>}
                                            className="sort-label"
                                        />
                                        <FormControlLabel
                                            value="titleDesc"
                                            control={<Radio className="sort-radio" size="small" />}
                                            label={<Typography variant="body2">Tên Z-A</Typography>}
                                            className="sort-label"
                                        />
                                    </RadioGroup>
                                </Collapse>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={10} className="books-section">
                        <Typography variant="h4" className="search-results-title">
                            Sách dành cho bạn
                            {hasActiveFilters && (
                                <Typography variant="body2" component="span" sx={{ ml: 2, color: 'text.secondary' }}>
                                    ({filteredBooks.length} sản phẩm)
                                </Typography>
                            )}
                        </Typography>

                        <Divider className="books-divider"/>
                        <Box className="books-filters">
                            <Box>
                                <Button
                                    className={`custom-icon-button2 ${selectedFilter === "all" ? "selected" : ""}`}
                                    disableRipple
                                    onClick={() => handleFilter("all")}
                                >
                                    <Typography variant="body1" className="custom-typography2">
                                        Tất cả
                                    </Typography>
                                </Button>
                            </Box>
                            <Box>
                                <Button
                                    className={`custom-icon-button2 ${selectedFilter === "best-sellers" ? "selected" : ""}`}
                                    disableRipple
                                    onClick={() => handleFilter("best-sellers")}
                                >
                                    <Typography variant="body1" className="custom-typography2">
                                        Best Sellers
                                    </Typography>
                                </Button>
                            </Box>
                            <Box>
                                <Button
                                    className={`custom-icon-button2 ${selectedFilter === "big-sale" ? "selected" : ""}`}
                                    disableRipple
                                    onClick={() => handleFilter("big-sale")}
                                >
                                    <Typography variant="body1" className="custom-typography2">
                                        Big Sale
                                    </Typography>
                                </Button>
                            </Box>
                            <Box>
                                <Button
                                    className={`custom-icon-button2 ${selectedFilter === "new-release" || selectedFilter === "new-releases" ? "selected" : ""}`}
                                    disableRipple
                                    onClick={() => handleFilter("new-release")}
                                >
                                    <Typography variant="body1" className="custom-typography2">
                                        New Releases
                                    </Typography>
                                </Button>
                            </Box>
                        </Box>

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