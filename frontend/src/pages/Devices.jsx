import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import axios from "../api/axios";
import DeviceCard from "../components/cards/DeviceCard";
import SensorCard from "../components/cards/SensorCard";
import AddDeviceModal from "../components/modal/AddDeviceModal";
import DeviceSettingModal from "../components/modal/DeviceSettingModal";
import AddSensorModal from "../components/modal/AddSensorModal";
import RuleModal from "../components/modal/RuleModal";

export default function Devices() {
  const [tab, setTab] = useState("device");
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [rules, setRules] = useState([]);

  // Quản lý các Modal riêng biệt
  const [openAddDevice, setOpenAddDevice] = useState(false);
  const [openDeviceSetting, setOpenDeviceSetting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [openAddSensor, setOpenAddSensor] = useState(false);
  const [openRuleModal, setOpenRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  // 1. GỌI API ĐỘC LẬP (ĐÃ SỬA LỖI PROMISE.ALL)
  const fetchData = async () => {
    try {
      const devicesRes = await axios.get("/devices");
      if (devicesRes.status === 200) {
        // Dựa vào log: (2) [Array(11), 11], ta lấy phần tử index 0
        const rawData = devicesRes.data.data || devicesRes.data; 
        
        // Kiểm tra nếu là mảng lồng mảng thì lấy cái bên trong
        const actualDevices = Array.isArray(rawData[0]) ? rawData[0] : rawData;
        
        console.log("✅ Danh sách thiết bị thực tế:", actualDevices);
        setDevices(actualDevices);
      }
    } catch (error) {
      console.error("Lỗi khi tải Thiết bị:", error);
    }

    // B. Lấy danh sách Sensor từ Options
    try {
      const optionsRes = await axios.get("/automation/options");
      if (optionsRes.status === 200) {
        setSensors(optionsRes.data.sensors || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải Sensor Options:", error);
    }

    // C. Lấy danh sách Luật
    try {
      const rulesRes = await axios.get("/automation");
      if (rulesRes.status === 200) {
        setRules(Array.isArray(rulesRes.data) ? rulesRes.data : (rulesRes.data.data || []));
      }
    } catch (error) {
      console.error("Lỗi khi tải Luật tự động:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== HANDLERS THIẾT BỊ =====

  const handleToggle = async (id, type) => {
    try {
      await axios.post(`/devices/${id}/toggle`, { type });
      await fetchData(); // Cập nhật lại UI sau khi bật/tắt
    } catch (error) {
      console.error("Lỗi toggle thiết bị:", error);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      try {
        await axios.delete(`/devices/${id}`);
        await fetchData(); 
      } catch (error) {
        console.error("Lỗi xóa thiết bị:", error);
        alert("Xóa thiết bị thất bại!");
      }
    }
  };

  const handleOpenSetting = (device) => {
    setSelectedDevice(device);
    setOpenDeviceSetting(true);
  };

  const handleSaveSetting = async (updatedDevice) => {
    try {
      await axios.put(`/devices/${updatedDevice.device_id}`, updatedDevice);
      await fetchData();
      setOpenDeviceSetting(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error("Lỗi cập nhật thiết bị:", error);
      alert("Cập nhật thất bại!");
    }
  };

  const handleAddDevice = async (newDevice) => {
    try {
      await axios.post("/devices", newDevice);
      // Gọi lại API sau khi thêm thành công để đảm bảo lấy list mới nhất
      await fetchData();
      setOpenAddDevice(false);
    } catch (error) {
      console.error("Lỗi thêm thiết bị:", error);
      alert("Không thể thêm thiết bị! Vui lòng xem log backend.");
    }
  };

  // ===== HANDLERS SENSOR =====
  const handleSensorDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cảm biến này?")) {
      setSensors((prev) => prev.filter((s) => (s.sensor_id || s.id) !== id));
    }
  };

  const handleSensorToggle = (id) => {
    setSensors((prev) =>
      prev.map((s) =>
        s.sensor_id === id
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s,
      ),
    );
  };

  const handleAddSensor = (newSensor) => {
    setSensors((prev) => [...prev, newSensor]);
  };

  // ===== HANDLERS LUẬT TỰ ĐỘNG =====
  const handleDeleteRule = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa luật này?")) {
      try {
        await axios.delete(`/automation/${id}`); 
        await fetchData(); 
      } catch (error) {
        console.error("Lỗi xóa luật", error);
      }
    }
  };

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setOpenRuleModal(true);
  };

  const handleAddRule = () => {
    setSelectedRule(null);
    setOpenRuleModal(true);
  };

  const handleSaveRule = async (formData) => {
    try {
      if (selectedRule) {
        await axios.put(`/automation/${selectedRule.rule_id}`, formData);
      } else {
        await axios.post("/automation", formData);
      }
      await fetchData();
      setOpenRuleModal(false);
      setSelectedRule(null);
    } catch (error) {
      console.error("Lỗi khi lưu luật:", error);
      alert("Không thể lưu luật! Bạn kiểm tra lại xem Backend có đang chạy không.");
    }
  };

  // ===== COUNT BẢO VỆ CHỐNG LỖI =====
  const safeDevices = Array.isArray(devices) ? devices : [];
  const safeSensors = Array.isArray(sensors) ? sensors : [];

  const totalDevices = safeDevices.length;
  const totalFans = safeDevices.filter((d) => d.type === "fan").length;
  const totalLights = safeDevices.filter((d) => d.type === "light").length;

  const totalSensors = safeSensors.length;
  const totalTemp = safeSensors.filter((s) => s.type === "temperature").length;
  const totalLightSensor = safeSensors.filter((s) => s.type === "light").length;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý thiết bị</h1>
        </div>

        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <div className="flex gap-6 mb-6">
            <Tab active={tab === "device"} onClick={() => setTab("device")}>Thiết bị</Tab>
            <Tab active={tab === "sensor"} onClick={() => setTab("sensor")}>Cảm biến</Tab>
            <Tab active={tab === "automation"} onClick={() => setTab("automation")}>Luật tự động</Tab>
          </div>

          {tab === "device" && (
            <button onClick={() => setOpenAddDevice(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + Thêm thiết bị
            </button>
          )}

          {tab === "sensor" && (
            <button onClick={() => setOpenAddSensor(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + Thêm cảm biến
            </button>
          )}

          {tab === "automation" && (
            <button onClick={handleAddRule} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + Thêm luật mới
            </button>
          )}
        </div>

        {/* ===== DEVICE ===== */}
        {tab === "device" && (
          <>
            <StatRow
              data={[
                { title: "Tổng thiết bị", value: totalDevices },
                { title: "Tổng số quạt", value: totalFans },
                { title: "Tổng số đèn", value: totalLights },
              ]}
            />
            <Grid>
              {safeDevices.map((d, index) => (
                <DeviceCard
                  // Sử dụng device_id làm key, nếu không có thì dùng index để tránh lỗi React
                  key={d.device_id || `device-${index}`} 
                  device={d}
                  onToggle={handleToggle}
                  onDelete={handleDeleteDevice} // Lúc này d.device_id sẽ không còn undefined
                  onSetting={handleOpenSetting}
                />
              ))}
            </Grid>
          </>
        )}

        {openAddDevice && (
          <AddDeviceModal
            onClose={() => setOpenAddDevice(false)}
            onSave={handleAddDevice}
            currentCount={safeDevices.length}
          />
        )}

        {openDeviceSetting && (
          <DeviceSettingModal
            device={selectedDevice}
            onClose={() => setOpenDeviceSetting(false)}
            onSave={handleSaveSetting}
          />
        )}

        {/* ===== SENSOR ===== */}
        {tab === "sensor" && (
          <>
            <StatRow
              data={[
                { title: "Tổng cảm biến", value: totalSensors },
                { title: "DHT20", value: totalTemp },
                { title: "Ánh sáng", value: totalLightSensor },
              ]}
            />
            <Grid>
              {safeSensors.map((s) => (
                <SensorCard
                  key={s.sensor_id}
                  sensor={s}
                  onToggle={handleSensorToggle}
                  onDelete={handleSensorDelete}
                />
              ))}
            </Grid>
          </>
        )}

        {openAddSensor && (
          <AddSensorModal
            onClose={() => setOpenAddSensor(false)}
            onSave={handleAddSensor}
            currentCount={safeSensors.length}
          />
        )}

        {/* ===== AUTOMATION ===== */}
        {tab === "automation" && (
          <AutomationList
            rules={rules}
            sensors={safeSensors}
            devices={safeDevices}
            onDelete={handleDeleteRule}
            onEdit={handleEditRule}
          />
        )}
      </div>

      {openRuleModal && (
        <RuleModal
          rule={selectedRule}
          sensors={safeSensors}
          devices={safeDevices}
          onClose={() => {
            setOpenRuleModal(false);
            setSelectedRule(null);
          }}
          onSave={handleSaveRule}
        />
      )}
    </div>
  );
}

// ... CÁC COMPONENT CON (Tab, StatRow, Grid, AutomationList) GIỮ NGUYÊN BÊN DƯỚI ...
function Tab({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`pb-2 ${active ? "border-b-2 border-blue-500 text-blue-600 font-semibold" : ""}`}>
      {children}
    </button>
  );
}

function StatRow({ data }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {data.map((item, i) => (
        <div key={i} className="bg-white rounded-lg p-5 shadow-sm">
          <p className="text-gray-500">{item.title}</p>
          <h2 className="text-2xl font-bold">{item.value}</h2>
        </div>
      ))}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

function AutomationList({ rules, sensors, devices, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {rules.map((r) => (
        <div key={r.rule_id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">{r.name}</h3>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {r.is_active ? "ĐANG CHẠY" : "ĐÃ TẮT"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 block mb-1">Điều kiện (NẾU)</span>
              {r.AutomationConditions?.map((c, i) => {
                const sensor = sensors.find((s) => s.sensor_id === c.sensor_id);
                return (
                  <div key={i} className="font-medium">
                    {sensor?.name || "Sensor"} {c.operator} {c.target_value} {sensor?.unit}
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 block mb-1">Thực thi (THÌ)</span>
              {r.AutomationActions?.map((a, i) => {
                const device = devices.find((d) => d.device_id === a.device_id);
                return (
                  <div key={i} className="font-medium text-blue-600">
                    {a.action_type === "turn_on" ? "Bật" : "Tắt"} {device?.name || "Thiết bị"}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 mt-4 border-t pt-4">
            <button onClick={() => onEdit(r)} className="px-4 py-1.5 bg-gray-100 text-blue-600 rounded-lg">
              Chỉnh sửa
            </button>
            <button onClick={() => onDelete(r.rule_id)} className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg">
              Xóa luật
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}