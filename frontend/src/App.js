import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";


function App() {
  const location = useLocation();  ;
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute &&
        <Header/>
      }

       <Routes>
         <Route path="/" element={<HomePage/>} />
       </Routes>

       {!isAdminRoute && 
        <Footer />
       }
    </>
  );
}

export default App;