import ledImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function DeviceControl({ device, onSetting }) {
  const img = device.type === "led" ? ledImg : fanImg;

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="font-semibold mb-3">{device.name}</h3>

      <div className="flex justify-center text-6xl mb-4">
        <img src={img} className="w-16 h-16 object-contain" />
      </div>

      {/* Power */}
      <div className="flex items-center justify-between mb-2">
        <span>Bật/Tắt</span>
        <input type="checkbox" defaultChecked={device.power} />
      </div>

      {/* Auto */}
      <div className="flex items-center justify-between mb-4">
        <span>Tự động</span>
        <input type="checkbox" defaultChecked={device.auto} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onSetting}
          className="flex-1 bg-gray-200 rounded px-2 py-1"
        >
          Cài đặt
        </button>
        <button className="flex-1 bg-red-500 text-white rounded px-2 py-1">
          Xóa
        </button>
      </div>
    </div>
  );
}