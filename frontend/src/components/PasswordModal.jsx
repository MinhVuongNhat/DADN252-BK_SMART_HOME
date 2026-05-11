import React, { useState } from "react";
import userApi from "../api/user.api";

function PasswordModal({ close }) {
  const [passData, setPassData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // 1. Validate nhanh tại client
    if (!passData.old_password || !passData.new_password) {
      return alert("Vui lòng nhập đầy đủ mật khẩu!");
    }
    if (passData.new_password !== passData.confirm_password) {
      return alert("Mật khẩu nhập lại không khớp!");
    }
    if (passData.new_password.length < 6) {
      return alert("Mật khẩu mới phải từ 6 ký tự trở lên!");
    }

    setLoading(true);
    try {
      // 2. Gọi API từ file user.api.js
      const res = await userApi.changePassword({
        old_password: passData.old_password,
        new_password: passData.new_password,
      });

      alert(res.data.message || "Đổi mật khẩu thành công!");
      close(); // Đóng modal sau khi thành công
    } catch (err) {
      // 3. Xử lý lỗi từ backend (ví dụ: mật khẩu cũ sai)
      const errorMsg = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-96 rounded-2xl shadow-2xl p-6 transition-all scale-100">
        {/* Header Modal */}
        <div className="bg-blue-500 text-white text-center font-semibold py-3 rounded-t-xl -mx-6 -mt-6 mb-6">
          Đổi mật khẩu
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="password"
            name="old_password"
            placeholder="Mật khẩu cũ"
            className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="new_password"
            placeholder="Mật khẩu mới"
            className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Nhập lại mật khẩu mới"
            className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={close}
            disabled={loading}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${
              loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-8 py-2 rounded-full transition-colors shadow-md`}
          >
            {loading ? "Đang xử lý..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PasswordModal;