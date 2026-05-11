const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const uploadAvatar = require("../middlewares/uploadAvatar.middleware");


const {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword
} = require("../controllers/user.controller");


// GET PROFILE
router.get("/profile", authMiddleware, getProfile);


// UPDATE PROFILE
router.put("/profile", authMiddleware, updateProfile);


// UPDATE AVATAR
router.post(
  "/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  updateAvatar
);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);



module.exports = router;