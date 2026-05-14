// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ Không tìm thấy token trong header");
      return res.status(401).json({ message: "Vui lòng đăng nhập!" });
    }

    // Kiểm tra kĩ SECRET_KEY
    const SECRET = process.env.JWT_SECRET || "secret_key_nhom_6";
    const decoded = jwt.verify(token, SECRET);


    req.user = decoded;

    next();
  } catch (error) {
    // In lỗi chi tiết ra console của Backend (Terminal)
    console.error("❌ Lỗi xác thực JWT:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token đã hết hạn!" });
    }
    res
      .status(403)
      .json({ message: "Phiên làm việc hết hạn hoặc Token không hợp lệ!" });
  }
};
