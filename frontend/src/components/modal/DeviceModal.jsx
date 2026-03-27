import { useEffect, useState } from "react";
import lightImg from "../../assets/led.png";
import fanImg from "../../assets/fan.png";

export default function DeviceModal({ device, onClose, onSave }) {
  const isEdit = !!device;

  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "light",
    power_status: "off",
    control_mode: "manual",
    startTime: "18:30",
    endTime: "21:30",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (device) {
      setForm({
        ...device,
        startTime: "18:30",
        endTime: "21:30",
        startDate: "",
        endDate: "",
      });
    }
  }, [device]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  const img = form.type === "light" ? lightImg : fanImg;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[800px] p-6">

        {/* TITLE */}
        <h2 className="text-xl font-bold mb-4">Cài đặt</h2>

        <div className="grid grid-cols-2 gap-6">

          {/* LEFT ICON */}
          <div className="flex justify-center items-center">
            <img src={img} className="w-40 h-40 object-contain" />
          </div>

          {/* RIGHT CONTENT */}
          <div>

            {/* NAME */}
            <h3 className="text-lg font-semibold">
              {isEdit ? form.name : "Thiết bị mới"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {form.type === "light" ? "Đèn LED" : "Quạt"}
            </p>

            {/* ===== ADD MODE ===== */}
            {!isEdit && (
              <>
                <Input label="ID" value={form.id} onChange={(v) => handleChange("id", v)} />
                <Input label="Tên thiết bị" value={form.name} onChange={(v) => handleChange("name", v)} />

                <Select
                  label="Loại thiết bị"
                  value={form.type}
                  onChange={(v) => handleChange("type", v)}
                  options={[
                    { value: "light", label: "Đèn" },
                    { value: "fan", label: "Quạt" },
                  ]}
                />
              </>
            )}

            {/* STATUS */}
            <BoxSelect
              label="Trạng thái"
              value={form.power_status}
              options={[
                { value: "on", label: "Bật" },
                { value: "off", label: "Tắt" },
              ]}
              onChange={(v) => handleChange("power_status", v)}
            />

            {/* MODE */}
            <BoxSelect
              label="Chế độ"
              value={form.control_mode}
              options={[
                { value: "manual", label: "Thủ công" },
                { value: "automation", label: "Tự động" },
                { value: "schedule", label: "Lịch trình" },
              ]}
              onChange={(v) => handleChange("control_mode", v)}
            />

            {/* ===== SCHEDULE (ONLY EDIT) ===== */}
            {isEdit && form.control_mode === "schedule" && (
              <div className="border p-3 rounded mt-3">
                <p className="font-medium mb-2">Thiết lập lịch</p>

                <div className="flex gap-2 mb-2">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => handleChange("startTime", e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => handleChange("endTime", e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

function Input({ label, value, onChange }) {
  return (
    <div className="mb-2">
      <p className="text-sm">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="mb-2">
      <p className="text-sm">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function BoxSelect({ label, value, options, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-2">
      {options.map((o) => (
        <div
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`border p-3 rounded cursor-pointer ${
            value === o.value ? "bg-blue-100 border-blue-500" : ""
          }`}
        >
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-medium">{o.label}</p>
        </div>
      ))}
    </div>
  );
}