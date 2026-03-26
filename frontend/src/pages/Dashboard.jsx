import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import socket from "../socket/socket";
import axios from "../api/axios";

export default function Dashboard() {
  const [tab, setTab] = useState("overview");

  const [summary, setSummary] = useState({});
  const [sensor, setSensor] = useState({});
  const [devices, setDevices] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const s1 = await axios.get("/dashboard/summary");
    const s2 = await axios.get("/sensors/latest");
    const s3 = await axios.get("/devices/quick");

    setSummary(s1.data);
    setSensor(s2.data);
    setDevices(s3.data);
  };

  useEffect(() => {
    socket.on("sensor-data", (data) => {
      setSensor((prev) => ({
        ...prev,
        [data.type]: data.value,
      }));
    });
  }, []);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-4">Trang chủ</h1>

        {/* Tabs */}
        <div className="flex gap-6 mb-6">
          <Tab active={tab === "overview"} onClick={() => setTab("overview")}>
            Tổng quan
          </Tab>

          <Tab active={tab === "chart"} onClick={() => setTab("chart")}>
            Biểu đồ
          </Tab>
        </div>

        {tab === "overview" && (
          <>
            {/* ROW 1 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard title="Thiết bị" value={summary.devices} />
              <StatCard title="Cảm biến" value={summary.sensors} />
              <StatCard title="Cảnh báo" value={summary.alerts} />
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <SensorCard title="Nhiệt độ" value={sensor.temperature} unit="°C" color="text-orange-500" />
              <SensorCard title="Độ ẩm" value={sensor.humidity} unit="%" color="text-blue-500" />
              <SensorCard title="Ánh sáng" value={sensor.light} unit="lux" color="text-yellow-500" />
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-3 gap-4">
              <DeviceCard
                title="Đèn"
                status={devices.light}
                onClick={() => toggle(devices, setDevices, "light")}
              />

              <DeviceCard
                title="Quạt"
                status={devices.fan}
                onClick={() => toggle(devices, setDevices, "fan")}
              />

              <TimeCard />
            </div>
          </>
        )}

        {tab === "chart" && <div>Chart (làm tiếp sau)</div>}
      </div>
    </div>
  );
}

// ================= UI COMPONENT =================

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

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold">{value || 0}</h2>
    </div>
  );
}

function SensorCard({ title, value, unit, color }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <p className="text-gray-500 mb-2">{title}</p>
      <h2 className={`text-4xl font-bold ${color}`}>
        {value || 0} {unit}
      </h2>
    </div>
  );
}

function DeviceCard({ title, status, onClick }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <p className="mb-4">{title}</p>

      <div
        onClick={onClick}
        className={`w-16 h-8 mx-auto rounded-full flex items-center px-1 cursor-pointer ${
          status ? "bg-green-500 justify-end" : "bg-red-500 justify-start"
        }`}
      >
        <div className="w-6 h-6 bg-white rounded-full"></div>
      </div>
    </div>
  );
}

function TimeCard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setInterval(() => setTime(new Date()), 1000);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <h2 className="text-3xl font-bold">
        {time.toLocaleTimeString()}
      </h2>
      <p>{time.toDateString()}</p>
      <p>TP. Hồ Chí Minh</p>
    </div>
  );
}

// toggle helper
function toggle(devices, setDevices, type) {
  setDevices((prev) => ({
    ...prev,
    [type]: !prev[type],
  }));
}