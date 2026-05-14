import { useState } from "react";

export default function RuleModal({ rule, sensors, devices, onClose, onSave }) {
  
  // KHỞI TẠO STATE TRỰC TIẾP (Bỏ luôn useEffect)
  const [form, setForm] = useState(() => {
    // 1. Nếu có rule (Chế độ Edit) -> Lấy data cũ
    if (rule) {
      const cond = rule.AutomationConditions?.[0] || {};
      const act = rule.AutomationActions?.[0] || {};
      return {
        rule_id: rule.rule_id,
        name: rule.name,
        is_active: rule.is_active,
        condition: {
          sensor_id: cond.sensor_id || "",
          operator: cond.operator || ">",
          target_value: cond.target_value || "",
        },
        action: {
          device_id: act.device_id || "",
          action_type: act.action_type || "turn_on",
        },
      };
    } 
    // 2. Nếu không có rule (Chế độ Thêm mới) -> Lấy cảm biến/thiết bị mặc định
    else {
      return {
        name: "",
        is_active: true,
        condition: { 
          sensor_id: sensors?.length > 0 ? sensors[0].sensor_id : "", 
          operator: ">", 
          target_value: 30 
        },
        action: { 
          device_id: devices?.length > 0 ? devices[0].device_id : "", 
          action_type: "turn_on" 
        },
      };
    }
  });

  const handleSave = () => {
    if (!form.name || !form.condition.sensor_id || !form.action.device_id || !form.condition.target_value) {
      alert("Vui lòng điền đầy đủ thông tin luật (bao gồm cả Giá trị)!");
      return;
    }
    onSave(form); 
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[600px] p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-blue-700">
          {rule ? "Chỉnh sửa luật" : "Tạo luật tự động mới"}
        </h2>

        <div className="space-y-6">
          {/* Tên luật */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên luật</label>
            <input
              type="text"
              className="w-full border p-2 rounded focus:ring-2 ring-blue-200 outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Tự động bật quạt khi nóng"
            />
          </div>

          {/* PHẦN NẾU (CONDITION) */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <p className="font-bold text-orange-700 mb-3 text-sm">NẾU (ĐIỀU KIỆN)</p>
            <div className="flex gap-2">
              <select
                className="flex-1 border p-2 rounded bg-white"
                value={form.condition.sensor_id}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, sensor_id: e.target.value } })}
              >
                <option value="">Chọn cảm biến</option>
                {sensors.map((s) => (
                  <option key={s.sensor_id} value={s.sensor_id}>{s.name}</option>
                ))}
              </select>

              <select
                className="w-20 border p-2 rounded bg-white"
                value={form.condition.operator}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, operator: e.target.value } })}
              >
                <option value=">">{">"}</option>
                <option value="<">{"<"}</option>
                <option value="=">{"="}</option>
              </select>

              <input
                type="number"
                className="w-24 border p-2 rounded"
                value={form.condition.target_value}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, target_value: e.target.value } })}
                placeholder="Giá trị"
              />
            </div>
          </div>

          {/* PHẦN THÌ (ACTION) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="font-bold text-blue-700 mb-3 text-sm">THÌ (HÀNH ĐỘNG)</p>
            <div className="flex gap-2">
              <select
                className="flex-1 border p-2 rounded bg-white"
                value={form.action.device_id}
                onChange={(e) => setForm({ ...form, action: { ...form.action, device_id: e.target.value } })}
              >
                <option value="">Chọn thiết bị</option>
                {devices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>{d.name}</option>
                ))}
              </select>

              <select
                className="flex-1 border p-2 rounded bg-white"
                value={form.action.action_type}
                onChange={(e) => setForm({ ...form, action: { ...form.action, action_type: e.target.value } })}
              >
                <option value="turn_on">Bật thiết bị</option>
                <option value="turn_off">Tắt thiết bị</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg font-medium shadow-md"
          >
            {rule ? "Cập nhật luật" : "Tạo luật"}
          </button>
        </div>
      </div>
    </div>
  );
}