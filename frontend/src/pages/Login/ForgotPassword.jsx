import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Thêm Link để người dùng có đường lui về trang Login
import './ForgotPassword.css'
import { useEffect } from 'react';


const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [statusType, setStatusType] = useState(""); // Thêm cái này để phân biệt màu xanh/đỏ
    const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái đợi gửi mail

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        setStatusType("");

        try {
            const res = await axios.post("http://localhost:5000/api/user/forgot-password", { email });
            setMessage(res.data?.message || "Đã gửi link khôi phục vào Email của bạn!");
            setStatusType("success"); // Đánh dấu thành công để hiện màu xanh
        } catch (err) {
            setMessage(err.response?.data?.message || "Lỗi rồi, vui lòng kiểm tra lại!");
            setStatusType("error"); // Đánh dấu lỗi để hiện màu đỏ
        } finally {
            setIsLoading(false); // Tắt trạng thái đợi
        }
    };
    
    useEffect(() => {
    document.title = "Quên mật khẩu | BK SmartHome";
     }, []);
    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <h2>Quên mật khẩu</h2>
                <p className="forgot-subtitle">Nhập email hệ thống SmartHome để nhận liên kết khôi phục.</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Nhập email tài khoản" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        disabled={isLoading} // Đang gửi thì khóa ô input lại
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
                    </button>
                </form>

                {/* In thông báo kèm theo class tương ứng để Thắng dễ style màu sắc */}
                {message && (
                    <p className={`status-msg ${statusType === "success" ? "msg-success" : "msg-error"}`}>
                        {message}
                    </p>
                )}

                <div className="forgot-footer">
                    <Link to="/login" className="back-to-login">← Quay lại đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;