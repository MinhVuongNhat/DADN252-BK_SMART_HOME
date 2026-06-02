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
  //Quản lí sensors
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);

  // Fetch toàn bộ dữ liệu (Thiết bị, Cảm biến, Luật)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [devRes, senRes, ruleRes] = await Promise.allSettled([
        getDevices(),
        axios.get("/sensors"),
        axios.get("/automation"),
      ]);

      if (devRes.status === "fulfilled") {
        const res = devRes.value;
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setDevices(data);
      }

      if (senRes.status === "fulfilled") {
        setSensors(senRes.value.data || []);
      }

      if (ruleRes.status === "fulfilled") {
        setRules(ruleRes.value.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tổng hợp:", error);
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
      await fetchData(); // Reload lại toàn bộ dữ liệu
      setOpenAddDevice(false);
    } catch (error) {
      alert("Không thể thêm thiết bị. Vui lòng kiểm tra lại backend!");
    }
  };

  // 3. Xử lý Cập nhật thiết bị (Dùng cho DeviceSettingModal)
  const handleSaveSetting = async (updatedDevice) => {
    try {
      await updateDevice(updatedDevice.device_id, updatedDevice);
      await fetchData(); 
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
        await fetchData(); 
      } catch (error) {
        alert("Xóa thiết bị thất bại!");
      }
    }
  };

  // 5. Xử lý Bật/Tắt nhanh tại Card
  const handleToggle = async (id) => {
    try {
      await toggleDevice(id);
      await fetchData(); 
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
  const handleOpenHistory = async (type, title) => {
    setSelectedSensor({ type, title });
    setOpenHistoryModal(true);
    try {
      const res = await axios.get(`/sensors/history/${type}`);
      setHistoryData(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
      setHistoryData([]);
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
            {/* Hàng thống kê số liệu cảm biến */}
            <StatRow
              data={[
                { title: "Tổng số cảm biến", value: totalSensors },
                { title: "DHT20 (Nhiệt độ/Độ ẩm)", value: totalTemp },
                { title: "Cảm biến Ánh sáng", value: totalLightSensor },
              ]}
            />
            
            <div className="mb-4 text-sm text-gray-500 font-medium uppercase">
              💡 Mẹo: Bấm vào thẻ để xem đồ thị hoặc danh sách lịch sử đo chi tiết
            </div>

            {/* Danh sách các thẻ Card Cảm biến */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeSensors.map((s, index) => (
                <div 
                  key={s.sensor_id || `sensor-${index}`}
                  onClick={() => handleOpenHistory(s.type || s.sensor_type, s.name)}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <SensorCard
                    sensor={s}
                    onToggle={(id, e) => {
                      e.stopPropagation(); // Ngăn nổi bọt trigger modal lịch sử khi gạt switch
                      handleSensorToggle(id);
                    }}
                    onDelete={(id, e) => {
                      e.stopPropagation(); // Ngăn nổi bọt trigger modal lịch sử khi bấm xóa
                      handleSensorDelete(id);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* BẢNG CHI TIẾT TRẠNG THÁI (BÊ TỪ DASHBOARD SANG) */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Danh sách chi tiết trạng thái hoạt động</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 uppercase text-xs font-bold border-b">
                      <th className="p-4">ID</th>
                      <th className="p-4">Tên Cảm Biến</th>
                      <th className="p-4">Loại</th>
                      <th className="p-4">Trạng Thái</th>
                      <th className="p-4">Cập nhật cuối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeSensors.length > 0 ? (
                      safeSensors.map((s) => (
                        <tr key={s.sensor_id} className="hover:bg-blue-50 border-b transition-colors">
                          <td className="p-4 font-mono text-sm">{s.sensor_id}</td>
                          <td className="p-4 font-semibold">{s.name}</td>
                          <td className="p-4 text-blue-600 font-medium">{s.type || s.sensor_type}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {s.status === 'active' ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-sm">
                            {s.last_seen ? new Date(s.last_seen).toLocaleString("vi-VN") : "Vừa xong"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-gray-400">Hệ thống chưa ghi nhận cảm biến nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL POPUP XEM LỊCH SỬ KHI CLICK VÀO CARD */}
            {openHistoryModal && selectedSensor && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Lịch sử nhận tín hiệu: {selectedSensor.title}</h2>
                    <button 
                      onClick={() => { setOpenHistoryModal(false); setHistoryData([]); }} 
                      className="text-gray-500 hover:text-red-500 text-2xl font-bold"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-bold border">
                          <th className="p-3 border">Thời gian hệ thống nhận</th>
                          <th className="p-3 border text-center">Giá trị log</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.length > 0 ? (
                          historyData.map((h, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="p-3 border text-gray-600 text-sm">
                                {h.createdAt ? new Date(h.createdAt).toLocaleString("vi-VN") : new Date().toLocaleString("vi-VN")}
                              </td>
                              <td className="p-3 border text-center font-bold text-blue-600 text-base">
                                {h.value} {selectedSensor.type === "temperature" ? "°C" : selectedSensor.type === "humidity" ? "%" : "lux"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="p-6 text-center text-gray-400">Không tìm thấy dữ liệu log lịch sử của cảm biến này...</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
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