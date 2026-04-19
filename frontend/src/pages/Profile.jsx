import React, { useState, useEffect } from "react";
import userApi from "../api/user.api";
import PasswordModal from "../components/PasswordModal";
import Sidebar from "../layout/Sidebar";

export default function Profile() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false); // State xem ảnh to
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    username: "",
    home_name: "",
    email: "",
    phone: "",
    avatar_url: ""
  });

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile();
        setFormData({
          username: res.data.username || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          home_name: res.data.home_name || "Chưa có nhà",
          avatar_url: res.data.avatar_url || ""
        });
      } catch (err) {
        console.error("Lỗi lấy thông tin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await userApi.updateProfile(formData);
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Không thể lưu thông tin!");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("avatar", file);
    try {
      const res = await userApi.updateAvatar(data);
      setFormData({ ...formData, avatar_url: res.data.avatar_url });
      alert("Đã cập nhật ảnh đại diện!");
    } catch (err) {
      alert("Lỗi khi upload ảnh!");
    }
  };

  // Link ảnh đầy đủ từ backend
  const avatarFullUrl = formData.avatar_url 
    ? `http://localhost:5000${formData.avatar_url}` 
    : "https://via.placeholder.com/150";

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600 text-lg">Đang tải dữ liệu...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR BÊN TRÁI */}
      <Sidebar />

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Thông tin cá nhân</h1>

        <div className="bg-white p-10 rounded-xl shadow-sm max-w-5xl mx-auto border border-gray-200">
          
          {/* PHẦN AVATAR */}
          <div className="flex items-center gap-8 mb-10 pb-10 border-b border-gray-100">
            <div 
              onClick={() => setShowAvatarPreview(true)}
              className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md cursor-pointer hover:opacity-80 transition-all"
              title="Click để phóng to ảnh"
            >
              <img
                src={avatarFullUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            
            <input type="file" id="avatarInput" hidden onChange={handleAvatarChange} accept="image/*" />
            <button 
              onClick={() => document.getElementById("avatarInput").click()}
              className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Thay đổi ảnh
            </button>
          </div>

          {/* GRID THÔNG TIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-10">
            <Input 
              label="Tên người dùng" 
              name="username"
              value={formData.username} 
              readOnly={!isEditing} 
              onChange={handleChange}
            />
            <Input 
              label="Tên nhà" 
              name="home_name"
              value={formData.home_name} 
              readOnly={!isEditing} 
              onChange={handleChange}
            />
            <Input 
              label="Email" 
              name="email"
              value={formData.email} 
              readOnly={!isEditing} 
              onChange={handleChange}
            />
            <Input 
              label="Số điện thoại" 
              name="phone"
              value={formData.phone} 
              readOnly={!isEditing} 
              onChange={handleChange}
            />
          </div>

          {/* NHÓM NÚT BẤM (Gần giống layout Figma) */}
          <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
            <div className="flex justify-end gap-4">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="bg-blue-600 text-white px-10 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-all">
                    Lưu thay đổi
                  </button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-8 py-2 rounded-lg hover:bg-gray-300 transition-all">
                    Hủy
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-blue-600 text-white px-10 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-all"
                >
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-fit bg-slate-400 text-white px-8 py-2 rounded-lg hover:bg-slate-500 transition-colors shadow"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XEM ẢNH PHÓNG TO */}
      {showAvatarPreview && (
        <div 
          className="fixed inset-0 bg-black/85 z-[999] flex items-center justify-center p-6 transition-all"
          onClick={() => setShowAvatarPreview(false)}
        >
          <div className="relative animate-in zoom-in duration-300">
            <button 
              className="absolute -top-12 -right-2 text-white text-4xl hover:text-gray-300"
              onClick={() => setShowAvatarPreview(false)}
            >
              &times;
            </button>
            <img 
              src={avatarFullUrl} 
              alt="Avatar Full" 
              className="rounded-lg shadow-2xl max-w-full max-h-[85vh] border-4 border-white object-contain"
            />
          </div>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU */}
      {showPasswordModal && (
        <PasswordModal close={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

// Component Input tái sử dụng
function Input({ label, name, value, readOnly, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`p-3 rounded-lg border-2 outline-none transition-all duration-300 ${
          readOnly 
          ? "bg-gray-50 text-gray-500 border-gray-100" 
          : "bg-white border-blue-400 ring-4 ring-blue-50"
        }`}
      />
    </div>
  );
}