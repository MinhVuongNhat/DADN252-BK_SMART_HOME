import axios from "./axios";

export const getDevices = () => axios.get("/devices");
export const createDevice = (data) => axios.post("/devices", data);
export const updateDevice = (id, data) => axios.put(`/devices/${id}`, data);
export const deleteDevice = (id) => axios.delete(`/devices/${id}`);
export const toggleDevice = (id, data) =>
  axios.post(`/devices/${id}/toggle`, data);