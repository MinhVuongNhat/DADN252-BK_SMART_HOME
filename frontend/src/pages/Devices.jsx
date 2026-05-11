import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import axios from "../api/axios";
import DeviceModal from "../components/modal/DeviceModal";
import DeviceCard from "../components/cards/DeviceCard";
import SensorCard from "../components/cards/SensorCard";
import AddDeviceModal from "../components/modal/AddDeviceModal";
import DeviceSettingModal from "../components/modal/DeviceSettingModal";
import AddSensorModal from "../components/modal/AddSensorModal";
import RuleModal from "../components/modal/RuleModal";
// import các mock để demo
import { mockDevices, mockSensors, mockRules, mockConditions, mockActions } from "../api/mock";

export default function Devices() {
  const [tab, setTab] = useState("device");
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [rules, setRules] = useState([]);

  // Quản lý các Modal riêng biệt
  const [openAddDevice, setOpenAddDevice] = useState(false);
  const [openDeviceSetting, setOpenDeviceSetting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openAddSensor, setOpenAddSensor] = useState(false);
  const [openRuleModal, setOpenRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

//  useEffect(() => {
//    fetchData();
//  }, []);
  useEffect(() => {
    setDevices(mockDevices);
    setSensors(mockSensors);

    const mergedRules = mockRules.map((rule) => {
      const conditions = mockConditions.filter(
        (c) => c.rule_id === rule.rule_id
      );

      const actions = mockActions.filter(
        (a) => a.rule_id === rule.rule_id
      );

      return {
        ...rule,
        conditions,
        actions,
      };
    });

    setRules(mergedRules);
  }, []);

//  const fetchData = async () => {
//    const d = await axios.get("/devices");
//    const s = await axios.get("/sensors");
//    const r = await axios.get("/automation");

//    setDevices(d.data);
//    setSensors(s.data);
//    setRules(r.data);
//  };

  // ===== HANDLERS =====
  // ===== Device =====
  const handleToggle = (id, type) => {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.device_id === id) {
            if (type === "power") {
              return { ...d, power_status: d.power_status === "on" ? "off" : "on" };
            } else {
              return { ...d, control_mode: d.control_mode === "automation" ? "manual" : "automation" };
            }
          }
          return d;
        })
      );
    };

  const handleDeleteDevice = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      setDevices((prev) => prev.filter((d) => d.device_id !== id));
    }
  };

  const handleRename = (id, name) => {
    setDevices(prev =>
      prev.map(d =>
        d.device_id === id ? { ...d, name } : d
      )
    );
  };

  const handleOpenSetting = (device) => {
      setSelectedDevice(device);
      setOpenDeviceSetting(true);
    };

    const handleSaveSetting = (updatedDevice) => {
      setDevices((prev) =>
        prev.map((d) => (d.device_id === updatedDevice.device_id ? updatedDevice : d))
      );
    };

    const handleAddDevice = (newDevice) => {
      setDevices((prev) => [...prev, newDevice]);
    };

  // ===== Sensor =====
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
          : s
      )
    );
  };

  const handleAddSensor = (newSensor) => {
    setSensors((prev) => [...prev, newSensor]);
  };

  // ===== Auto Rule =====
  const handleDeleteRule = (id) => {
      if (window.confirm("Bạn có chắc muốn xóa luật này?")) {
        setRules((prev) => prev.filter((r) => r.rule_id !== id));
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

    const handleSaveRule = (rule) => {
      if (rules.find((r) => r.rule_id === rule.rule_id)) {
        // Cập nhật luật cũ
        setRules((prev) => prev.map((r) => (r.rule_id === rule.rule_id ? rule : r)));
      } else {
        // Thêm luật mới
        setRules((prev) => [...prev, rule]);
      }
    };

  // ===
  // ===== COUNT =====
  const totalDevices = devices.length;
  const totalFans = devices.filter((d) => d.type === "fan").length;
  const totalLights = devices.filter((d) => d.type === "light").length;

  const totalSensors = sensors.length;
  const totalTemp = sensors.filter((s) => s.type === "temperature").length;
  const totalLightSensor = sensors.filter((s) => s.type === "light").length;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100">
        {/* TITLE */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý thiết bị</h1>
        </div>

        {/* TABS */}
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <div className="flex gap-6 mb-6">
            <Tab active={tab === "device"} onClick={() => setTab("device")}>
              Thiết bị
            </Tab>
            <Tab active={tab === "sensor"} onClick={() => setTab("sensor")}>
              Cảm biến
            </Tab>
            <Tab active={tab === "automation"} onClick={() => setTab("automation")}>
              Luật tự động
            </Tab>
          </div>

          {tab === "device" && (
            <button 
            onClick={() => setOpenAddDevice(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Thêm thiết bị
            </button>
          )}

          {tab === "sensor" && (
            <button 
            onClick={() => setOpenAddSensor(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Thêm cảm biến
            </button>
          )}

          {tab === "automation" && (
            <button 
              onClick={handleAddRule}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
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
            {devices.map((d) => (
              <DeviceCard
                key={d.device_id}
                device={d}
                onToggle={handleToggle}
                onDelete={handleDeleteDevice}
                onSetting={handleOpenSetting}
              />
            ))}
          </Grid>
          </>
        )}

        {/* Modal Thêm Mới */}
        {openAddDevice && (
          <AddDeviceModal 
            onClose={() => setOpenAddDevice(false)} 
            onSave={handleAddDevice}
            currentCount={devices.length}
          />
        )}

        {/* Modal Cài Đặt */}
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
            {sensors.map((s) => (
              <SensorCard
                key={s.sensor_id}
                sensor={s}
                onToggle={handleSensorToggle} // Truyền thêm toggle
                onDelete={handleSensorDelete}
              />
            ))}
          </Grid>
          </>
        )}

        {/* Modal Thêm Sensor */}
        {openAddSensor && (
          <AddSensorModal
            onClose={() => setOpenAddSensor(false)}
            onSave={handleAddSensor}
            currentCount={sensors.length}
          />
        )}

        {/* ===== AUTOMATION ===== */}
        {tab === "automation" && (
          <AutomationList
            rules={rules}
            sensors={sensors}
            devices={devices}
            onDelete={handleDeleteRule}
            onEdit={handleEditRule}
          />
        )}
      </div>

      {/* Modal dùng chung cho Thêm/Sửa Rule */}
      {openRuleModal && (
        <RuleModal
          rule={selectedRule}
          sensors={sensors}
          devices={devices}
          onClose={() => setOpenRuleModal(false)}
          onSave={handleSaveRule}
        />
      )}
    </div>
  );
}

function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 ${
        active ? "border-b-2 border-blue-500 text-blue-600 font-semibold" : ""
      }`}
    >
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
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>;
}

function AutomationList({ rules, sensors, devices, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {rules.map((r) => (
        <div key={r.rule_id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">{r.name}</h3>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {r.is_active ? "ĐANG CHẠY" : "ĐÃ TẮT"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-500 block mb-1">Điều kiện (NẾU)</span>
              {r.conditions.map((c, i) => {
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
              {r.actions.map((a, i) => {
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
            <button 
              onClick={() => onEdit(r)}
              className="px-4 py-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg text-sm transition"
            >
              Chỉnh sửa
            </button>
            <button 
              onClick={() => onDelete(r.rule_id)}
              className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition"
            >
              Xóa luật
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}