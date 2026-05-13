import { useState } from "react"; // Không cần dùng useEffect nữa
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openUser, setOpenUser] = useState(false);
  
  // FIX: Dùng Lazy Initialization để đọc localStorage ngay lúc tạo state
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch token và user info
    navigate("/login"); // Quay về trang đăng nhập
  };

  const menu = [
    { label: "Trang chủ", path: "/dashboard" },
    { label: "Quản lý thiết bị", path: "/devices" },
    { label: "Lịch sử", path: "/logs" },
    { label: "Thông tin cá nhân", path: "/profile" },
  ];

  // Đường dẫn ảnh avatar
  const avatarUrl = user?.avatar_url 
    ? `http://localhost:5000${user.avatar_url}` 
    : null;

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
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all"
        >
          {/* Hiển thị avatar thật nếu có, không thì hiện vòng tròn xám */}
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden border">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <span className="font-medium text-gray-700">
            {user?.username || "Admin"}
          </span>
        </div>

        {openUser && (
          <div className="absolute top-12 left-0 bg-white shadow-xl border border-gray-100 rounded-lg p-2 w-40 z-50 animate-in fade-in zoom-in duration-200">
            <div
              className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 p-2 rounded transition-colors"
              onClick={() => {
                navigate("/profile");
                setOpenUser(false);
              }}
            >
              Profile
            </div>
            <div 
              className="cursor-pointer hover:bg-red-50 hover:text-red-600 p-2 rounded transition-colors border-t mt-1"
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <input
        placeholder="Tìm kiếm..."
        className="w-full p-2 border rounded mb-6 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
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