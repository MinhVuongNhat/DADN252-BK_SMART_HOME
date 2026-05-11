const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: "Vui lòng đăng nhập!" });

        // Dùng chung SECRET_KEY và giải mã đúng Object Thắng đã ký (sign)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_nhom_6');
        
        // Gán thông tin vào req.user để dùng cho Sensor API
        // decoded lúc này sẽ có dạng: { user_id: ..., role: ..., iat: ..., exp: ... }
        req.user = decoded; 
        
        next();
    } catch (error) {
        res.status(403).json({ message: "Phiên làm việc hết hạn!" });
    }
};