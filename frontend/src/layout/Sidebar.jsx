import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openUser, setOpenUser] = useState(false);

  const menu = [
    { label: "Trang chủ", path: "/dashboard" },
    { label: "Quản lý thiết bị", path: "/devices" },
    { label: "Lịch sử", path: "/logs" },
    { label: "Thông tin cá nhân", path: "/profile" },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="font-bold text-lg">BK SMARTHOME</h1>
      </div>

      {/* User */}
      <div className="relative mb-4">
        <div
          onClick={() => setOpenUser(!openUser)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <span>Admin</span>
        </div>

        {openUser && (
          <div className="absolute top-10 left-0 bg-white shadow-md rounded p-2 w-32">
            <div
              className="cursor-pointer hover:bg-gray-100 p-1"
              onClick={() => navigate("/profile")}
            >
              Profile
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1">
              Logout
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <input
        placeholder="Tìm kiếm..."
        className="w-full p-2 border rounded mb-6"
      />

      {/* Menu */}
      <div className="flex flex-col gap-2 text-gray-700">
        {menu.map((item) => (
          <MenuItem
            key={item.path}
            label={item.label}
            onClick={() => navigate(item.path)}
            active={location.pathname === item.path}
          />
        ))}
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`p-2 rounded cursor-pointer transition ${
        active
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "hover:bg-gray-100"
      }`}
    >
      {label}
    </div>
  );
}