import axiosClient from "./axios.js"; // Giả sử axios.js là file cấu hình axios của bạn

const userApi = {
  getProfile: () => {
    return axiosClient.get("/user/profile");
  },
  updateProfile: (data) => {
    return axiosClient.put("/user/profile", data);
  },
  updateAvatar: (formData) => {
    return axiosClient.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (data) => {
    return axiosClient.put("/user/change-password", data);
  },
};

export default userApi;