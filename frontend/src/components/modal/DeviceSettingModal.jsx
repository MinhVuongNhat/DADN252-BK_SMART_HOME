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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="grid grid-cols-1 md:grid-cols-5">
          
          {/* Bên trái: Thumbnail & Name */}
          <div className="md:col-span-2 bg-gray-50 p-8 flex flex-col items-center justify-center border-r border-gray-100">
            <img src={img} className={`w-32 h-32 object-contain mb-6 drop-shadow-xl ${form.power_status === 'off' && 'grayscale'}`} />
            <input 
              className="text-xl font-bold text-center bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none w-full pb-1"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Tên thiết bị..."
            />
          </div>

          {/* Bên phải: Cấu hình */}
          <div className="md:col-span-3 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cấu hình</h2>
              <p className="text-gray-500 text-sm">Thiết lập cách thức hoạt động của thiết bị</p>
            </div>

            {/* Chọn Chế độ */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Chế độ hoạt động</label>
              <select 
                value={form.control_mode}
                onChange={(e) => setForm({...form, control_mode: e.target.value})}
                className="w-full border-gray-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="manual">Thủ công (Manual)</option>
                <option value="automation">Tự động (Automation)</option>
                <option value="schedule">Hẹn giờ (Schedule)</option>
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* LOGIC HIỂN THỊ CHI TIẾT THEO CHẾ ĐỘ */}
            <div className="min-h-[100px] flex flex-col justify-center">
              {form.control_mode === "manual" && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-gray-700">Điều khiển nhanh</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setForm({...form, power_status: "on"})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.power_status === "on" ? "bg-green-500 text-white shadow-lg shadow-green-200" : "bg-gray-100 text-gray-400"}`}
                    >
                      BẬT
                    </button>
                    <button 
                      onClick={() => setForm({...form, power_status: "off"})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.power_status === "off" ? "bg-red-500 text-white shadow-lg shadow-red-200" : "bg-gray-100 text-gray-400"}`}
                    >
                      TẮT
                    </button>
                  </div>
                </div>
              )}

              {form.control_mode === "automation" && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100 animate-in fade-in">
                  <i className="fa-solid fa-circle-info mr-2"></i>
                  Thiết bị sẽ tự động hoạt động dựa trên ngưỡng cảm biến đã cài đặt.
                </div>
              )}

              {form.control_mode === "schedule" && (
                <div className="p-4 bg-orange-50 rounded-xl space-y-3 border border-orange-100 animate-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-orange-600 uppercase">Khung giờ hoạt động</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1">BẮT ĐẦU</span>
                      <input 
                        type="time" 
                        value={form.start_time || "00:00"}
                        onChange={(e) => setForm({...form, start_time: e.target.value})}
                        className="w-full border p-2 rounded-lg outline-none focus:border-orange-400" 
                      />
                    </div>
                    <div className="text-gray-300 mt-4">→</div>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1">KẾT THÚC</span>
                      <input 
                        type="time" 
                        value={form.end_time || "00:00"}
                        onChange={(e) => setForm({...form, end_time: e.target.value})}
                        className="w-full border p-2 rounded-lg outline-none focus:border-orange-400" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <button 
                onClick={onClose} 
                className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => { onSave(form); onClose(); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}