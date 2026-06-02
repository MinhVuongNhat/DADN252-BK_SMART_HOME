import React, { useState, useEffect, useRef } from 'react'; // Khai báo thêm useRef ở đây
import './Login.css'
import { Link, useNavigate } from 'react-router-dom'; 
import axios from "axios";

import mailicon from '../../assets/icon-mail.svg'
import lockicon from '../../assets/lock.svg'
import info from '../../assets/info.svg'
import arrowright from '../../assets/arrow-right Copy.svg'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔥 1. Tạo mảng các useRef để quản lý tiêu điểm của 2 ô input
  const inputRefs = [
    useRef(null), // Ô 0: Email
    useRef(null)  // Ô 1: Mật khẩu
  ];

  // 🔥 2. Hàm xử lý bắt phím mũi tên Lên/Xuống
  const handleKeyDown = (index, e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault(); // Ngăn cuộn trang mặc định
      const nextIndex = (index + 1) % inputRefs.length; // Xuống ô tiếp theo (ô 0 xuống 1, ô 1 vòng lên 0)
      inputRefs[nextIndex].current?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + inputRefs.length) % inputRefs.length; // Lên ô phía trước
      inputRefs[prevIndex].current?.focus();
    }
  };

  const handleLogin = async (e) => { 
    e.preventDefault(); // Nhận e từ form onSubmit

    // Validate nhanh không để trống dữ liệu trước khi gửi
    if (!email.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

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

  useEffect(() => {
    document.title = "Đăng nhập | BK SmartHome";
  }, []);

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
        {/* 🔥 3. Chuyển div thành thẻ FORM để bắt sự kiện phím ENTER tự động */}
        <form className="form-box-right" onSubmit={handleLogin}>
          <div className="project-name">
            <h1>BK SMARTHOME CHÀO MỪNG QUAY LẠI.</h1>
            <p>ĐĂNG NHẬP ĐỂ TIẾP TỤC.</p>
          </div>

          {/* 🔥 4. Đính ref và onKeyDown tương ứng cho mỗi ô input */}
          <div className="inputs">
            <div className="input">
              <img src={mailicon} alt="mail" className="mailicon" />
              <input 
                ref={inputRefs[0]}
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(0, e)}
              />
            </div>
            <div className="input">
              <img src={lockicon} alt="lock" className="lockicon" />
              <input 
                ref={inputRefs[1]}
                type="password" 
                placeholder="Mật khẩu" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                onKeyDown={(e) => handleKeyDown(1, e)}
              />
            </div>
          </div>

          {/* 🔥 5. Thay đổi button thành type="submit" */}
          <button type="submit" className="btn-login">
            Tiến đến tài khoản của tôi
            <img src={arrowright} alt="arrowright" className="arrowright" />
          </button>

          <div className="redirect-signup">
            Chưa là thành viên ? <Link to="/signup">THAM GIA NGAY</Link>
          </div>
          <div className="forget-pass">
              <Link to="/forgot-password">Quên mật khẩu ? </Link>
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
        </form> {/* Đóng form */}
      </div> {/* Đóng login-body */}
    </div> 
  );
};

export default Login;