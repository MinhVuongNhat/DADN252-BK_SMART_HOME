import axios from './axios';

export const getDevices = () => axios.get('/devices');
export const toggleDevice = (id) => axios.post(`/devices/${id}/toggle`);
export const updateDevice = (id, deviceData) => axios.put(`/devices/${id}`, deviceData);
export const updateDevicePower = (id, power_status) => axios.patch(`/devices/${id}/power`, { power_status });
export const updateDeviceMode = (id, control_mode) => axios.patch(`/devices/${id}/mode`, { control_mode });
export const createDevice = (deviceData) => axios.post('/devices', deviceData);
export const deleteDevice = (id) => axios.delete(`/devices/${id}`);