import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  Collapse,
  Chip,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import "./OrderPage.css"; 
import * as CartService from "../../services/CartService";
import * as OrderService from "../../services/OrderService";
import * as DiscountService from "../../services/DiscountService";
import * as UserService from "../../services/UserService";
import * as GHNService from "../../services/GHNService";
function OrderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    notes: ""
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDiscountList, setShowDiscountList] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);

  const checkAuthentication = useCallback(async () => {
    try {
      setIsLoading(true);
      const access_token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      if (!access_token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      const response = await UserService.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

   const fetchProvinces = useCallback(async () => {
    try {
      const response = await GHNService.getProvinces();
      setProvinces(response.data.map(province => ({
        id: province.ProvinceID,
        name: province.ProvinceName
      })));
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setAlert({
        open: true,
        message: "Không thể tải danh sách tỉnh/thành phố",
        severity: "error"
      });
    }
  }, []);

  const fetchDistricts = useCallback(async (provinceId) => {
    try {
      const response = await GHNService.getDistricts(provinceId);

      setDistricts(response.data.map(district => ({
        id: district.DistrictID,
        name: district.DistrictName,
        provinceId: district.ProvinceID
      })));

      setWards([]);
      setShippingAddress(prev => ({
        ...prev,
        district: "",
        ward: ""
      }));
    } catch (error) {
      console.error("Error fetching districts:", error);
      setAlert({
        open: true,
        message: "Không thể tải danh sách quận/huyện",
        severity: "error"
      });
    }
  }, []);

  const fetchWards = useCallback(async (districtId) => {
    try {
      const response = await GHNService.getWards(districtId);

      setWards(response.data.map(ward => ({
        id: ward.WardCode,
        name: ward.WardName,
        districtId: ward.DistrictID
      })));

      setShippingAddress(prev => ({
        ...prev,
        ward: ""
      }));
    } catch (error) {
      console.error("Error fetching wards:", error);
      setAlert({
        open: true,
        message: "Không thể tải danh sách phường/xã",
        severity: "error"
      });
    }
  }, []);


  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);

      const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!access_token) {
        setLoading(false);
        return;
      }

      const response = await CartService.getCart();
      setCartItems(response.data.cartItems);

      const userResponse = await UserService.getProfile();
      const userData = userResponse.data.user || userResponse.data;
      console.log("User data received:", userData);

      if (userData.address && userData.address.length > 0) {
        const defaultAddress = userData.address.find(addr => addr.isDefault);

        if (defaultAddress) {
          console.log("Default address:", defaultAddress);
          setSelectedAddressId(defaultAddress._id);

          await fetchDistricts(defaultAddress.provinceId);

          await fetchWards(defaultAddress.districtId);

          setShippingAddress({
            name: userData.name || "",
            phoneNumber: defaultAddress.phone || userData.phone || "",
            address: defaultAddress.address || "",
            province: defaultAddress.provinceId || "",
            district: defaultAddress.districtId || "",
            ward: defaultAddress.wardCode || "",
            notes: ""
          });
        }
      } else {
        setUseNewAddress(true);
        setShippingAddress(prev => ({
          ...prev,
          name: userData.name || "",
          phoneNumber: userData.phone || "",
          address: userData.address || "",
          province: userData.province || "",
          district: userData.district || "",
          ward: userData.ward || ""
        }));
      }

      // 7. Set điểm thưởng
      setAvailablePoints(userData.points || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      setLoading(false);
      setAlert({
        open: true,
        message: "Có lỗi xảy ra khi tải dữ liệu",
        severity: "error"
      });
    }
  }, [fetchDistricts, fetchWards]);

  const calculateShippingFee = useCallback(async () => {
    if (!shippingAddress.ward || !shippingAddress.district) {
      return;
    }

    try {
      setCalculatingFee(true);

      const totalWeight = cartItems.reduce((total, item) => total + (item.quantity * 500), 0);
      const totalValue = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

      const response = await GHNService.calculateFee({
        to_ward_code: shippingAddress.ward,
        to_district_id: parseInt(shippingAddress.district),
        insurance_value: totalValue,
        weight: totalWeight
      });

      if (response.data && response.data.data) {
        const calculatedFee = response.data.data.total;
        setShippingFee(calculatedFee);
      } else {
        setShippingFee(35000);
      }

      setCalculatingFee(false);
    } catch (error) {
      console.error("Error calculating shipping fee:", error.response?.data || error.message);
      setShippingFee(35000);
      setCalculatingFee(false);
      setAlert({
        open: true,
        message: "Không thể tính phí vận chuyển, đã áp dụng phí mặc định",
        severity: "warning"
      });
    }
  }, [cartItems, shippingAddress.district, shippingAddress.ward]);

  const fetchSuitableDiscounts = useCallback(async () => {
    try {
      setLoadingDiscounts(true);

      const subtotal = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

      const response = await DiscountService.getSuitableDiscounts(subtotal);

      if (response.data && response.data.discounts) {
        setAvailableDiscounts(response.data.discounts);
      } else {
        setAvailableDiscounts([]);
      }
    } catch (error) {
      console.error("Error fetching suitable discounts:", error.response?.data || error.message);
      setAvailableDiscounts([]);
    } finally {
      setLoadingDiscounts(false);
    }
  }, [cartItems]);

  useEffect(() => {
    const init = async () => {
      const isAuth = await checkAuthentication();
      if (isAuth) {
        fetchCart();
        fetchProvinces();
      }
    };

    init();
  }, [checkAuthentication, fetchCart, fetchProvinces]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchSuitableDiscounts();
    }
  }, [cartItems, fetchSuitableDiscounts]);

  useEffect(() => {
    if (isAuthenticated && shippingAddress.ward && shippingAddress.district) {
      calculateShippingFee();
    }
  }, [shippingAddress.ward, shippingAddress.district, calculateShippingFee, isAuthenticated]);

  const handleAddressSelection = async (e) => {
    const addressId = e.target.value;

    if (addressId === "new") {
      setUseNewAddress(true);
      setSelectedAddressId("");
      setShippingAddress({
        name: user.name || "",
        phoneNumber: user.phone || "",
        address: "",
        province: "",
        district: "",
        ward: "",
        notes: ""
      });
    } else {
      setUseNewAddress(false);
      setSelectedAddressId(addressId);

      const selectedAddress = user.address.find(addr => addr._id === addressId);
      if (selectedAddress) {
        try {
          await fetchDistricts(selectedAddress.provinceId); 
          await fetchWards(selectedAddress.districtId);    

          setShippingAddress({
            name: user.name || "",
            phoneNumber: selectedAddress.phone || user.phone || "",
            address: selectedAddress.address || "",
            province: selectedAddress.provinceId || "",
            district: selectedAddress.districtId || "",
            ward: selectedAddress.wardCode || "",
            notes: ""
          });
        } catch (error) {
          console.error("Lỗi khi load địa chỉ:", error);
          setAlert({
            open: true,
            message: "Không thể load địa chỉ đã chọn",
            severity: "error"
          });
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));

    if (name === "province" && value) {
      fetchDistricts(value);
    } else if (name === "district" && value) {
      fetchWards(value);
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleDiscountCodeChange = (e) => {
    setDiscountCode(e.target.value);
  };

  const handleToggleDiscountList = () => {
    setShowDiscountList(!showDiscountList);
  };

  const handleApplyDiscount = (discount) => {
    if (!discount) return;

    let calculatedDiscountAmount = 0;

    if (discount.type === 'PERCENTAGE' || discount.type === 'percentage') {
      const subtotal = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);
      calculatedDiscountAmount = subtotal * (discount.value / 100);

      if (discount.maxDiscount && calculatedDiscountAmount > discount.maxDiscount) {
        calculatedDiscountAmount = discount.maxDiscount;
      }
    } else {
      calculatedDiscountAmount = discount.value;
    }

    setDiscountAmount(calculatedDiscountAmount);
    setAppliedDiscount({
      code: discount.code,
      amount: calculatedDiscountAmount,
      _id: discount._id,
      description: discount.description || ""
    });

    setAlert({
      open: true,
      message: "Áp dụng mã giảm giá thành công",
      severity: "success"
    });

    setShowDiscountList(false);
  };

  const handleApplyDiscountByCode = async () => {
    if (!discountCode.trim()) {
      setAlert({
        open: true,
        message: "Vui lòng nhập mã giảm giá",
        severity: "error"
      });
      return;
    }

    try {
      setApplyingDiscount(true);

      const foundDiscount = availableDiscounts.find(
        discount => discount.code.toLowerCase() === discountCode.toLowerCase()
      );

      if (foundDiscount) {
        handleApplyDiscount(foundDiscount);
      } else {
        setAlert({
          open: true,
          message: "Mã giảm giá không hợp lệ hoặc không áp dụng được cho đơn hàng này",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      setAlert({
        open: true,
        message: "Có lỗi xảy ra khi áp dụng mã giảm giá",
        severity: "error"
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountAmount(0);
    setDiscountCode("");
    setAppliedDiscount(null);
    setAlert({
      open: true,
      message: "Đã xóa mã giảm giá",
      severity: "info"
    });
  };

  const handlePointsChange = (e) => {
    const points = parseInt(e.target.value) || 0;
    if (points > availablePoints) {
      setPointsToUse(availablePoints);
    } else {
      setPointsToUse(points);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.book.price * item.quantity,
    0
  );

  const totalAmount = (subtotal || 0) + (shippingFee || 0) - (discountAmount || 0) - (pointsToUse || 0);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!access_token) {
        setAlert({
          open: true,
          message: "Vui lòng đăng nhập để tiếp tục",
          severity: "error"
        });
        navigate("/account/login");
        return;
      }

      const requiredFields = ["name", "phoneNumber", "address", "province", "district", "ward"];
      const missingFields = requiredFields.filter(field => !shippingAddress[field]);

      if (missingFields.length > 0) {
        setAlert({
          open: true,
          message: "Vui lòng điền đầy đủ thông tin giao hàng",
          severity: "error"
        });
        setLoading(false);
        return;
      }

      const selectedProvince = provinces.find(p => p.id === shippingAddress.province);
      const selectedDistrict = districts.find(d => d.id === shippingAddress.district);
      const selectedWard = wards.find(w => w.id === shippingAddress.ward);

      const orderData = {
        shippingInfo: {
          name: shippingAddress.name,
          phoneNumber: shippingAddress.phoneNumber,
          address: shippingAddress.address,
          provinceId: shippingAddress.province,
          districtId: shippingAddress.district,
          wardCode: shippingAddress.ward,
          provineName: selectedProvince?.name || "",
          districtName: selectedDistrict?.name || "",
          wardName: selectedWard?.name || "",
          note: shippingAddress.notes || "",
          fee: shippingFee
        },
        paymentMethod: paymentMethod,
        discountUsed: appliedDiscount?._id || null,
        pointUsed: pointsToUse,
        notes: shippingAddress.notes || ""
      };

      const response = await OrderService.createOrder(orderData);

      const orderId = response.data.data?._id || response.data.savedOrder?._id;

      if (!orderId) {
        throw new Error("Order ID not found in response");
      }

      localStorage.setItem("latestOrder", JSON.stringify({
        shippingInfo: {
          name: shippingAddress.name,
          phoneNumber: shippingAddress.phoneNumber,
          address: shippingAddress.address,
          province: provinces.find(p => p.id === shippingAddress.province)?.name || "",
          district: districts.find(d => d.id === shippingAddress.district)?.name || "",
          ward: wards.find(w => w.id === shippingAddress.ward)?.name || "",
          note: shippingAddress.notes || "",
          fee: shippingFee
        },
        paymentMethod,
        totalDiscount: discountAmount,
        pointUsed: pointsToUse,
        totalAmount,
        items: cartItems
      }));

      if (paymentMethod === "Online") {
        const paymentResponse = await OrderService.createPayment(orderId);

        if (paymentResponse.data.paymentUrl) {
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          throw new Error("Payment URL not found in response");
        }
      } else {
        navigate("/payment-success");
      }
    } catch (error) {
      console.error("Error details:", error);

      if (error.response) {
        console.error("Server response data:", error.response.data);
        console.error("Server response status:", error.response.status);

        setAlert({
          open: true,
          message: error.response.data.message ||
            `Lỗi ${error.response.status}: Có lỗi xảy ra khi đặt hàng`,
          severity: "error"
        });
      } else if (error.request) {
        console.error("No response received:", error.request);
        setAlert({
          open: true,
          message: "Không nhận được phản hồi từ máy chủ",
          severity: "error"
        });
      } else {
        console.error("Error message:", error.message);
        setAlert({
          open: true,
          message: `Lỗi: ${error.message}`,
          severity: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const DiscountsList = () => {
    if (!availableDiscounts.length) {
      return (
        <Box className="discount-loading-center">
          <Typography variant="body2" color="text.secondary">
            Không có mã giảm giá khả dụng
          </Typography>
        </Box>
      );
    }

    return (
      <List className="discount-list">
        {availableDiscounts.map((discount) => {
          let discountDesc = "";
          if (discount.type === 'PERCENTAGE' || discount.type === 'percentage') {
            discountDesc = `Giảm ${discount.value}%`;
            if (discount.maxDiscount) {
              discountDesc += ` (tối đa ${discount.maxDiscount.toLocaleString()}₫)`;
            }
          } else {
            discountDesc = `Giảm ${discount.value.toLocaleString()}₫`;
          }

          return (
            <ListItem
              key={discount._id}
              divider
              button
              onClick={() => handleApplyDiscount(discount)}
              className="discount-list-item"
            >
              <Box className="discount-item-content">
                <Box className="discount-item-header">
                  <Typography variant="subtitle2" className="discount-item-code">
                    {discount.code}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyDiscount(discount);
                    }}
                  >
                    Áp dụng
                  </Button>
                </Box>
                <Typography variant="body2" className="discount-item-description">
                  {discountDesc}
                </Typography>
                {discount.description && (
                  <Typography variant="body2" className="discount-item-description" color="text.secondary">
                    {discount.description}
                  </Typography>
                )}
                {discount.minOrderValue > 0 && (
                  <Typography variant="body2" className="discount-item-min-order">
                    Đơn tối thiểu: {discount.minOrderValue.toLocaleString()}₫
                  </Typography>
                )}
                {discount.expiryDate && (
                  <Typography variant="caption" className="discount-item-expiry">
                    HSD: {new Date(discount.expiryDate).toLocaleDateString('vi-VN')}
                  </Typography>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>
    );
  };

  // Login page component with CSS classes
  const LoginPrompt = () => (
    <Container maxWidth="sm" className="login-prompt-container">
      <Paper elevation={3} className="login-prompt-paper">
        <Typography variant="h5" component="h1" gutterBottom>
          Vui lòng đăng nhập để tiếp tục
        </Typography>
        <Typography variant="body1" className="login-prompt-text">
          Bạn cần đăng nhập để truy cập trang thanh toán và hoàn tất đơn hàng của mình.
        </Typography>
        <Box className="login-button-container">
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/account/login"
          >
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );

  // Show loading state
  if (isLoading) {
    return (
      <Container className="loading-container">
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Box maxWidth={"xl"} className="order-container" sx={{mx: "auto", padding: 2}}>
        {!isAuthenticated ? (
          <LoginPrompt />
        ) : (
          <>
            <Box className="order-header">
              <Typography variant="h4" className="order-main-title">
                 Thanh toán đơn hàng
              </Typography>
            </Box>                     
            {loading ? (
              <Box className="centered-loading">
                <CircularProgress />
              </Box>
            ) : cartItems.length === 0 ? (
              <Paper className="empty-cart-paper">
                <Typography variant="body1" color="textSecondary">
                  Không có sản phẩm nào trong giỏ hàng
                </Typography>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  className="continue-shopping-button"
                  startIcon={<ArrowBackIcon />}
                >
                  Tiếp tục mua hàng
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {/* Shipping Information */}
                <Grid size={8}>
                  <Box className="shipping-paper">
                    <Typography variant="h6" gutterBottom className="shipping-title">
                      Thông tin giao hàng
                    </Typography>

                   <Box className="address-selection-paper">
                      <Typography variant="h6" gutterBottom className="address-selection-title">
                        <LocationOnIcon className="shipping-icon" /> Chọn địa chỉ giao hàng
                      </Typography>
                      
                      <RadioGroup
                        className="address-radio-group"
                        value={useNewAddress ? "new" : selectedAddressId}
                        onChange={handleAddressSelection}
                      >
                        {user?.address && user.address.length > 0 && user.address.map((addr) => (
                          <FormControlLabel
                            key={addr._id}
                            value={addr._id}
                            control={<Radio />}
                            label={
                              <Box className="address-label-content">
                                <Box className="address-header">
                                  <Typography variant="body1" className="address-name-phone">
                                    {user.name} - {user.phone}
                                  </Typography>

                                  {addr.isDefault && (
                                    <Box className="default-label">
                                      Mặc định
                                    </Box>
                                  )}
                                </Box>

                                <Typography variant="body2" className="address-full-text">
                                  {addr.address}, {addr.wardName}, {addr.districtName}, {addr.provinceName}
                                </Typography>
                              </Box>
                            }
                            className={selectedAddressId === addr._id ? "address-option-check" : "address-option"}
                          />
                        ))}
                        
                        <FormControlLabel
                          value="new"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">
                                Sử dụng địa chỉ mới
                              </Typography>
                            </Box>
                          }
                          className="new-address-option"
                        />
                      </RadioGroup>    
                    </Box> 


                    <Grid container spacing={2}>
                      <Grid size= {{xs: 12, sm: 6}}>
                        <TextField
                          fullWidth
                          label="Họ và tên"
                          name="name"
                          value={shippingAddress.name}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid  size= {{xs: 12, sm: 6}}>
                        <TextField
                          
                          fullWidth
                          label="Số điện thoại"
                          name="phoneNumber"
                          value={shippingAddress.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid  size= {12}>
                        <TextField
                          
                          fullWidth
                          label="Địa chỉ"
                          name="address"
                          value={shippingAddress.address}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid size= {{xs: 12, sm: 4}}>
                        <FormControl fullWidth >
                          <InputLabel>Tỉnh/Thành phố</InputLabel>
                          <Select
                            name="province"
                            value={shippingAddress.province}
                            onChange={handleInputChange}
                            label="Tỉnh/Thành phố *"
                          >
                            {provinces.map(province => (
                              <MenuItem key={province.id} value={province.id}>
                                {province.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size= {{xs: 12, sm: 4}}>
                        <FormControl fullWidth >
                          <InputLabel>Quận/Huyện</InputLabel>
                          <Select
                            name="district"
                            value={shippingAddress.district}
                            onChange={handleInputChange}
                            label="Quận/Huyện *"
                            disabled={!shippingAddress.province}
                          >
                            {districts.map(district => (
                              <MenuItem key={district.id} value={district.id}>
                                {district.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size= {{xs: 12, sm: 4}}>
                        <FormControl fullWidth >
                          <InputLabel>Phường/Xã</InputLabel>
                          <Select
                            name="ward"
                            value={shippingAddress.ward}
                            onChange={handleInputChange}
                            label="Phường/Xã *"
                            disabled={!shippingAddress.district}
                          >
                            {wards.map(ward => (
                              <MenuItem key={ward.id} value={ward.id}>
                                {ward.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size= {12}>
                        <TextField
                          fullWidth
                          label="Ghi chú (tùy chọn)"
                          name="notes"
                          value={shippingAddress.notes}
                          onChange={handleInputChange}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box className="payment-paper">
                    <Typography variant="h6" gutterBottom className="payment-title">
                      Phương thức thanh toán
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        <FormControlLabel
                          value="COD"
                          control={<Radio className="custom-radio" />}
                          label={
                            <Box className="payment-method-box">
                              <Typography>Thanh toán khi giao hàng (COD)</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="Online"
                          control={<Radio className="custom-radio" />}
                          label={
                            <Box className="payment-method-with-icon">
                              <Typography>Thanh toán trực tuyến (Online) </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid size={4} >
                  <Box className="order-summary-paper">
                    <Typography variant="h6" gutterBottom className="order-summary-title">
                      Đơn hàng ({cartItems.length} sản phẩm)
                    </Typography>

                    <Box className="order-items-container">
                      {cartItems.map(item => (
                        <Box key={item.book._id} className="order-item">
                          <Box className="order-item-image">
                            <img
                              src={item.book.images}
                              alt={item.book.title}
                            />
                          </Box>
                          <Box className="order-item-details">
                            <Typography variant="body1" className="order-item-title">
                              {item.book.title}
                            </Typography>
                            <Typography variant="body2" className="order-item-price">
                              {item.book.price.toLocaleString()}₫
                            </Typography>
                            <Typography variant="body2" className="order-item-quantity">
                              Số lượng: {item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Box className="discount-section">
                      <Typography variant="h6" gutterBottom className="discount-title">
                        <LocalOfferIcon className="discount-title-icon" />
                        Mã giảm giá
                      </Typography>

                      {appliedDiscount ? (
                        <Box className="applied-discount-container">
                          <Box className="applied-discount-content">
                            <Box className="applied-discount-info">
                              <Typography variant="subtitle1" className="discount-code">
                                <LocalOfferIcon className="discount-code-icon" />
                                {appliedDiscount.code}
                              </Typography>
                              <Typography variant="body2" className="discount-amount">
                                Giảm: {appliedDiscount.amount.toLocaleString()}₫
                              </Typography>
                              {appliedDiscount.description && (
                                <Typography variant="body2" className="discount-description">
                                  {appliedDiscount.description}
                                </Typography>
                              )}
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={handleRemoveDiscount}
                              className="remove-discount-button"
                            >
                              Xóa
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Box className="discount-input-container">
                            <Box className="discount-input-box">
                              <TextField
                                fullWidth
                                value={discountCode}
                                onChange={handleDiscountCodeChange}
                                size="small"
                                placeholder="Nhập mã giảm giá tại đây"
                              />
                              <Button
                                variant="contained"
                                onClick={handleApplyDiscountByCode}
                                disabled={applyingDiscount || !discountCode.trim()}
                                className="discount-apply-button"
                              >
                                {applyingDiscount ? <CircularProgress size={10} /> : "Áp dụng"}
                              </Button>
                            </Box>
                          </Box>

                          <Box className="discount-toggle-container">
                            <Button
                              variant="text"
                              onClick={handleToggleDiscountList}
                              endIcon={showDiscountList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              className="discount-toggle-button"
                            >
                              {showDiscountList ? "Ẩn mã giảm giá" : "Xem mã giảm giá có thể áp dụng"}
                              {loadingDiscounts && <CircularProgress size={16} sx={{ ml: 1 }} />}
                              {!loadingDiscounts && availableDiscounts.length > 0 && (
                                <Typography component="span" variant="body2" className="discount-count">
                                  ({availableDiscounts.length})
                                </Typography>
                              )}
                            </Button>
                          </Box>

                          <Collapse in={showDiscountList} sx={{ mt: 1 }}>
                            {loadingDiscounts ? (
                              <Box className="discount-loading-center">
                                <CircularProgress size={24} />
                              </Box>
                            ) : (
                              <DiscountsList />
                            )}
                          </Collapse>
                        </>
                      )}
                    </Box>

                    {availablePoints > 0 && (
                      <Paper className="points-paper">
                        <Typography variant="h6" gutterBottom className="points-title">
                          <Box component="span" className="points-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                            </svg>
                          </Box>
                          Điểm thưởng
                        </Typography>
                        <Box className="points-content">
                          <Typography variant="body2" className="points-available">
                            Điểm hiện có: 
                            <Typography component="span" className="points-available-amount">
                              {availablePoints.toLocaleString()}
                            </Typography>
                          </Typography>
                          <Box className="points-input-container">
                            <TextField
                              type="number"
                              label="Số điểm muốn sử dụng"
                              size="small"
                              value={pointsToUse}
                              onChange={handlePointsChange}
                              fullWidth
                              inputProps={{ min: 0, max: availablePoints }}
                            />
                          </Box>
                        </Box>
                        {pointsToUse > 0 && (
                          <Typography variant="body2" className="points-savings">
                            Bạn sẽ tiết kiệm được {pointsToUse.toLocaleString()}₫ với {pointsToUse} điểm
                          </Typography>
                        )}
                      </Paper>
                    )}

                    <Divider className="summary-divider" />

                    <Box className="summary-section">
                      <Box className="summary-row">
                        <Typography variant="body1">Tạm tính</Typography>
                        <Typography variant="body1">{subtotal.toLocaleString()}₫</Typography>
                      </Box>
                      <Box className="summary-row">
                        <Typography variant="body1" className="summary-shipping-fee">
                          Phí vận chuyển
                          {calculatingFee && <CircularProgress size={12} sx={{ ml: 1 }} />}
                        </Typography>
                        <Typography variant="body1">
                          {shippingFee.toLocaleString()}₫
                        </Typography>
                      </Box>
                      {discountAmount > 0 && (
                        <Box className="summary-row">
                          <Typography variant="body1">Giảm giá</Typography>
                          <Typography variant="body1" className="summary-discount">
                            -{discountAmount.toLocaleString()}₫
                          </Typography>
                        </Box>
                      )}
                      {pointsToUse > 0 && (
                        <Box className="summary-row">
                          <Typography variant="body1">Điểm thưởng sử dụng</Typography>
                          <Typography variant="body1" className="summary-points">
                            -{pointsToUse.toLocaleString()}₫
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider className="summary-divider" />

                    <Box className="summary-total">
                      <Typography variant="h6">Tổng cộng</Typography>
                      <Typography variant="h6" className="summary-total-amount">
                        {(totalAmount || 0).toLocaleString()}₫
                      </Typography>
                    </Box>

                    <Box className="action-buttons">
                      <Button
                        component={Link}
                        to="/user/cart"
                        variant="text"
                        className="back-to-cart-button"
                        startIcon={<ArrowBackIcon />}
                      >
                        Quay về giỏ hàng
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        className="place-order-button"
                        onClick={handlePlaceOrder}
                        disabled={loading || calculatingFee}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Đặt hàng'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>
    </>
  );
}

export default OrderPage;