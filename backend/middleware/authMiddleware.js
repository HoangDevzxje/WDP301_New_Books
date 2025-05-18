const User = require("../models/User");
const jwt = require("jsonwebtoken");

const checkAuthorize = (roles = []) => async(req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Không có quyền truy cập!" });

  try {
    // Verify token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    // Kiểm tra xem id trong token có hợp lệ không (tồn tại trong DB)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại!" });
    }

    // Lưu thông tin user vào request để có thể sử dụng trong các route
    req.user = user;

    // Kiểm tra role (nếu có yêu cầu role trong middleware)
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
    }

    next(); // Tiếp tục với request nếu tất cả kiểm tra đều hợp lệ
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Token không hợp lệ!" });
  }
};

module.exports = { checkAuthorize };
