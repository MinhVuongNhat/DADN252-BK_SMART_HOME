import { useState } from "react";
import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function AddDeviceModal({ onClose, onSave, currentCount }) {
  // Tạo tên mặc định dạng Thiết bị 01, 02...
  const defaultName = `Thiết bị ${(currentCount + 1).toString().padStart(2, '0')}`;
  
  const [form, setForm] = useState({
    device_id: `DEV_${Date.now()}`, // Tạo ID duy nhất
    name: defaultName,
    type: "light",
    power_status: "off",
    control_mode: "manual",
  });

  const img = form.type === "light" ? lightImg : fanImg;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[500px] p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Thêm thiết bị mới</h2>
        
        <div className="flex flex-col items-center mb-6">
          <img src={img} className="w-24 h-24 object-contain mb-2" alt="device-preview" />
          <p className="text-sm text-gray-500 italic">Xem trước biểu tượng</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên thiết bị</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full border p-2 rounded mt-1 outline-blue-500"
              placeholder="Nhập tên thiết bị..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Loại thiết bị</label>
            <select
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="light">Đèn (LED)</option>
              <option value="fan">Quạt</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            Hủy
          </button>
          <button 
            onClick={() => { onSave(form); onClose(); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Thêm thiết bị
          </button>
        </div>
      </div>
    </div>
  );
}