import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get("token"); 
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [message, setMessage] = useState("");
    const [statusType, setStatusType] = useState(""); 
    const [isLoading, setIsLoading] = useState(false); 

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không trùng khớp!");
            setStatusType("error");
            return;
        }

        setIsLoading(true);
        setMessage("");
        setStatusType("");

        try {
            // Sửa lại endpoint /api/users cho chuẩn cấu trúc route hệ thống
            const res = await axios.post("http://localhost:5000/api/user/reset-password", {
                token: token,
                newPassword: newPassword
            });
            
            setMessage("Chúc mừng bạn! Đã đổi mật khẩu thành công.");
            setStatusType("success");
            setTimeout(() => navigate("/login"), 2000); 
        } catch (err) {
            setMessage(err.response?.data?.message || "Lỗi rồi, token hết hạn hoặc không đúng!");
            setStatusType("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Thiết lập mật khẩu mới</h2>
                
                {token && (
                    <div style={styles.tokenBadge}>
                        🔒 Hệ thống đã xác thực liên kết bảo mật: {token.substring(0, 8)}...
                    </div>
                )}

                <form onSubmit={handleReset} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mật khẩu mới</label>
                        <input 
                            type="password" 
                            placeholder="Nhập mật khẩu mới" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                            disabled={isLoading}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Xác nhận mật khẩu mới</label>
                        <input 
                            type="password" 
                            placeholder="Nhập lại mật khẩu mới" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                            disabled={isLoading}
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                    </button>
                </form>

                {message && (
                    <div style={{...styles.alert, ...(statusType === "success" ? styles.success : styles.error)}}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

// Hệ thống stylesheet nội bộ giúp form đứng giữa màn hình, tăm tắp, mướt mắt
const styles = {
    container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: "Segoe UI, sans-serif", width: "100vw", position: "absolute", top: 0, left: 0 },
    card: { backgroundColor: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", width: "100%", maxWidth: "400px", textAlign: "center", boxSizing: "border-box" },
    title: { margin: "0 0 20px 0", color: "#333", fontSize: "22px", fontWeight: "600" },
    tokenBadge: { backgroundColor: "#e3f2fd", color: "#0d47a1", padding: "10px", borderRadius: "6px", fontSize: "12px", marginBottom: "20px", textAlign: "left", lineHeight: "1.4" },
    form: { display: "flex", flexDirection: "column", gap: "15px" },
    inputGroup: { textAlign: "left" },
    label: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#444" },
    input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px", boxSizing: "border-box", outline: "none" },
    button: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#28a745", color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginTop: "10px" },
    alert: { marginTop: "15px", padding: "12px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", textAlign: "center" },
    success: { backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
    error: { backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" }
};

export default ResetPassword;