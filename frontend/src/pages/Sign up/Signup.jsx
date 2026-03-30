import React from "react";
import './Signup.css'
import { Link } from 'react-router-dom';
import { useState } from "react"; // Nhớ thêm useState ở đầu nhé

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
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [homeName, setHomeName] = useState("");
  const handleSignup = (e) => {
    e.preventDefault(); // Chặn trang web load lại khi bấm nút

    // LOGIC 1: Ép 2 mật khẩu phải giống nhau
    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return; // Dừng lại luôn, không chạy code bên dưới
    }

    // LOGIC 2: Lưu nháp vào LocalStorage (giả lập Database)
    const newUser = {
        fullname: fullname,
        email: email,
        password: password,
        phone: phone,
        homeName: homeName
    };

    // Lưu vào trình duyệt dưới tên 'storedUser'
    localStorage.setItem('storedUser', JSON.stringify(newUser));

    alert("Đăng ký thành công! Dữ liệu đã được lưu vào 'bộ nhớ tạm' trình duyệt.");
    // Sau này Thắng có thể dùng useNavigate để tự chuyển sang trang Login
};
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
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)} />
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