import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Logs from "./pages/Logs";
import { useState } from 'react'
import Signup from './pages/Sign up/Signup.jsx'
import Profile from './pages/Profile.jsx';
import Login from './pages/Login/Login.jsx'; // Tạm đóng lại nếu chưa có file Login.jsx
import ForgotPassword from './pages/Login/ForgotPassword.jsx'; // Đảm bảo đúng đường dẫn file
import ResetPassword from './pages/Login/ResetPassword.jsx'; // Đảm bảo đúng đường dẫn file
import './App.css'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Placeholder pages */}
        <Route path="/devices" element={<Devices />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/profile" element={<Profile />}/>
        <Route path="/signup" element={<Signup />} /> {/* Định nghĩa các tuyến đường */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Mặc định khi vào web sẽ hiện trang Signup */}
        <Route path="/" element={<Signup />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App