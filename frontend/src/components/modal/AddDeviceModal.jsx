import { useState } from "react";
import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function AddDeviceModal({ onClose, onSave, currentCount }) {
  const defaultName = `Thiết bị ${(currentCount + 1).toString().padStart(2, '0')}`;
  
  const [form, setForm] = useState({
    // Xóa dòng tạo ID ảo, để backend lo
    name: defaultName,
    type: "light",
    location: "Phòng khách" // Thêm location vì backend có vẻ cần (hoặc chuỗi rỗng)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const img = form.type === "light" ? lightImg : fanImg;

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert("Vui lòng nhập tên thiết bị");
    
    setIsSubmitting(true);
    try {
      // Gọi callback onSave được truyền từ trang Devices.jsx
      await onSave(form); 
      onClose();
    } catch (error) {
      alert("Lỗi khi thêm thiết bị!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[450px] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Thêm thiết bị mới</h2>
        
        <div className="flex flex-col items-center mb-6 bg-gray-50 py-4 rounded-xl">
          <img src={img} className="w-20 h-20 object-contain mb-2" alt="preview" />
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
            Biểu tượng {form.type === 'light' ? 'Đèn' : 'Quạt'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Tên thiết bị</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-200 p-2.5 rounded-lg mt-1 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Ví dụ: Đèn phòng khách..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Loại thiết bị</label>
            <select
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
              className="w-full border border-gray-200 p-2.5 rounded-lg mt-1 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="light">Đèn (LED)</option>
              <option value="fan">Quạt</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Vị trí</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              className="w-full border p-2 rounded mt-1 outline-blue-500"
              placeholder="Ví dụ: Phòng khách..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={() => { 
                // Gửi form đi
                onSave(form); 
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {isSubmitting ? "Đang lưu..." : "Xác nhận thêm"}
          </button>
        </div>
      </div>
    </div>
  );
}