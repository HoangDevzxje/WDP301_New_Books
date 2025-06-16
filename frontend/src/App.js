import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import HomePage from "./pages/HomePage/HomePage";
import Header from "./components/Header/Header";
import AdminLayout from "./components/Adminlayout/AdminLayout.js";
import BookManagement from "./pages/Admin/BookManagement";
const AdminRoute = ({ children }) => {
  const userRole =
    localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
  const isAuthenticated =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!isAuthenticated || userRole !== "admin") {
    return <Navigate to="/account/login" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const updateUserEmail = (email, role = null) => {
      setUserEmail(email);
      if (role) {
        setUserRole(role);
      }
    };

  return (
    <>
      {!isAdminRoute &&
        <Header
          userEmail={userEmail}
          updateUserEmail={updateUserEmail}/>
      }
      

          <Routes>
            <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="books" element={<BookManagement />} />
          </Route>

          <Route path="/account/login" element={<Login onLoginSuccess={updateUserEmail} />} />
          <Route path="/account/register" element={<Register />} />
          <Route path="/" element={<HomePage/>} />
       </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
