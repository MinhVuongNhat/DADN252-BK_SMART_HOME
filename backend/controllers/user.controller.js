const bcrypt = require("bcrypt");
const User = require("../models/User");
const Home = require("../models/Home");


// ==============================
// GET PROFILE
// ==============================

exports.getProfile = async (req, res) => {

  try {

    const userId = req.user.user_id;

    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "username",
        "email",
        "phone",
        "avatar_url",
        "home_id"
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let home_name = null;

    if (user.home_id) {

      const home = await Home.findByPk(user.home_id);

      if (home) home_name = home.home_name;

    }

    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      home_name
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};



// ==============================
// UPDATE PROFILE
// ==============================

exports.updateProfile = async (req, res) => {

  try {

    const userId = req.user.user_id;

    const { username, email, phone, home_name } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    user.updated_at = new Date();

    await user.save();

    if (home_name && user.home_id) {

      await Home.update(
        { home_name },
        { where: { home_id: user.home_id } }
      );

    }

    res.json({ message: "Profile updated successfully" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};


// ==============================
// UPDATE AVATAR
// ==============================

exports.updateAvatar = async (req, res) => {

  try {

    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarPath = "/uploads/avatar/" + req.file.filename;

    await User.update(
      { avatar_url: avatarPath },
      { where: { user_id: userId } }
    );

    res.json({
      message: "Avatar updated",
      avatar_url: avatarPath
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { old_password, new_password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // FIX: So sánh với password_hash trong DB
    const match = await bcrypt.compare(old_password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password_hash = hashedPassword; // Update đúng field
    user.updated_at = new Date();
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};