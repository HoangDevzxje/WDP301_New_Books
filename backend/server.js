// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoute");
        
const { checkAuthorize } = require("./middleware/authMiddleware");


const DB = require("./config/db");

const app = express();
const port = process.env.PORT || 9999;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);


// Test phân quyền
app.get("/open", (req, res) => {
    res.status(200).json({ message: "Đây là API công khai." });
});
app.get("/admin-only", checkAuthorize(["admin"]), (req, res) => {
    res.status(200).json({ message: "Chào Admin!" });
});
app.get("/user-or-admin", checkAuthorize(["user", "admin"]), (req, res) => {
    res.status(200).json({ message: "Chào User hoặc Admin!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  DB.connectDB();
});
