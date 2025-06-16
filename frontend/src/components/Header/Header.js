import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
  Popper,
  Paper,
  Fade,
  Grid,
  MenuItem,
  ListItem,
  List,
  ListItemText,
  Menu,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonPinOutlinedIcon from "@mui/icons-material/PersonPinOutlined";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NoBackpackIcon from "@mui/icons-material/NoBackpack";
import FlagIcon from "@mui/icons-material/Flag";
import RoomIcon from "@mui/icons-material/Room";
import PhoneIcon from "@mui/icons-material/Phone";
import Badge from "@mui/material/Badge";
import InputBase from "@mui/material/InputBase";
import ImageIcon from "@mui/icons-material/Image";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import axios from "axios";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  width: "600px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  transition: "all 0.3s",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const SearchIconWrapper = styled("div")(() => ({
  color: "#999",
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  left: 12,
  top: 0,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#000",
  width: "600px",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: "16px",
    borderRadius: "8px",
    whiteSpace: "nowrap",        
    overflowX: "auto", 
  },
}));

const SearchResults = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 10,
  marginTop: "4px",
  backgroundColor: "#fff",
  maxHeight: "300px",
  overflowY: "auto",
  borderRadius: "6px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  padding: theme.spacing(1),
}));

const Header = ({
  userEmail,
  updateUserEmail,
  wishlistCount = 0,
  cartCount = 0,
  cartTotal = 0,
  updateCartCount,
  updateCartTotal,
  updateWishlistCount,
}) => {
    const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const [showBanner, setShowBanner] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl2(null);
  };

  useEffect(() => {
    fetchCategories();
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:9999/category/");
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setActiveCategory(response.data[0]);
          fetchBooksByCategory(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooksByCategory = async (categoryId) => {
    if (categoryBooks[categoryId]) return;

    try {
      const response = await axios.get(
        `http://localhost:9999/book/category/${categoryId}`
      );
      if (response.data) {
        const activeBooks = response.data.filter(
          (book) => book.isActivated !== false
        );

        setCategoryBooks((prev) => ({
          ...prev,
          [categoryId]: activeBooks,
        }));
      }
    } catch (error) {
      console.error(`Lỗi khi lấy sách cho danh mục ${categoryId}:`, error);
      setCategoryBooks((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:9999/book/");
        const filteredBooks = response.data.filter((book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredBooks);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sách:", error);
      }
    };

    fetchBooks();
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShowResults(true);
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userRole");

    updateUserEmail(null);

    if (typeof updateCartCount === "function") {
      updateCartCount(0);
    }
    if (typeof updateCartTotal === "function") {
      updateCartTotal(0);
    }
    if (typeof updateWishlistCount === "function") {
      updateWishlistCount(0);
    }

    setUserMenuAnchorEl(null);

    // Navigate to login page
      navigate("/account/login");
  };

  const handleCategoryMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
      fetchBooksByCategory(categories[0]._id);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuMouseEnter = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuMouseLeave = () => {
    setUserMenuAnchorEl(null);
  };

  const handleCategoryHover = (category) => {
    setActiveCategory(category);
    fetchBooksByCategory(category._id);
  };

  const handleCategoryClick2 = (categoryId) => {
    navigate(`/category/${categoryId}`);
    handleClose();
  };
  const handleSearchSubmit = () => {
    navigate(`/book-result?query=${encodeURIComponent(searchTerm)}`);
  };

  const displayWishlistText =
    wishlistCount === 1 ? "1 Sản phẩm" : `${wishlistCount} Sản phẩm`;
  
  const open = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  return (
    <Box className="sticky-header">
      <div className="nav-bar-container" >
        <Box className="nav-bar">
          <div className="nav-logo">
            <img src="/NB (2).png" alt="logo" />
            <Typography
                component={Link}
                to="/"
                className="logo-text"
            >
              NewBooks
            </Typography>
          </div>

          <div className="nav-search">
            <Button
              className="custom-icon-button"
              onMouseEnter={handleCategoryMouseEnter}
            >
              <MenuIcon className="custom-icon" />
              <Typography variant="body2" className="custom-typography">
                Danh mục
              </Typography>
            </Button>

            <Search ref={searchRef}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>

              <StyledInputBase
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={(event) => {
                  if (event.key === "Enter") handleSearchSubmit();
                }}
                onClick={handleSearchSubmit}
              />

              {showResults && searchResults.length > 0 && (
                <SearchResults>
                  <List>
                    {searchResults.map((book) => (
                      <ListItem button key={book._id}>
                        {book.images.length > 0 ? (
                          <img
                            src={book.images[0]}
                            alt={book.title}
                            width="40"
                            height="50"
                            className="search-result-image"
                          />
                        ) : (
                          <ImageIcon />
                        )}
                        <ListItemText
                          className="search-result-text"
                          primary={book.title}
                          secondary={formatPrice(book.price)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </SearchResults>
              )}
            </Search>
          </div>

          <div className="nav-buttons">
            {userEmail ? (
              <Box
                className="user-menu-container"
                onMouseEnter={handleUserMenuMouseEnter}
                onMouseLeave={handleUserMenuMouseLeave}
              >
                <Button
                  className="custom-icon-button"
                >
                  <PersonPinOutlinedIcon className="custom-icon" />
                  <Typography
                    variant="body2"
                    className="cart-text custom-typography"
                    component={Link} to="/user/profile"
                  >
                    {userEmail.split("@")[0]}
                  </Typography>
                </Button>

                <Popper
                  open={userMenuOpen}
                  anchorEl={userMenuAnchorEl}
                  placement="bottom-start"
                  transition
                  className="user-menu-popper"
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={250}>
                        <Box className="user-menu-list">
                          <MenuItem
                            component={Link}
                            to="/track-order"
                            className="user-menu-item"
                          >
                            Đơn hàng của tôi
                          </MenuItem>
                          <MenuItem
                            component={Link}
                            to="/user/profile"
                            className="user-menu-item"
                          >
                            Tài khoản của tôi
                          </MenuItem>
                          <MenuItem onClick={handleLogout} className="user-menu-item">
                            Thoát tài khoản
                          </MenuItem>
                        </Box>
                    </Fade>
                  )}
                </Popper>
              </Box>
            ) : (
              <Button
                className="custom-icon-button"
                component={Link} to="/account/login"
              >
                <PersonPinOutlinedIcon className="custom-icon" />
                <Typography
                  variant="body2"
                  className="cart-text custom-typography"
                >
                  Đăng nhập
                </Typography>
              </Button>
            )}

            <Button
              className="custom-icon-button"
               component={Link} to="/cart"
            >
              <AddShoppingCartIcon className="custom-icon" />
              <Typography
                variant="body2"
                className="cart-text custom-typography"
               
              >
                Giỏ hàng
              </Typography>
            </Button>
            
            <Box className="more-menu-container">
              <Button onClick={handleOpenMenu}>
                <MoreVertIcon className="custom-icon" />
              </Button>

              <Menu
                anchorEl={anchorEl2}
                open={Boolean(anchorEl2)}
                onClose={handleCloseMenu}
                className="more-menu"
              >
                <MenuItem onClick={handleCloseMenu} className="more-menu-item">
                  <NoBackpackIcon className="more-menu-icon" />
                  Hoàn trả sách
                </MenuItem>
                <MenuItem onClick={handleCloseMenu} className="more-menu-item">
                  <FlagIcon className="more-menu-icon" />
                  Phản ánh khiếu nại
                </MenuItem>
                <MenuItem onClick={handleCloseMenu} className="more-menu-item">
                  <RoomIcon className="more-menu-icon" />
                  Theo dõi đơn hàng
                </MenuItem>
                <MenuItem onClick={handleCloseMenu} className="more-menu-item">
                  <PhoneIcon />
                  <Typography>0123123123</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </div>
        </Box>
      </div>

      <Container maxWidth="lg" className="dropdown">
        <Box className="dropdown-container">
          <Box 
            className="dropdown-trigger"
            onMouseLeave={handleClose}
          >
            <Popper
              open={open}
              anchorEl={anchorEl}
              placement="bottom-start"
              transition
              className="dropdown-popper"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350} >
                  <Paper
                    className="dropdown-paper"
                  >
                    <Box className="dropdown-content">
                      <Box className="category-list">
                        {isLoading ? (
                          <Typography className="loading-text">
                            Đang tải danh mục...
                          </Typography>
                        ) : categories && categories.length > 0 ? (
                          categories.map((category) => (
                            <MenuItem
                              key={category._id}
                              onClick={() => handleCategoryClick2(category._id)}
                              onMouseEnter={() => handleCategoryHover(category)}
                              className={`category-menu-item ${
                                activeCategory &&
                                activeCategory._id === category._id
                                  ? "active"
                                  : ""
                              }`}
                            >
                              {category.name}
                            </MenuItem>
                          ))
                        ) : (
                          <Typography className="no-category-text">
                            Không có danh mục nào
                          </Typography>
                        )}
                      </Box>

                      <Box className="books-display">
                        {activeCategory ? (
                          <>
                            <Typography
                              variant="h6"
                              className="category-title"
                            >
                              {activeCategory.name}
                            </Typography>

                            {categoryBooks[activeCategory._id] ? (
                              categoryBooks[activeCategory._id].length > 0 ? (
                                <Grid container spacing={2}>
                                  {categoryBooks[activeCategory._id]
                                    .slice(0, 3)
                                    .map((book) => (
                                      <Grid item xs={4} key={book._id}>
                                        <Box
                                          component={Link}
                                          to={`/book/${book._id}`}
                                          className="book-item"
                                        >
                                          <Box className="book-image-container">
                                            <img
                                              src={
                                                book.images?.[0] ||
                                                "/placeholder.jpg"
                                              }
                                              alt={book.title}
                                              className="book-image"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/placeholder.jpg";
                                              }}
                                            />
                                          </Box>
                                          <Typography
                                            variant="body2"
                                            className="book-title"
                                          >
                                            {book.title}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    ))}
                                </Grid>
                              ) : (
                                <Typography variant="body2" className="no-books-text">
                                  Không có sách nào trong danh mục này
                                </Typography>
                              )
                            ) : (
                              <Typography variant="body2" className="loading-books-text">
                                Đang tải sách...
                              </Typography>
                            )}

                            <Box className="view-all-container">
                              <Button
                                className="custom-icon-button"
                                component={Link}
                                to={`/category/${activeCategory._id}`}
                                variant="outlined"
                                size="small"
                                onClick={handleClose}
                              >
                                <Typography variant="body2" className="custom-typography">
                                  Xem tất cả
                                </Typography>
                              </Button>
                            </Box>
                          </>
                        ) : (
                          <Typography variant="body1" className="select-category-text">
                            Vui lòng chọn danh mục để xem sách
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              )}
            </Popper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Header;