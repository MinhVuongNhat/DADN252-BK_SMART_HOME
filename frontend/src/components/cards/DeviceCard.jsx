import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";
import { toggleDevice, updateDeviceMode } from "../../api/device.api";
import { useState } from "react";

<<<<<<< Updated upstream
export default function DeviceCard({ device, onSetting, onDelete, onToggle }) {
  const img = device.type === "light" ? lightImg : fanImg;
  const isOn = device.power_status === "on";
  const isAuto = device.control_mode === "automation";
=======
export default function DeviceCard({ device, onSetting, onDelete, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const img = device.type === "light" ? lightImg : fanImg;
  const isOn = device.power_status === "on";

  const modeLabels = {
    manual: "Thủ công",
    automation: "Tự động",
    schedule: "Lịch trình",
  };
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
    <div className={`bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all ${loading ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{device.name}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{device.type}</p>
        </div>
        
        {/* Nút Toggle Switch thay cho Badge tĩnh */}
        <button 
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      <div className="flex justify-center my-6">
        <img 
          src={img} 
          className={`w-20 h-20 object-contain transition-all duration-500 ${isOn ? "opacity-100 scale-110 drop-shadow-2xl" : "opacity-40"}`} 
        />
>>>>>>> Stashed changes
      </div>
    </div>
  );
}

<<<<<<< Updated upstream
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
=======
      <div className="flex flex-col gap-3">
        {/* Dropdown thay đổi chế độ */}
        <div className="text-sm text-gray-500 bg-gray-50 py-2 px-3 rounded-lg flex justify-between items-center">
          <span>Chế độ:</span>
          <select 
            value={device.control_mode} 
            onChange={handleModeChange}
            className="bg-transparent font-medium text-blue-600 outline-none cursor-pointer"
          >
            {Object.entries(modeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSetting(device)}
            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg py-2 transition-colors"
          >
            Cài đặt
          </button>
          <button
            onClick={() => onDelete(device.device_id)}
            className="px-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
          >
            Xóa
          </button>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}