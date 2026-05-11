const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Để mã hóa mật khẩu

const signup = async (userData) => {
    // 1. Kiểm tra xem email hoặc username đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) throw new Error("Email này đã được đăng ký!");

    // 2. Mã hóa mật khẩu (Đừng bao giờ lưu mật khẩu thô vào DB!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 3. Lưu vào Database
    const newUser = await User.create({
        username: userData.username,
        email: userData.email,
        password_hash: hashedPassword, // Lưu bản đã mã hóa
        phone: userData.phone
    });

    return newUser;
};

const login = async (email, password) => {
    // 1. Tìm user theo email
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Email không tồn tại!");

    // 2. So sánh mật khẩu (Giải mã bcrypt)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error("Sai mật khẩu!");

    // 3. Tạo Token (Chìa khóa vạn năng)
    const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET || 'secret_key_nhom_6',
        { expiresIn: '1d' } // Token có tác dụng trong 1 ngày
    );

    return { token, user: { id: user.user_id, username: user.username } };
};

module.exports = { signup, login };