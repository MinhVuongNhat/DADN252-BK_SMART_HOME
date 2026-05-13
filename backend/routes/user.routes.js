const express = require("express");
const router = express.Router();

// Đảm bảo đường dẫn này chính xác tới file middleware của bạn
const authMiddleware = require("../middlewares/auth.middleware"); 
const uploadAvatar = require("../middlewares/uploadAvatar.middleware");

const {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword
} = require("../controllers/user.controller");

/**
 * LƯU Ý: 
 * Nếu file auth.middleware.js của bạn export theo kiểu: module.exports = { verifyToken: ... }
 * Thì ở đây bạn phải sửa thành: const { verifyToken } = require("../middlewares/auth.middleware");
 * Và thay authMiddleware bên dưới thành verifyToken.
 */

// GET PROFILE - Lấy thông tin cá nhân
router.get("/profile", authMiddleware, getProfile);

// UPDATE PROFILE - Cập nhật thông tin chữ (tên, email, sđt...)
router.put("/profile", authMiddleware, updateProfile);

// UPDATE AVATAR - Cập nhật ảnh đại diện
router.post(
  "/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"), // "avatar" phải khớp với name trong FormData ở Frontend
  updateAvatar
);

// CHANGE PASSWORD - Đổi mật khẩu
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;