import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import HomePage from "./pages/HomePage/HomePage";
import AdminLayout from "./components/Adminlayout/AdminLayout.js";
import Header from "./components/Header/Header";
import BookDetail from "./pages/BookDetail/BookDetail.js";
import BookList from "./pages/Admin/BookManagement/BookList.js";
import BookFormPage from "./pages/Admin/BookManagement/BookFormPage.js";
import CategoryManagementPage from "./pages/Admin/CategoryManagement/CategoryManagementPage.js";
import UserManagement from "./pages/Admin/UserManagrment/UserManagement.js";
import FeedbackManagement from "./pages/Admin/FeedbackManagement/FeedbackManagement.js";
import Wishlist from "./pages/Wishlist/Wishlist";
import Chatbot from "./components/Chatbot/Chatbot.js";
import Cart from "./pages/Cart/Cart.js";
import DiscountListPage from "./pages/Admin/DiscountManagement/DiscountListPage.js";
import DiscountFormPage from "./pages/Admin/DiscountManagement/DiscountFormPage.js";
import OrderManagement from "./pages/Admin/OrderManagement/OrderManagement.js";
import Profile from "./pages/Profile/Profile.js";
import EditProfile from "./pages/Profile/EditProfile.js";
import AddressPage from "./pages/Profile/AddressPage.js";
import ChangePassword from "./pages/Profile/ChangePassword.js";
import OrderPage from "./pages/OrderPage/OrderPage.js";
import OrderSuccessPage from "./pages/OrderSuccessPage/OrderSuccessPage.js";
import ShopAll from "./pages/ShopAll/ShopAll.js";

const AdminRoute = ({ children }) => {
  const userRole =
    localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
  const isAuthenticated =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  if (!isAuthenticated || userRole !== "admin") {
    return <Navigate to="/account/login" replace />;
  }

  return children;
};

const UserOnlyRoute = ({ children }) => {
  const userRole =
    localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

  if (userRole === "admin") {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const storedEmail =
    localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");

  const updateUserEmail = (email, role = null) => {
    setUserEmail(email);
    if (role) {
      setUserRole(role);
    }
  };

  return (
    <>
      {!isAdminRoute && (
        <Header userEmail={storedEmail} updateUserEmail={updateUserEmail} />
      )}

      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="books">
            <Route index element={<BookList />} />
            <Route path="add" element={<BookFormPage />} />
            <Route path=":id/edit" element={<BookFormPage />} />
          </Route>
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="feedbacks" element={<FeedbackManagement />} />
          <Route path="discounts">
            <Route index element={<DiscountListPage />} />
            <Route path="add" element={<DiscountFormPage />} />
            <Route path=":id/edit" element={<DiscountFormPage />} />
          </Route>
          <Route path="orders" element={<OrderManagement />} />
        </Route>

        <Route
          path="/account/login"
          element={<Login onLoginSuccess={updateUserEmail} />}
        />
        <Route path="/account/register" element={<Register />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/shopAll" element={<ShopAll />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/edit-profile" element={<EditProfile />} />
        <Route path="/user/addresses" element={<AddressPage />} />

        <Route
          path="/user/change-password"
          element={
            <UserOnlyRoute>
              <ChangePassword />
            </UserOnlyRoute>
          }
        />
        <Route
          path="/user/wishlist"
          element={
            <UserOnlyRoute>
              <Wishlist />
            </UserOnlyRoute>
          }
        />

        <Route
          path="/user/cart"
          element={
            <UserOnlyRoute>
              <Cart />
            </UserOnlyRoute>
          }
        />
        <Route path="/checkout" element={
          <UserOnlyRoute>
            <OrderPage />
          </UserOnlyRoute>
        } />

        <Route path="/payment-success" element={
          <UserOnlyRoute>
            <OrderSuccessPage  />
          </UserOnlyRoute>
        } />

      </Routes>

      {!isAdminRoute && (
        <>
          <Footer />
          <Chatbot />
        </>
      )}
    </>
  );
}

export default App;
