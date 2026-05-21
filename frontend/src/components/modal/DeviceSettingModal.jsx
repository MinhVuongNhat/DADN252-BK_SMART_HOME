import { useEffect, useState } from "react";
import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function DeviceSettingModal({ device, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo form khi mở Modal hoặc khi device thay đổi
  useEffect(() => {
    if (device) {
      setForm({
        ...device,
        // Ưu tiên lấy giờ từ database, nếu không có mới dùng mặc định
        start_time: device.start_time || "08:00",
        end_time: device.end_time || "17:00",
        control_mode: device.control_mode || "manual"
      });
    }
  }, [device]);

  if (!form) return null;

  const img = form.type === "light" ? lightImg : fanImg;

  // Xử lý lưu dữ liệu
  const handleSave = () => {
    // Kiểm tra nhanh dữ liệu trước khi gửi
    if (form.control_mode === 'schedule' && (!form.start_time || !form.end_time)) {
      alert("Vui lòng chọn đầy đủ khung giờ!");
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="grid grid-cols-1 md:grid-cols-5">
          
          {/* Bên trái: Thumbnail & Tên (Hiển thị preview) */}
          <div className="md:col-span-2 bg-gray-50 p-8 flex flex-col items-center justify-center border-r border-gray-100">
            <div className="relative group">
              <img 
                src={img} 
                className={`w-32 h-32 object-contain mb-6 transition-all duration-500 
                  ${form.power_status === 'on' ? 'drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'grayscale opacity-50'}`} 
              />
            </div>
            <input 
              className="text-xl font-bold text-center bg-white border-2 border-transparent focus:border-blue-500 rounded-lg px-2 py-1 outline-none w-full shadow-sm"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Tên thiết bị..."
            />
            <p className="mt-2 text-xs text-gray-400 uppercase tracking-widest">{form.type}</p>
          </div>

          {/* Bên phải: Cấu hình chi tiết */}
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
                className="w-full border-gray-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer bg-white"
              >
                <option value="manual">Thủ công (Manual)</option>
                <option value="automation">Tự động (Automation)</option>
                <option value="schedule">Lịch trình (Schedule)</option>
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* Vùng thay đổi nội dung theo chế độ */}
            <div className="min-h-[120px] flex flex-col justify-center">
              
              {/* CHẾ ĐỘ THỦ CÔNG */}
              {form.control_mode === "manual" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-gray-700">Điều khiển trực tiếp</label>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setForm({...form, power_status: "on"})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.power_status === "on" ? "bg-green-500 text-white shadow-lg shadow-green-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                    >
                      BẬT
                    </button>
                    <button 
                      type="button"
                      onClick={() => setForm({...form, power_status: "off"})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.power_status === "off" ? "bg-red-500 text-white shadow-lg shadow-red-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                    >
                      TẮT
                    </button>
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ TỰ ĐỘNG */}
              {form.control_mode === "automation" && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100 animate-in fade-in">
                  <div className="flex items-center">
                    <i className="fa-solid fa-circle-info mr-2"></i>
                    <span className="font-medium">Hệ thống thông minh</span>
                  </div>
                  <p className="mt-1 opacity-80">Thiết bị sẽ tự động hoạt động dựa trên ngưỡng cảm biến đã cài đặt trong phần "Luật tự động".</p>
                </div>
              )}

              {/* CHẾ ĐỘ LỊCH TRÌNH */}
              {form.control_mode === "schedule" && (
                <div className="p-4 bg-orange-50 rounded-xl space-y-4 border border-orange-100 animate-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Cài đặt khung giờ hoạt động</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1 font-bold">GIỜ MỞ</span>
                      <input 
                        type="time" 
                        value={form.start_time}
                        onChange={(e) => setForm({...form, start_time: e.target.value})}
                        className="w-full border-2 border-orange-200 p-2 rounded-lg outline-none focus:border-orange-500 transition-colors" 
                      />
                    </div>
                    <div className="text-orange-300 mt-4 font-bold">→</div>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1 font-bold">GIỜ TẮT</span>
                      <input 
                        type="time" 
                        value={form.end_time}
                        onChange={(e) => setForm({...form, end_time: e.target.value})}
                        className="w-full border-2 border-orange-200 p-2 rounded-lg outline-none focus:border-orange-500 transition-colors" 
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-orange-400 italic">* Lịch trình sẽ được lặp lại hàng ngày.</p>
                </div>
              )}
            </div>

            {/* Nút bấm điều hướng */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button 
                type="button"
                onClick={onClose} 
                className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
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