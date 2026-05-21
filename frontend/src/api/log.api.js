import axios from "./axios.js";

export const getLogs = (page = 1, limit = 10, search = "") => {
  return axios.get("/logs", { // CHỈ ĐỂ "/logs", không có "/api"
    params: { page, limit, search }
  });
};