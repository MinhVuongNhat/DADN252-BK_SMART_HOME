import React, { useState, useEffect } from "react";
import userApi from "../api/user.api";
import PasswordModal from "../components/PasswordModal";
import Sidebar from "../layout/Sidebar";

export default function Profile() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState({}); // Lưu dữ liệu gốc để dùng khi bấm "Hủy"

  const [formData, setFormData] = useState({
    username: "",
    home_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  // 1. Fetch dữ liệu từ API
  const fetchProfile = async () => {
    try {
      const res = await userApi.getProfile();
      const data = res.data || res;
      const profileData = {
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        home_name: data.home_name || "Chưa có nhà",
        avatar_url: data.avatar_url || "",
      };
      setFormData(profileData);
      setInitialData(profileData); // Lưu lại bản gốc
    } catch (err) {
      console.error("Lỗi lấy thông tin:", err);
      if (err.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Hàm Validate dữ liệu
  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;

    if (!formData.username.trim())
      tempErrors.username = "Tên không được để trống";
    if (!formData.home_name.trim())
      tempErrors.home_name = "Tên nhà không được để trống";

    if (!formData.email.trim()) {
      tempErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Email không đúng định dạng";
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      tempErrors.phone = "SĐT phải gồm 10 số (03, 05, 07, 08, 09)";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      // Chỉ gửi các trường backend cần cập nhật
      const { username, email, phone, home_name } = formData;
      await userApi.updateProfile({ username, email, phone, home_name });

      setIsEditing(false);
      setInitialData(formData); // Cập nhật bản gốc sau khi lưu thành công
      alert("Cập nhật thông tin thành công!");

      // Đồng bộ thông tin user vào localStorage để Sidebar cập nhật tên ngay
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...currentUser, username, email, phone }),
      );
    } catch (err) {
      console.error("Lỗi lưu thông tin:", err);
      const msg = err.response?.data?.message || "Không thể lưu thông tin!";
      alert(msg);
    }
  };

  // Hàm xử lý khi bấm nút Hủy
  const handleCancel = () => {
    setFormData(initialData); // Reset về dữ liệu ban đầu
    setErrors({});
    setIsEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("avatar", file);

    try {
      const res = await userApi.updateAvatar(data);
      const resData = res.data || res;
      setFormData((prev) => ({ ...prev, avatar_url: resData.avatar_url }));

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...currentUser, avatar_url: resData.avatar_url }),
      );

      alert("Đã cập nhật ảnh đại diện!");
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      alert("Lỗi khi upload ảnh!");
    }
  };

  const avatarFullUrl = formData.avatar_url
    ? `http://localhost:5000${formData.avatar_url}`
    : "https://via.placeholder.com/150";

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center font-bold text-blue-600 text-lg">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-800 tracking-tight">
          Thông tin cá nhân
        </h1>

        <div className="bg-white p-10 rounded-2xl shadow-sm max-w-5xl mx-auto border border-gray-200">
          {/* PHẦN AVATAR */}
          <div className="flex items-center gap-8 mb-10 pb-10 border-b border-gray-100">
            <div
              onClick={() => setShowAvatarPreview(true)}
              className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md cursor-pointer hover:opacity-90 transition-all"
              title="Click để phóng to ảnh"
            >
              <img
                src={avatarFullUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <input
              type="file"
              id="avatarInput"
              hidden
              onChange={handleAvatarChange}
              accept="image/*"
            />
            <button
              onClick={() => document.getElementById("avatarInput").click()}
              className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Thay đổi ảnh
            </button>
          </div>

          {/* GRID THÔNG TIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10">
            <Input
              label="Tên người dùng"
              name="username"
              value={formData.username}
              readOnly={!isEditing}
              onChange={handleChange}
              error={errors.username}
            />
            <Input
              label="Tên nhà"
              name="home_name"
              value={formData.home_name}
              readOnly={!isEditing}
              onChange={handleChange}
              error={errors.home_name}
            />
            <Input
              label="Email"
              name="email"
              value={formData.email}
              readOnly={!isEditing}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              readOnly={!isEditing}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>

          {/* NHÓM NÚT BẤM */}
          <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
            <div className="flex justify-end gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-10 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 px-8 py-2.5 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-10 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all"
                >
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-fit bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 border border-blue-100"
            >
              <span className="text-base"></span> Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XEM ẢNH */}
      {showAvatarPreview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-6"
          onClick={() => setShowAvatarPreview(false)}
        >
          <div className="relative scale-in-center">
            <button
              className="absolute -top-12 -right-2 text-white text-4xl hover:scale-110 transition-transform"
              onClick={() => setShowAvatarPreview(false)}
            >
              &times;
            </button>
            <img
              src={avatarFullUrl}
              alt="Avatar Full"
              className="rounded-2xl shadow-2xl max-w-full max-h-[85vh] border-4 border-white"
            />
          </div>
        </div>
      )}

      {showPasswordModal && (
        <PasswordModal close={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function Input({ label, name, value, readOnly, onChange, error }) {
  return (
    <div className="flex flex-col">
      <label className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        autoComplete="off"
        className={`p-3.5 rounded-xl border-2 outline-none transition-all duration-300 ${
          readOnly
            ? "bg-gray-50 text-gray-500 border-gray-100"
            : error
              ? "border-red-500 ring-4 ring-red-50"
              : "bg-white border-blue-400 ring-4 ring-blue-50"
        }`}
      />
      {error && !readOnly && (
        <span className="text-red-500 text-[10px] mt-1.5 font-bold italic ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
