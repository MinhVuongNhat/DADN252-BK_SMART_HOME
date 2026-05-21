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



// GET PROFILE - Lấy thông tin cá nhân
router.get("/profile", authMiddleware, getProfile);

// UPDATE PROFILE - Cập nhật thông tin chữ (tên, email, sđt...)
router.put("/profile", authMiddleware, updateProfile);

// UPDATE AVATAR - Cập nhật ảnh đại diện
router.post(
  "/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"), 
  updateAvatar
);

// CHANGE PASSWORD - Đổi mật khẩu
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;