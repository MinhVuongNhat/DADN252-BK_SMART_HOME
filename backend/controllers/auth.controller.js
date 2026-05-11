const authService = require('../services/auth.service');

const signup = async (req, res) => {
    try {
        // req.body chính là đống userData từ Frontend gửi sang
        const user = await authService.signup(req.body);
        
        // Trả về đúng format như bạn Thắng viết trong README
        res.status(201).json({
            message: "Đăng ký thành công!",
            user: { id: user.user_id, username: user.username }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        
        res.status(200).json({
            accessToken: result.token,
            user: result.user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { signup, login };