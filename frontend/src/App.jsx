import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Logs from "./pages/Logs";
import { useState } from 'react'
import Signup from './Pages/Sign up/Signup.jsx'
import Login from './Pages/Login/Login.jsx'; // Tạm đóng lại nếu chưa có file Login.jsx
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Placeholder pages */}
        <Route path="/devices" element={<Devices />} />
        <Route path="/logs" element={<div>Logs Page</div>} />
        <Route path="/profile" element={<div>Profile Page</div>} />
        <Route path="/signup" element={<Signup />} /> {/* Định nghĩa các tuyến đường */}
        <Route path="/login" element={<Login />} />
        
        {/* Mặc định khi vào web sẽ hiện trang Signup */}
        <Route path="/" element={<Signup />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App