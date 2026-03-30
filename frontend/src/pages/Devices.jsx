import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import axios from "../api/axios";
import DeviceModal from "../components/modal/DeviceModal";
import DeviceCard from "../components/cards/DeviceCard";
import SensorCard from "../components/cards/SensorCard";
import { mockDevices, mockSensors, mockRules } from "../api/mock";

export default function Devices() {
  const [tab, setTab] = useState("device");

  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [rules, setRules] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

//  useEffect(() => {
//    fetchData();
//  }, []);
  useEffect(() => {
    setDevices(mockDevices);
    setSensors(mockSensors);
    setRules(mockRules);
    }, []);

  const fetchData = async () => {
    const d = await axios.get("/devices");
    const s = await axios.get("/sensors");
    const r = await axios.get("/automation");

    setDevices(d.data);
    setSensors(s.data);
    setRules(r.data);
  };

  // ===== HANDLERS =====
  const handleToggle = (id, type) => {
  setDevices((prev) =>
    prev.map((d) =>
    d.id === id
      ? {
        ...d,
        ...(type === "power"
        ? {
          power_status: d.power_status === "on" ? "off" : "on",
        }
        : {
          control_mode:
            d.control_mode === "automation"
            ? "manual"
            : "automation",
          }),
      }
      : d
    )
  );
  };

    const handleDelete = (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    };

    const handleSensorDelete = (id) => {
    setSensors((prev) => prev.filter((s) => s.id !== id));
    };

    const handleSetting = (device) => {
    setSelectedDevice(device);
    setOpenModal(true);
    };

    const handleSave = (device) => {
      if (device.id && devices.find((d) => d.id === device.id)) {
        // UPDATE
        setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? device : d))
        );
      } else {
        // CREATE
        const newDevice = {
        ...device,
        id: Date.now(),
        };
        setDevices((prev) => [...prev, newDevice]);
      }
    };
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

          {tab !== "automation" && (
            <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
            + Thêm thiết bị
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
                key={d.id}
                device={d}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onSetting={handleSetting}
                />
              ))}
            </Grid>
          </>
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
                key={s.id}
                sensor={s}
                onDelete={handleSensorDelete}
                />
              ))}
            </Grid>
          </>
        )}

        {/* ===== AUTOMATION ===== */}
        {tab === "automation" && (
          <AutomationList rules={rules} />
        )}
      </div>

      {openModal && (
        <DeviceModal
          device={selectedDevice}
          onClose={() => setOpenModal(false)}
          onSave={handleSave}
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

function AutomationList({ rules }) {
  return (
    <div className="space-y-4">
      {rules.map((r) => (
        <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between">
            <h3 className="font-semibold">{r.name}</h3>

            <span
              className={`px-2 py-1 text-sm rounded ${
                r.is_active ? "bg-green-100 text-green-600" : "bg-gray-200"
              }`}
            >
              {r.is_active ? "Đang chạy" : "Tắt"}
            </span>
          </div>

          <p className="mt-2 text-gray-600 text-sm">
            Nếu sensor thỏa điều kiện → thực hiện hành động
          </p>

          <div className="flex gap-2 mt-3">
            <button className="bg-gray-200 px-3 py-1 rounded">
              Sửa
            </button>
            <button className="bg-red-500 text-white px-3 py-1 rounded">
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}