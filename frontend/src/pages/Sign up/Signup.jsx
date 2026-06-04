import React from "react";
import './Signup.css'
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from "react"; 
import axios from "axios";

import homeicon from '../../assets/home-icon.svg'
import mailicon from '../../assets/icon-mail.svg'
import usericon from '../../assets/icon-user.svg'
import lockicon from '../../assets/lock.svg'
import lock1icon from '../../assets/lock1.svg'
import phoneicon from '../../assets/phone.svg'

import info from '../../assets/info.svg'
import arrowright from '../../assets/arrow-right Copy.svg'

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [homeName, setHomeName] = useState("");

  // 🔥 1. Tạo mảng các useRef để quản lý danh sách ô input phục vụ di chuyển phím
  const inputRefs = [
    useRef(null), // Ô 0: Họ và tên
    useRef(null), // Ô 1: Mail
    useRef(null), // Ô 2: Mật khẩu
    useRef(null), // Ô 3: Xác nhận mật khẩu
    useRef(null), // Ô 4: Số điện thoại
    useRef(null)  // Ô 5: My Smarthome
  ];

  // 🔥 2. Hàm xử lý di chuyển tiêu điểm khi nhấn mũi tên Lên/Xuống
  const handleKeyDown = (index, e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault(); // Ngăn hành vi cuộn trang mặc định của trình duyệt
      const nextIndex = (index + 1) % inputRefs.length; // Đi tới ô tiếp theo, hết mảng thì vòng lại ô đầu
      inputRefs[nextIndex].current?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + inputRefs.length) % inputRefs.length; // Đi lùi lại ô trước
      inputRefs[prevIndex].current?.focus();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // Hàm này giờ nhận e từ form onSubmit

    // 1. Validate Email định dạng chuẩn (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Email không đúng định dạng! Vui lòng kiểm tra lại.");
        return;
    }

    // 2. Validate số điện thoại 10 số
    const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
        alert("Số điện thoại không hợp lệ! SĐT phải gồm đúng 10 chữ số và bắt đầu bằng các đầu số (03, 05, 07, 08, 09).");
        return;
    }

    // 3. Validate độ dài mật khẩu (Ít nhất 6 ký tự)
    if (password.length < 6) {
        alert("Mật khẩu phải có độ dài từ 6 ký tự trở lên!");
        return;
    }

    // 4. Validate khớp mật khẩu
    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    // 5. Kiểm tra không được để trống
    if (!username.trim() || !phone.toString().trim() || !email.trim() || !password.trim() || !homeName.trim()) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    const userData = {
        username: username,
        email: email,
        password: password,
        phone: phone,
        homeName: homeName
    };

    try {
        const response = await axios.post("http://localhost:5000/api/auth/signup", userData);
        if (response.status === 201) {
            alert("Đăng ký thành công! Chào mừng thành viên mới.");
            navigate('/login');
        }
    } catch (error) {
        alert("Lỗi đăng ký: " + (error.response?.data?.message || "Server bận rồi"));
    }
  };

  useEffect(() => {
    document.title = "Đăng Ký | BK SmartHome";
  }, []);

  return (
    <div className="signup-container">
      <div className="signup-body">
        {/* CỘT TRÁI */}
        <div className="info-box-left">
          <div className="signup-header">
            <h1><strong>BK SMARTHOME</strong></h1>
          </div>
          <h2 className="slogan">
            <strong>Organize Today, Innovate Tomorrow</strong>
          </h2>
        </div>

        {/* CỘT PHẢI */}
        {/* 🔥 3. Biến div bao ngoài thành thẻ FORM để bắt sự kiện ENTER tự động */}
        <form className="form-box-right" onSubmit={handleSignup}>
          <div className="project-name">
            <h1>TRỞ THÀNH THÀNH VIÊN BK SMARTHOME.</h1>
            <p>ĐĂNG KÝ VÀ THAM GIA NGAY VỚI CHÚNG TÔI.</p>
          </div>

          {/* 🔥 4. Gắn ref và onKeyDown vào từng ô input tương ứng theo index */}
          <div className="inputs">
            <div className="input">
              <img src={usericon} alt="user" className="usericon" />
              <input 
                ref={inputRefs[0]}
                type="text" 
                placeholder="Họ và tên"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => handleKeyDown(0, e)}
              />
            </div>
            <div className="input">
              <img src={mailicon} alt="mail" className="mailicon" />
              <input 
                ref={inputRefs[1]}
                type="email" 
                placeholder="Mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(1, e)}
              />
            </div>
            <div className="input">
              <img src={lockicon} alt="lock" className="lockicon" />
              <input 
                ref={inputRefs[2]}
                type="password" 
                placeholder="Mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(2, e)}
              />
            </div>
            <div className="input">
              <img src={lock1icon} alt="lock1" className="lock1icon" />
              <input 
                ref={inputRefs[3]}
                type="password" 
                placeholder="Xác nhận lại mật khẩu" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(3, e)}
              />
            </div>
            <div className="input">
              <img src={phoneicon} alt="phone" className="phoneicon" />
              {/* Lưu ý: Đổi type="text" để tránh bị nuốt số 0 ở đầu khi lấy dữ liệu */}
              <input 
                ref={inputRefs[4]}
                type="text" 
                placeholder="Số điện thoại" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => handleKeyDown(4, e)}
              />
            </div>
            <div className="input">
              <img src={homeicon} alt="home" className="homeicon" />
              <input 
                ref={inputRefs[5]}
                type="text" 
                placeholder="My Smarthome" 
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(5, e)}
              />
            </div>
          </div>

          {/* 🔥 5. Chuyển button thành type="submit" để form hiểu lệnh kích hoạt */}
          <button type="submit" className="btn-signup">   
            Trở thành thành viên
            <img src={arrowright} alt="arrowright" className="arrowright" />
          </button>

          <div className="redirect-login">
            Đã có sẵn tài khoản ? <Link to="/login">ĐĂNG NHẬP NGAY</Link>
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
      </div> {/* Đóng signup-body */}
    </div> 
  );
};

export default Signup;