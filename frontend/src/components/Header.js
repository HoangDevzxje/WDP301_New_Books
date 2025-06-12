import React, { useState, useEffect, useRef } from "react";
import "../styles/Header.css";
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


const CategoryMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  "&:hover": {
    backgroundColor: "#f5f5f5",
    color: "#000",
  },
}));

const UserMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0.75, 1.5),
  fontSize: "0.875rem",
  "&:hover": {
    backgroundColor: "#f5f5f5",
    color: "#187bcd",
  },
  borderBottom: "1px solid #f0f0f0",
  "&:last-child": {
    borderBottom: "none",
  },
}));

const UserMenuPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1300,
  "& .MuiPaper-root": {
    minWidth: "150px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    padding: 0,
  },
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
                sx={{
                  fontSize: "1.6rem",
                  fontWeight: "bold",
                  float: "left",
                  color: "white",
                  textShadow: "1px 1px 2px #0003",
                  textDecoration: "none",
                }}
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
                            style={{ borderRadius: "4px", objectFit: "cover" }}
                          />
                        ) : (
                          <ImageIcon />
                        )}
                        <ListItemText
                          style={{ marginLeft: "10px" }}
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
                sx={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                }}
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

                <UserMenuPopper
                  open={userMenuOpen}
                  anchorEl={userMenuAnchorEl}
                  placement="bottom-start"
                  transition
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={250}>
                      <Paper sx={{ mt: 1 }}>
                        <Box
                          component="ul"
                          sx={{ padding: 0, margin: 0, listStyle: "none" }}
                        >
                          <UserMenuItem
                          component={Link}
                          to="/track-order"
                          >
                            Đơn hàng của tôi
                          </UserMenuItem>
                          <UserMenuItem
                          component={Link}
                          to="/user/profile"
                          >
                            Tài khoản của tôi
                          </UserMenuItem>
                          <UserMenuItem onClick={handleLogout}>
                            Thoát tài khoản
                          </UserMenuItem>
                        </Box>
                      </Paper>
                    </Fade>
                  )}
                </UserMenuPopper>
              </Box>
            ) : (
              <Button
                className="custom-icon-button"
              >
                <PersonPinOutlinedIcon className="custom-icon" />
                <Typography
                  variant="body2"
                  className="cart-text custom-typography"
                  component={Link} to="/account/login"
                >
                  Đăng nhập
                </Typography>
              </Button>
            )}

            <Button
              className="custom-icon-button"
            >
              <AddShoppingCartIcon className="custom-icon" />
              <Typography
                variant="body2"
                className="cart-text custom-typography"
                component={Link} to="/cart"
              >
                Giỏ hàng
              </Typography>
            </Button>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button onClick={handleOpenMenu}>
                <MoreVertIcon className="custom-icon" />
              </Button>

              <Menu
                anchorEl={anchorEl2}
                open={Boolean(anchorEl2)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={handleCloseMenu}>
                  <NoBackpackIcon sx={{ mr: 1 }} />
                  Hoàn trả sách
                </MenuItem>
                <MenuItem onClick={handleCloseMenu}>
                  <FlagIcon sx={{ mr: 1 }} />
                  Phản ánh khiếu nại
                </MenuItem>
                <MenuItem onClick={handleCloseMenu}>
                  <RoomIcon sx={{ mr: 1 }} />
                  Theo dõi đơn hàng
                </MenuItem>
                <MenuItem onClick={handleCloseMenu}>
                  <PhoneIcon />
                  <Typography>0123123123</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </div>
        </Box>
      </div>

      <Container maxWidth="lg" className="dropdown">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box 
            sx={{
              position: "relative",
              "&:hover": {
                "& .dropdown-menu": {
                  opacity: 1,
                  visibility: "visible",
                },
              },
            }}
            onMouseLeave={handleClose}
          >
            <Popper
              open={open}
              anchorEl={anchorEl}
              placement="bottom-start"
              transition
              style={{ zIndex: 1300 }} 
              className="dropdown-menu"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350} >
                  <Paper
                    sx={{
                      width: "800px",
                      display: "flex",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      marginTop: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", width: "100%" }}>
                      <Box
                        sx={{
                          width: "30%",
                          borderRight: "1px solid #eee",
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        {isLoading ? (
                          <Typography sx={{ p: 2 }}>
                            Đang tải danh mục...
                          </Typography>
                        ) : categories && categories.length > 0 ? (
                          categories.map((category) => (
                            <CategoryMenuItem
                              key={category._id}
                              onClick={() => handleCategoryClick2(category._id)}
                              onMouseEnter={() => handleCategoryHover(category)}
                              sx={{
                                backgroundColor:
                                  activeCategory &&
                                  activeCategory._id === category._id
                                    ? "#f5f5f5"
                                    : "transparent",
                                color:
                                  activeCategory &&
                                  activeCategory._id === category._id
                                    ? "#000"
                                    : "inherit",
                                fontWeight:
                                  activeCategory &&
                                  activeCategory._id === category._id
                                    ? "bold"
                                    : "normal",
                              }}
                            >
                              {category.name}
                            </CategoryMenuItem>
                          ))
                        ) : (
                          <Typography sx={{ p: 2 }}>
                            Không có danh mục nào
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          width: "70%",
                          padding: 2,
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        {activeCategory ? (
                          <>
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 2,
                                color: "#000",
                                borderBottom: "1px solid #eee",
                                paddingBottom: 1,
                              }}
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
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textDecoration: "none",
                                            color: "inherit",
                                            padding: 2,
                                            "&:hover": { color: "#C49A6C" },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 80,
                                              height: 120,
                                              minWidth: 80,
                                              minHeight: 120,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              border: "1px solid #eee",
                                              overflow: "hidden",
                                            }}
                                          >
                                            <img
                                              src={
                                                book.images?.[0] ||
                                                "/placeholder.jpg"
                                              }
                                              alt={book.title}
                                              style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                              }}
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/placeholder.jpg";
                                              }}
                                            />
                                          </Box>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              mt: 1,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              display: "-webkit-box",
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: "vertical",
                                              textAlign: "center",
                                              maxWidth: 140, 
                                            }}
                                          >
                                            {book.title}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    ))}
                                </Grid>
                              ) : (
                                <Typography variant="body2">
                                  Không có sách nào trong danh mục này
                                </Typography>
                              )
                            ) : (
                              <Typography variant="body2">
                                Đang tải sách...
                              </Typography>
                            )}

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                              }}
                            >
                              <Button
                                component={Link}
                                to={`/category/${activeCategory._id}`}
                                variant="outlined"
                                color="#000"
                                size="small"
                                onClick={handleClose}
                              >
                                Xem tất cả
                              </Button>
                            </Box>
                          </>
                        ) : (
                          <Typography variant="body1">
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
