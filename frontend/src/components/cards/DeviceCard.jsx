import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";
import { toggleDevice, updateDeviceMode } from "../../api/device.api";
import { useState } from "react";

export default function DeviceCard({ device, onSetting, onDelete, onToggle }) {
  const img = device.type === "light" ? lightImg : fanImg;
  const isOn = device.power_status === "on";
  const isAuto = device.control_mode === "automation";

  // 1. Xử lý Bật/Tắt thiết bị
  const handleToggle = async () => {
    try {
      setLoading(true);
      await toggleDevice(device.device_id); 
      onRefresh(); // Gọi callback để trang Devices.jsx load lại dữ liệu mới
    } catch (error) {
      console.error("Lỗi khi điều khiển thiết bị:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Thay đổi chế độ
  const handleModeChange = async (e) => {
    const newMode = e.target.value;
    try {
      setLoading(true);
      await updateDeviceMode(device.device_id, newMode);
      onRefresh();
    } catch (error) {
      console.error("Lỗi khi đổi chế độ:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold mb-3">{device.name}</h3>

      <div className="flex justify-center mb-4">
        <img src={img} className="w-16 h-16 object-contain" />
      </div>

      <Toggle
        label="Bật/Tắt"
        status={device.power_status === "on"}
        onClick={() => onToggle(device.device_id, "power")}
      />

      <Toggle
        label="Tự động"
        status={device.control_mode === "automation"}
        onClick={() => onToggle(device.device_id, "auto")}
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onSetting(device)}
          className="flex-1 bg-gray-200 rounded py-1"
        >
          Cài đặt
        </button>

        <button
          onClick={() => onDelete(device.device_id)}
          className="flex-1 bg-red-500 text-white rounded py-1"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, status, onClick }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <span>{label}</span>

      <div
        onClick={onClick}
        className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition ${
          status ? "bg-blue-500 justify-end" : "bg-gray-300"
        }`}
      >
        <div className="w-5 h-5 bg-white rounded-full"></div>
      </div>
    </div>
  );
}