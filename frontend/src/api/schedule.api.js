import axios from './axios';

// Lấy danh sách lịch trình của 1 thiết bị
export const getSchedulesByDevice = (deviceId) => 
    axios.get(`/schedules/devices/${deviceId}/schedules`);

// Tạo mới
export const createSchedule = (data) => 
    axios.post('/schedules', data);

// Cập nhật
export const updateSchedule = (id, data) => 
    axios.put(`/schedules/${id}`, data);

// Xóa
export const deleteSchedule = (id) => 
    axios.delete(`/schedules/${id}`);

// Bật/Tắt lịch trình
export const toggleScheduleActive = (id, isActive) => 
    axios.patch(`/schedules/${id}/active`, { is_active: isActive });