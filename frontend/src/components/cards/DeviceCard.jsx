import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function DeviceCard({ device, onSetting, onDelete }) {
  const img = device.type === "light" ? lightImg : fanImg;
  const isOn = device.power_status === "on";

  // Map tên chế độ hiển thị
  const modeLabels = {
    manual: "Thủ công",
    automation: "Tự động",
    schedule: "Lịch trình",
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{device.name}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{device.type}</p>
        </div>
        {/* Badge trạng thái Bật/Tắt */}
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
          isOn ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
        }`}>
          {isOn ? "● Đang bật" : "○ Đang tắt"}
        </span>
      </div>

      <div className="flex justify-center my-6">
        <img 
          src={img} 
          className={`w-20 h-20 object-contain transition-opacity ${isOn ? "opacity-100" : "opacity-40"}`} 
        />
      </div>

      <div className="flex flex-col gap-3">
        {/* Hiển thị chế độ hiện tại dưới dạng text nhẹ nhàng */}
        <div className="text-sm text-gray-500 bg-gray-50 py-2 px-3 rounded-lg flex justify-between">
          <span>Chế độ:</span>
          <span className="font-medium text-blue-600">{modeLabels[device.control_mode]}</span>
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
            <i className="fa-regular fa-trash-can"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  );
}