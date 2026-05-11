import React, { useState } from 'react'; // Phải có { useState } ở đây
import './Login.css'
import { Link, useNavigate } from 'react-router-dom'; // Phải có useNavigate ở đây
import axios from "axios";

import mailicon from '../../assets/icon-mail.svg'
import lockicon from '../../assets/lock.svg'
import info from '../../assets/info.svg'
import arrowright from '../../assets/arrow-right Copy.svg'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => { // Thêm async ở đây
    e.preventDefault();

    try {
      // 1. Gửi email và password lên Backend để kiểm tra
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: email,
        password: password
      });

      // 2. Nếu Backend trả về 200 (OK)
      if (response.status === 200) {
        // Lưu lại cái "Vé thông hành" (accessToken) để dùng cho các trang sau
        localStorage.setItem("accessToken", response.data.accessToken);
        // Lưu thông tin user để hiển thị tên trên Dashboard
        localStorage.setItem("user", JSON.stringify(response.data.user));

        alert("Đăng nhập thành công! Chào mừng quay trở lại.");
        navigate('/dashboard'); 
      }
    } catch (error) {
      // Hiện lỗi nếu sai pass hoặc email không tồn tại
      alert("Lỗi đăng nhập: " + (error.response?.data?.message || "Sai tài khoản hoặc mật khẩu"));
    }
  };
  return (
    <div className="login-container">
      <div className="login-body">
        {/* CỘT TRÁI */}
        <div className="info-box-left">
          <div className="login-header">
            <h1><strong>BK SMARTHOME</strong></h1>
          </div>
          <h2 className="slogan">
            <strong>Organize Today, Innovate Tomorrow</strong>
          </h2>
        </div>

        {/* CỘT PHẢI */}
        <div className="form-box-right">
          <div className="project-name">
            <h1>BK SMARTHOME CHÀO MỪNG QUAY LẠI.</h1>
            <p>ĐĂNG NHẬP ĐỂ TIẾP TỤC.</p>
          </div>

          <div className="inputs">
            <div className="input">
              <img src={mailicon} alt="mail" className="mailicon" />
              <input type="email" placeholder="Email" value={email} 
                      onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="input">
              <img src={lockicon} alt="lock" className="lockicon" />
              <input type="password" placeholder="Mật khẩu" value={password} 
                      onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button className="btn-login" onClick={handleLogin}>
            Tiến đến tài khoản của tôi
            <img src={arrowright} alt="arrowright" className="arrowright" />
          </button>

          <div className="redirect-signup">
            Chưa là thành viên ? <Link to="/signup">THAM GIA NGAY</Link>
          </div>
          <div className="forget pass">
              <p>Quên mật khẩu ?.</p>
          </div>

          <div className="form-footer">
            <div className="copyright">
              <p>Copyright 2026 BK SmartHome Inc. All rights Reserved.</p>
            </div>
            <div className="help">
              <img src={info} alt="info" className="info" />
              <p>Cần giúp đỡ?</p>
            </div>
          </div>
        </div> {/* Đóng form-box-right */}
      </div> {/* Đóng login-body */}
    </div> 
  );
};

export default Login;

