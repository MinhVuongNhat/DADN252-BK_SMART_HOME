// import axios from "axios";

// const instance = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// instance.interceptors.request.use(
//   (config) => {
//     // Sửa "token" thành "accessToken" cho khớp với controller/localStorage
//     const token = localStorage.getItem("accessToken"); 
    
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default instance;

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Bộ đánh chặn REQUEST (Code cũ của Thắng - Giữ nguyên)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. 🔥 BỔ SUNG: Bộ đánh chặn RESPONSE (Xử lý Force Logout)
instance.interceptors.response.use(
  (response) => {
    // Nếu API trả về dữ liệu thành công (status 2xx), cứ cho qua bình thường
    return response;
  },
  (error) => {
    // Nếu Backend từ chối request và trả về lỗi phản hồi
    if (error.response) {
      const status = error.response.status;

      // Nếu dính mã 401 (Chưa đăng nhập/Token sai do đổi pass) hoặc 403 (Token hết hạn)
      if (status === 401 || status === 403) {
        console.warn("⚠️ [FORCE LOGOUT] Phát hiện phiên làm việc không hợp lệ hoặc mật khẩu đã bị đổi!");
        
        // Xóa sạch token cũ trong localStorage để user không dùng lại được nữa
        localStorage.removeItem("accessToken");
        
        // Ép trình duyệt reload dứt điểm và đẩy bay người dùng về trang Login
        window.location.href = "/login"; 
      }
    }
    
    // Trả lỗi về cho component nếu muốn xử lý riêng biệt
    return Promise.reject(error);
  }
);

export default instance;