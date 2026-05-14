import { useEffect, useState } from "react";
import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function DeviceSettingModal({ device, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (device) setForm({ ...device });
  }, [device]);

  if (!form) return null;

  const img = form.type === "light" ? lightImg : fanImg;

  // Hàm xử lý gửi dữ liệu
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Truyền object form về cho hàm onSave ở trang Devices.jsx xử lý API
      await onSave(form);
      onClose();
    } catch (error) {
      alert("Không thể lưu cài đặt. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<<<<<<< Updated upstream
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
=======
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all ${isSubmitting ? "opacity-75 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-5">
          
          {/* Bên trái: Thumbnail & Name */}
          <div className="md:col-span-2 bg-gray-50 p-8 flex flex-col items-center justify-center border-r border-gray-100">
            <img 
                src={img} 
                className={`w-32 h-32 object-contain mb-6 transition-all duration-500 ${form.power_status === 'off' ? 'grayscale opacity-50' : 'drop-shadow-2xl'}`} 
            />
            <input 
              className="text-xl font-bold text-center bg-white border-2 border-transparent focus:border-blue-500 rounded-lg px-2 py-1 outline-none w-full"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Tên thiết bị..."
            />
          </div>

          {/* Bên phải: Cấu hình */}
          <div className="md:col-span-3 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cấu hình</h2>
              <p className="text-gray-500 text-sm">Thiết lập cách thức hoạt động</p>
>>>>>>> Stashed changes
            </div>
          )}

<<<<<<< Updated upstream
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 text-gray-500">Đóng</button>
            <button 
              onClick={() => { onSave(form); onClose(); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Lưu thay đổi
            </button>
=======
            {/* Chọn Chế độ */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Chế độ hoạt động</label>
              <select 
                value={form.control_mode}
                onChange={(e) => setForm({...form, control_mode: e.target.value})}
                className="w-full border-gray-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="manual">Thủ công (Manual)</option>
                <option value="automation">Tự động (Automation)</option>
                <option value="schedule">Hẹn giờ (Schedule)</option>
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* Logic hiển thị theo chế độ */}
            <div className="min-h-[100px]">
              {form.control_mode === "manual" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-gray-700">Điều khiển nhanh</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setForm({...form, power_status: "on"})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.power_status === "on" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}
                    >
                      BẬT
                    </button>
                    <button 
                      onClick={() => setForm({...form, power_status: "off"})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.power_status === "off" ? "bg-red-500 text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}
                    >
                      TẮT
                    </button>
                  </div>
                </div>
              )}

              {form.control_mode === "automation" && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100">
                  <p>Thiết bị sẽ tự động bật/tắt dựa trên cảm biến.</p>
                </div>
              )}

              {form.control_mode === "schedule" && (
                <div className="p-4 bg-orange-50 rounded-xl space-y-3 border border-orange-100">
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
                className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-200"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
              </button>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>
    </div>
  );
}