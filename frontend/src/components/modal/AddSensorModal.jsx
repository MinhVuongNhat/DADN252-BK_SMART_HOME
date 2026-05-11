import { useState } from "react";
import tempImg from "../../assets/cam-bien-nhiet-do-do-am-dht20.png";
import lightImg from "../../assets/cam-bien-anh-sang.png";

export default function AddSensorModal({ onClose, onSave, currentCount }) {
  const defaultName = `Sensor ${(currentCount + 1).toString().padStart(2, '0')}`;
  
  const [form, setForm] = useState({
    sensor_id: `SNSR_${Date.now()}`,
    name: defaultName,
    type: "dht20",
    status: "active",
    unit: "°C", // Mặc định cho DHT20
    value: "--"
  });

  const handleTypeChange = (type) => {
    setForm({
      ...form,
      type: type,
      unit: type === "dht20" ? "°C/%" : "Lux"
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[450px] p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-green-700">Thêm cảm biến mới</h2>

        <div className="space-y-5">
          {/* Tên cảm biến */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tên cảm biến</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full border p-2 rounded mt-1 outline-green-500"
            />
          </div>

          {/* Loại cảm biến */}
          <div>
            <label className="text-sm font-medium text-gray-700">Loại cảm biến</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div 
                onClick={() => handleTypeChange("dht20")}
                className={`cursor-pointer border p-3 rounded-lg text-center transition ${form.type === "dht20" ? "bg-green-50 border-green-500" : "hover:bg-gray-50"}`}
              >
                <p className="font-semibold">DHT20</p>
                <p className="text-xs text-gray-500">Nhiệt độ & Độ ẩm</p>
              </div>
              <div 
                onClick={() => handleTypeChange("light")}
                className={`cursor-pointer border p-3 rounded-lg text-center transition ${form.type === "light" ? "bg-green-50 border-green-500" : "hover:bg-gray-50"}`}
              >
                <p className="font-semibold">Ánh sáng</p>
                <p className="text-xs text-gray-500">Cảm biến quang</p>
              </div>
            </div>
          </div>

          {/* ID (Chỉ đọc) */}
          <div>
            <label className="text-sm font-medium text-gray-400">Sensor ID (Auto)</label>
            <input type="text" value={form.sensor_id} disabled className="w-full bg-gray-50 border p-2 rounded mt-1 text-gray-400 text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-gray-500">Hủy</button>
          <button 
            onClick={() => { onSave(form); onClose(); }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Xác nhận thêm
          </button>
        </div>
      </div>
    </div>
  );
}