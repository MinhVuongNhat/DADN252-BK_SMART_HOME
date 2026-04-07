import { useEffect, useState } from "react";

export default function RuleModal({ rule, sensors, devices, onClose, onSave }) {
  const [form, setForm] = useState({
    rule_id: `RULE_${Date.now()}`,
    name: "",
    is_active: true,
    conditions: [{ sensor_id: "", operator: ">", target_value: 30 }],
    actions: [{ device_id: "", action_type: "turn_on" }],
  });

  useEffect(() => {
    if (rule) setForm({ ...rule });
  }, [rule]);

  const handleSave = () => {
    if (!form.name || !form.conditions[0].sensor_id || !form.actions[0].device_id) {
      alert("Vui lòng điền đầy đủ thông tin luật!");
      return;
    }
    onSave(form);
    onClose();
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
                value={form.conditions[0].sensor_id}
                onChange={(e) => {
                  const newConds = [...form.conditions];
                  newConds[0].sensor_id = e.target.value;
                  setForm({ ...form, conditions: newConds });
                }}
              >
                <option value="">Chọn cảm biến</option>
                {sensors.map((s) => (
                  <option key={s.sensor_id} value={s.sensor_id}>{s.name}</option>
                ))}
              </select>

              <select
                className="w-20 border p-2 rounded bg-white"
                value={form.conditions[0].operator}
                onChange={(e) => {
                  const newConds = [...form.conditions];
                  newConds[0].operator = e.target.value;
                  setForm({ ...form, conditions: newConds });
                }}
              >
                <option value=">">{">"}</option>
                <option value="<">{"<"}</option>
                <option value="=">{"="}</option>
              </select>

              <input
                type="number"
                className="w-24 border p-2 rounded"
                value={form.conditions[0].target_value}
                onChange={(e) => {
                  const newConds = [...form.conditions];
                  newConds[0].target_value = e.target.value;
                  setForm({ ...form, conditions: newConds });
                }}
              />
            </div>
          </div>

          {/* PHẦN THÌ (ACTION) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="font-bold text-blue-700 mb-3 text-sm">THÌ (HÀNH ĐỘNG)</p>
            <div className="flex gap-2">
              <select
                className="flex-1 border p-2 rounded bg-white"
                value={form.actions[0].device_id}
                onChange={(e) => {
                  const newActions = [...form.actions];
                  newActions[0].device_id = e.target.value;
                  setForm({ ...form, actions: newActions });
                }}
              >
                <option value="">Chọn thiết bị</option>
                {devices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>{d.name}</option>
                ))}
              </select>

              <select
                className="flex-1 border p-2 rounded bg-white"
                value={form.actions[0].action_type}
                onChange={(e) => {
                  const newActions = [...form.actions];
                  newActions[0].action_type = e.target.value;
                  setForm({ ...form, actions: newActions });
                }}
              >
                <option value="turn_on">Bật thiết bị</option>
                <option value="turn_off">Tắt thiết bị</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-gray-500">Hủy</button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            {rule ? "Cập nhật luật" : "Tạo luật"}
          </button>
        </div>
      </div>
    </div>
  );
}