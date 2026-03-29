import axios from "./axios";

export const getLogs = (page = 1) =>
  axios.get(`/logs?page=${page}&limit=10`);

export const getAlerts = (page = 1) =>
  axios.get(`/alerts?page=${page}&limit=10`);

export const resolveAlert = (id) =>
  axios.patch(`/alerts/${id}/resolve`);