import { useEffect, useState } from "react";
import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function DeviceSettingModal({ device, onClose, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (device) setForm({ ...device });
  }, [device]);

  if (!form) return null;

  const img = form.type === "light" ? lightImg : fanImg;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[700px] p-6 grid grid-cols-5 gap-6">
        
        {/* Bên trái: Ảnh và Thông tin cơ bản */}
        <div className="col-span-2 flex flex-col items-center border-r pr-6">
          <img src={img} className="w-32 h-32 object-contain mb-4" />
          <input 
            className="text-lg font-bold text-center border-b focus:border-blue-500 outline-none w-full"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
          <p className="text-gray-400 text-sm mt-2 uppercase">{form.type}</p>
        </div>

        {/* Bên phải: Cấu hình chi tiết */}
        <div className="col-span-3 space-y-4">
          <h2 className="text-xl font-bold">Cài đặt thiết bị</h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setForm({...form, power_status: "on"})}
              className={`flex-1 py-2 rounded border ${form.power_status === "on" ? "bg-green-100 border-green-500 text-green-700" : ""}`}
            >
              BẬT
            </button>
            <button 
              onClick={() => setForm({...form, power_status: "off"})}
              className={`flex-1 py-2 rounded border ${form.power_status === "off" ? "bg-red-100 border-red-500 text-red-700" : ""}`}
            >
              TẮT
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Chế độ hoạt động</label>
            <select 
              value={form.control_mode}
              onChange={(e) => setForm({...form, control_mode: e.target.value})}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="manual">Thủ công</option>
              <option value="automation">Tự động (Theo cảm biến)</option>
              <option value="schedule">Theo lịch trình</option>
            </select>
          </div>

          {form.control_mode === "schedule" && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2 border">
               <p className="text-xs font-bold text-gray-500">THIẾT LẬP GIỜ</p>
               <div className="flex gap-2">
                  <input type="time" className="flex-1 border p-1 rounded" />
                  <input type="time" className="flex-1 border p-1 rounded" />
               </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 text-gray-500">Đóng</button>
            <button 
              onClick={() => { onSave(form); onClose(); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}