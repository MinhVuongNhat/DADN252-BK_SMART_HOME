import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import axios from "../api/axios";
import socket from "../socket/socket";
import DeviceCard from "../components/cards/DeviceCard";
import SensorCard from "../components/cards/SensorCard";
import AddDeviceModal from "../components/modal/AddDeviceModal";
import DeviceSettingModal from "../components/modal/DeviceSettingModal";
import AddSensorModal from "../components/modal/AddSensorModal";
import RuleModal from "../components/modal/RuleModal";
// import các mock để demo
import { mockDevices, mockSensors, mockRules, mockConditions, mockActions } from "../api/mock";
import { 
  getDevices, 
  createDevice, 
  updateDevice, 
  deleteDevice, 
  toggleDevice 
} from "../api/device.api";

export default function Devices() {
  const [tab, setTab] = useState("device");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sensors, setSensors] = useState([]);
  const [rules, setRules] = useState([]);

  // Quản lý các Modal riêng biệt
  const [openAddDevice, setOpenAddDevice] = useState(false);
  const [openDeviceSetting, setOpenDeviceSetting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [openAddSensor, setOpenAddSensor] = useState(false);
  const [openRuleModal, setOpenRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  // Fetch dữ liệu thiết bị thực tế cho Device
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await getDevices();
      
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setDevices(data);
    } catch (error) {
      console.error("Lỗi khi load thiết bị:", error);
      setDevices([]); // Đảm bảo luôn là mảng nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu mock cho Sensor và Rules
  useEffect(() => {
    fetchData();

    // Lắng nghe sự kiện cập nhật thiết bị để làm mới dữ liệu
    const handleUpdate = () => {
      console.log("🔄 Phát hiện thay đổi thiết bị, đang cập nhật...");
      fetchData();
    };

    socket.on("device_update", handleUpdate);
    return () => {
      socket.off("device_update", handleUpdate);
    };
  }, []);

  // ===== HANDLERS =====
  // ===== Device =====
  const handleAddDevice = async (newDeviceForm) => {
    try {
      await createDevice(newDeviceForm);
      await fetchDevices(); // Reload lại danh sách sau khi thêm
      setOpenAddDevice(false);
    } catch (error) {
      alert("Không thể thêm thiết bị. Vui lòng kiểm tra lại backend!");
    }
  };

  // 3. Xử lý Cập nhật thiết bị (Dùng cho DeviceSettingModal)
  const handleSaveSetting = async (updatedDevice) => {
    try {
      await updateDevice(updatedDevice.device_id, updatedDevice);
      await fetchDevices(); // Reload để UI đồng bộ với DB
      setOpenDeviceSetting(false);
      setSelectedDevice(null);
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  // 4. Xử lý Xóa thiết bị
  const handleDeleteDevice = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này? Dữ liệu liên quan sẽ bị mất.")) {
      try {
        await deleteDevice(id);
        await fetchDevices(); // Cập nhật lại danh sách sau khi xóa
      } catch (error) {
        alert("Xóa thiết bị thất bại!");
      }
    }
  };

  // 5. Xử lý Bật/Tắt nhanh tại Card
  const handleToggle = async (id) => {
    try {
      await toggleDevice(id);
      await fetchDevices(); // Cập nhật trạng thái mới nhất từ Server
    } catch (error) {
      console.error("Lỗi toggle:", error);
    }
  };

  const handleOpenSetting = (device) => {
    setSelectedDevice(device);
    setOpenDeviceSetting(true);
  };

  const handleRename = (id, name) => {
    setDevices(prev =>
      prev.map(d =>
        d.device_id === id ? { ...d, name } : d
      )
    );
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
  const handleSensorDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cảm biến này?")) {
      try {
        await axios.delete(`/sensors/${id}`);
        await fetchData();
      } catch (error) {
        console.error("Lỗi xóa cảm biến:", error);
      }
    }
  };

  const handleSensorToggle = async (id) => {
    try {
      // Tìm sensor hiện tại để lấy status
      const sensor = sensors.find(s => s.sensor_id === id);
      const newStatus = sensor.status === "active" ? "inactive" : "active";
      
      await axios.patch(`/sensors/${id}`, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái cảm biến:", error);
    }
  };

  const handleAddSensor = async (newSensor) => {
    try {
      await axios.post("/sensors", newSensor);
      await fetchData();
      setOpenAddSensor(false);
    } catch (error) {
      console.error("Lỗi thêm cảm biến:", error);
      alert("Không thể thêm cảm biến!");
    }
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

  // ===== COUNT =====
  const totalDevices = devices.length;
  const totalFans = devices.filter((d) => d.type === "fan").length;
  const totalLights = devices.filter((d) => d.type === "light").length;

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