import React from "react";
import './Signup.css'
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react"; // Nhớ thêm useState ở đầu nhé
import axios from "axios";
import { useEffect } from 'react';

import homeicon from '../../assets/home-icon.svg'
import mailicon from '../../assets/icon-mail.svg'
import usericon from '../../assets/icon-user.svg'
import lockicon from '../../assets/lock.svg'
import lock1icon from '../../assets/lock1.svg'
import phoneicon from '../../assets/phone.svg'

import info from '../../assets/info.svg'
import arrowright from '../../assets/arrow-right Copy.svg'
const Signup = () => {
  // 1. Tạo các state để lưu thông tin
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [homeName, setHomeName] = useState("");
  const handleSignup = async (e) => {
    e.preventDefault();

    // 1. Validate Email định dạng chuẩn (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Email không đúng định dạng! Vui lòng kiểm tra lại.");
        return;
    }

    // 🔥 2. CHÈN ĐOẠN VALIDATE SỐ ĐIỆN THOẠI 10 SỐ VÀO ĐÂY:
    // Regex này bắt buộc phải bắt đầu bằng số 0, theo sau là các đầu số 3,5,7,8,9 và đủ 10 số
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

    // 5. Kiểm tra các trường bắt buộc không được để trống (Thắng có thể bỏ check phone ở đây vì Regex trên đã thầu luôn rồi)
    if (!username.trim() || !phone.trim() || !email.trim() || !password.trim() || !homeName.trim()) {
        alert("Vui lòng điền đầy đủ");
        return;
    }

    // Gom đúng đống data này gửi đi
    const userData = {
        username: username,
        email: email,
        password: password,
        phone: phone,
        homeName: homeName
        // Tạm thời chưa gửi homeName vì Model chưa có cột này
    };

    try {
        // Gửi sang API mà Thắng vừa mở cổng ở Backend
        const response = await axios.post("http://localhost:5000/api/auth/signup", userData);
        
        if (response.status === 201) {
            alert("Đăng ký thành công! Chào mừng thành viên mới.");
            // Thắng có thể dùng useNavigate để chuyển sang trang /login
            navigate('/login');
        }
    } catch (error) {
        // Đây chính là lúc error.message phát huy tác dụng nè!
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
        <div className="form-box-right">
          <div className="project-name">
            <h1>TRỞ THÀNH THÀNH VIÊN BK SMARTHOME.</h1>
            <p>ĐĂNG KÝ VÀ THAM GIA NGAY VỚI CHÚNG TÔI.</p>
          </div>

          <div className="inputs">
            <div className="input">
              <img src={usericon} alt="user" className="usericon" />
              <input 
                    type="text" 
                    placeholder="Họ và tên"
                    // Mỗi khi tao gõ, mày hãy cập nhật vào State cho tao
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="input">
              <img src={mailicon} alt="mail" className="mailicon" />
              <input type="email" placeholder="Mail" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input">
              <img src={lockicon} alt="lock" className="lockicon" />
              <input type="password" placeholder="Mật khẩu" value={password}
                    onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="input">
              <img src={lock1icon} alt="lock1" className="lock1icon" />
              <input type="password" placeholder="Xác nhận lại mật khẩu" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}/>
            </div>
            <div className="input">
              <img src={phoneicon} alt="lock1" className="phoneicon" />
              <input type="number" placeholder="Số điện thoại" value={phone}
                    onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="input">
              <img src={homeicon} alt="home" className="homeicon" />
              <input type="text" placeholder="My Smarthome" value={homeName}
                    onChange={(e) => setHomeName(e.target.value)} />
            </div>
          </div>
           {/*thêm tác vụ hàm vô nút bấm*/}
          <button className="btn-signup" onClick={handleSignup}>   
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
        </div> {/* Đóng form-box-right */}
      </div> {/* Đóng signup-body */}
    </div> 

  );
};

export default Signup;