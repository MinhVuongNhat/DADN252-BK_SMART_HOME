const bcrypt = require("bcrypt");
const User = require("../models/User");
const Home = require("../models/Home");
const  {sendResetPasswordEmail}  = require('../utils/mailer');
const jwt = require('jsonwebtoken');

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
        "home_id",
      ],
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
      home_name,
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
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cập nhật các trường
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.updated_at = new Date();

    await user.save(); // Nếu trùng email, nó sẽ nhảy xuống catch(err) ở đây

    if (home_name && user.home_id) {
      await Home.update({ home_name }, { where: { home_id: user.home_id } });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Database Update Error:", err); // Xem lỗi ở Terminal Backend
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
      { where: { user_id: userId } },
    );

    res.json({
      message: "Avatar updated",
      avatar_url: avatarPath,
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
    if (!match)
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password_hash = hashedPassword; // Update đúng field
    user.updated_at = new Date();
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Quên mật khẩu


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }

    // 1. Tạo chìa khóa bí mật động (Kết hợp Secret chung + mật khẩu mã hóa hiện tại của user)
    const secretKey = (process.env.JWT_SECRET || "thang_smart_home_2026_bi_mat") + user.password_hash;

    // 2. Ký JWT chứa ID của user, cho hết hạn sau 15 phút
    const resetToken = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      secretKey, 
      { expiresIn: '15m' }
    );
    
    // HOÀN TOÀN KHÔNG CÓ user.save() ghi vào DB nữa! Dữ liệu của nhóm hoàn toàn sạch sẽ.

    // 3. Tạo link dẫn tới trang React của Thắng (Token JWT lúc này nằm trên URL luôn)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // 4. Gửi email thông qua hàm của Thắng sang Mailtrap
    await sendResetPasswordEmail(user.email, resetLink);

    res.json({ message: "Link đặt lại mật khẩu đã được gửi vào Mailtrap của bạn!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
    // 1. Chỉ đón đúng token và newPassword từ Frontend React gửi qua
    const { token, newPassword } = req.body;

    // console.log("\n=======================================================");
    // console.log("📥 [BACKEND RECEIVE] Có request gửi đến API Reset Password");
    // console.log("👉 Token nhận được:", token ? `|${token.substring(0, 30)}...|` : "❌ TRỐNG TRƠN!");
    // console.log("👉 Mật khẩu mới nhận được (newPassword):", newPassword ? `|${newPassword}|` : "❌ TRỐNG TRƠN!");
    // console.log("=======================================================");

    try {
        // 1. Giải mã thô để lấy user_id bên trong token ra trước
        // console.log("🔍 [BƯỚC 1] Đang tiến hành decode thô Token...");
        const decoded = jwt.decode(token);
        if (!decoded) {
            // console.log("❌ [LỖI BƯỚC 1] jwt.decode thất bại! Token không đúng định dạng JWT.");
            return res.status(400).json({ message: "Token không hợp lệ!" });
        }
        // console.log("✅ [THÀNH CÔNG BƯỚC 1] Decode thô mượt mà. Dữ liệu bên trong token:", decoded);

        // 2. Tìm user trong DB để lấy password_hash cũ ra làm chìa khóa đối chiếu
        // console.log(`🔍 [BƯỚC 2] Đang tìm User có ID = [${decoded.user_id}] trong SQL Server...`);
        const user = await User.findByPk(decoded.user_id);
        if (!user) {
            // console.log(`❌ [LỖI BƯỚC 2] Không tìm thấy User nào có ID = [${decoded.user_id}] trong Database của nhóm!`);
            return res.status(400).json({ message: "Yêu cầu không hợp lệ hoặc tài khoản không tồn tại!" });
        }
        // console.log("✅ [THÀNH CÔNG BƯỚC 2] Tìm thấy người dùng!");
        // console.log("   - Username:", user.username);
        // console.log("   - Email hiện tại:", user.email);
        // console.log("   - Pass Hash hiện tại trong DB:", user.password_hash.substring(0, 15) + "...");

        // 3. Tái tạo lại khóa bí mật và xác thực xem token có bị fake hay hết hạn 15 phút chưa
        // console.log("🔍 [BƯỚC 3] Đang tái tạo Secret Key động và tiến hành verify token...");
        const secretKey = (process.env.JWT_SECRET || "thang_smart_home_2026_bi_mat") + user.password_hash;
        
        // Tiến hành verify thực tế
        jwt.verify(token, secretKey); 
        // console.log("✅ [THÀNH CÔNG BƯỚC 3] Token chuẩn chỉnh 100%! Không bị fake, không hết hạn.");

        // 4. Băm mật khẩu mới và cập nhật trực tiếp
        // console.log("🔍 [BƯỚC 4] Đang kiểm tra dữ liệu mật khẩu để tiến hành băm (hash)...");
        if (!newPassword) {
            // console.log("❌ [LỖI BƯỚC 4] Biến 'newPassword' trống rỗng! Không có mật khẩu để băm.");
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới!" });
        }

        // console.log(`   -> Tiến hành băm mật khẩu: |${newPassword}| bằng bcrypt...`);
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt); // Dùng đúng biến newPassword
        
        // console.log("💾 [BƯỚC 5] Đang thực thi lệnh user.save() để ghi đè vào SQL Server...");
        await user.save();
        // console.log("🎉 [THÀNH CÔNG RỰC RỠ] Đã cập nhật mật khẩu mới vào DB thành công!");

        res.json({ message: "Đổi mật khẩu thành công!" });

    } catch (err) {
        // console.log("\n================ 🚨 JWT VERIFY CATCH ERROR ================");
        // console.error("❌ Tên loại lỗi gặp phải (Error Name):", err.name);
        // console.error("❌ Chi tiết thông báo lỗi (Error Message):", err.message);

        // Kiểm tra xem lỗi có phải do lệch múi giờ hay hết hạn thật không
        try {
            const decodedTho = jwt.decode(token);
            if (decodedTho && decodedTho.exp) {
                // console.log("⏱️ Thời gian Token hết hạn (Unix):", decodedTho.exp);
                // console.log("📅 Đổi sang giờ VN:", new Date(decodedTho.exp * 1000).toLocaleString("vi-VN"));
                // console.log("💻 Thời gian máy tính của Thắng hiện tại:", new Date().toLocaleString("vi-VN"));
            }
        } catch (e) {
            console.log("Không giải mã sâu thêm được.");
        }
        // console.log("===========================================================\n");

        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: "Liên kết đặt lại mật khẩu đã hết hạn (quá 15 phút)!" });
        }
        res.status(500).json({ error: err.message });
    }
};